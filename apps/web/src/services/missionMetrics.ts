import { getAyektaDB } from '../db/dexie/database';
import { loadDraftChartForPatient } from '../db/repositories/chartLoadRepository';
import { countOutboxByStatus } from '../db/repositories/syncOutboxRepository';
import type { PatientData } from '../types/patient.types';
import {
  computeClinicalRollupFromCharts,
  type ClinicalMissionRollup,
} from './clinicalMissionRollup';

export type MissionMetricsSnapshot = {
  localPatients: number;
  localEncounters: number;
  signedEncounterVersions: number;
  draftEncounterVersions: number;
  inReviewEncounterVersions: number;
  supersededEncounterVersions: number;
  pendingAttachments: number;
  registeredAttachmentsMeta: number;
  syncOutboxPending: number;
  syncOutboxError: number;
  auditEventsTotal: number;
  /** Latest draft chart JSON per local encounter (Chunk G). */
  clinical: ClinicalMissionRollup;
  capturedAtIso: string;
};

async function loadChartsForClinicalRollup(): Promise<PatientData[]> {
  const db = getAyektaDB();
  const encs = await db.encounters.toArray();
  const seen = new Set<string>();
  const charts: PatientData[] = [];
  for (const e of encs) {
    const pid = e.patientId?.trim();
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    const c = await loadDraftChartForPatient(pid);
    if (c) charts.push(c);
  }
  return charts;
}

export async function gatherMissionMetrics(): Promise<MissionMetricsSnapshot> {
  const db = getAyektaDB();
  const [
    localPatients,
    localEncounters,
    versions,
    pendingAttachments,
    registeredAttachmentsMeta,
    syncOutboxPending,
    syncOutboxError,
    auditEventsTotal,
    chartRows,
  ] = await Promise.all([
    db.patients.count(),
    db.encounters.count(),
    db.encounterVersions.toArray(),
    db.pendingAttachments.count(),
    db.attachmentsMeta.count(),
    countOutboxByStatus('pending'),
    countOutboxByStatus('error'),
    db.auditEventsLocal.count(),
    loadChartsForClinicalRollup(),
  ]);

  let signedEncounterVersions = 0;
  let draftEncounterVersions = 0;
  let inReviewEncounterVersions = 0;
  let supersededEncounterVersions = 0;
  for (const v of versions) {
    if (v.status === 'signed') signedEncounterVersions++;
    else if (v.status === 'draft') draftEncounterVersions++;
    else if (v.status === 'in_review') inReviewEncounterVersions++;
    else if (v.status === 'superseded') supersededEncounterVersions++;
  }

  const clinical = computeClinicalRollupFromCharts(chartRows);

  return {
    localPatients,
    localEncounters,
    signedEncounterVersions,
    draftEncounterVersions,
    inReviewEncounterVersions,
    supersededEncounterVersions,
    pendingAttachments,
    registeredAttachmentsMeta,
    syncOutboxPending,
    syncOutboxError,
    auditEventsTotal,
    clinical,
    capturedAtIso: new Date().toISOString(),
  };
}

export function metricsToCsvRows(m: MissionMetricsSnapshot): string {
  const c = m.clinical;
  const p = c.plannedProcedurePatients;
  const lines = [
    'metric,value',
    `localPatients,${m.localPatients}`,
    `localEncounters,${m.localEncounters}`,
    `signedEncounterVersions,${m.signedEncounterVersions}`,
    `draftEncounterVersions,${m.draftEncounterVersions}`,
    `inReviewEncounterVersions,${m.inReviewEncounterVersions}`,
    `supersededEncounterVersions,${m.supersededEncounterVersions}`,
    `pendingAttachments,${m.pendingAttachments}`,
    `registeredAttachmentsMeta,${m.registeredAttachmentsMeta}`,
    `syncOutboxPending,${m.syncOutboxPending}`,
    `syncOutboxError,${m.syncOutboxError}`,
    `auditEventsTotal,${m.auditEventsTotal}`,
    `clinical_chartsInRollup,${c.chartsInRollup}`,
    `clinical_patientsWithProcedureDocumented,${c.patientsWithProcedureDocumented}`,
    `clinical_patientsWithDiagnosisDocumented,${c.patientsWithDiagnosisDocumented}`,
    `clinical_complicationLogEntries,${c.complicationLogEntries}`,
    `clinical_complicationSeverity_minor,${c.complicationBySeverity.minor}`,
    `clinical_complicationSeverity_moderate,${c.complicationBySeverity.moderate}`,
    `clinical_complicationSeverity_major,${c.complicationBySeverity.major}`,
    `clinical_complicationSeverity_critical,${c.complicationBySeverity.critical}`,
    `clinical_complicationSeverity_unset,${c.complicationBySeverity.unset}`,
    `clinical_patientsWithOpNoteComplicationFlag,${c.patientsWithOpNoteComplicationFlag}`,
    `clinical_progressNotesTotal,${c.progressNotesTotal}`,
    `clinical_progressNotesWithWoundStatus,${c.progressNotesWithWoundStatus}`,
    `clinical_followUpNotesTotal,${c.followUpNotesTotal}`,
    `clinical_followUpNotesWithNextScheduled,${c.followUpNotesWithNextScheduled}`,
    `clinical_patientsWithDischargeDate,${c.patientsWithDischargeDate}`,
    `clinical_patientsWithOutcomeImmediate,${c.patientsWithOutcomeImmediate}`,
    `clinical_patientsReadmission30dYes,${c.patientsReadmission30dYes}`,
    `clinical_patientsReturnToOR30dYes,${c.patientsReturnToOR30dYes}`,
    `clinical_patientsMortalityRelatedYes,${c.patientsMortalityRelatedYes}`,
    `clinical_labsRowsTotal,${c.labsRowsTotal}`,
    `clinical_imagingStudiesTotal,${c.imagingStudiesTotal}`,
    `clinical_homeMedRowsTotal,${c.homeMedRowsTotal}`,
    `clinical_allergyRowsTotal,${c.allergyRowsTotal}`,
    `clinical_patientsWithPlannedProcedure,${c.patientsWithPlannedProcedure}`,
    `clinical_planned_inguinalHerniaL,${p.inguinalHerniaL}`,
    `clinical_planned_inguinalHerniaR,${p.inguinalHerniaR}`,
    `clinical_planned_inguinalHerniaBilateral,${p.inguinalHerniaBilateral}`,
    `clinical_planned_ventralUmbilical,${p.ventralUmbilical}`,
    `clinical_planned_hysterectomy,${p.hysterectomy}`,
    `clinical_planned_prostatectomy,${p.prostatectomy}`,
    `clinical_planned_hydroceleL,${p.hydroceleL}`,
    `clinical_planned_hydroceleR,${p.hydroceleR}`,
    `clinical_planned_hydroceleBilateral,${p.hydroceleBilateral}`,
    `clinical_planned_massExcision,${p.massExcision}`,
    `capturedAtIso,${m.capturedAtIso}`,
  ];
  return lines.join('\n');
}
