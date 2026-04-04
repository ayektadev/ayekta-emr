import { getSyncRequestHeaders } from './syncTransport';
import {
  deletePendingAttachmentById,
  listAllPendingAttachments,
  putAttachmentMeta,
} from '../db/repositories/attachmentRepository';

const MAX_INLINE_REGISTER_BYTES = 1_500_000;

function encounterClientIdForUpload(row: { patientId: string; encounterId?: string }): string {
  return row.encounterId?.trim() || `enc:${row.patientId}`;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const r = reader.result;
      if (typeof r !== 'string') {
        reject(new Error('read failed'));
        return;
      }
      const i = r.indexOf(',');
      resolve(i >= 0 ? r.slice(i + 1) : r);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

type PresignResponse = {
  attachmentId: string;
  method: string;
  uploadUrl: string;
  headers: Record<string, string>;
  requiresAuthorization: boolean;
  expiresIn: number;
  storage: 's3' | 'server_bytea';
};

/**
 * Flush queued files: presigned PUT (S3 or dev `/attachments/blob/{id}`), then optional S3 complete.
 * Falls back to `POST /attachments/register` with base64 for small files if presign is unavailable.
 */
export async function flushPendingAttachmentsToApi(): Promise<{ uploaded: number; skipped: number }> {
  const base = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');
  if (!base) return { uploaded: 0, skipped: 0 };

  const rows = await listAllPendingAttachments();
  let uploaded = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.status !== 'queued' || row.id == null) continue;

    try {
      const presignRes = await fetch(`${base}/attachments/presign`, {
        method: 'POST',
        headers: getSyncRequestHeaders(),
        body: JSON.stringify({
          patientId: row.patientId,
          filename: row.filename,
          mimeType: row.mimeType,
          byteSize: row.blob.size,
          docType: 'clinical',
          encounterClientId: encounterClientIdForUpload(row),
        }),
      });

      if (presignRes.ok) {
        const presign = (await presignRes.json()) as PresignResponse;
        const putHeaders: Record<string, string> = { ...presign.headers };
        if (presign.requiresAuthorization) {
          Object.assign(putHeaders, getSyncRequestHeaders());
        }
        const put = await fetch(presign.uploadUrl, {
          method: presign.method || 'PUT',
          headers: putHeaders,
          body: row.blob,
        });
        if (!put.ok) {
          skipped++;
          continue;
        }
        if (presign.storage === 's3') {
          const done = await fetch(`${base}/attachments/${presign.attachmentId}/complete`, {
            method: 'POST',
            headers: getSyncRequestHeaders(),
          });
          if (!done.ok) {
            skipped++;
            continue;
          }
        }
        await putAttachmentMeta({
          id: presign.attachmentId,
          patientId: row.patientId,
          filename: row.filename,
          mimeType: row.mimeType,
          size: row.blob.size,
          uploadedAt: Date.now(),
        });
        await deletePendingAttachmentById(row.id);
        uploaded++;
        continue;
      }

      if (row.blob.size > MAX_INLINE_REGISTER_BYTES) {
        skipped++;
        continue;
      }

      const contentBase64 = await blobToBase64(row.blob);
      const res = await fetch(`${base}/attachments/register`, {
        method: 'POST',
        headers: getSyncRequestHeaders(),
        body: JSON.stringify({
          patientId: row.patientId,
          filename: row.filename,
          mimeType: row.mimeType,
          byteSize: row.blob.size,
          contentBase64,
          docType: 'clinical',
          encounterClientId: encounterClientIdForUpload(row),
        }),
      });
      if (!res.ok) {
        skipped++;
        continue;
      }
      const j = (await res.json()) as { id?: string };
      const remoteId = j.id ?? `srv-${row.id}-${Date.now()}`;
      await putAttachmentMeta({
        id: remoteId,
        patientId: row.patientId,
        filename: row.filename,
        mimeType: row.mimeType,
        size: row.blob.size,
        uploadedAt: Date.now(),
      });
      await deletePendingAttachmentById(row.id);
      uploaded++;
    } catch {
      skipped++;
    }
  }

  return { uploaded, skipped };
}
