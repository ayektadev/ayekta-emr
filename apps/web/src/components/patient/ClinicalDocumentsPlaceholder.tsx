import { useCallback, useEffect, useState } from 'react';
import { getPatientDataSnapshot, usePatientStore } from '../../store/patientStore';
import {
  buildFhirExportBundle,
  MAX_CHART_PDF_EMBED_BYTES,
} from '../../services/fhir/fhirExport';
import { blobToBase64 } from '../../services/attachmentUpload';
import { generateFullChartPDF } from '../../utils/fullChartPDF';
import {
  enqueuePendingAttachment,
  listAttachmentMetaForPatient,
  listPendingAttachmentsForPatient,
} from '../../db/repositories/attachmentRepository';
import type { LocalAttachmentMetaRow, LocalPendingAttachmentRow } from '../../db/dexie/schemaTypes';
import { downloadServerAttachmentFile, syncApiConfigured, type ServerAttachmentListItem } from '../../services/attachmentsApi';
import { useServerAttachmentsQuery } from '../../hooks/queries/useServerAttachmentsQuery';

function downloadFhirJson(bundle: Record<string, unknown>, ishiId: string) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/fhir+json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GH26${ishiId}_fhir-bundle.json`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ClinicalDocumentsPlaceholder() {
  const ishiId = usePatientStore((s) => s.ishiId);
  const [meta, setMeta] = useState<LocalAttachmentMetaRow[]>([]);
  const [pending, setPending] = useState<LocalPendingAttachmentRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const {
    data: serverFetched,
    isFetching: serverLoading,
    refetch: refetchServerAttachments,
  } = useServerAttachmentsQuery(ishiId || undefined);
  const server: ServerAttachmentListItem[] =
    syncApiConfigured() && ishiId ? (serverFetched ?? []) : [];

  const refresh = useCallback(async () => {
    if (!ishiId) return;
    const [m, p] = await Promise.all([
      listAttachmentMetaForPatient(ishiId),
      listPendingAttachmentsForPatient(ishiId),
    ]);
    setMeta(m);
    setPending(p);
    if (syncApiConfigured()) await refetchServerAttachments();
  }, [ishiId, refetchServerAttachments]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !ishiId) return;
    await enqueuePendingAttachment({
      patientId: ishiId,
      encounterId: `enc:${ishiId}`,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      blob: file,
      createdAt: Date.now(),
      status: 'queued',
    });
    setMsg(`Queued “${file.name}”. It will upload on the next sync when the API is configured.`);
    await refresh();
  };

  const onExportFhir = () => {
    const snap = getPatientDataSnapshot(usePatientStore.getState());
    if (!snap?.ishiId) {
      setMsg('Open a patient chart before exporting FHIR.');
      return;
    }
    const bundle = buildFhirExportBundle(snap);
    downloadFhirJson(bundle, snap.ishiId);
    setMsg('Downloaded FHIR R4 collection bundle (Patient, Encounter, DocumentReferences, DiagnosticReports).');
  };

  const onExportFhirWithPdf = async () => {
    const snap = getPatientDataSnapshot(usePatientStore.getState());
    if (!snap?.ishiId) {
      setMsg('Open a patient chart before exporting FHIR.');
      return;
    }
    const pdf = generateFullChartPDF(snap);
    if (pdf.size > MAX_CHART_PDF_EMBED_BYTES) {
      setMsg(
        `Chart PDF is ${(pdf.size / 1024).toFixed(0)} KB; max embed is ${(MAX_CHART_PDF_EMBED_BYTES / 1024).toFixed(0)} KB. Exporting bundle without PDF bytes — use Save w/ PDF for the full file.`
      );
      downloadFhirJson(buildFhirExportBundle(snap), snap.ishiId);
      return;
    }
    const chartPdfBase64 = await blobToBase64(pdf);
    const bundle = buildFhirExportBundle(snap, { chartPdfBase64 });
    downloadFhirJson(bundle, snap.ishiId);
    setMsg('Downloaded FHIR bundle including a DocumentReference with embedded application/pdf data.');
  };

  const onDownloadServer = async (row: ServerAttachmentListItem) => {
    try {
      await downloadServerAttachmentFile(row.id, row.filename);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Download failed.');
    }
  };

  if (!ishiId) {
    return (
      <div className="max-w-3xl mx-auto p-6 font-clinical text-sm text-ayekta-muted">
        Open a patient to manage documents and exports.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 font-clinical space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Documents &amp; attachments</h2>
        <p className="text-sm text-ayekta-muted leading-relaxed">
          Queued files are <strong>saved on this device</strong> immediately (IndexedDB). They upload to the
          server when you <strong>run sync</strong> while online and the API base URL is configured—same pass as
          chart sync (presigned <code className="text-xs bg-gray-100 px-1">PUT /attachments/blob/&#123;id&#125;</code>{' '}
          or small-file base64 register). Completed server files appear below for download.
        </p>
      </div>

      {msg && (
        <p className="text-sm text-gray-700 border border-ayekta-border rounded-md px-3 py-2 bg-white" role="status">
          {msg}
        </p>
      )}

      <section aria-labelledby="attach-heading" className="border border-ayekta-border rounded-md p-4 bg-white">
        <h3 id="attach-heading" className="text-sm font-medium text-gray-900 mb-3">
          Add attachment (local queue)
        </h3>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <span className="px-3 py-2 bg-ayekta-orange text-white rounded-sm font-medium hover:opacity-90">
            Choose file
          </span>
          <input type="file" className="sr-only" onChange={onPickFile} />
        </label>
        <p className="text-xs text-ayekta-muted mt-2">
          Large files use <code className="text-xs">POST /attachments/presign</code> then direct PUT; small files
          may fall back to inline base64 register.
        </p>
      </section>

      {syncApiConfigured() && (
        <section aria-labelledby="server-heading" className="border border-ayekta-border rounded-md p-4 bg-white">
          <h3 id="server-heading" className="text-sm font-medium text-gray-900 mb-3">
            On server
          </h3>
          {serverLoading ? (
            <p className="text-sm text-ayekta-muted">Loading…</p>
          ) : server.length === 0 ? (
            <p className="text-sm text-ayekta-muted">No completed attachments for this patient on the API yet.</p>
          ) : (
            <ul className="text-sm space-y-2 divide-y divide-gray-100">
              {server.map((row) => (
                <li key={row.id} className="pt-2 first:pt-0 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{row.filename}</span>
                    <span className="block text-xs text-gray-500 tabular-nums">
                      {(row.byteSize / 1024).toFixed(1)} KB · {row.storageBackend}
                      {row.docType ? ` · ${row.docType}` : ''}
                      {row.checksum ? ` · sha256:${row.checksum.slice(0, 8)}…` : ''}
                      {row.uploadedAt ? ` · ${row.uploadedAt}` : row.createdAt ? ` · ${row.createdAt}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDownloadServer(row)}
                    className="text-sm font-medium px-3 py-1.5 rounded-sm border border-ayekta-border text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange"
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="lists-heading" className="border border-ayekta-border rounded-md p-4 bg-white">
        <h3 id="lists-heading" className="text-sm font-medium text-gray-900 mb-3">
          Queued &amp; registered (this device)
        </h3>
        {pending.length === 0 && meta.length === 0 ? (
          <p className="text-sm text-ayekta-muted">No local attachment metadata yet.</p>
        ) : (
          <ul className="text-sm space-y-2 divide-y divide-gray-100">
            {pending.map((row) => (
              <li key={`p-${row.id ?? row.createdAt}-${row.filename}`} className="pt-2 first:pt-0">
                <span className="font-medium">{row.filename}</span>
                <span className="text-ayekta-muted ml-2">({row.status})</span>
                <span className="block text-xs text-gray-500 tabular-nums">
                  {(row.blob.size / 1024).toFixed(1)} KB · local queue
                </span>
              </li>
            ))}
            {meta.map((row) => (
              <li key={row.id} className="pt-2 first:pt-0">
                <span className="font-medium">{row.filename}</span>
                <span className="text-ayekta-muted ml-2">registered</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="fhir-heading" className="border border-ayekta-border rounded-md p-4 bg-white">
        <h3 id="fhir-heading" className="text-sm font-medium text-gray-900 mb-3">
          FHIR bundle export
        </h3>
        <p className="text-xs text-ayekta-muted mb-3">
          Patient, Encounter, DocumentReference (operative note + optional chart PDF with base64{' '}
          <code className="text-xs bg-gray-100 px-1">data</code>), DiagnosticReport per lab/imaging row.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportFhir}
            className="text-sm font-medium px-4 py-2 rounded-sm border border-ayekta-border text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange"
          >
            Download FHIR JSON (no PDF bytes)
          </button>
          <button
            type="button"
            onClick={() => void onExportFhirWithPdf()}
            className="text-sm font-medium px-4 py-2 rounded-sm bg-ayekta-orange text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange"
          >
            Download FHIR + chart PDF (embedded)
          </button>
        </div>
      </section>
    </div>
  );
}
