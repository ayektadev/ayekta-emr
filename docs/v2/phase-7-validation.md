# Phase 7 validation — sync (push/pull surface, queue, badges, conflicts)

Reference: `Ayekta_v2_Engineering_Blueprint.md` §10 (sync architecture) and Phase 7 deliverables: push/pull API, local queue processor, status badges, conflict handling UI.

## Deliverable mapping

| Deliverable | Implementation | Notes |
|-------------|----------------|-------|
| **Push / pull API** | `services/syncTransport.ts` + **`apps/api`** (FastAPI) | Mock transport by default. With `VITE_SYNC_API_BASE`, client calls a real Postgres-backed service (`ayekta_api`). Apply `apps/api/migrations/001_core_tenant_chart_ingest.sql` to your database (Supabase, RDS, etc.). |
| **Local queue processor** | `processSyncQueue` in `services/syncQueue.ts` | Walks pending `syncOutbox` rows, loads payload from `syncQueue`, calls `syncPush`, marks `synced` / `error`, bumps `retryCount` on transient failure (cap `MAX_RETRIES`), runs `syncPull` after batch. |
| **Coalesced enqueue** | `upsertPendingChartBundlePush` | Removes prior **pending** `chart_bundle` rows for the same patient before enqueueing (avoids unbounded duplicates). |
| **Outbox repo** | `syncOutboxRepository.ts` | `bumpOutboxRetry`, `removePendingChartPushesForEntity`, `countOutboxByStatus`. |
| **Status badges** | `SyncStatusBadge` in `AppShell` header | Pending / error / offline / syncing / up to date; **Sync now** when there is work. |
| **Conflict UI** | `SyncConflictBanner` + `syncStatusStore` | On mock conflict (or HTTP 409), outbox → `error`, audit `sync_conflict`, banner with **Keep local & retry** (`requeueOutboxPush`) or **Dismiss**. |
| **Audit** | `appendLocalAuditEvent` | `sync_success`, `sync_failure`, `sync_conflict` with `entityType: 'sync'`. |
| **Autosave → queue** | `useAutoSave` + `chartSyncEnqueue` | Full-chart snapshot to IndexedDB; debounced (~12s) enqueue after autosave. Header **Save** calls `notifyChartSavedForSync` with PDF blob when generated. |
| **Background sync** | `SyncBootstrap` | Online/offline listeners; `refreshCounts` on load; interval ~45s `runProcessor` when online. |

## Manual smoke test

1. Sign in → open patient → edit → wait for autosave (or **Save** with PDF).  
2. Header badge should show pending, then **Up to date** after processor runs (online).  
3. **Settings → Sync & display** → enable **Simulate server conflict** → **Run sync processor** → expect red conflict banner; **Keep local & retry** → expect success after mock allows second pass (or disable demo flag + clear mock state).  
4. Go offline (browser devtools) → badge **Offline**; come back online → pending flush resumes.  
5. (Optional) Set `VITE_SYNC_API_BASE` to a real gateway implementing the three routes; confirm 409 surfaces as conflict.

## Deferred

- **True multi-device merge** and field-level demographic rules (blueprint §10 conflict rules).  
- **Version-aware push** (`versionId` on outbox tied to signed encounter rows).  
- **Attachment binary** upload in queue (currently chart JSON + optional PDF in legacy `syncQueue` row).
