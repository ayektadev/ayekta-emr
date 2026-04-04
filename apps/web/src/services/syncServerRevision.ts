import { getAyektaDB } from '../db/dexie/database';

const KEY_PREFIX = 'sync-server-rev:';

export async function getServerRevisionForPatient(ishiId: string): Promise<number | null> {
  if (!ishiId) return null;
  try {
    const row = await getAyektaDB().keyValue.get(KEY_PREFIX + ishiId);
    if (row == null || row.v == null) return null;
    const n = Number(row.v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function setServerRevisionForPatient(ishiId: string, rev: number): Promise<void> {
  if (!ishiId || !Number.isFinite(rev)) return;
  try {
    await getAyektaDB().keyValue.put({ k: KEY_PREFIX + ishiId, v: rev });
  } catch (e) {
    console.error('setServerRevisionForPatient:', e);
  }
}
