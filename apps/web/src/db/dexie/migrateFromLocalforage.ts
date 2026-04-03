import localforage from 'localforage';
import type { PatientData } from '../../types/patient.types';
import type { ModulePreferences, MissionConfig } from '../../types/module.types';
import { getAyektaDB, CHART_DRAFT_KEY, KV } from './database';

const LEGACY_PATIENT_DB = localforage.createInstance({
  name: 'ayekta-emr',
  storeName: 'patients',
});

const LEGACY_MODULE_DB = localforage.createInstance({
  name: 'ayekta-emr-modules',
  storeName: 'preferences',
});

const LEGACY_SYNC_KEY = 'ayekta_sync_queue';

interface LegacyQueuedSync {
  id: string;
  ishiId: string;
  jsonContent: string;
  pdfBlob?: Blob;
  timestamp: number;
  attempts: number;
}

/**
 * One-time (idempotent) copy from pre-v2 localforage databases into Dexie.
 * Safe to call on every boot.
 */
export async function migrateFromLocalforage(): Promise<void> {
  const db = getAyektaDB();

  const existing = await db.chartDraft.get(CHART_DRAFT_KEY);
  if (!existing) {
    const legacyPatient = await LEGACY_PATIENT_DB.getItem<PatientData>('current-patient');
    if (legacyPatient?.ishiId && legacyPatient.demographics) {
      await db.chartDraft.put({ key: CHART_DRAFT_KEY, payload: legacyPatient });
    }
  }

  const hasPrefs = await db.keyValue.get(KV.modulePreferences);
  if (!hasPrefs) {
    const preferences = await LEGACY_MODULE_DB.getItem<ModulePreferences>('module-preferences');
    const missions = await LEGACY_MODULE_DB.getItem<MissionConfig[]>('missions');
    const activeMissionId = await LEGACY_MODULE_DB.getItem<string>('active-mission-id');

    if (preferences) {
      await db.keyValue.put({ k: KV.modulePreferences, v: preferences });
    }
    if (missions?.length) {
      await db.keyValue.put({ k: KV.missions, v: missions });
    }
    if (activeMissionId) {
      await db.keyValue.put({ k: KV.activeMissionId, v: activeMissionId });
    }
  }

  const queueCount = await db.syncQueue.count();
  if (queueCount === 0) {
    const legacyQueue = await localforage.getItem<LegacyQueuedSync[]>(LEGACY_SYNC_KEY);
    if (legacyQueue?.length) {
      try {
        await db.syncQueue.bulkAdd(
          legacyQueue.map((item) => ({
            clientId: item.id,
            ishiId: item.ishiId,
            jsonContent: item.jsonContent,
            pdfBlob: item.pdfBlob,
            timestamp: item.timestamp,
            attempts: item.attempts,
          }))
        );
      } catch (e) {
        console.warn('Sync queue migration skipped:', e);
      }
    }
  }
}
