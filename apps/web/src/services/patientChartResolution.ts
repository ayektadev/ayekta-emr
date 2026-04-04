import { loadDraftChartForPatient } from '../db/repositories/chartLoadRepository';
import { loadFromStorage } from '../utils/storage';
import type { PatientData } from '../types/patient.types';

/**
 * Resolve chart JSON for a patient route: Dexie draft version, else active chartDraft if same id.
 */
export async function resolvePatientChartData(patientId: string): Promise<PatientData | null> {
  const fromIndex = await loadDraftChartForPatient(patientId);
  if (fromIndex?.ishiId === patientId) return fromIndex;

  const draft = await loadFromStorage();
  if (draft?.ishiId === patientId) return draft;

  return null;
}
