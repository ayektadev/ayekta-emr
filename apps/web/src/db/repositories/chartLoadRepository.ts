import type { PatientData } from '../../types/patient.types';
import { loadCurrentDraftChartForPatient } from './encounterRepository';

/** Resolves chart JSON from the encounter graph current draft (Phase 6–aware). */
export async function loadDraftChartForPatient(patientId: string): Promise<PatientData | null> {
  return loadCurrentDraftChartForPatient(patientId);
}
