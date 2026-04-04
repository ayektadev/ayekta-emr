import type { PatientData } from '../types/patient.types';

/** Aggregates across charts (typically one latest draft per patient encounter). */
export type ClinicalMissionRollup = {
  chartsInRollup: number;
  /** Patients with any non-empty operative procedure text. */
  patientsWithProcedureDocumented: number;
  /** Patients with pre- or post-op diagnosis text. */
  patientsWithDiagnosisDocumented: number;
  /** Total discrete complication log rows (all charts). */
  complicationLogEntries: number;
  complicationBySeverity: {
    minor: number;
    moderate: number;
    major: number;
    critical: number;
    unset: number;
  };
  /** Patients with op-note complication class other than none / empty. */
  patientsWithOpNoteComplicationFlag: number;
  /** All progress notes across charts. */
  progressNotesTotal: number;
  progressNotesWithWoundStatus: number;
  /** All follow-up visit rows. */
  followUpNotesTotal: number;
  followUpNotesWithNextScheduled: number;
  /** Patients with discharge date filled. */
  patientsWithDischargeDate: number;
  /** Patients with non-empty surgical outcomes immediate field. */
  patientsWithOutcomeImmediate: number;
  patientsReadmission30dYes: number;
  patientsReturnToOR30dYes: number;
  patientsMortalityRelatedYes: number;
  labsRowsTotal: number;
  imagingStudiesTotal: number;
  homeMedRowsTotal: number;
  allergyRowsTotal: number;
  /** Patients with at least one planned op checkbox true (surgical needs). */
  patientsWithPlannedProcedure: number;
  plannedProcedurePatients: {
    inguinalHerniaL: number;
    inguinalHerniaR: number;
    inguinalHerniaBilateral: number;
    ventralUmbilical: number;
    hysterectomy: number;
    prostatectomy: number;
    hydroceleL: number;
    hydroceleR: number;
    hydroceleBilateral: number;
    massExcision: number;
  };
};

const emptyPlanned = (): ClinicalMissionRollup['plannedProcedurePatients'] => ({
  inguinalHerniaL: 0,
  inguinalHerniaR: 0,
  inguinalHerniaBilateral: 0,
  ventralUmbilical: 0,
  hysterectomy: 0,
  prostatectomy: 0,
  hydroceleL: 0,
  hydroceleR: 0,
  hydroceleBilateral: 0,
  massExcision: 0,
});

export function computeClinicalRollupFromCharts(charts: PatientData[]): ClinicalMissionRollup {
  const sev = { minor: 0, moderate: 0, major: 0, critical: 0, unset: 0 };
  const planned = emptyPlanned();
  let patientsWithProcedureDocumented = 0;
  let patientsWithDiagnosisDocumented = 0;
  let complicationLogEntries = 0;
  let patientsWithOpNoteComplicationFlag = 0;
  let progressNotesTotal = 0;
  let progressNotesWithWoundStatus = 0;
  let followUpNotesTotal = 0;
  let followUpNotesWithNextScheduled = 0;
  let patientsWithDischargeDate = 0;
  let patientsWithOutcomeImmediate = 0;
  let patientsReadmission30dYes = 0;
  let patientsReturnToOR30dYes = 0;
  let patientsMortalityRelatedYes = 0;
  let labsRowsTotal = 0;
  let imagingStudiesTotal = 0;
  let homeMedRowsTotal = 0;
  let allergyRowsTotal = 0;
  let patientsWithPlannedProcedure = 0;

  for (const p of charts) {
    const on = p.operativeNote;
    if (on?.procedurePerformed?.trim()) patientsWithProcedureDocumented++;
    if (on?.preopDiagnosis?.trim() || on?.postopDiagnosis?.trim()) patientsWithDiagnosisDocumented++;

    const opClass = on?.opNoteComplicationClass;
    if (opClass && opClass !== 'none') patientsWithOpNoteComplicationFlag++;

    const log = p.complicationLog;
    if (Array.isArray(log)) {
      for (const e of log) {
        complicationLogEntries++;
        const s = e?.severity;
        if (s === 'minor') sev.minor++;
        else if (s === 'moderate') sev.moderate++;
        else if (s === 'major') sev.major++;
        else if (s === 'critical') sev.critical++;
        else sev.unset++;
      }
    }

    const prog = p.progressNotes?.notes;
    if (Array.isArray(prog)) {
      progressNotesTotal += prog.length;
      for (const n of prog) {
        if (n?.woundStatus?.trim()) progressNotesWithWoundStatus++;
      }
    }

    const fus = p.followUpNotes?.notes;
    if (Array.isArray(fus)) {
      followUpNotesTotal += fus.length;
      for (const n of fus) {
        if (n?.nextFollowUp?.trim()) followUpNotesWithNextScheduled++;
      }
    }

    if (p.discharge?.dischargeDate?.trim()) patientsWithDischargeDate++;

    const so = p.surgicalOutcomes;
    if (so?.immediateOutcome && String(so.immediateOutcome).trim()) patientsWithOutcomeImmediate++;
    if (so?.readmissionWithin30Days === true) patientsReadmission30dYes++;
    if (so?.returnToORWithin30Days === true) patientsReturnToOR30dYes++;
    if (so?.mortalityRelated === true) patientsMortalityRelatedYes++;

    if (Array.isArray(p.labs)) labsRowsTotal += p.labs.length;
    if (Array.isArray(p.imaging)) imagingStudiesTotal += p.imaging.length;

    const meds = p.medications;
    if (meds) {
      homeMedRowsTotal +=
        (meds.currentMedications?.length ?? 0) +
        (meds.prnMedications?.length ?? 0) +
        (meds.preopMedications?.length ?? 0);
      allergyRowsTotal += meds.allergies?.length ?? 0;
    }

    const sn = p.surgicalNeeds;
    if (sn) {
      const anyPlanned =
        sn.opInguinalHerniaL ||
        sn.opInguinalHerniaR ||
        sn.opInguinalHerniaBilateral ||
        sn.opVentralUmbilicalHernia ||
        sn.opHysterectomy ||
        sn.opProstatectomy ||
        sn.opHydrocelectomyL ||
        sn.opHydrocelectomyR ||
        sn.opHydrocelectomyBilateral ||
        sn.opMassExcision;
      if (anyPlanned) {
        patientsWithPlannedProcedure++;
        if (sn.opInguinalHerniaL) planned.inguinalHerniaL++;
        if (sn.opInguinalHerniaR) planned.inguinalHerniaR++;
        if (sn.opInguinalHerniaBilateral) planned.inguinalHerniaBilateral++;
        if (sn.opVentralUmbilicalHernia) planned.ventralUmbilical++;
        if (sn.opHysterectomy) planned.hysterectomy++;
        if (sn.opProstatectomy) planned.prostatectomy++;
        if (sn.opHydrocelectomyL) planned.hydroceleL++;
        if (sn.opHydrocelectomyR) planned.hydroceleR++;
        if (sn.opHydrocelectomyBilateral) planned.hydroceleBilateral++;
        if (sn.opMassExcision) planned.massExcision++;
      }
    }
  }

  return {
    chartsInRollup: charts.length,
    patientsWithProcedureDocumented,
    patientsWithDiagnosisDocumented,
    complicationLogEntries,
    complicationBySeverity: sev,
    patientsWithOpNoteComplicationFlag,
    progressNotesTotal,
    progressNotesWithWoundStatus,
    followUpNotesTotal,
    followUpNotesWithNextScheduled,
    patientsWithDischargeDate,
    patientsWithOutcomeImmediate,
    patientsReadmission30dYes,
    patientsReturnToOR30dYes,
    patientsMortalityRelatedYes,
    labsRowsTotal,
    imagingStudiesTotal,
    homeMedRowsTotal,
    allergyRowsTotal,
    patientsWithPlannedProcedure,
    plannedProcedurePatients: planned,
  };
}
