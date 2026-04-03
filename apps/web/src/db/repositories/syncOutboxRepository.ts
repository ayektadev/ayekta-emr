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
