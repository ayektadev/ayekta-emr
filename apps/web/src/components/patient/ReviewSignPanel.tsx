import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getPatientDataSnapshot, usePatientStore } from '../../store/patientStore';
import { saveToStorage } from '../../utils/storage';
import { getPersistenceContext } from '../../db/repositories/persistenceContext';
import {
  getEncounterById,
  listEncounterVersions,
  signCurrentEncounterDraft,
  submitDraftForReview,
  upsertDraftEncounterFromChart,
} from '../../db/repositories/encounterRepository';
import { encounterIdForPatient } from '../../db/utils/encounterIds';
import type { LocalEncounterVersionRow } from '../../db/dexie/schemaTypes';
import { getWorkflowPolicy, type WorkflowPolicy } from '../../services/workflowPolicy';

interface Props {
  patientId: string;
}

function formatWhen(ts: number | undefined): string {
  if (ts == null) return '—';
  return new Date(ts).toLocaleString();
}

function versionStatusLabel(status: LocalEncounterVersionRow['status']): string {
  switch (status) {
    case 'in_review':
      return 'In review';
    case 'superseded':
      return 'Superseded';
    default:
      return status;
  }
}

export default function ReviewSignPanel({ patientId }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const user = useAuthStore((s) => s.user);
  const savePatient = usePatientStore((s) => s.savePatient);

  const [versions, setVersions] = useState<LocalEncounterVersionRow[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [encounterExists, setEncounterExists] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [policy, setPolicy] = useState<WorkflowPolicy | null>(null);

  const encId = encounterIdForPatient(patientId);
  const canAttest = role === 'surgeon' || role === 'admin';
  const canSubmitReview = role === 'nurse' || role === 'admin' || role === 'surgeon';

  const refresh = useCallback(async () => {
    const enc = await getEncounterById(encId);
    setEncounterExists(!!enc);
    setCurrentVersionId(enc?.currentVersionId ?? null);
    const list = enc ? await listEncounterVersions(enc.id) : [];
    setVersions(list);
  }, [encId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, patientId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const p = await getWorkflowPolicy();
      if (!cancelled) setPolicy(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentDraft = versions.find((v) => v.id === currentVersionId);
  const isDraft = currentDraft?.status === 'draft';
  const isInReview = currentDraft?.status === 'in_review';

  const canSignNow = policy?.enableInReview ? isInReview : isDraft;
  const showSubmitReview = Boolean(policy?.enableInReview && isDraft);

  const onSubmitReview = async () => {
    if (!user?.username || !user.displayName) {
      setMessage({ kind: 'err', text: 'You must be signed in to submit for review.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    const snap = getPatientDataSnapshot(usePatientStore.getState());
    if (!snap || snap.ishiId !== patientId) {
      setBusy(false);
      setMessage({ kind: 'err', text: 'Open this patient’s chart before submitting for review.' });
      return;
    }
    const pctx = getPersistenceContext();
    try {
      await saveToStorage(snap);
      await upsertDraftEncounterFromChart(snap, pctx);
    } catch {
      setBusy(false);
      setMessage({ kind: 'err', text: 'Could not save chart before submit. Try again.' });
      return;
    }
    const ctx = getPersistenceContext();
    const result = await submitDraftForReview(patientId, {
      tenantId: ctx.tenantId,
      facilityId: ctx.facilityId,
      username: user.username,
      displayName: user.displayName,
    });
    setBusy(false);
    if (!result.ok) {
      const map: Record<string, string> = {
        no_encounter: 'No saved encounter for this patient yet. Save the chart once, then try again.',
        not_draft: 'The current version is not a draft. Refresh or save the chart.',
        transaction_failed: 'Update failed due to a storage error. Try again.',
      };
      setMessage({ kind: 'err', text: map[result.error] ?? result.error });
      return;
    }
    setMessage({
      kind: 'ok',
      text: 'Chart submitted for review. A surgeon may attest once nursing sign-offs (if configured) are complete.',
    });
    savePatient();
    await refresh();
  };

  const onSign = async () => {
    if (!user?.username || !user.displayName) {
      setMessage({ kind: 'err', text: 'You must be signed in with a display name to attest.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    const snap = getPatientDataSnapshot(usePatientStore.getState());
    if (!snap || snap.ishiId !== patientId) {
      setBusy(false);
      setMessage({ kind: 'err', text: 'Open this patient’s chart before signing.' });
      return;
    }
    const pctx = getPersistenceContext();
    try {
      await saveToStorage(snap);
      await upsertDraftEncounterFromChart(snap, pctx);
    } catch {
      setBusy(false);
      setMessage({ kind: 'err', text: 'Could not save chart before sign. Try again.' });
      return;
    }
    const ctx = getPersistenceContext();
    const result = await signCurrentEncounterDraft(patientId, {
      tenantId: ctx.tenantId,
      facilityId: ctx.facilityId,
      username: user.username,
      displayName: user.displayName,
      amendmentReason: amendmentReason.trim() || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      const map: Record<string, string> = {
        no_encounter: 'No saved encounter for this patient yet. Save the chart once, then try again.',
        not_draft:
          'The current version is not a draft (already signed or out of sync). Refresh the page or save the chart.',
        transaction_failed: 'Signing failed due to a storage error. Try again.',
        submit_for_review_first:
          'This tenant requires submit-for-review first. Use “Submit for review” while the version is still a draft.',
        nursing_signoff_incomplete:
          'Required nursing section sign-offs are missing. Complete them on the relevant chart sections, save, then try again.',
      };
      setMessage({ kind: 'err', text: map[result.error] ?? result.error });
      return;
    }
    setAmendmentReason('');
    setMessage({
      kind: 'ok',
      text: `Encounter attested. Signed version ${result.signedVersionId.slice(0, 12)}… — a new draft is open for addenda.`,
    });
    savePatient();
    await refresh();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans">
      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">Review &amp; sign</h2>
      <p className="mt-1 text-sm text-gray-600 mb-6 max-w-2xl leading-relaxed">
        Version history and surgeon attestation. When workflow requires it, staff submit the draft for review;
        nursing signs off configured sections; then a surgeon signs the encounter.
      </p>

      {policy?.enableInReview ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <strong>Review workflow is on</strong> (Admin → Workflow). Submit draft for review before surgeon
          sign; complete nursing sign-offs on chart sections as configured.
        </p>
      ) : null}

      {!encounterExists && (
        <p className="text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg p-6 mb-6 bg-white">
          No encounter row on this device yet. Use <strong>Save</strong> from the header (or wait for autosave)
          once, then return here to attest.
        </p>
      )}

      {message && (
        <div
          role={message.kind === 'ok' ? 'status' : 'alert'}
          aria-live={message.kind === 'ok' ? 'polite' : 'assertive'}
          className={`text-sm rounded-lg px-3 py-2 mb-4 ${
            message.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {encounterExists && versions.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
          <table className="w-full text-sm">
            <caption className="sr-only">Encounter versions for this patient</caption>
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Ver.
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Created
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Signed
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Signer
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {versions.map((v) => {
                const isCurrent = v.id === currentVersionId;
                return (
                  <tr key={v.id} className={isCurrent ? 'bg-orange-50/50' : undefined}>
                    <td className="px-3 py-2 tabular-nums">{v.versionNumber}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex flex-wrap items-center gap-1">
                        <span>{versionStatusLabel(v.status)}</span>
                        {v.status === 'signed' ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            (locked)
                          </span>
                        ) : null}
                        {isCurrent ? (
                          <span className="text-xs text-gray-700 font-medium">(current)</span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                      {formatWhen(v.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                      {v.status === 'signed' ? formatWhen(v.signedAt) : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {v.signedByDisplayName ?? v.signedByUsername ?? '—'}
                    </td>
                    <td
                      className="px-3 py-2 text-xs text-gray-600 max-w-[12rem] truncate"
                      title={v.amendmentReason ?? ''}
                    >
                      {v.amendmentReason ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showSubmitReview && (
        <section
          aria-labelledby="submit-review-heading"
          className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm mb-6"
        >
          <h3 id="submit-review-heading" className="text-sm font-semibold text-gray-900 mb-2">
            Submit for review
          </h3>
          {!canSubmitReview ? (
            <p className="text-sm text-gray-600 mb-3">
              Your role cannot submit for review in this build.
            </p>
          ) : (
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Moves the active <strong>draft</strong> to <strong>in review</strong> so the team can finish
              nursing sign-offs before surgeon attestation.
            </p>
          )}
          <button
            type="button"
            onClick={() => void onSubmitReview()}
            disabled={!canSubmitReview || busy || !encounterExists}
            className="text-sm font-medium px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            {busy ? 'Working…' : 'Submit draft for review'}
          </button>
        </section>
      )}

      <section aria-labelledby="attest-heading" className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <h3 id="attest-heading" className="text-sm font-semibold text-gray-900 mb-3">
          Surgeon attestation
        </h3>
        {!canAttest && (
          <p className="text-sm text-gray-600 mb-3">
            Only a <strong>surgeon</strong> or <strong>admin</strong> role can sign the encounter on this
            build. Your role: <span className="font-medium capitalize">{role ?? '—'}</span>.
          </p>
        )}
        <label htmlFor="amendment-reason" className="block text-xs font-medium text-gray-600 mb-1">
          Optional attestation / addendum note (stored with the signed version and audit)
        </label>
        <textarea
          id="amendment-reason"
          rows={3}
          value={amendmentReason}
          onChange={(e) => setAmendmentReason(e.target.value)}
          disabled={!canAttest || busy}
          className="w-full max-w-xl text-sm border border-gray-300 rounded-md px-2 py-1.5 mb-3 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        />
        <div>
          <button
            type="button"
            onClick={() => void onSign()}
            disabled={!canAttest || !canSignNow || busy || !encounterExists}
            className="text-sm font-medium px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            {busy ? 'Signing…' : 'Sign encounter'}
          </button>
        </div>
        {!canSignNow && encounterExists && currentDraft && (
          <p className="text-xs text-gray-500 mt-2">
            {policy?.enableInReview
              ? 'The active version must be in review (not draft) before signing. Submit for review first, complete nursing sign-offs, then attest.'
              : 'The active pointer must be a draft. Try saving from the header.'}
          </p>
        )}
      </section>
    </div>
  );
}
