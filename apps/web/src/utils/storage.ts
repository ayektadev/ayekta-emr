import { CHART_DRAFT_KEY } from '../db/constants';
import { getAyektaDB } from '../db/dexie/database';
import { clearLocalClinicalDataForPatient, persistChartSnapshot } from '../db/repositories/persistenceBridge';
import type { PatientData } from '../types/patient.types';
import { parseLegacyPatientJson } from '../migration/legacyJson';

/**
 * Save patient chart payload to IndexedDB (Dexie) — local-first.
 * Also projects into patients / encounters tables (Phase 3 repositories).
 */
export async function saveToStorage(data: PatientData): Promise<void> {
  try {
    const db = getAyektaDB();
    await db.chartDraft.put({ key: CHART_DRAFT_KEY, payload: data });
    await persistChartSnapshot(data);
  } catch (error) {
    console.error('Failed to save to storage:', error);
    throw error;
  }
}

export async function loadFromStorage(): Promise<PatientData | null> {
  try {
    const db = getAyektaDB();
    const row = await db.chartDraft.get(CHART_DRAFT_KEY);
    return row?.payload ?? null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

/** Clears chart draft only (module prefs + sync queue + auth unchanged). */
export async function clearClinicalStorage(): Promise<void> {
  try {
    const db = getAyektaDB();
    await db.chartDraft.delete(CHART_DRAFT_KEY);
  } catch (error) {
    console.error('Failed to clear clinical storage:', error);
    throw error;
  }
}

/**
 * Full local wipe for sign-out (chart + auth session + normalized patient graph for current chart).
 * Keeps module configuration and legacy sync blobs unless tied to entityId cleanup.
 */
export async function clearSessionAndChart(): Promise<void> {
  const db = getAyektaDB();
  let patientId: string | undefined;
  try {
    const row = await db.chartDraft.get(CHART_DRAFT_KEY);
    patientId = row?.payload?.ishiId;
  } catch {
    /* ignore */
  }

  try {
    if (patientId) {
      await clearLocalClinicalDataForPatient(patientId);
    }
    await db.transaction('rw', db.chartDraft, db.authSession, async () => {
      await db.chartDraft.delete(CHART_DRAFT_KEY);
      await db.authSession.delete('current');
    });
  } catch (error) {
    console.error('Failed to clear session storage:', error);
    throw error;
  }
}

export function exportPatientToJSON(data: PatientData): boolean {
  try {
    const filename = `GH26${data.ishiId}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    setTimeout(() => {
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }, 0);
    return true;
  } catch (error) {
    console.error('Failed to export JSON file:', error);
    return false;
  }
}

export async function importPatientFromJSON(file: File): Promise<PatientData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const result = parseLegacyPatientJson(raw);
        if (!result.ok) {
          reject(new Error(result.error));
          return;
        }
        resolve(result.data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function hasSavedPatient(): Promise<boolean> {
  try {
    const db = getAyektaDB();
    const row = await db.chartDraft.get(CHART_DRAFT_KEY);
    return row != null;
  } catch {
    return false;
  }
}
