import { getAyektaDB } from '../db/dexie/database';
import type { PatientData, TabName } from '../types/patient.types';

export const WORKFLOW_POLICY_KV_KEY = 'ayekta-workflow-policy-v1';

export type WorkflowPolicy = {
  /** When true, chart must be submitted for review (`in_review`) before surgeon sign; nursing sign-offs may apply. */
  enableInReview: boolean;
  /** Module keys that require a nursing section sign-off on the chart JSON before surgeon sign. */
  nursingSignOffSectionKeys: TabName[];
};

export const DEFAULT_NURSING_SIGNOFF_MODULES: TabName[] = ['nursing-orders', 'pacu', 'floor-flow'];

export const DEFAULT_WORKFLOW_POLICY: WorkflowPolicy = {
  enableInReview: false,
  nursingSignOffSectionKeys: [...DEFAULT_NURSING_SIGNOFF_MODULES],
};

function normalizePolicy(raw: unknown): WorkflowPolicy {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_WORKFLOW_POLICY };
  const o = raw as Record<string, unknown>;
  const enableInReview = o.enableInReview === true;
  const keys = o.nursingSignOffSectionKeys;
  const nursingSignOffSectionKeys = Array.isArray(keys)
    ? (keys.filter((k) => typeof k === 'string') as TabName[])
    : [...DEFAULT_NURSING_SIGNOFF_MODULES];
  return { enableInReview, nursingSignOffSectionKeys };
}

export async function getWorkflowPolicy(): Promise<WorkflowPolicy> {
  try {
    const row = await getAyektaDB().keyValue.get(WORKFLOW_POLICY_KV_KEY);
    return normalizePolicy(row?.v);
  } catch {
    return { ...DEFAULT_WORKFLOW_POLICY };
  }
}

export async function setWorkflowPolicy(policy: WorkflowPolicy): Promise<void> {
  const db = getAyektaDB();
  await db.keyValue.put({
    k: WORKFLOW_POLICY_KV_KEY,
    v: {
      enableInReview: policy.enableInReview,
      nursingSignOffSectionKeys: [...policy.nursingSignOffSectionKeys],
    },
  });
}

export function nursingSignOffsSatisfied(data: PatientData, policy: WorkflowPolicy): boolean {
  const map = data.clinicalWorkflow?.sectionNursingSignOff ?? {};
  for (const key of policy.nursingSignOffSectionKeys) {
    const e = map[key];
    if (!e?.signedAt?.trim()) return false;
  }
  return true;
}
