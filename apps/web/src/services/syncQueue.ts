import type { PatientData } from '../types/patient.types';
import { getAyektaDB } from '../db/dexie/database';
import { hashPayloadUtf8 } from '../db/repositories/persistenceBridge';
import {
  bumpOutboxRetry,
  enqueueSyncOutbox,
  listPendingOutbox,
  markOutboxStatus,
  removePendingChartPushesForEntity,
} from '../db/repositories/syncOutboxRepository';
import { appendLocalAuditEvent } from '../db/repositories/auditRepository';
import { getPersistenceContext } from '../db/repositories/persistenceContext';
import { applyPulledBundles } from './applySyncPull';
import { getServerRevisionForPatient, setServerRevisionForPatient } from './syncServerRevision';
import { syncAck, syncPull, syncPush, type SyncPushBody } from './syncTransport';

export interface QueuedSync {
  id: string;
  ishiId: string;
  jsonContent: string;
  pdfBlob?: Blob;
  timestamp: number;
  attempts: number;
}

const MAX_RETRIES = 6;

function rowToQueued(row: {
  clientId: string;
  ishiId: string;
  jsonContent: string;
  pdfBlob?: Blob;
  timestamp: number;
  attempts: number;
}): QueuedSync {
  return {
    id: row.clientId,
    ishiId: row.ishiId,
    jsonContent: row.jsonContent,
    pdfBlob: row.pdfBlob,
    timestamp: row.timestamp,
    attempts: row.attempts,
  };
}

/**
 * Coalesce pending chart pushes for this patient to a single outbox + syncQueue row.
 */
export async function upsertPendingChartBundlePush(
  data: PatientData,
  pdfBlob?: Blob | null
): Promise<void> {
  const ishiId = data.ishiId;
  if (!ishiId) return;

  try {
    const db = getAyektaDB();
    await removePendingChartPushesForEntity(ishiId);

    const clientId = `sync_${ishiId}_${Date.now()}`;
    const createdAt = Date.now();
    const jsonContent = JSON.stringify(data, null, 2);

    await db.syncQueue.add({
      clientId,
      ishiId,
      jsonContent,
      pdfBlob: pdfBlob ?? undefined,
      timestamp: createdAt,
      attempts: 0,
    });

    const payloadHash = await hashPayloadUtf8(jsonContent);
    await enqueueSyncOutbox({
      clientId,
      entityType: 'chart_bundle',
      entityId: ishiId,
      versionId: null,
      operation: 'push',
      payloadHash,
      createdAt,
      retryCount: 0,
      status: 'pending',
      lastError: null,
    });
  } catch (error) {
    console.error('upsertPendingChartBundlePush:', error);
  }
}

/** @deprecated Prefer upsertPendingChartBundlePush */
export async function addToSyncQueue(
  ishiId: string,
  jsonContent: string,
  pdfBlob?: Blob
): Promise<void> {
  try {
    const data = JSON.parse(jsonContent) as PatientData;
    if (data.ishiId !== ishiId) data.ishiId = ishiId;
    await upsertPendingChartBundlePush(data, pdfBlob);
  } catch {
    const db = getAyektaDB();
    const clientId = `sync_${ishiId}_${Date.now()}`;
    const createdAt = Date.now();
    await db.syncQueue.add({
      clientId,
      ishiId,
      jsonContent,
      pdfBlob,
      timestamp: createdAt,
      attempts: 0,
    });
    const payloadHash = await hashPayloadUtf8(jsonContent);
    await enqueueSyncOutbox({
      clientId,
      entityType: 'chart_bundle',
      entityId: ishiId,
      versionId: null,
      operation: 'push',
      payloadHash,
      createdAt,
      retryCount: 0,
      status: 'pending',
      lastError: null,
    });
  }
}

async function getSyncQueue(): Promise<QueuedSync[]> {
  try {
    const db = getAyektaDB();
    const rows = await db.syncQueue.toArray();
    return rows.map((r) =>
      rowToQueued({
        clientId: r.clientId,
        ishiId: r.ishiId,
        jsonContent: r.jsonContent,
        pdfBlob: r.pdfBlob,
        timestamp: r.timestamp,
        attempts: r.attempts,
      })
    );
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}

async function auditSync(action: string, entityId: string, metadata?: Record<string, unknown>) {
  const ctx = getPersistenceContext();
  await appendLocalAuditEvent({
    tenantId: ctx.tenantId,
    facilityId: ctx.facilityId,
    username: ctx.username,
    entityType: 'sync',
    entityId,
    action,
    metadataJson: metadata,
    occurredAt: Date.now(),
  });
}

/**
 * Flush pending outbox pushes (mock or HTTP). Idempotent per clientId on server mock.
 */
export async function processSyncQueue(): Promise<{
  succeeded: number;
  failed: number;
  total: number;
  conflicts: number;
}> {
  const pending = await listPendingOutbox();
  const sorted = [...pending].sort((a, b) => a.createdAt - b.createdAt);

  let succeeded = 0;
  let failed = 0;
  let conflicts = 0;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { succeeded: 0, failed: 0, total: sorted.length, conflicts: 0 };
  }

  const apiBase = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');
  const pendingEntityIds = new Set(
    sorted.filter((r) => r.status === 'pending').map((r) => r.entityId)
  );

  const runPullLoop = async (revisionOnlyFor?: ReadonlySet<string>) => {
    let pullCursor: string | null = null;
    let lastOk = false;
    for (;;) {
      const pull = await syncPull(pullCursor);
      lastOk = pull.ok;
      if (!pull.ok) break;
      await applyPulledBundles(pull.bundles, {
        revisionOnlyEntityIds: revisionOnlyFor,
      });
      if (!pull.hasMore) break;
      pullCursor = pull.cursor;
      if (!pullCursor) break;
    }
    if (lastOk) {
      const { useSyncStatusStore } = await import('../store/syncStatusStore');
      useSyncStatusStore.setState({ lastPullAt: Date.now() });
    }
  };

  if (apiBase) {
    await runPullLoop(pendingEntityIds);
  }

  const db = getAyektaDB();
  const acked: string[] = [];

  for (const row of sorted) {
    if (row.status !== 'pending') continue;

    const sq = await db.syncQueue.where('clientId').equals(row.clientId).first();
    if (!sq) {
      await markOutboxStatus(row.clientId, 'error', 'missing_payload');
      await auditSync('sync_failure', row.entityId, { clientId: row.clientId, reason: 'missing_payload' });
      failed++;
      continue;
    }

    const body: SyncPushBody = {
      clientId: row.clientId,
      entityType: row.entityType,
      entityId: row.entityId,
      versionId: row.versionId,
      operation: row.operation,
      payloadHash: row.payloadHash,
      payloadJson: sq.jsonContent,
    };
    const baseRev = await getServerRevisionForPatient(row.entityId);
    if (baseRev != null) {
      body.baseServerRevision = baseRev;
    }

    const result = await syncPush(body);

    if (result.ok) {
      await markOutboxStatus(row.clientId, 'synced', null);
      await db.syncQueue.where('clientId').equals(row.clientId).delete();
      succeeded++;
      acked.push(row.clientId);
      if (typeof result.serverRevision === 'number') {
        await setServerRevisionForPatient(row.entityId, result.serverRevision);
      }
      await auditSync('sync_success', row.entityId, { clientId: row.clientId, payloadHash: row.payloadHash });
    } else if (result.kind === 'conflict') {
      await markOutboxStatus(row.clientId, 'error', result.message);
      conflicts++;
      failed++;
      await auditSync('sync_conflict', row.entityId, {
        clientId: row.clientId,
        message: result.message,
      });
      const { useSyncStatusStore } = await import('../store/syncStatusStore');
      useSyncStatusStore.getState().pushConflict({
        clientId: row.clientId,
        entityId: row.entityId,
        message: result.message,
        serverRevision: result.serverRevision,
      });
    } else {
      await bumpOutboxRetry(row.clientId, result.message);
      const updated = await db.syncOutbox.where('clientId').equals(row.clientId).first();
      if (updated && updated.retryCount >= MAX_RETRIES) {
        await markOutboxStatus(row.clientId, 'error', result.message);
      }
      failed++;
      await auditSync('sync_failure', row.entityId, {
        clientId: row.clientId,
        message: result.message,
        retries: updated?.retryCount,
      });
    }
  }

  if (acked.length) void syncAck(acked);

  if (apiBase) {
    await runPullLoop(undefined);
  }

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    const { flushPendingAttachmentsToApi } = await import('./attachmentUpload');
    await flushPendingAttachmentsToApi();
    const { queryClient } = await import('../query/queryClient');
    const { queryKeys } = await import('../query/queryKeys');
    void queryClient.invalidateQueries({ queryKey: queryKeys.serverAttachmentsAll });
  }

  return {
    succeeded,
    failed,
    total: sorted.length,
    conflicts,
  };
}

/** Re-queue a conflicted row as pending for another push attempt (e.g. after clinician review). */
export async function requeueOutboxPush(clientId: string): Promise<void> {
  const db = getAyektaDB();
  const row = await db.syncOutbox.where('clientId').equals(clientId).first();
  if (row?.id == null) return;
  await db.syncOutbox.update(row.id, {
    status: 'pending',
    lastError: null,
    retryCount: 0,
  });
}

export async function getSyncQueueStatus(): Promise<{
  queueLength: number;
  oldestItem?: number;
}> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    return { queueLength: 0 };
  }

  const oldestTimestamp = Math.min(...queue.map((item) => item.timestamp));

  return {
    queueLength: queue.length,
    oldestItem: oldestTimestamp,
  };
}

export async function clearSyncQueue(): Promise<void> {
  try {
    const db = getAyektaDB();
    await db.syncQueue.clear();
    await db.syncOutbox.clear();
    console.log('Sync queue cleared');
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
}
