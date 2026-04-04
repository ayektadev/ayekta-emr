# Phase 5 validation — surgery modules (Blueprint §19 + Product Spec §7)

Reference: `Ayekta_v2_Engineering_Blueprint.md` Phase 5 deliverables and `Ayekta_v2_Product_Spec.md` §7 (pre-op checklist, procedure note, anesthesia fields, post-op orders, wound follow-up, complications log, surgical outcomes).

## Blueprint Phase 5 deliverable mapping

| Deliverable | Implementation | Notes |
|-------------|----------------|-------|
| **Pre-op** | `PreOpChecklist` on `PatientData` + module `pre-op-checklist` | ASA, consent status, NPO/site/imaging/labs/meds checks, DVT plan, AC/beta-blocker tri-state, notes. Aligns with inventory `preop.*` / encounter readiness. |
| **Procedure / op note** | Extended `OperativeNote` + UI section “Structured procedure (registry)” | Migration Inventory `panel-opnote` selects: procedure category, closure, drains, specimen, hernia F/H, complication class, EBL mL, outcome narrative, post-op media flag. Narrative fields unchanged. |
| **Anesthesia fields** | Existing `pre-anesthesia`, `anesthesia-record` modules | Phase 5 does not duplicate; pre-op checklist bridges intake → anesthesia. |
| **Post-op** | Existing `nursing-orders`, `pacu`, `floor-flow`, `discharge` | PACU extended with inventory pain + TAP summary block. |
| **Wound** | Existing `progress-notes` (wound in exam/plan) | Product Spec wound follow-up remains in progress notes / discharge criteria; no separate duplicate module. |
| **Complications** | `complicationLog: ComplicationLogEntry[]` + module `complications-log` | Repeatable log (Blueprint `ComplicationEvent` intent) in addition to op-note complication narrative/class. |
| **Outcomes** | `SurgicalOutcomesCapture` + module `surgical-outcomes` | Immediate result, narrative, disposition, unexpected findings, 30-day tri-state flags. |

## Routes / navigation

- Chart sections: `apps/web/src/constants/patientChartSections.ts` (order: … consent → pre-op checklist → pre-anesthesia … op note → complications log → surgical outcomes → nursing orders …).
- Module registry: `apps/web/src/utils/moduleRegistry.ts` (lazy chunks + `enabledByDefault`).
- Legacy tab bar: `TabNavigation.tsx` labels for new `TabName` values.

## Persistence

- `loadPatient` merges new keys for older JSON exports (`patientStore.ts`).
- `savePatient`, `useAutoSave`, `Header` PDF/JSON payload include `preOpChecklist`, `complicationLog`, `surgicalOutcomes`.
- `fullChartPDF.ts` prints checklist, registry op-note fields, complications log, and surgical outcomes.

## Module preferences migration

- `moduleManagementStore.loadPreferences` merges saved `enabledModules` with registry defaults so **new** Phase 5 modules stay enabled when `enabledByDefault` is true, and appends unknown module ids to `moduleOrder`.

## Manual smoke test

1. Sign in → open a patient → enable new modules in Settings if needed.  
2. Fill **Pre-op checklist**, **Op note** structured section, **Complications log** (≥1 row), **Surgical outcomes**, **PACU** pain/TAP block.  
3. Wait for autosave → refresh → confirm fields persist.  
4. Save / PDF → confirm new sections appear in PDF.

## Deferred (later phases)

- **Signing / versioning** of these sections → Phase 6.  
- **Server-side** complication/outcome fact tables → Postgres / analytics Phase 9.  
- **FHIR Observation/Procedure** mapping for new discrete fields → mapper updates in Phase 8 alongside `fhir-mapping-matrix.md`.
