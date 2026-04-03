import type { PatientData } from '../../types/patient.types';
import { getAyektaDB } from '../dexie/database';
import { draftVersionIdForEncounter, encounterIdForPatient } from '../utils/encounterIds';
import type { PersistenceContext } from './persistenceContext';

/**
 * Maintains one outpatient draft encounter per patient + rolling draft version payload
 * (Blueprint §9 — local encounter graph; signing splits versions in Phase 6).
 */
export async function upsertDraftEncounterFromChart(
  data: PatientData,
  ctx: PersistenceContext
): Promise<void> {
  const patientId = data.ishiId;
  if (!patientId) return;

  const db = getAyektaDB();
  const now = Date.now();
  const encId = encounterIdForPatient(patientId);
  const versionId = draftVersionIdForEncounter(encId);

  try {
    const existing = await db.encounters.get(encId);
    const createdAt = existing?.createdAt ?? now;

    await db.encounters.put({
      id: encId,
      patientId,
      tenantId: ctx.tenantId,
      facilityId: ctx.facilityId,
      encounterType: 'outpatient_surgical',
      status: 'draft',
      currentVersionId: versionId,
      createdAt,
      updatedAt: now,
    });

    await db.encounterVersions.put({
      id: versionId,
      encounterId: encId,
      versionNumber: 1,
      status: 'draft',
      dataJson: data as unknown as Record<string, unknown>,
      createdAt: now,
    });
  } catch (e) {
    console.error('encounterRepository.upsertDraftEncounterFromChart:', e);
  }
}

export async function getEncountersForPatient(patientId: string) {
  const db = getAyektaDB();
  try {
    return await db.encounters.where('patientId').equals(patientId).toArray();
  } catch (e) {
    console.error('getEncountersForPatient:', e);
    return [];
  }
}
