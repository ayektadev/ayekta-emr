import { getAyektaDB } from '../db/dexie/database';
import { hashPayloadUtf8 } from '../db/repositories/persistenceBridge';
import { enqueueSyncOutbox, listPendingOutbox } from '../db/repositories/syncOutboxRepository';

export interface QueuedSync {
  id: string;
  ishiId: string;
  jsonContent: string;
  pdfBlob?: Blob;
  timestamp: number;
  attempts: number;
}

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

export async function addToSyncQueue(
  ishiId: string,
  jsonContent: string,
  pdfBlob?: Blob
): Promise<void> {
  try {
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
    console.log('Added to sync queue:', ishiId);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
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

/**
 * Cloud sync is parked (no Google Drive / API). Queue is persisted for a future push worker.
 */
export async function processSyncQueue(): Promise<{
  succeeded: number;
  failed: number;
  total: number;
}> {
  const queue = await getSyncQueue();
  const outbox = await listPendingOutbox();
  console.info(
    '[sync] Remote sync parked; legacy queue:',
    queue.length,
    'structured outbox pending:',
    outbox.length
  );
  return { succeeded: 0, failed: 0, total: queue.length + outbox.length };
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
