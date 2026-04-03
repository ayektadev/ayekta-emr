import { getAyektaDB } from '../dexie/database';

export async function putReferenceData(key: string, value: unknown): Promise<void> {
  try {
    await getAyektaDB().referenceData.put({ key, value });
  } catch (e) {
    console.error('putReferenceData:', e);
  }
}

export async function getReferenceData<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const row = await getAyektaDB().referenceData.get(key);
    return row?.value as T | undefined;
  } catch (e) {
    console.error('getReferenceData:', e);
    return undefined;
  }
}
