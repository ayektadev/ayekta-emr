import { getAyektaDB } from '../dexie/database';
import type { LocalAuditEventRow } from '../dexie/schemaTypes';

export async function appendLocalAuditEvent(
  row: Omit<LocalAuditEventRow, 'id'>
): Promise<void> {
  try {
    await getAyektaDB().auditEventsLocal.add(row);
  } catch (e) {
    console.error('appendLocalAuditEvent:', e);
  }
}
