import type { PatientData } from '../../types/patient.types';
import type { LocalPatientRow } from '../dexie/schemaTypes';
import { getAyektaDB } from '../dexie/database';
import type { PersistenceContext } from './persistenceContext';

export async function upsertPatientFromChart(
  data: PatientData,
  ctx: PersistenceContext
): Promise<void> {
  const id = data.ishiId;
  if (!id) return;

  const db = getAyektaDB();
  const now = Date.now();

  try {
    await db.patients.put({
      id,
      tenantId: ctx.tenantId,
      facilityId: ctx.facilityId,
      firstName: data.demographics?.firstName ?? '',
      lastName: data.demographics?.lastName ?? '',
      dob: data.demographics?.dob ?? '',
      sex: data.demographics?.gender ?? '',
      updatedAt: now,
    });

    await db.patientIdentifiers.put({
      id: `id:facility_mrn:${id}`,
      patientId: id,
      type: 'facility_local_mrn',
      value: id,
      isPrimary: true,
    });
  } catch (e) {
    console.error('patientRepository.upsertPatientFromChart:', e);
  }
}

export async function getPatientById(patientId: string): Promise<LocalPatientRow | undefined> {
  try {
    return await getAyektaDB().patients.get(patientId);
  } catch (e) {
    console.error('getPatientById:', e);
    return undefined;
  }
}

export async function listPatientsForFacility(ctx: PersistenceContext): Promise<LocalPatientRow[]> {
  const db = getAyektaDB();
  try {
    return await db.patients
      .filter((p) => p.tenantId === ctx.tenantId && p.facilityId === ctx.facilityId)
      .toArray();
  } catch (e) {
    console.error('listPatientsForFacility:', e);
    return [];
  }
}
