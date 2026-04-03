# Phase 3 validation (Engineering Blueprint §19)

Reference: Blueprint §9 (Dexie tables), Phase 3 deliverables.

| Deliverable | Status | Where |
|-------------|--------|--------|
| Dexie repositories | **Met** | `apps/web/src/db/repositories/*` |
| Patient store (local) | **Met** | `patientRepository.ts` + `patients` / `patientIdentifiers` tables |
| Encounter store (local) | **Met** | `encounterRepository.ts` + `encounters` / `encounterVersions` |
| Attachment metadata store | **Met** | `attachmentRepository.ts` + `attachmentsMeta` / `pendingAttachments` |
| Sync queue | **Met** | Legacy `syncQueue` (blob-friendly) + structured `syncOutbox` (Blueprint §10 shape) |
| Migration support | **Met** | Dexie `version(2)` upgrade + `migrateFromLocalforage` + `persistChartSnapshot` after legacy chart import |

**Manual checks**

1. Sign in → new patient → edit demographics → wait for autosave (or Save on chart header).  
2. DevTools → Application → IndexedDB → `AyektaEMR_v2` → confirm rows in `patients`, `encounters`, `encounterVersions` update with chart edits.  
3. Save with PDF/JSON queue → rows appear in `syncQueue` and `syncOutbox`.  
4. Sign out → confirm `chartDraft` cleared and patient/encounter rows for that ISHI id removed (normalized graph cleanup).

**Note:** Chart UI still reads/writes the `chartDraft` blob; normalized tables are the offline projection for Phase 4+ (search, encounter list, sync API).
