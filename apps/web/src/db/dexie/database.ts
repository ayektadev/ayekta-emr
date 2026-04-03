import Dexie, { type Table } from 'dexie';
import type { PatientData } from '../../types/patient.types';
import type { ClinicalRole } from '@ayekta/shared-types';

export const CHART_DRAFT_KEY = 'current';

export interface ChartDraftRow {
  key: string;
  payload: PatientData;
}

export interface KeyValueRow {
  k: string;
  v: unknown;
}

export interface SyncQueueRow {
  id?: number;
  clientId: string;
  ishiId: string;
  jsonContent: string;
  pdfBlob?: Blob;
  timestamp: number;
  attempts: number;
}

export interface AuthSessionRow {
  id: 'current';
  username: string;
  displayName: string;
  role: ClinicalRole;
  tenantId: string;
  facilityId: string;
  trustedUntil: number;
}

export class AyektaDB extends Dexie {
  chartDraft!: Table<ChartDraftRow, string>;
  keyValue!: Table<KeyValueRow, string>;
  syncQueue!: Table<SyncQueueRow, number>;
  authSession!: Table<AuthSessionRow, string>;

  constructor() {
    super('AyektaEMR_v2');
    this.version(1).stores({
      chartDraft: 'key',
      keyValue: 'k',
      syncQueue: '++id, clientId',
      authSession: 'id',
    });
  }
}

let dbInstance: AyektaDB | null = null;

export function getAyektaDB(): AyektaDB {
  if (!dbInstance) {
    dbInstance = new AyektaDB();
  }
  return dbInstance;
}

/** KV keys mirrored from legacy localforage module store */
export const KV = {
  modulePreferences: 'module-preferences',
  missions: 'missions',
  activeMissionId: 'active-mission-id',
} as const;
