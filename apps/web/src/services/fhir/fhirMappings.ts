/**
 * Coding systems and display helpers — FHIR is import/export only (Blueprint §13, FHIR_ARCHITECTURE.md).
 */

export const SYSTEM_ISHI = 'https://ayekta.org/fhir/sid/ishi';
export const SYSTEM_AYEKTA_PATIENT = 'https://ayekta.org/fhir/sid/patient-id';

/** LOINC: Progress note */
export const LOINC_PROGRESS_NOTE = '11506-3';
/** LOINC: Summary of episode note */
export const LOINC_SUMMARY_NOTE = '34133-9';

/** Vital signs & common clinical (R4 export / import round-trip) */
export const LOINC_HEART_RATE = '8867-4';
export const LOINC_RESP_RATE = '9279-1';
export const LOINC_SPO2 = '2708-6';
export const LOINC_BODY_TEMP = '8310-5';
export const LOINC_BODY_WEIGHT = '29463-7';
export const LOINC_BODY_HEIGHT = '8302-2';
export const LOINC_BP_SYSTOLIC = '8480-6';
export const LOINC_BP_DIASTOLIC = '8462-4';
export const LOINC_PAIN_SCORE = '72514-3';
export const LOINC_HPI_NARRATIVE = '10164-2';

export function fhirGenderFromAyekta(g: string): 'male' | 'female' | 'other' | 'unknown' {
  const x = (g || '').toLowerCase();
  if (x === 'm' || x === 'male') return 'male';
  if (x === 'f' || x === 'female') return 'female';
  if (x === 'other' || x === 'nonbinary' || x === 'nb') return 'other';
  return 'unknown';
}
