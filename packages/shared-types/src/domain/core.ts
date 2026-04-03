/**
 * Canonical domain identifiers (v2 internal model — Phase 1 lock).
 * Chart payload today still uses Legacy PatientData in the web app; these types
 * anchor Postgres/Dexie evolution and FHIR mapping.
 */

export type AyektaId = string;
export type FacilityLocalMrn = string;

export type EncounterLifecycleStatus =
  | 'draft'
  | 'in_review'
  | 'signed'
  | 'amended'
  | 'superseded';

export interface TenantRef {
  id: string;
  slug: string;
}

export interface FacilityRef {
  id: string;
  tenantId: string;
  name: string;
  timezone: string;
}

export interface PatientIdentity {
  ayektaId: AyektaId;
  facilityLocalMrn?: FacilityLocalMrn;
  tenantId: string;
  facilityId: string;
}

export interface EncounterRef {
  id: string;
  patientId: AyektaId;
  tenantId: string;
  facilityId: string;
  encounterType: string;
  status: EncounterLifecycleStatus;
  currentVersionId?: string;
}
