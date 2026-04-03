import type { PatientData } from '../../types/patient.types';
import { getAyektaDB } from '../dexie/database';
import { encounterIdForPatient } from '../utils/encounterIds';
import { upsertDraftEncounterFromChart } from './encounterRepository';
import { getPersistenceContext, type PersistenceContext } from './persistenceContext';
import { upsertPatientFromChart } from './patientRepository';

export { getPersistenceContext, type PersistenceContext };

/**
 * Dual-write chart snapshot into normalized local tables (Phase 3).
 * Safe to call after `chartDraft` write; failures are logged, not thrown to UI.
 * (Explicit sign/save audit events land in Phase 6.)
 */
export async function persistChartSnapshot(data: PatientData): Promise<void> {
  const ctx = getPersistenceContext();
  await upsertPatientFromChart(data, ctx);
  await upsertDraftEncounterFromChart(data, ctx);
}

/** Remove normalized rows for one patient (sign-out / privacy). */
export async function clearLocalClinicalDataForPatient(patientId: string): Promise<void> {
  if (!patientId) return;

  const db = getAyektaDB();
  const encId = encounterIdForPatient(patientId);

  try {
    await db.transaction(
      'rw',
      [
        db.patientIdentifiers,
        db.encounterVersions,
        db.encounters,
        db.attachmentsMeta,
        db.pendingAttachments,
        db.patients,
        db.syncOutbox,
      ],
      async () => {
        await db.encounterVersions.where('encounterId').equals(encId).delete();
        await db.encounters.delete(encId);
        await db.patientIdentifiers.where('patientId').equals(patientId).delete();
        await db.attachmentsMeta.where('patientId').equals(patientId).delete();
        await db.pendingAttachments.where('patientId').equals(patientId).delete();
        await db.syncOutbox.where('entityId').equals(patientId).delete();
        await db.patients.delete(patientId);
      }
    );
  } catch (e) {
    console.error('clearLocalClinicalDataForPatient:', e);
  }
}

export async function hashPayloadUtf8(payload: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
