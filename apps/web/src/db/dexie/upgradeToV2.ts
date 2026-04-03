import type { Transaction } from 'dexie';
import type { PatientData } from '../../types/patient.types';
import { DEFAULT_FACILITY_ID, DEFAULT_TENANT_ID } from '@ayekta/shared-types';
import { CHART_DRAFT_KEY } from '../constants';
import { encounterIdForPatient, draftVersionIdForEncounter } from '../utils/encounterIds';

/**
 * Backfill patients / encounters / draft version from existing chart draft (idempotent).
 */
export async function upgradeDatabaseToV2(tx: Transaction): Promise<void> {
  try {
    const chart = await tx.table('chartDraft').get(CHART_DRAFT_KEY);
    const payload = chart?.payload as PatientData | undefined;
    if (!payload?.ishiId) return;

    const patientId = payload.ishiId;
    const tenantId = DEFAULT_TENANT_ID;
    const facilityId = DEFAULT_FACILITY_ID;
    const now = Date.now();
    const encId = encounterIdForPatient(patientId);

    await tx.table('patients').put({
      id: patientId,
      tenantId,
      facilityId,
      firstName: payload.demographics?.firstName ?? '',
      lastName: payload.demographics?.lastName ?? '',
      dob: payload.demographics?.dob ?? '',
      sex: payload.demographics?.gender ?? '',
      updatedAt: now,
    });

    await tx.table('patientIdentifiers').put({
      id: `id:facility_mrn:${patientId}`,
      patientId,
      type: 'facility_local_mrn',
      value: patientId,
      isPrimary: true,
    });

    const versionId = draftVersionIdForEncounter(encId);
    await tx.table('encounters').put({
      id: encId,
      patientId,
      tenantId,
      facilityId,
      encounterType: 'outpatient_surgical',
      status: 'draft',
      currentVersionId: versionId,
      createdAt: now,
      updatedAt: now,
    });

    await tx.table('encounterVersions').put({
      id: versionId,
      encounterId: encId,
      versionNumber: 1,
      status: 'draft',
      dataJson: payload as unknown as Record<string, unknown>,
      createdAt: now,
    });
  } catch (e) {
    console.error('upgradeDatabaseToV2:', e);
  }
}
