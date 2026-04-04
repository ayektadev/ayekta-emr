import { getAyektaDB } from '../dexie/database';
import type { SyncOutboxRow } from '../dexie/schemaTypes';

export async function enqueueSyncOutbox(row: Omit<SyncOutboxRow, 'id'>): Promise<void> {
  try {
    await getAyektaDB().syncOutbox.add(row);
  } catch (e) {
    console.error('syncOutboxRepository.enqueueSyncOutbox:', e);
  }
}

export async function listPendingOutbox(): Promise<SyncOutboxRow[]> {
  try {
    return await getAyektaDB().syncOutbox.where('status').equals('pending').toArray();
  } catch (e) {
    console.error('listPendingOutbox:', e);
    return [];
  }
}

export async function markOutboxStatus(
  clientId: string,
  status: SyncOutboxRow['status'],
  lastError: string | null
): Promise<void> {
  try {
    const db = getAyektaDB();
    const row = await db.syncOutbox.where('clientId').equals(clientId).first();
    if (row?.id != null) {
      await db.syncOutbox.update(row.id, { status, lastError });
    }
  } catch (e) {
    console.error('markOutboxStatus:', e);
  }
}

export async function bumpOutboxRetry(clientId: string, lastError: string): Promise<void> {
  try {
    const db = getAyektaDB();
    const row = await db.syncOutbox.where('clientId').equals(clientId).first();
    if (row?.id != null) {
      await db.syncOutbox.update(row.id, {
        retryCount: row.retryCount + 1,
        lastError,
      });
    }
  } catch (e) {
    console.error('bumpOutboxRetry:', e);
  }
}

/** Drop pending chart_bundle rows for one patient so the next enqueue coalesces to one push. */
export async function removePendingChartPushesForEntity(entityId: string): Promise<void> {
  try {
    const db = getAyektaDB();
    const rows = await db.syncOutbox
      .where('entityId')
      .equals(entityId)
      .filter((r) => r.entityType === 'chart_bundle' && r.status === 'pending')
      .toArray();
    for (const r of rows) {
      await db.syncQueue.where('clientId').equals(r.clientId).delete();
      if (r.id != null) await db.syncOutbox.delete(r.id);
    }
  } catch (e) {
    console.error('removePendingChartPushesForEntity:', e);
  }
}

export async function countOutboxByStatus(status: SyncOutboxRow['status']): Promise<number> {
  try {
    return await getAyektaDB().syncOutbox.where('status').equals(status).count();
  } catch (e) {
    console.error('countOutboxByStatus:', e);
    return 0;
  }
}
