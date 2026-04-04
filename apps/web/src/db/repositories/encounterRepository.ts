import type { PatientData } from '../../types/patient.types';
import { getWorkflowPolicy, nursingSignOffsSatisfied } from '../../services/workflowPolicy';
import { getAyektaDB } from '../dexie/database';
import { draftVersionIdForEncounter, encounterIdForPatient } from '../utils/encounterIds';
import type { LocalEncounterVersionRow } from '../dexie/schemaTypes';
import { appendLocalAuditEvent } from './auditRepository';
import type { PersistenceContext } from './persistenceContext';

function isEditableVersionStatus(s: LocalEncounterVersionRow['status']): boolean {
  return s === 'draft' || s === 'in_review';
}

function newVersionId(): string {
  return `ver:${crypto.randomUUID()}`;
}

/**
 * Chart JSON for the editable draft pointed to by `encounters.currentVersionId`.
 */
export async function loadCurrentDraftChartForPatient(patientId: string): Promise<PatientData | null> {
  if (!patientId) return null;
  try {
    const db = getAyektaDB();
    const encId = encounterIdForPatient(patientId);
    const enc = await db.encounters.get(encId);
    if (!enc) return null;
    const row = await db.encounterVersions.get(enc.currentVersionId);
    if (!row?.dataJson || typeof row.dataJson !== 'object') return null;
    if (!isEditableVersionStatus(row.status)) return null;
    return row.dataJson as unknown as PatientData;
  } catch (e) {
    console.error('loadCurrentDraftChartForPatient:', e);
    return null;
  }
}

export async function listEncounterVersions(encounterId: string): Promise<LocalEncounterVersionRow[]> {
  try {
    const rows = await getAyektaDB().encounterVersions.where('encounterId').equals(encounterId).toArray();
    return rows.sort((a, b) => a.versionNumber - b.versionNumber);
  } catch (e) {
    console.error('listEncounterVersions:', e);
    return [];
  }
}

/**
 * Maintains encounter + current draft version; overwrites only the active draft row (never a signed row).
 */
export async function upsertDraftEncounterFromChart(
  data: PatientData,
  ctx: PersistenceContext
): Promise<void> {
  const patientId = data.ishiId;
  if (!patientId) return;

  const db = getAyektaDB();
  const now = Date.now();
  const encId = encounterIdForPatient(patientId);
  const legacyDraftId = draftVersionIdForEncounter(encId);

  try {
    let enc = await db.encounters.get(encId);
    let currentVid = enc?.currentVersionId;

    if (!enc) {
      currentVid = legacyDraftId;
      await db.encounters.put({
        id: encId,
        patientId,
        tenantId: ctx.tenantId,
        facilityId: ctx.facilityId,
        encounterType: 'outpatient_surgical',
        status: 'draft',
        currentVersionId: currentVid,
        createdAt: now,
        updatedAt: now,
      });
      await db.encounterVersions.put({
        id: currentVid,
        encounterId: encId,
        versionNumber: 1,
        status: 'draft',
        dataJson: data as unknown as Record<string, unknown>,
        createdAt: now,
        supersedesVersionId: null,
      });
      return;
    }

    const ver = await db.encounterVersions.get(enc.currentVersionId);
    if (!ver) {
      await db.encounterVersions.put({
        id: enc.currentVersionId,
        encounterId: encId,
        versionNumber: 1,
        status: 'draft',
        dataJson: data as unknown as Record<string, unknown>,
        createdAt: now,
        supersedesVersionId: null,
      });
      await db.encounters.update(encId, { updatedAt: now });
      return;
    }

    if (ver.status === 'signed' || ver.status === 'superseded') {
      console.warn('upsertDraftEncounterFromChart: current version is not editable; skip overwrite');
      return;
    }

    await db.encounterVersions.put({
      ...ver,
      dataJson: data as unknown as Record<string, unknown>,
    });
    await db.encounters.update(encId, { updatedAt: now });
  } catch (e) {
    console.error('encounterRepository.upsertDraftEncounterFromChart:', e);
  }
}

export type SignEncounterContext = PersistenceContext & {
  username: string;
  displayName: string;
  amendmentReason?: string;
};

/**
 * Moves the active draft to `in_review` (Product spec §10 / chunk J).
 */
export async function submitDraftForReview(
  patientId: string,
  ctx: SignEncounterContext
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getAyektaDB();
  const encId = encounterIdForPatient(patientId);
  const now = Date.now();

  try {
    const enc = await db.encounters.get(encId);
    if (!enc) return { ok: false, error: 'no_encounter' };

    const draft = await db.encounterVersions.get(enc.currentVersionId);
    if (!draft || draft.status !== 'draft') return { ok: false, error: 'not_draft' };

    await db.transaction('rw', db.encounters, db.encounterVersions, async () => {
      await db.encounterVersions.put({ ...draft, status: 'in_review' });
      await db.encounters.update(encId, { status: 'in_review', updatedAt: now });
    });

    await appendLocalAuditEvent({
      tenantId: ctx.tenantId,
      facilityId: ctx.facilityId,
      username: ctx.username,
      entityType: 'encounter',
      entityId: encId,
      action: 'submit_review',
      metadataJson: { versionId: draft.id, versionNumber: draft.versionNumber },
      occurredAt: now,
    });

    return { ok: true };
  } catch (e) {
    console.error('submitDraftForReview:', e);
    return { ok: false, error: 'transaction_failed' };
  }
}

/**
 * Freezes the current draft as a signed version and forks a new draft with the same chart payload (addendum).
 */
export async function signCurrentEncounterDraft(
  patientId: string,
  ctx: SignEncounterContext
): Promise<{ ok: true; signedVersionId: string; newDraftVersionId: string } | { ok: false; error: string }> {
  const db = getAyektaDB();
  const encId = encounterIdForPatient(patientId);
  const now = Date.now();

  try {
    const enc = await db.encounters.get(encId);
    if (!enc) return { ok: false, error: 'no_encounter' };

    const draft = await db.encounterVersions.get(enc.currentVersionId);
    if (!draft || !isEditableVersionStatus(draft.status)) return { ok: false, error: 'not_draft' };

    const policy = await getWorkflowPolicy();
    if (policy.enableInReview) {
      if (draft.status !== 'in_review') return { ok: false, error: 'submit_for_review_first' };
      const data = draft.dataJson as unknown as PatientData;
      if (!nursingSignOffsSatisfied(data, policy)) return { ok: false, error: 'nursing_signoff_incomplete' };
    } else if (draft.status !== 'draft') {
      return { ok: false, error: 'not_draft' };
    }

    const signedId = newVersionId();
    const nextDraftId = newVersionId();
    const frozenPayload = JSON.parse(JSON.stringify(draft.dataJson)) as Record<string, unknown>;
    const forkPayload = JSON.parse(JSON.stringify(draft.dataJson)) as Record<string, unknown>;

    await db.transaction('rw', db.encounters, db.encounterVersions, async () => {
      await db.encounterVersions.delete(draft.id);

      const signedRow: LocalEncounterVersionRow = {
        id: signedId,
        encounterId: encId,
        versionNumber: draft.versionNumber,
        status: 'signed',
        dataJson: frozenPayload,
        createdAt: draft.createdAt,
        signedAt: now,
        signedByUsername: ctx.username,
        signedByDisplayName: ctx.displayName,
        supersedesVersionId: draft.supersedesVersionId ?? null,
        amendmentReason: ctx.amendmentReason?.trim() || null,
      };
      await db.encounterVersions.put(signedRow);

      const nextDraft: LocalEncounterVersionRow = {
        id: nextDraftId,
        encounterId: encId,
        versionNumber: draft.versionNumber + 1,
        status: 'draft',
        dataJson: forkPayload,
        createdAt: now,
        supersedesVersionId: signedId,
        amendmentReason: null,
      };
      await db.encounterVersions.put(nextDraft);

      await db.encounters.update(encId, {
        currentVersionId: nextDraftId,
        status: 'signed',
        updatedAt: now,
      });
    });

    await appendLocalAuditEvent({
      tenantId: ctx.tenantId,
      facilityId: ctx.facilityId,
      username: ctx.username,
      entityType: 'encounter',
      entityId: encId,
      action: 'sign',
      metadataJson: {
        signedVersionId: signedId,
        newDraftVersionId: nextDraftId,
        versionNumber: draft.versionNumber,
        amendmentReason: ctx.amendmentReason ?? null,
      },
      occurredAt: now,
    });

    return { ok: true, signedVersionId: signedId, newDraftVersionId: nextDraftId };
  } catch (e) {
    console.error('signCurrentEncounterDraft:', e);
    return { ok: false, error: 'transaction_failed' };
  }
}

export async function getEncountersForPatient(patientId: string) {
  const db = getAyektaDB();
  try {
    return await db.encounters.where('patientId').equals(patientId).toArray();
  } catch (e) {
    console.error('getEncountersForPatient:', e);
    return [];
  }
}

export async function getEncounterById(encounterId: string) {
  try {
    return await getAyektaDB().encounters.get(encounterId);
  } catch (e) {
    console.error('getEncounterById:', e);
    return undefined;
  }
}
