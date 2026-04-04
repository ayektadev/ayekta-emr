# Spec → product traceability matrix

This file is the **contract** between the three build-driving markdown sources and the repository. It is updated when behavior ships or when scope is intentionally deferred. **Nothing in those documents should be silently forgotten**: each major theme appears here as **implemented**, **partial**, **deferred**, or **N/A**, with a pointer to code or follow-up work.

**Source documents (authoritative prose):**

| Document | Path |
|----------|------|
| Product Spec | `revamp april 26/Ayekta_v2_Product_Spec.md` |
| Engineering Blueprint | `revamp april 26/Ayekta_v2_Engineering_Blueprint.md` |
| Migration Inventory | `revamp april 26/Ayekta_v2_Migration_Inventory.md` |

---

## Next sprint — start here

Prioritized follow-ups (pull from **Future / out of scope** below as capacity allows):

1. **Tenant workflow policy on the server** — Replace device-local `keyValue` (`ayekta-workflow-policy-v1`) with Postgres-backed admin config + JWT tenant scope so policy is authoritative across devices (today: `services/workflowPolicy.ts`, Admin → Workflow).
2. **Signed / amendment authority on sync** — Server-side truth for signed versions, amendment conflicts, and nursing vs surgeon attestations in the normalized mirror (chunk **D** partial today).
3. **Smarter sync merge UI** — Field-level / three-way resolution for draft conflicts (beyond revision banner + keep-local).

---

## Chunk status (execution plan)

| Chunk | Scope | Status |
|-------|--------|--------|
| **A** | This matrix kept current | **Done** (this revision) |
| **B** | API users + `POST /auth/login` + JWT; protect `/sync/*`, `/attachments/*`; web stores JWT for sync | **Done** — `migrations/004_users_auth.sql`, `ayekta_api/api/auth_router.py`, `deps.py` principals, `authStore` + `syncTransport` |
| **C** | Postgres domain (patients / encounters / versions) toward blueprint §8 | **Done** — `migrations/005_normalized_clinical.sql` + `chart_bundle_ingest` on `POST /sync/push` (`entityType=chart_bundle`). |
| **D** | Sync pull + server conflicts (409) end-to-end | **MVP done** — `006_encounter_server_revision.sql`, `baseServerRevision` on push, 409 + `serverRevision` in `detail`, paginated pull (`cursor` = `ISO|encounterUuid`), web: KV revision, pull-before/push/pull-after, `applySyncPull` (+ revision-only for pending entities). Signed-record / amendment conflicts **deferred**. |
| **E** | FHIR matrix expansion (Observation, Condition, MedicationStatement, Procedure, lab Obs+DiagnosticReport, …) | **Done** — `fhirExport.ts` + `fhirMappings.ts` LOINC set; `fhirImport.ts` `mergeClinicalResourcesFromFhirBundle`; dashboard FHIR load uses merge after Patient stub. **MedicationRequest** (orders vs home meds) still **deferred** to API/workflow. |
| **F** | Attachments metadata vs blueprint (`type`, `checksum`, `uploaded_by`, `uploaded_at`, `encounter_id`) | **Done** — `007_attachment_blueprint_columns.sql` on **`attachment_ingests`**; `attachments_router` sets fields; web sends **`docType`** + **`encounterClientId`** (`enc:{ishiId}`). Rename to canonical **`attachments`** table vs ingest name **deferred** (no functional gap). |
| **G** | Mission analytics from **structured clinical** fields (not only Dexie row counts) | **Done** — `clinicalMissionRollup.ts` + `gatherMissionMetrics` loads latest draft per local encounter; `MissionAnalyticsPage` + CSV export. Server / multi-site fact tables **deferred** (blueprint analytics pipeline). |
| **H** | Blueprint IA: nurse Intake Queue route; admin Users / Facilities / Audit / Config | **MVP done** — `ROUTES` + role nav (`packages/shared-types/src/routes.ts`); `/intake`, `/documents` (nurse+admin); `/admin` hub + `/admin/users|facilities|audit|config` shells; `RequireRoles`; `IntakeQueuePage`, `DocumentsHubPage`, `AdminHomePage`. Full admin CRUD / server UI **deferred**. |
| **I** | TanStack Query; `offline.html` + SW fallback | **Done** — `@tanstack/react-query` + `QueryClientProvider` (`main.tsx`, `query/queryClient.ts`); `useMissionMetricsQuery`, `useServerAttachmentsQuery`; sync invalidates `serverAttachments` after flush; `public/offline.html` precached; Workbox `navigateFallback` → `/ayekta-emr/offline.html` (`vite.config.ts`). Persisted query cache / devtools **optional later**. |
| **J** | Product spec §10 parity: **`in_review`** lifecycle, **nursing section sign-off** vs surgeon sign-off; **admin-configurable** workflow (policy toggles) | **Done (local policy)** — `LocalEncounterVersionRow.status` includes `in_review`; `encounterRepository.submitDraftForReview` + `signCurrentEncounterDraft` + `upsertDraftEncounterFromChart` / `loadCurrentDraftChartForPatient`; `services/workflowPolicy.ts` (Dexie `keyValue`); Admin **Workflow** `WorkflowConfigPage`; chart JSON `clinicalWorkflow.sectionNursingSignOff`; `SectionNursingSignOffBar` on `PatientWorkspacePage`; `ReviewSignPanel` submit + sign gates. **Server-backed tenant policy** → see **Next sprint**. |

---

## Product Spec — section coverage

| Sec. | Topic | Status | Where / notes |
|------|--------|--------|----------------|
| 1 | Product definition (offline-first, surgery-scoped, FHIR-capable) | **Partial** | Offline-first + surgery modules; FHIR bundle export + clinical merge on import (chunk **E**); MedicationRequest / full server mapper still **deferred**. |
| 2 | Strategic positioning | **Aligned** | Not billing/scheduling/portal. |
| 3 | Surgical scope (wedge ordering) | **Partial** | Core peri-op / wound / complications / outcomes; local clinical mission rollups **G**; server registry **deferred**. |
| 4 | v1 users and roles | **Partial** | Roles in UI + **API users table** + JWT (chunk B); server RBAC on clinical writes **deferred**. |
| 5 | Role expectations | **Partial** | Chart + Review & sign + **chunk J** nursing section sign-off + local admin workflow; server RBAC on writes still **deferred**. |
| 6 | Core workflows | **Partial** | Intake → document → sync queue → API ingest + normalized mirror on push (**C**); deeper server-only workflows **ongoing**. |
| 7 | Required v1 modules | **See inventory table** | `patientChartSections` + `moduleRegistry`. |
| 8 | Identity model | **Partial** | Local ISHI + Dexie; API mirrors patient row via `client_patient_id` + identifier (`005`); full MRN graph **ongoing**. |
| 9 | FHIR posture | **Partial** | `services/fhir/*` — vitals Observations, conditions, meds, allergies, procedure, labs (Obs+DR), op note + PDF DocumentReference; orders profile / US Core **deferred**. |
| 10 | Versioning & signing | **Partial** | Local **`in_review`**, nursing section sign-offs, surgeon sign, amend; **server** workflow enforcement + cross-device policy **next sprint**. |
| 11 | Offline-first behavior | **Partial** | IndexedDB, PWA, outbox, sync badge, **409** draft conflict path with revision align + overwrite / retry. **Smarter sync merge UI** (field-level / three-way merge beyond banner + keep-local) is **explicitly backlog** after chunks **F–J** sprints — not in current scope. |
| 12 | Analytics / mission dashboard | **Partial** | `MissionAnalyticsPage` = operational Dexie + **structured clinical rollups** (G); site-level / server aggregates **deferred**. |
| 13 | Device / UX | **Partial** | Desktop/tablet-first. |
| 14–16 | Benchmarks / hosting / non-negotiables | **N/A / Partial** | As before. |
| 17 | Product acceptance criteria | **Partial** | Attachments + FHIR + mission (**G**) + **chunk J** local workflow; server acceptance items **ongoing**. |
| 18 | Summary | **N/A** | Narrative. |

---

## Engineering Blueprint — major themes

| Theme | Status | Implementation |
|--------|--------|----------------|
| Frontend stack (React, Vite, Dexie, Zustand, PWA) | **Partial** | **TanStack Query** (**I**) for server list + mission metrics; RHF/Zod not universal. |
| Route / role IA (Blueprint §5) | **Partial** | **H**: intake + documents (nurse/admin); admin hub + section shells; `RequireRoles`. |
| Backend FastAPI + Postgres | **Partial** | Sync ingest + **normalized patients/encounters/versions** on chart push (C); attachments; JWT (B); audit_events / fact tables **deferred**. |
| Local-first writes | **Yes** | `patientStore`, Dexie. |
| Domain layering | **Partial** | Chart JSON + versions; dedicated domain package **deferred**. |
| Multi-tenant | **Partial** | Tenant on API rows + **JWT `tid`**; header tenant when using `SYNC_API_KEY` only. |
| Permission matrix | **Partial** | Module toggles + role in UI + **local** workflow policy (**J**); **server enforcement on clinical writes deferred**. |
| Dexie schema | **Yes** | `apps/web/src/db/dexie/`; `authSession.accessToken` for API JWT. |
| Sync architecture | **Partial** | Push + ack + **pull** (draft bundles) + **409** draft lock (`server_revision`); signed-version server authority **deferred**. Smarter merge UI **deferred** (see matrix §11 / Deferred backlog). |
| Auth / offline unlock | **Partial** | **JWT login** when `JWT_SECRET` + DB + migration 004; mock login when no `VITE_SYNC_API_BASE`; refresh tokens / device registration **deferred**. |
| Audit | **Partial** | Local + server sync_events; full audit payload **deferred**. |
| FHIR layer | **Partial** | Export + stub + **clinical merge** (chunk E); MedicationRequest / full round-trip parity **deferred**. |
| Attachments | **Partial** | Presign (S3 or dev PUT), list/download, BYTEA; blueprint columns on **`attachment_ingests`** (**F**). Canonical table rename / object checksum for S3 **deferred**. |
| Analytics pipeline | **Partial** | Local structured rollups (**G**); server fact tables / jobs **deferred**. |
| PWA / SW | **Partial** | Vite PWA + **`offline.html`** navigation fallback (**I**); full offline routing UX **ongoing**. |
| Repo structure | **Partial** | `apps/web`, `apps/api`, `shared-types`; blueprint extra packages **deferred**. |

---

## Migration Inventory — prototype panels → v2 modules

| Inventory panel | Payload / intent | v2 module / surface |
|-----------------|------------------|---------------------|
| `login-or-global` | Login / provider | `LoginPage`, `authStore` (+ API login), `Header` |
| `panel-encounter` | H&P / encounter | Demographics, triage, surgical needs, summary |
| `panel-surgneed` | Surgical need | `surgical-needs` |
| `panel-or` | OR record | `or-record` |
| `panel-opnote` | Op note | `operative-note` |
| `panel-nursing` | Nursing orders | `nursing-orders` |
| `panel-pacu` | PACU rows | `pacu` |
| `panel-floor` | Floor rows | `floor-flow` |
| `panel-progress` | Progress / wound | `progress-notes` |
| `panel-labs` | Labs | `labs` |
| `panel-meds` | Meds | `medications` |
| `panel-discharge` | Discharge | `discharge` |
| `panel-followup` | Follow-up | `follow-up-notes` |

**Inventory rules:** clinical intent preserved; RBAC + domain classification **ongoing**; real auth now includes **Postgres-backed users** when API is used.

---

## Future / out of scope (reference)

*Not in the current execution slice; kept for roadmap and spec traceability.*

- **Server tenant workflow policy** — Authoritative `enableInReview` + nursing sign-off module list in API/DB (replace IndexedDB `keyValue`); cross-device consistency.
- **Signed-version sync authority** — Server rules for signed rows, amendments, and conflict handling vs local Dexie (**chunk D** follow-on).
- **Smarter sync merge UI** — Interactive / field-level resolution for draft conflicts (beyond revision + banner + keep-local).
- **MedicationRequest** / orders FHIR profile and API workflow (**chunk E** note).
- **Full admin CRUD** — Users, facilities, audit views beyond shells (**chunk H**).
- **Postgres parity** — Canonical **`attachments`** table rename, S3 object checksum, `audit_events`, device graph, analytics fact tables.
- **Server-side role checks** on every clinical write (engineering acceptance §20).
- **Refresh tokens** / device registration (blueprint §11).
- **Persisted TanStack Query cache** / devtools (**chunk I** optional).

---

## Human checklist (Supabase / ops)

Apply SQL in order: `001` through **`007_attachment_blueprint_columns.sql`**. Set **`JWT_SECRET`** on the API. Seed users use password = username (`surgeon` / `nurse` / `admin`) — **rotate in production**. Web: `VITE_SYNC_API_BASE`, optional `VITE_SYNC_TENANT_SLUG=default`, login via UI (JWT stored in IndexedDB session).

---

## How to use this matrix in PRs

1. When behavior ships, update this file in the same PR.
2. Deferred work stays in the **Chunk** or **Deferred** sections — do not delete source-doc requirements.
3. Link `docs/v2/phase-*-validation.md` when a phase closes.

---

## Related docs

- `docs/v2/postgres-schema-draft.sql`, `apps/api/migrations/*.sql`
- `apps/api/README.md`
- `FHIR_ARCHITECTURE.md`, `docs/v2/fhir-mapping-matrix.md` (if present)
