import { create } from 'zustand';
import {
  countOutboxByStatus,
  listPendingOutbox,
} from '../db/repositories/syncOutboxRepository';
import { processSyncQueue, requeueOutboxPush } from '../services/syncQueue';

export interface SyncConflict {
  clientId: string;
  entityId: string;
  message: string;
  /** Present on HTTP 409 — align local KV before “keep local & retry”. */
  serverRevision?: number;
}

interface SyncStatusState {
  pendingCount: number;
  errorCount: number;
  isOnline: boolean;
  isProcessing: boolean;
  lastPullAt: number | null;
  lastProcessAt: number | null;
  lastError: string | null;
  conflicts: SyncConflict[];
  refreshCounts: () => Promise<void>;
  runProcessor: () => Promise<void>;
  dismissConflict: (clientId: string) => void;
  pushConflict: (c: SyncConflict) => void;
  resolveKeepLocalAndRetry: (clientId: string) => Promise<void>;
}

export const useSyncStatusStore = create<SyncStatusState>((set, get) => ({
  pendingCount: 0,
  errorCount: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isProcessing: false,
  lastPullAt: null,
  lastProcessAt: null,
  lastError: null,
  conflicts: [],

  refreshCounts: async () => {
    try {
      const pending = await listPendingOutbox();
      const err = await countOutboxByStatus('error');
      set({
        pendingCount: pending.length,
        errorCount: err,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      });
    } catch {
      set({ lastError: 'Could not read sync queue' });
    }
  },

  runProcessor: async () => {
    if (get().isProcessing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      set({ isOnline: false });
      return;
    }
    set({ isProcessing: true, lastError: null });
    try {
      const result = await processSyncQueue();
      set({
        lastProcessAt: Date.now(),
        lastError:
          result.conflicts > 0
            ? `${result.conflicts} conflict(s) need review`
            : result.failed > result.succeeded && result.succeeded === 0
              ? 'Some items failed to sync'
              : null,
      });
    } catch (e) {
      set({ lastError: e instanceof Error ? e.message : 'Sync failed' });
    } finally {
      set({ isProcessing: false });
      await get().refreshCounts();
    }
  },

  dismissConflict: (clientId) => {
    set((s) => ({ conflicts: s.conflicts.filter((c) => c.clientId !== clientId) }));
  },

  pushConflict: (c) => {
    set((s) => {
      if (s.conflicts.some((x) => x.clientId === c.clientId)) return s;
      return { conflicts: [...s.conflicts, c] };
    });
  },

  resolveKeepLocalAndRetry: async (clientId) => {
    const c = get().conflicts.find((x) => x.clientId === clientId);
    if (c?.entityId && typeof c.serverRevision === 'number') {
      const { setServerRevisionForPatient } = await import('../services/syncServerRevision');
      await setServerRevisionForPatient(c.entityId, c.serverRevision);
    }
    await requeueOutboxPush(clientId);
    get().dismissConflict(clientId);
    await get().refreshCounts();
    await get().runProcessor();
  },
}));
