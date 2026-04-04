# Phase 6 validation — encounter versioning, sign/amend, audit

Reference: `Ayekta_v2_Engineering_Blueprint.md` Phase 6 (signed encounter versions, addendum draft fork, local audit trail) and Product Spec chart lifecycle.

## Deliverable mapping

| Deliverable | Implementation | Notes |
|-------------|----------------|-------|
| **Draft vs signed rows** | `LocalEncounterVersionRow.status`: `draft` \| `signed` \| `superseded` in `schemaTypes.ts` | Signed snapshot frozen; new draft after sign references prior via `supersedesVersionId`. |
| **Load editable chart** | `loadCurrentDraftChartForPatient` in `encounterRepository.ts` | Returns chart JSON only when `encounters.currentVersionId` points at a **draft** row. |
| **Persist draft** | `upsertDraftEncounterFromChart` | Overwrites current row only if it is `draft`; refuses to overwrite a signed row. |
| **Sign + fork** | `signCurrentEncounterDraft` | Transaction: remove old draft row, insert signed snapshot (`signedAt`, signer, optional `amendmentReason`), insert new draft with copied payload, update encounter `currentVersionId`, encounter `status` → `signed`. |
| **Audit: sign** | `appendLocalAuditEvent` inside `signCurrentEncounterDraft` | `action: 'sign'`, `entityType: 'encounter'`, metadata includes version ids and optional reason. |
| **Audit: login** | `appendLocalAuditEvent` in `authStore.login` | `action: 'login_success'`, `entityType: 'session'`. |
| **Audit: save** | `appendLocalAuditEvent` after successful `saveToStorage` in `patientStore.savePatient` | `action: 'save'`, `entityType: 'patient_chart'`. |
| **Version list UI** | `ReviewSignPanel` + chart section **Review & sign** | Lists versions; surgeon/admin can attest current draft; optional note; calls `savePatient()` after sign to re-sync IndexedDB projection. |
| **Chart navigation** | `patientChartSections.ts` + `PatientWorkspacePage.tsx` | New panel key `review-sign`; section buttons use `aria-current="page"` when active. |

## Persistence flow (smoke)

1. Sign in as **surgeon** or **admin** → open patient → save chart (or wait for autosave).  
2. Open **Review & sign** → confirm version table shows draft v1 (or higher).  
3. **Sign encounter** → expect new signed row for prior version number and new draft with `versionNumber + 1`; optional note appears on signed row.  
4. Refresh → chart still loads from new draft; edits save without overwriting signed row.  
5. Sign in as **nurse** → **Review & sign** visible but **Sign** disabled with role explanation.

## Deferred

- **Read-only viewer** for a selected signed version’s `dataJson` (structured diff / PDF of frozen chart).  
- **Superseded** status on older signed rows if product requires explicit chain display.  
- **Server-side** version storage and tamper-evident audit (sync phase).
