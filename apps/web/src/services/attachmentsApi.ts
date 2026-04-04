import { getSyncRequestHeaders } from './syncTransport';

export type ServerAttachmentListItem = {
  id: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  createdAt: string | null;
  storageBackend: string;
  docType?: string;
  checksum?: string | null;
  uploadedAt?: string | null;
  uploadedBy?: string | null;
  encounterId?: string | null;
};

function apiBase(): string | null {
  const base = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');
  return base || null;
}

export function syncApiConfigured(): boolean {
  return !!apiBase();
}

export async function listServerAttachmentsForPatient(patientId: string): Promise<ServerAttachmentListItem[]> {
  const base = apiBase();
  if (!base) return [];
  const url = `${base}/attachments?patientId=${encodeURIComponent(patientId)}`;
  const res = await fetch(url, { headers: getSyncRequestHeaders() });
  if (!res.ok) return [];
  const data = (await res.json()) as ServerAttachmentListItem[];
  return Array.isArray(data) ? data : [];
}

/** Browser download via authenticated GET (handles 302 to S3 when applicable). */
export async function downloadServerAttachmentFile(attachmentId: string, filename: string): Promise<void> {
  const base = apiBase();
  if (!base) throw new Error('Sync API not configured');
  const res = await fetch(`${base}/attachments/${attachmentId}/download`, {
    headers: getSyncRequestHeaders(),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'attachment';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
