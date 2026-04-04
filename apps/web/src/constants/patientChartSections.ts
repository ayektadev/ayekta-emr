import type { TabName } from '../types/patient.types';

export type PatientWorkspaceSection =
  | 'summary'
  | 'encounters'
  | 'review-sign'
  | 'documents'
  | TabName;

export interface ChartSectionDef {
  key: PatientWorkspaceSection;
  label: string;
  kind: 'panel' | 'module';
  moduleId?: TabName;
  /** Nurse intake–oriented sections (used for quick default) */
  intake?: boolean;
}

/** Ordered to match Product Spec chart tab intent + surgical modules. */
export const CHART_SECTION_DEFINITIONS: ChartSectionDef[] = [
  { key: 'summary', label: 'Summary', kind: 'panel' },
  { key: 'encounters', label: 'Encounters', kind: 'panel' },
  { key: 'triage', label: 'Vitals & intake', kind: 'module', moduleId: 'triage', intake: true },
  { key: 'demographics', label: 'Registration', kind: 'module', moduleId: 'demographics' },
  { key: 'medications', label: 'Medications', kind: 'module', moduleId: 'medications' },
  { key: 'labs', label: 'Labs', kind: 'module', moduleId: 'labs' },
  { key: 'imaging', label: 'Imaging', kind: 'module', moduleId: 'imaging' },
  { key: 'surgical-needs', label: 'Planned procedure', kind: 'module', moduleId: 'surgical-needs' },
  { key: 'consent', label: 'Consent', kind: 'module', moduleId: 'consent' },
  { key: 'pre-op-checklist', label: 'Pre-op checklist', kind: 'module', moduleId: 'pre-op-checklist' },
  { key: 'pre-anesthesia', label: 'Pre-anesthesia', kind: 'module', moduleId: 'pre-anesthesia' },
  { key: 'anesthesia-record', label: 'Anesthesia record', kind: 'module', moduleId: 'anesthesia-record' },
  { key: 'or-record', label: 'OR record', kind: 'module', moduleId: 'or-record' },
  { key: 'operative-note', label: 'Op note', kind: 'module', moduleId: 'operative-note' },
  { key: 'complications-log', label: 'Complications log', kind: 'module', moduleId: 'complications-log' },
  { key: 'surgical-outcomes', label: 'Surgical outcomes', kind: 'module', moduleId: 'surgical-outcomes' },
  { key: 'nursing-orders', label: 'Nursing orders', kind: 'module', moduleId: 'nursing-orders' },
  { key: 'pacu', label: 'PACU', kind: 'module', moduleId: 'pacu' },
  { key: 'floor-flow', label: 'Floor', kind: 'module', moduleId: 'floor-flow' },
  { key: 'progress-notes', label: 'Wound & progress', kind: 'module', moduleId: 'progress-notes' },
  { key: 'discharge', label: 'Discharge', kind: 'module', moduleId: 'discharge' },
  { key: 'follow-up-notes', label: 'Follow-up', kind: 'module', moduleId: 'follow-up-notes' },
  { key: 'review-sign', label: 'Review & sign', kind: 'panel' },
  { key: 'documents', label: 'Documents', kind: 'panel' },
];
