/**
 * FHIR Bundle → Ayekta: Patient stub + best-effort clinical merge (chunk E).
 * JSON chart import remains authoritative for full fidelity.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Allergy, AppState, Demographics, Medication, PatientData } from '../../types/patient.types';
import {
  LOINC_BODY_HEIGHT,
  LOINC_BODY_TEMP,
  LOINC_BODY_WEIGHT,
  LOINC_BP_DIASTOLIC,
  LOINC_BP_SYSTOLIC,
  LOINC_HEART_RATE,
  LOINC_HPI_NARRATIVE,
  LOINC_PAIN_SCORE,
  LOINC_RESP_RATE,
  LOINC_SPO2,
  SYSTEM_ISHI,
} from './fhirMappings';

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

/** True if payload looks like a FHIR R4 Bundle. */
export function isFhirBundleJson(data: unknown): boolean {
  if (!isRecord(data)) return false;
  return data.resourceType === 'Bundle' && typeof data.type === 'string';
}

function firstPatientFromBundle(bundle: Record<string, unknown>): Record<string, unknown> | null {
  const entries = bundle.entry;
  if (!Array.isArray(entries)) return null;
  for (const e of entries) {
    if (!isRecord(e) || !isRecord(e.resource)) continue;
    if (e.resource.resourceType === 'Patient') return e.resource;
  }
  return null;
}

function identifierValue(patient: Record<string, unknown>, system: string): string | undefined {
  const ids = patient.identifier;
  if (!Array.isArray(ids)) return undefined;
  for (const row of ids) {
    if (!isRecord(row)) continue;
    if (row.system === system && typeof row.value === 'string') return row.value;
  }
  return undefined;
}

function parseHumanName(patient: Record<string, unknown>): { first: string; last: string } {
  const names = patient.name;
  if (!Array.isArray(names) || !isRecord(names[0])) return { first: '', last: '' };
  const n = names[0];
  const family = typeof n.family === 'string' ? n.family : '';
  const given = Array.isArray(n.given) ? n.given.filter((g): g is string => typeof g === 'string') : [];
  return { first: given[0] || '', last: family };
}

/**
 * Extract ISHI and demographics from a FHIR Patient inside a Bundle (best-effort).
 * Returns null if no Patient entry.
 */
export function extractPatientStubFromBundle(bundle: unknown): Pick<PatientData, 'ishiId' | 'demographics'> | null {
  if (!isRecord(bundle) || bundle.resourceType !== 'Bundle') return null;
  const patient = firstPatientFromBundle(bundle);
  if (!patient) return null;

  const ishi = identifierValue(patient, SYSTEM_ISHI) || '';
  const { first, last } = parseHumanName(patient);
  const birthDate = typeof patient.birthDate === 'string' ? patient.birthDate : '';
  const gender = typeof patient.gender === 'string' ? patient.gender : '';

  const demographics: Demographics = {
    firstName: first,
    middleName: '',
    lastName: last,
    dob: birthDate,
    age: 0,
    gender,
    address: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    bloodGroup: '',
    bloodTransfusionHistory: false,
    bloodTransfusionDetails: '',
    allergies: '',
    currentMedications: '',
    pastMedicalHistory: '',
    pastSurgicalHistory: '',
    familyHistory: '',
    socialHistory: '',
    pmhHTN: false,
    pmhDM2: false,
    pmhCOPD: false,
    pmhBPH: false,
    pmhOther: '',
  };

  return {
    ishiId: ishi || `fhir-import-${Date.now()}`,
    demographics,
  };
}

/**
 * After `reset()`, merge a FHIR Patient stub into default module state for a new editable chart.
 */
function buildResourceIndex(bundle: Record<string, unknown>): Map<string, Record<string, unknown>> {
  const m = new Map<string, Record<string, unknown>>();
  const entries = bundle.entry;
  if (!Array.isArray(entries)) return m;
  for (const e of entries) {
    if (!isRecord(e) || !isRecord(e.resource)) continue;
    const r = e.resource;
    if (typeof r.resourceType === 'string' && typeof r.id === 'string') {
      m.set(`${r.resourceType}/${r.id}`, r);
    }
  }
  return m;
}

function observationLoinc(obs: Record<string, unknown>): string | undefined {
  const code = obs.code;
  if (!isRecord(code)) return undefined;
  const coding = code.coding;
  if (!Array.isArray(coding)) return undefined;
  for (const c of coding) {
    if (!isRecord(c)) continue;
    if (c.system === 'http://loinc.org' && typeof c.code === 'string') return c.code;
  }
  return undefined;
}

function observationCategoryCodes(obs: Record<string, unknown>): string[] {
  const cats = obs.category;
  if (!Array.isArray(cats)) return [];
  const out: string[] = [];
  for (const cat of cats) {
    if (!isRecord(cat)) continue;
    const coding = cat.coding;
    if (!Array.isArray(coding)) continue;
    for (const c of coding) {
      if (isRecord(c) && typeof c.code === 'string') out.push(c.code);
    }
  }
  return out;
}

function readObservationValue(obs: Record<string, unknown>): string {
  if (typeof obs.valueString === 'string') return obs.valueString;
  if (isRecord(obs.valueQuantity) && obs.valueQuantity.value != null) {
    const u = typeof obs.valueQuantity.unit === 'string' ? obs.valueQuantity.unit : '';
    return `${obs.valueQuantity.value}${u ? ` ${u}` : ''}`;
  }
  return '';
}

function conditionTextFrom(r: Record<string, unknown>): string {
  const code = r.code;
  return isRecord(code) && typeof code.text === 'string' ? code.text.trim() : '';
}

function procedureCodeText(r: Record<string, unknown>): string {
  const code = r.code;
  return isRecord(code) && typeof code.text === 'string' ? code.text.trim() : '';
}

function medicationFromStatement(r: Record<string, unknown>): Medication | null {
  const mc = r.medicationCodeableConcept;
  const name = isRecord(mc) && typeof mc.text === 'string' ? mc.text : '';
  if (!name.trim()) return null;
  const dosage = Array.isArray(r.dosage) && isRecord(r.dosage[0]) && typeof r.dosage[0].text === 'string' ? r.dosage[0].text : '';
  return {
    id: uuidv4(),
    name: name.trim(),
    dose: dosage,
    frequency: '',
    route: '',
    startDate: '',
    stopDate: '',
  };
}

function allergyFromResource(r: Record<string, unknown>): Allergy | null {
  const code = r.code;
  const allergen = isRecord(code) && typeof code.text === 'string' ? code.text : '';
  if (!allergen.trim()) return null;
  let reaction = '';
  const reactions = r.reaction;
  if (Array.isArray(reactions) && isRecord(reactions[0])) {
    const man = reactions[0].manifestation;
    if (Array.isArray(man) && isRecord(man[0]) && typeof man[0].text === 'string') reaction = man[0].text;
  }
  return { id: uuidv4(), allergen: allergen.trim(), reaction, severity: '' };
}

function diagnosticReportConclusion(r: Record<string, unknown>): string {
  const c = r.conclusion;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter((x): x is string => typeof x === 'string').join('\n\n');
  return '';
}

function isLikelyImagingStudyName(name: string): boolean {
  return /(ct\b|mri|x-?ray|chest\s+xr|ultrasound|\bus\b|echo|mammo|fluoro|pet\b|dexa)/i.test(name);
}

/**
 * Merge Observation / Condition / Procedure / MedicationStatement / AllergyIntolerance / DiagnosticReport
 * from an R4 collection Bundle into existing `PatientData` (fills empty module fields; conservative on overwrite).
 */
export function mergeClinicalResourcesFromFhirBundle(bundle: unknown, data: PatientData): PatientData {
  if (!isRecord(bundle) || bundle.resourceType !== 'Bundle') return data;

  const index = buildResourceIndex(bundle);
  const entries = Array.isArray(bundle.entry) ? bundle.entry : [];

  let triage = { ...data.triage };
  let operativeNote = { ...data.operativeNote };
  let surgicalNeeds = { ...data.surgicalNeeds };
  const medications = {
    ...data.medications,
    currentMedications: [...data.medications.currentMedications],
    allergies: [...data.medications.allergies],
    prnMedications: [...data.medications.prnMedications],
    preopMedications: [...data.medications.preopMedications],
  };
  const labs = [...data.labs];
  const imaging = [...data.imaging];

  let sbp = '';
  let dbp = '';
  const conditionTexts: string[] = [];

  for (const e of entries) {
    if (!isRecord(e) || !isRecord(e.resource)) continue;
    const r = e.resource;
    const rt = r.resourceType;

    if (rt === 'Observation') {
      const cats = observationCategoryCodes(r);
      if (cats.includes('laboratory')) continue;

      const loinc = observationLoinc(r);
      const val = readObservationValue(r);
      if (!loinc && !val) continue;

      switch (loinc) {
        case LOINC_HEART_RATE:
          if (!triage.hr.trim()) triage = { ...triage, hr: val };
          break;
        case LOINC_RESP_RATE:
          if (!triage.rr.trim()) triage = { ...triage, rr: val };
          break;
        case LOINC_SPO2:
          if (!triage.spo2.trim()) triage = { ...triage, spo2: val.replace(/\s+/g, '') };
          break;
        case LOINC_BODY_TEMP:
          if (!triage.temperature.trim()) triage = { ...triage, temperature: val };
          break;
        case LOINC_BODY_WEIGHT:
          if (!triage.weight.trim()) triage = { ...triage, weight: val };
          break;
        case LOINC_BODY_HEIGHT:
          if (!triage.height.trim()) triage = { ...triage, height: val };
          break;
        case LOINC_BP_SYSTOLIC:
          sbp = val.replace(/[^\d.]/g, '');
          break;
        case LOINC_BP_DIASTOLIC:
          dbp = val.replace(/[^\d.]/g, '');
          break;
        case LOINC_PAIN_SCORE: {
          const n =
            isRecord(r.valueQuantity) && typeof r.valueQuantity.value === 'number'
              ? r.valueQuantity.value
              : parseFloat(val);
          if (Number.isFinite(n)) triage = { ...triage, painScale: Math.round(n) };
          break;
        }
        case LOINC_HPI_NARRATIVE:
          if (!triage.historyOfPresentIllness.trim()) triage = { ...triage, historyOfPresentIllness: val };
          break;
        default:
          break;
      }
    }

    if (rt === 'Condition') {
      const text = conditionTextFrom(r);
      if (text) conditionTexts.push(text);
    }

    if (rt === 'MedicationStatement') {
      const row = medicationFromStatement(r);
      if (row && !medications.currentMedications.some((m) => m.name.trim().toLowerCase() === row.name.trim().toLowerCase())) {
        medications.currentMedications.push(row);
      }
    }

    if (rt === 'AllergyIntolerance') {
      const a = allergyFromResource(r);
      if (a && !medications.allergies.some((x) => x.allergen.toLowerCase() === a.allergen.toLowerCase())) {
        medications.allergies.push(a);
      }
    }

    if (rt === 'Procedure') {
      const codeText = procedureCodeText(r);
      if (!codeText) continue;
      const completed = r.status === 'completed';
      if (completed) {
        if (!operativeNote.procedurePerformed.trim()) {
          operativeNote = { ...operativeNote, procedurePerformed: codeText };
        }
        if (typeof r.performedDateTime === 'string' && !operativeNote.dateOfSurgery.trim()) {
          operativeNote = { ...operativeNote, dateOfSurgery: r.performedDateTime.slice(0, 10) };
        }
      } else if (!surgicalNeeds.procedure.trim()) {
        surgicalNeeds = { ...surgicalNeeds, procedure: codeText };
      }
    }
  }

  if (sbp && dbp && !triage.bp.trim()) {
    triage = { ...triage, bp: `${sbp}/${dbp}` };
  }

  if (conditionTexts[0] && !operativeNote.preopDiagnosis.trim()) {
    operativeNote = { ...operativeNote, preopDiagnosis: conditionTexts[0] };
  }
  if (conditionTexts[1] && !operativeNote.postopDiagnosis.trim()) {
    operativeNote = { ...operativeNote, postopDiagnosis: conditionTexts[1] };
  }

  for (const e of entries) {
    if (!isRecord(e) || !isRecord(e.resource)) continue;
    const r = e.resource;
    if (r.resourceType !== 'DiagnosticReport') continue;

    const code = r.code;
    const testName = isRecord(code) && typeof code.text === 'string' ? code.text : 'Report';
    const results = r.result;
    let resultValue = '';
    let fromLabObservation = false;

    if (Array.isArray(results)) {
      for (const ref of results) {
        if (!isRecord(ref) || typeof ref.reference !== 'string') continue;
        const obs = index.get(ref.reference);
        if (obs && obs.resourceType === 'Observation' && observationCategoryCodes(obs).includes('laboratory')) {
          fromLabObservation = true;
          resultValue = readObservationValue(obs);
          const notes = obs.note;
          let interp = '';
          if (Array.isArray(notes) && isRecord(notes[0]) && typeof notes[0].text === 'string') {
            interp = notes[0].text;
          }
          const eff = typeof r.effectiveDateTime === 'string' ? r.effectiveDateTime : '';
          const day = eff.slice(0, 10) || '';
          labs.push({
            id: uuidv4(),
            testName,
            dateOrdered: day,
            dateResulted: day,
            resultValue,
            referenceRange: '',
            status: typeof r.status === 'string' ? r.status : 'final',
            interpretation: interp,
          });
          break;
        }
      }
    }

    if (fromLabObservation) continue;

    const conc = diagnosticReportConclusion(r);
    const eff = typeof r.effectiveDateTime === 'string' ? r.effectiveDateTime : '';
    const day = eff.slice(0, 10) || '';
    if (!conc.trim() && !day) continue;

    if (isLikelyImagingStudyName(testName)) {
      const parts = conc.split(/\n\n+/);
      const findings = parts[0] || '';
      const impression = parts.slice(1).join('\n\n') || '';
      imaging.push({
        id: uuidv4(),
        studyType: testName,
        bodyPart: '',
        dateOrdered: day,
        datePerformed: day,
        findings,
        impression: impression || conc,
      });
    } else {
      labs.push({
        id: uuidv4(),
        testName,
        dateOrdered: day,
        dateResulted: day,
        resultValue: conc,
        referenceRange: '',
        status: typeof r.status === 'string' ? r.status : 'final',
        interpretation: '',
      });
    }
  }

  return {
    ...data,
    triage,
    surgicalNeeds,
    operativeNote,
    medications,
    labs,
    imaging,
  };
}

export function patientDataFromEmptyAppStateWithFhirStub(
  state: AppState,
  stub: Pick<PatientData, 'ishiId' | 'demographics'>
): PatientData {
  const now = new Date().toISOString();
  return {
    ishiId: stub.ishiId,
    currentProvider: state.currentProvider || 'FHIR import',
    createdAt: now,
    updatedAt: now,
    firstSavedAt: undefined,
    demographics: { ...state.demographics, ...stub.demographics },
    triage: state.triage,
    surgicalNeeds: state.surgicalNeeds,
    consent: state.consent,
    medications: state.medications,
    labs: state.labs,
    imaging: state.imaging,
    operativeNote: state.operativeNote,
    discharge: state.discharge,
    preAnesthesia: state.preAnesthesia,
    anesthesiaRecord: state.anesthesiaRecord,
    orRecord: state.orRecord,
    nursingOrders: state.nursingOrders,
    pacu: state.pacu,
    floorFlow: state.floorFlow,
    progressNotes: state.progressNotes,
    followUpNotes: state.followUpNotes,
    preOpChecklist: state.preOpChecklist,
    complicationLog: state.complicationLog,
    surgicalOutcomes: state.surgicalOutcomes,
    clinicalWorkflow: state.clinicalWorkflow ?? { sectionNursingSignOff: {} },
  };
}
