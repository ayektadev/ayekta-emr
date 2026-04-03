import Dexie, { type Table } from 'dexie';
import type { ClinicalRole } from '@ayekta/shared-types';
import type { PatientData } from '../../types/patient.types';
import type {
  LocalAttachmentMetaRow,
  LocalAuditEventRow,
  LocalEncounterRow,
  LocalEncounterVersionRow,
  LocalPatientIdentifierRow,
  LocalPatientRow,
  LocalPendingAttachmentRow,
  ReferenceDataRow,
  SyncOutboxRow,
} from './schemaTypes';
import { upgradeDatabaseToV2 } from './upgradeToV2';

export type { LocalPatientRow, LocalEncounterRow, SyncOutboxRow };

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

  referenceData!: Table<ReferenceDataRow, string>;
  patients!: Table<LocalPatientRow, string>;
  patientIdentifiers!: Table<LocalPatientIdentifierRow, string>;
  encounters!: Table<LocalEncounterRow, string>;
  encounterVersions!: Table<LocalEncounterVersionRow, string>;
  attachmentsMeta!: Table<LocalAttachmentMetaRow, string>;
  pendingAttachments!: Table<LocalPendingAttachmentRow, number>;
  syncOutbox!: Table<SyncOutboxRow, number>;
  auditEventsLocal!: Table<LocalAuditEventRow, number>;

  constructor() {
    super('AyektaEMR_v2');

    this.version(1).stores({
      chartDraft: 'key',
      keyValue: 'k',
      syncQueue: '++id, clientId',
      authSession: 'id',
    });

    this.version(2)
      .stores({
        chartDraft: 'key',
        keyValue: 'k',
        syncQueue: '++id, clientId',
        authSession: 'id',
        referenceData: 'key',
        patients: 'id, tenantId, facilityId, lastName, firstName, updatedAt',
        patientIdentifiers: 'id, patientId, type, value',
        encounters: 'id, patientId, tenantId, facilityId, status, updatedAt',
        encounterVersions: 'id, encounterId, versionNumber, status',
        attachmentsMeta: 'id, patientId, encounterId',
        pendingAttachments: '++id, patientId, status, createdAt',
        syncOutbox: '++id, clientId, entityType, entityId, status, createdAt',
        auditEventsLocal: '++id, occurredAt, entityType, entityId',
      })
      .upgrade((tx) => upgradeDatabaseToV2(tx));
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
