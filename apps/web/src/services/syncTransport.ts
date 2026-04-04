/**
 * Phase 7 sync transport — mock by default; optional HTTP to VITE_SYNC_API_BASE.
 * Blueprint: POST /sync/push, /sync/pull, /sync/ack (single reconciliation surface).
 */

import { useAuthStore } from '../store/authStore';

export interface SyncPushBody {
  clientId: string;
  entityType: string;
  entityId: string;
  versionId: string | null;
  operation: string;
  payloadHash: string;
  payloadJson: string;
  /** Server `encounters.server_revision` last seen after pull or successful push (Chunk D). */
  baseServerRevision?: number;
}

export type SyncPushResult =
  | { ok: true; serverRevision?: number }
  | { ok: false; kind: 'conflict'; message: string; serverRevision?: number }
  | { ok: false; kind: 'network'; message: string }
  | { ok: false; kind: 'server'; message: string };

export interface SyncPullResult {
  ok: boolean;
  bundles: unknown[];
  cursor: string | null;
  hasMore?: boolean;
  message?: string;
}

function parseFastApiDetail(raw: unknown): { message: string; serverRevision?: number } {
  if (raw == null) return { message: 'Server rejected push (conflict).' };
  if (typeof raw === 'string') return { message: raw };
  if (typeof raw === 'object' && 'message' in raw && typeof (raw as { message: unknown }).message === 'string') {
    const o = raw as { message: string; serverRevision?: unknown };
    const rev = o.serverRevision;
    return {
      message: o.message,
      serverRevision: typeof rev === 'number' && Number.isFinite(rev) ? rev : undefined,
    };
  }
  return { message: 'Server rejected push (conflict).' };
}

const MOCK_DELAY_MS = 280;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Headers for authenticated sync + attachment calls to `VITE_SYNC_API_BASE`. */
export function getSyncRequestHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const tenant = import.meta.env.VITE_SYNC_TENANT_ID as string | undefined;
  if (tenant?.trim()) {
    h['X-Tenant-Id'] = tenant.trim();
  }

  const jwt = useAuthStore.getState().accessToken?.trim();
  if (jwt) {
    h.Authorization = `Bearer ${jwt}`;
    return h;
  }

  const key = import.meta.env.VITE_SYNC_API_KEY as string | undefined;
  if (key?.trim()) {
    h.Authorization = `Bearer ${key.trim()}`;
  }
  return h;
}

function simulateConflict(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('ayekta-sync-simulate-conflict') === '1';
  } catch {
    return false;
  }
}

/** Idempotency: same clientId always succeeds after first success unless conflict mode forces conflict once. */
const mockAcked = new Set<string>();
const mockConflicted = new Set<string>();

/** Reset mock idempotency / conflict memory (e.g. when turning off demo conflict in Settings). */
export function clearMockSyncTransportState(): void {
  mockAcked.clear();
  mockConflicted.clear();
}

export async function syncPush(body: SyncPushBody): Promise<SyncPushResult> {
  const base = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');
  if (base) {
    try {
      const res = await fetch(`${base}/sync/push`, {
        method: 'POST',
        headers: getSyncRequestHeaders(),
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        const j = (await res.json().catch(() => ({}))) as { detail?: unknown };
        const { message, serverRevision } = parseFastApiDetail(j.detail);
        return { ok: false, kind: 'conflict', message, serverRevision };
      }
      if (!res.ok) {
        return { ok: false, kind: 'server', message: `HTTP ${res.status}` };
      }
      const okJson = (await res.json().catch(() => ({}))) as { serverRevision?: unknown };
      const sr = okJson.serverRevision;
      return {
        ok: true,
        serverRevision: typeof sr === 'number' && Number.isFinite(sr) ? sr : undefined,
      };
    } catch (e) {
      return { ok: false, kind: 'network', message: e instanceof Error ? e.message : 'Network error' };
    }
  }

  await sleep(MOCK_DELAY_MS);
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, kind: 'network', message: 'Offline' };
  }

  if (simulateConflict()) {
    if (!mockConflicted.has(body.clientId)) {
      mockConflicted.add(body.clientId);
      return {
        ok: false,
        kind: 'conflict',
        message:
          'Simulated conflict: server has a different base version. Resolve in the banner or turn off demo conflict in Settings.',
      };
    }
  }

  mockAcked.add(body.clientId);
  return { ok: true };
}

export async function syncPull(_cursor: string | null): Promise<SyncPullResult> {
  const base = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');
  if (base) {
    try {
      const res = await fetch(`${base}/sync/pull`, {
        method: 'POST',
        headers: getSyncRequestHeaders(),
        body: JSON.stringify({ cursor: _cursor }),
      });
      if (!res.ok) {
        return { ok: false, bundles: [], cursor: _cursor, message: `HTTP ${res.status}` };
      }
      const j = (await res.json()) as {
        bundles?: unknown[];
        cursor?: string | null;
        hasMore?: boolean;
      };
      return {
        ok: true,
        bundles: j.bundles ?? [],
        cursor: j.cursor ?? null,
        hasMore: j.hasMore === true,
      };
    } catch (e) {
      return {
        ok: false,
        bundles: [],
        cursor: _cursor,
        message: e instanceof Error ? e.message : 'Pull failed',
      };
    }
  }

  await sleep(120);
  return { ok: true, bundles: [], cursor: null, hasMore: false };
}

export async function syncAck(clientIds: string[]): Promise<void> {
  const base = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');
  if (!base || clientIds.length === 0) return;
  try {
    await fetch(`${base}/sync/ack`, {
      method: 'POST',
      headers: getSyncRequestHeaders(),
      body: JSON.stringify({ clientIds }),
    });
  } catch {
    /* non-fatal */
  }
}
