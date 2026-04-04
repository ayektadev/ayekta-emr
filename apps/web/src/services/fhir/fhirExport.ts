import { v4 as uuidv4 } from 'uuid';
import type { PatientData } from '../../types/patient.types';
import {
  LOINC_BODY_HEIGHT,
  LOINC_BODY_TEMP,
  LOINC_BODY_WEIGHT,
  LOINC_BP_DIASTOLIC,
  LOINC_BP_SYSTOLIC,
  LOINC_HEART_RATE,
  LOINC_HPI_NARRATIVE,
  LOINC_PAIN_SCORE,
  LOINC_PROGRESS_NOTE,
  LOINC_RESP_RATE,
  LOINC_SPO2,
  SYSTEM_ISHI,
  fhirGenderFromAyekta,
} from './fhirMappings';

type FhirResource = Record<string, unknown>;

function ref(rtype: string, id: string): { reference: string } {
  return { reference: `${rtype}/${id}` };
}

function buildPatientResource(data: PatientData, id: string): FhirResource {
  const d = data.demographics;
  const given = [d.firstName, d.middleName].filter(Boolean) as string[];
  const telecom: FhirResource[] = [];
  if (d.phone?.trim()) telecom.push({ system: 'phone', value: d.phone.trim() });
  if (d.email?.trim()) telecom.push({ system: 'email', value: d.email.trim() });

  return {
    resourceType: 'Patient',
    id,
    identifier: [{ system: SYSTEM_ISHI, value: data.ishiId }],
    name: [{ family: d.lastName || 'Unknown', given: given.length ? given : [''] }],
    birthDate: d.dob || undefined,
    gender: fhirGenderFromAyekta(d.gender),
    telecom: telecom.length ? telecom : undefined,
    address: d.address?.trim()
      ? [{ text: d.address.trim(), type: 'physical' }]
      : undefined,
  };
}

function buildEncounterResource(data: PatientData, id: string, patientId: string): FhirResource {
  return {
    resourceType: 'Encounter',
    id,
    status: 'finished',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' },
    subject: ref('Patient', patientId),
    type: [
      {
        text: data.surgicalNeeds?.procedure || 'Outpatient surgical encounter',
      },
    ],
    period: {
      start: data.createdAt || undefined,
      end: data.updatedAt || undefined,
    },
  };
}

function operativeNoteNarrative(on: PatientData['operativeNote']): string {
  const parts = [
    on.procedurePerformed && `Procedure: ${on.procedurePerformed}`,
    on.preopDiagnosis && `Pre-op Dx: ${on.preopDiagnosis}`,
    on.postopDiagnosis && `Post-op Dx: ${on.postopDiagnosis}`,
    on.surgicalFindings && `Findings: ${on.surgicalFindings}`,
    on.operativeTechnique && `Technique: ${on.operativeTechnique}`,
    on.complications && `Complications: ${on.complications}`,
    on.opNoteOutcomeNarrative && `Outcome: ${on.opNoteOutcomeNarrative}`,
  ].filter(Boolean);
  return parts.join('\n\n') || 'Operative note (structured fields only — see chart modules).';
}

/** Raw PDF size cap before base64 embedding (keeps bundles portable for handoff tools). */
export const MAX_CHART_PDF_EMBED_BYTES = 900_000;

export type FhirExportOptions = {
  /** Base64-encoded PDF bytes for a full-chart export DocumentReference (optional). */
  chartPdfBase64?: string | null;
};

function buildChartPdfDocumentReference(
  id: string,
  patientId: string,
  encounterId: string,
  chartPdfBase64: string,
  patientLabel: string
): FhirResource {
  return {
    resourceType: 'DocumentReference',
    id,
    status: 'current',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '34133-9',
          display: 'Summary of episode note',
        },
      ],
      text: 'Ayekta full chart export (PDF)',
    },
    subject: ref('Patient', patientId),
    context: { encounter: [ref('Encounter', encounterId)] },
    date: new Date().toISOString().slice(0, 10),
    description: `Chart PDF export for patient ${patientLabel}`,
    content: [
      {
        attachment: {
          contentType: 'application/pdf',
          title: 'full-chart-export.pdf',
          data: chartPdfBase64,
        },
      },
    ],
  };
}

function buildOpNoteDocumentReference(
  data: PatientData,
  id: string,
  patientId: string,
  encounterId: string
): FhirResource {
  return {
    resourceType: 'DocumentReference',
    id,
    status: 'current',
    type: {
      coding: [{ system: 'http://loinc.org', code: LOINC_PROGRESS_NOTE, display: 'Progress note' }],
      text: 'Operative / procedure note',
    },
    subject: ref('Patient', patientId),
    context: { encounter: [ref('Encounter', encounterId)] },
    date: data.operativeNote?.dateOfSurgery || data.updatedAt,
    description: 'Ayekta operative note (narrative summary for interoperability)',
    content: [
      {
        attachment: {
          contentType: 'text/plain',
          title: 'Operative note narrative',
        },
      },
    ],
    /** Human-readable extract (R4 allows extension for non-binary payloads in constrained envs). */
    extension: [
      {
        url: 'https://ayekta.org/fhir/StructureDefinition/plaintext-clinical-note',
        valueString: operativeNoteNarrative(data.operativeNote),
      },
    ],
  };
}

const CS_OBS_CATEGORY = 'http://terminology.hl7.org/CodeSystem/observation-category';

function triageEffectiveIso(t: PatientData['triage']): string | undefined {
  const d = t.date?.trim();
  const tm = t.time?.trim();
  if (d && tm) {
    const norm = tm.length <= 5 ? `${tm}:00` : tm;
    return `${d}T${norm}`;
  }
  return d || undefined;
}

function parseBp(bp: string): { sys?: string; dia?: string } {
  const m = bp.trim().match(/^(\d+)\s*\/\s*(\d+)/);
  if (!m) return {};
  return { sys: m[1], dia: m[2] };
}

function buildVitalsObservations(
  data: PatientData,
  patientId: string,
  encounterId: string
): FhirResource[] {
  const t = data.triage;
  const effective = triageEffectiveIso(t);
  const out: FhirResource[] = [];

  const vitalCat = [{ coding: [{ system: CS_OBS_CATEGORY, code: 'vital-signs' }] }];

  const addQty = (
    loinc: string,
    display: string,
    raw: string,
    unit: string,
    ucum: string
  ) => {
    const v = raw?.trim();
    if (!v) return;
    const n = parseFloat(v.replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(n)) return;
    out.push({
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: vitalCat,
      code: {
        coding: [{ system: 'http://loinc.org', code: loinc, display }],
        text: display,
      },
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      effectiveDateTime: effective,
      valueQuantity: { value: n, unit, system: 'http://unitsofmeasure.org', code: ucum },
    });
  };

  addQty(LOINC_HEART_RATE, 'Heart rate', t.hr, 'beats/min', '/min');
  addQty(LOINC_RESP_RATE, 'Respiratory rate', t.rr, 'breaths/min', '/min');

  const spo2 = t.spo2?.trim();
  if (spo2) {
    const n = parseFloat(spo2.replace(/[^\d.-]/g, ''));
    if (Number.isFinite(n)) {
      out.push({
        resourceType: 'Observation',
        id: uuidv4(),
        status: 'final',
        category: vitalCat,
        code: {
          coding: [{ system: 'http://loinc.org', code: LOINC_SPO2, display: 'Oxygen saturation' }],
          text: 'Oxygen saturation',
        },
        subject: ref('Patient', patientId),
        encounter: ref('Encounter', encounterId),
        effectiveDateTime: effective,
        valueQuantity: { value: n, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
      });
    }
  }

  addQty(LOINC_BODY_TEMP, 'Body temperature', t.temperature, 'Cel', 'Cel');
  addQty(LOINC_BODY_WEIGHT, 'Body weight', t.weight, 'kg', 'kg');
  addQty(LOINC_BODY_HEIGHT, 'Body height', t.height, 'cm', 'cm');

  const { sys, dia } = parseBp(t.bp || '');
  if (sys) {
    out.push({
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: vitalCat,
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC_BP_SYSTOLIC, display: 'Systolic blood pressure' }],
        text: 'Systolic BP',
      },
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      effectiveDateTime: effective,
      valueQuantity: { value: parseFloat(sys), unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
    });
  }
  if (dia) {
    out.push({
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: vitalCat,
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC_BP_DIASTOLIC, display: 'Diastolic blood pressure' }],
        text: 'Diastolic BP',
      },
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      effectiveDateTime: effective,
      valueQuantity: { value: parseFloat(dia), unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
    });
  }

  if (typeof t.painScale === 'number' && Number.isFinite(t.painScale)) {
    out.push({
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: vitalCat,
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC_PAIN_SCORE, display: 'Pain severity - 0-10 verbal' }],
        text: 'Pain scale',
      },
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      effectiveDateTime: effective,
      valueQuantity: { value: t.painScale, unit: '{score}', system: 'http://unitsofmeasure.org', code: '1' },
    });
  }

  const hpi = t.historyOfPresentIllness?.trim();
  if (hpi) {
    out.push({
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: [{ coding: [{ system: CS_OBS_CATEGORY, code: 'exam' }] }],
      code: {
        coding: [{ system: 'http://loinc.org', code: LOINC_HPI_NARRATIVE, display: 'History of present illness' }],
        text: 'History of present illness',
      },
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      effectiveDateTime: effective,
      valueString: hpi,
    });
  }

  return out;
}

function buildConditionResources(
  data: PatientData,
  patientId: string,
  encounterId: string
): FhirResource[] {
  const on = data.operativeNote;
  const out: FhirResource[] = [];
  const add = (text: string | undefined) => {
    const t = text?.trim();
    if (!t) return;
    out.push({
      resourceType: 'Condition',
      id: uuidv4(),
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
      },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'unconfirmed' }],
      },
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }],
        },
      ],
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      code: { text: t },
    });
  };
  add(on.preopDiagnosis);
  add(on.postopDiagnosis);
  return out;
}

function buildAllergyResources(data: PatientData, patientId: string): FhirResource[] {
  return data.medications.allergies
    .filter((a) => a.allergen?.trim())
    .map((a) => ({
      resourceType: 'AllergyIntolerance',
      id: uuidv4(),
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }] },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'unconfirmed' }],
      },
      patient: ref('Patient', patientId),
      code: { text: a.allergen.trim() },
      reaction: a.reaction?.trim() ? [{ manifestation: [{ text: a.reaction.trim() }] }] : undefined,
    }));
}

function medToStatement(
  med: { id: string; name: string; dose: string; frequency: string; route: string },
  patientId: string
): FhirResource {
  const doseLine = [med.dose, med.route, med.frequency].filter((x) => x?.trim()).join(' ');
  return {
    resourceType: 'MedicationStatement',
    id: uuidv4(),
    status: 'active',
    subject: ref('Patient', patientId),
    medicationCodeableConcept: { text: med.name?.trim() || 'Medication' },
    dosage: doseLine ? [{ text: doseLine }] : undefined,
  };
}

function buildMedicationStatements(data: PatientData, patientId: string): FhirResource[] {
  const lists = [
    ...data.medications.currentMedications,
    ...data.medications.prnMedications,
    ...data.medications.preopMedications,
  ];
  return lists.filter((m) => m.name?.trim()).map((m) => medToStatement(m, patientId));
}

function buildProcedureResources(data: PatientData, patientId: string, encounterId: string): FhirResource[] {
  const on = data.operativeNote;
  const sn = data.surgicalNeeds;
  const text = on.procedurePerformed?.trim() || sn.procedure?.trim();
  if (!text) return [];
  const completed = Boolean(on.dateOfSurgery?.trim());
  return [
    {
      resourceType: 'Procedure',
      id: uuidv4(),
      status: completed ? 'completed' : 'preparation',
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      performedDateTime: on.dateOfSurgery?.trim() || undefined,
      code: { text },
      note: on.surgicalFindings?.trim() ? [{ text: on.surgicalFindings.trim() }] : undefined,
    },
  ];
}

/** Lab row → Observation + DiagnosticReport(result) for blueprint §13 parity. */
function buildLabObservationAndReport(
  lab: PatientData['labs'][number],
  patientId: string,
  encounterId: string
): { obs: FhirResource; report: FhirResource } {
  const obsId = uuidv4();
  const drId = uuidv4();
  const effective = lab.dateResulted || lab.dateOrdered || undefined;
  const parts = [lab.resultValue, lab.referenceRange].filter(Boolean);
  const obs: FhirResource = {
    resourceType: 'Observation',
    id: obsId,
    status: 'final',
    category: [{ coding: [{ system: CS_OBS_CATEGORY, code: 'laboratory' }] }],
    code: { text: lab.testName || 'Laboratory result' },
    subject: ref('Patient', patientId),
    encounter: ref('Encounter', encounterId),
    effectiveDateTime: effective,
    valueString: parts.join(' — ') || lab.interpretation || undefined,
    note: lab.interpretation?.trim() ? [{ text: lab.interpretation.trim() }] : undefined,
  };
  const conclusion = [lab.interpretation, lab.referenceRange].filter(Boolean).join(' — ') || undefined;
  const report: FhirResource = {
    resourceType: 'DiagnosticReport',
    id: drId,
    status: 'final',
    code: { text: lab.testName || 'Laboratory report' },
    subject: ref('Patient', patientId),
    encounter: ref('Encounter', encounterId),
    effectiveDateTime: effective,
    result: [ref('Observation', obsId)],
    conclusion,
  };
  return { obs, report };
}

function buildImagingDiagnosticReports(
  data: PatientData,
  patientId: string,
  encounterId: string
): FhirResource[] {
  return data.imaging.map((im) => {
    const id = uuidv4();
    return {
      resourceType: 'DiagnosticReport',
      id,
      status: 'final',
      code: { text: im.studyType || 'Imaging report' },
      subject: ref('Patient', patientId),
      encounter: ref('Encounter', encounterId),
      effectiveDateTime: im.datePerformed || im.dateOrdered || undefined,
      conclusion: [im.findings, im.impression].filter(Boolean).join('\n\n') || undefined,
    };
  });
}

/**
 * R4 collection Bundle for handoff / analytics — not a complete FHIR server document.
 * @see docs/v2/fhir-mapping-matrix.md
 */
export function buildFhirExportBundle(
  data: PatientData,
  options?: FhirExportOptions
): Record<string, unknown> {
  const patientId = uuidv4();
  const encounterId = uuidv4();
  const docId = uuidv4();

  const entries: { fullUrl: string; resource: FhirResource }[] = [];

  const patient = buildPatientResource(data, patientId);
  entries.push({ fullUrl: `urn:uuid:${patientId}`, resource: patient });

  const enc = buildEncounterResource(data, encounterId, patientId);
  entries.push({ fullUrl: `urn:uuid:${encounterId}`, resource: enc });

  for (const r of buildVitalsObservations(data, patientId, encounterId)) {
    const oid = typeof r.id === 'string' ? r.id : uuidv4();
    entries.push({ fullUrl: `urn:uuid:${oid}`, resource: r });
  }

  for (const lab of data.labs) {
    const { obs, report } = buildLabObservationAndReport(lab, patientId, encounterId);
    const oid = typeof obs.id === 'string' ? obs.id : uuidv4();
    const rid = typeof report.id === 'string' ? report.id : uuidv4();
    entries.push({ fullUrl: `urn:uuid:${oid}`, resource: obs });
    entries.push({ fullUrl: `urn:uuid:${rid}`, resource: report });
  }

  for (const r of buildConditionResources(data, patientId, encounterId)) {
    const id = typeof r.id === 'string' ? r.id : uuidv4();
    entries.push({ fullUrl: `urn:uuid:${id}`, resource: r });
  }
  for (const r of buildAllergyResources(data, patientId)) {
    const id = typeof r.id === 'string' ? r.id : uuidv4();
    entries.push({ fullUrl: `urn:uuid:${id}`, resource: r });
  }
  for (const r of buildMedicationStatements(data, patientId)) {
    const id = typeof r.id === 'string' ? r.id : uuidv4();
    entries.push({ fullUrl: `urn:uuid:${id}`, resource: r });
  }
  for (const r of buildProcedureResources(data, patientId, encounterId)) {
    const id = typeof r.id === 'string' ? r.id : uuidv4();
    entries.push({ fullUrl: `urn:uuid:${id}`, resource: r });
  }

  entries.push({
    fullUrl: `urn:uuid:${docId}`,
    resource: buildOpNoteDocumentReference(data, docId, patientId, encounterId),
  });

  const pdfB64 = options?.chartPdfBase64?.trim();
  if (pdfB64) {
    const pdfDocId = uuidv4();
    const label = data.ishiId || data.demographics?.lastName || 'patient';
    entries.push({
      fullUrl: `urn:uuid:${pdfDocId}`,
      resource: buildChartPdfDocumentReference(pdfDocId, patientId, encounterId, pdfB64, label),
    });
  }

  for (const r of buildImagingDiagnosticReports(data, patientId, encounterId)) {
    entries.push({ fullUrl: `urn:uuid:${r.id}`, resource: r });
  }

  return {
    resourceType: 'Bundle',
    id: uuidv4(),
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: entries,
  };
}
