# Phases 1–4 validation (Blueprint §19 + Product Spec §7 workflow shell)

Reference: `revamp april 26/Ayekta_v2_Engineering_Blueprint.md` §19, `Ayekta_v2_Product_Spec.md` §§6–7, `Ayekta_v2_Migration_Inventory.md`.

This document records **adequacy for frontend-first delivery**, not server-backed completion.

---

## Phase 1 — extraction and schema lock

| Deliverable | Status | Evidence in repo |
|-------------|--------|------------------|
| Field inventory from current HTML | **Met** | `revamp april 26/Ayekta_v2_Migration_Inventory.md` (panels, static controls, dynamic groups) |
| Final domain model (clinical) | **Met** | `apps/web/src/types/patient.types.ts` (`PatientData` and module sub-objects) |
| Role matrix (module access) | **Met** | `apps/web/src/utils/moduleRegistry.ts` (`allowedRoles` per module) + `packages/shared-types` clinical role type |
| Route map | **Met** | `packages/shared-types/src/routes.ts`, `apps/web/src/App.tsx` |
| Dexie schema | **Met** | `apps/web/src/db/dexie/database.ts` (v2 tables) |
| Postgres schema draft | **Met** | `docs/v2/postgres-schema-draft.sql` |
| FHIR mapping matrix | **Met** | `docs/v2/fhir-mapping-matrix.md` |

**Update:** Named Phase 5 domain slices (`PreOpChecklist`, `ComplicationLogEntry`, `SurgicalOutcomesCapture`) now live in `patient.types.ts` with UI modules — see **`docs/v2/phase-5-validation.md`**. Phase 1 still “locked” persistence shape separately in Dexie/Postgres drafts.

---

## Phase 2 — app shell and auth

See **`docs/v2/phase-2-validation.md`**. Summary: Vite app, tokens/shell, `/login`, role-aware nav, mock auth + offline session row, PWA baseline. **Partial:** real online auth/API per blueprint §11.

---

## Phase 3 — local persistence

See **`docs/v2/phase-3-validation.md`**. Summary: repositories, `patients` / `encounters` / `encounterVersions`, attachments meta, sync queue + outbox, Dexie upgrade/migration. Chart JSON remains the UI source of truth with **projection** into normalized tables for search/encounter list.

---

## Phase 4 — patient and encounter UX

| Deliverable | Status | Evidence |
|-------------|--------|----------|
| Patient registration / search | **Met** | `apps/web/src/pages/PatientsListPage.tsx` (facility list + search + in-memory merge); new patient from dashboard → `/patients/:id` |
| Patient chart tabs | **Met** | `apps/web/src/pages/PatientWorkspacePage.tsx` + `constants/patientChartSections.ts` + `LazyModuleLoader` |
| Encounter composer | **Met (draft)** | Single draft encounter per patient in Dexie (`encounterRepository`); no separate “composer” route beyond chart sections |
| Nurse intake workflow | **Met (UX)** | Default section `?s=` for `nurse` role → vitals/intake when enabled; intake flags on section defs |
| Surgeon workflow | **Met (UX)** | Default `summary` for non-nurse; surgical modules in chart order |

**Gaps vs long-form blueprint narrative**

- **Encounter lifecycle states** (`draft` / `in_review` / `signed` …) are **Phase 6**, not Phase 4.
- **Attachments upload UX** is **Phase 8**; Phase 4 may still show a documents placeholder panel.

---

## Conclusion

Phases **1–4** are **adequately covered** for the documented frontend-first scope, with known deferrals: real auth API, signed/amended encounter lifecycle, full attachments/FHIR/sync.

Proceed to **Phase 5** when surgery-scoped module parity (pre-op through outcomes) is the priority.
