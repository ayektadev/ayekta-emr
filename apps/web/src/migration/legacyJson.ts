import { z } from 'zod';
import type { PatientData } from '../types/patient.types';

const legacyPatientSchema = z.object({
  ishiId: z.string().min(1),
  demographics: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .passthrough(),
});

export type LegacyImportResult =
  | { ok: true; data: PatientData }
  | { ok: false; error: string };

/** Validates minimum shape for v5.x JSON / IndexedDB exports before loading into the store. */
export function parseLegacyPatientJson(raw: unknown): LegacyImportResult {
  const parsed = legacyPatientSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid patient data file' };
  }
  return { ok: true, data: raw as PatientData };
}
