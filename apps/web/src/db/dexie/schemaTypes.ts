/**
 * Local persistence rows (Blueprint §9) — Phase 3.
 * Chart draft remains the UI source of truth until encounter UX hardens (Phase 4+).
 */

export interface ReferenceDataRow {
  key: string;
  value: unknown;
}

export interface LocalPatientRow {
  id: string;
  tenantId: string;
  facilityId: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  updatedAt: number;
}

export interface LocalPatientIdentifierRow {
  id: string;
  patientId: string;
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface LocalEncounterRow {
  id: string;
  patientId: string;
  tenantId: string;
  facilityId: string;
  encounterType: string;
  status: string;
  currentVersionId: string;
  createdAt: number;
  updatedAt: number;
}

/** Full chart-shaped payload for offline draft (mirrors PatientData JSON). */
export interface LocalEncounterVersionRow {
  id: string;
  encounterId: string;
  versionNumber: number;
  status: string;
  dataJson: Record<string, unknown>;
  createdAt: number;
  signedAt?: number;
}

export interface LocalAttachmentMetaRow {
  id: string;
  patientId: string;
  encounterId?: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey?: string;
  uploadedAt: number;
}

export interface LocalPendingAttachmentRow {
  id?: number;
  patientId: string;
  encounterId?: string;
  filename: string;
  mimeType: string;
  blob: Blob;
  createdAt: number;
  status: 'queued' | 'uploaded' | 'error';
}

export interface LocalAuditEventRow {
  id?: number;
  tenantId: string;
  facilityId?: string;
  username?: string;
  entityType: string;
  entityId: string;
  action: string;
  metadataJson?: Record<string, unknown>;
  occurredAt: number;
}

export interface SyncOutboxRow {
  id?: number;
  clientId: string;
  entityType: string;
  entityId: string;
  versionId: string | null;
  operation: string;
  payloadHash: string;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'synced' | 'error';
  lastError: string | null;
}
