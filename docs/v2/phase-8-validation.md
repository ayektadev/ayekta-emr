# Phase 8 validation — attachments & FHIR (starter)

Reference: Engineering Blueprint Phase 8 — attachment upload/download, FHIR import/export mapper, bundle export, DocumentReference / DiagnosticReport handling.

## Deliverable mapping (this slice)

| Deliverable | Status | Implementation |
|-------------|--------|----------------|
| **Bundle export** | **Partial → E** | `fhirExport.ts` — collection Bundle: Patient, Encounter, vital + HPI **Observation**, **Condition** / **AllergyIntolerance** / **MedicationStatement** / **Procedure**, lab **Observation** + **DiagnosticReport** (`result`), imaging **DiagnosticReport**, op-note + optional chart PDF **DocumentReference**. |
| **FHIR import** | **Partial → E** | `fhirImport.ts` — Patient stub + `mergeClinicalResourcesFromFhirBundle` (best-effort; JSON import for full fidelity). |
| **Coding helpers** | **Yes** | `fhirMappings.ts` — ISHI URI, LOINC vitals + HPI + progress/summary notes, gender helper. |
| **Attachment queue (local)** | **Partial** | Documents panel queues files; **`flushPendingAttachmentsToApi`** runs after **`processSyncQueue`** when online + `VITE_SYNC_API_BASE` set. |
| **Attachment API** | **Started** | `POST /attachments/register` + `migrations/002_attachment_ingest.sql` (inline `BYTEA` for dev; presigned S3 **deferred**). |
| **FHIR import (dashboard)** | **Partial → E** | Dashboard: FHIR Bundle → stub + clinical merge; legacy JSON unchanged. |
| **DocumentReference (binary)** | **Partial** | Chart PDF optional in bundle export (`chartPdfBase64`); size cap in `fhirExport.ts`. |
| **DiagnosticReport** | **Partial → E** | Labs: linked **Observation** + report; imaging: conclusion-only row (import uses name heuristic vs labs). |

## Manual smoke test

1. Open a patient → **Documents** section → **Download FHIR JSON bundle** → open JSON; confirm `Patient`, `Encounter`, `entry` includes op-note `DocumentReference` and lab/imaging `DiagnosticReport` when data exists.  
2. **Choose file** → confirm row appears under queued with size.  
3. **Save w/ PDF** in header still produces chart PDF download and sync payload (Phase 7).

## Related docs

- `FHIR_ARCHITECTURE.md`, `docs/v2/fhir-mapping-matrix.md`, `docs/v2/spec-to-product-matrix.md`
