import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CHART_SECTION_DEFINITIONS } from '../../constants/patientChartSections';
import {
  DEFAULT_WORKFLOW_POLICY,
  getWorkflowPolicy,
  setWorkflowPolicy,
  type WorkflowPolicy,
} from '../../services/workflowPolicy';
import type { TabName } from '../../types/patient.types';

const MODULE_OPTIONS: { id: TabName; label: string }[] = CHART_SECTION_DEFINITIONS.filter(
  (d): d is typeof d & { moduleId: TabName } => d.kind === 'module' && !!d.moduleId
).map((d) => ({ id: d.moduleId, label: d.label }));

export default function WorkflowConfigPage() {
  const [policy, setLocal] = useState<WorkflowPolicy>(DEFAULT_WORKFLOW_POLICY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const p = await getWorkflowPolicy();
      if (!cancelled) {
        setLocal(p);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSection = (id: TabName) => {
    setLocal((prev) => {
      const has = prev.nursingSignOffSectionKeys.includes(id);
      const nursingSignOffSectionKeys = has
        ? prev.nursingSignOffSectionKeys.filter((k) => k !== id)
        : [...prev.nursingSignOffSectionKeys, id];
      return { ...prev, nursingSignOffSectionKeys };
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await setWorkflowPolicy(policy);
      setMessage({ kind: 'ok', text: 'Workflow settings saved on this device.' });
    } catch {
      setMessage({ kind: 'err', text: 'Could not save settings. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl font-sans">
      <div className="mb-6">
        <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-800">
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Workflow</h1>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
          Configure encounter review and nursing sign-off requirements. Stored locally in IndexedDB (
          <code className="rounded bg-gray-100 px-1 text-xs">keyValue</code>
          ); production would map to tenant policy from the API.
        </p>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-8">
          {message ? (
            <p
              role={message.kind === 'err' ? 'alert' : 'status'}
              className={`rounded-lg border px-3 py-2 text-sm ${
                message.kind === 'ok'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              {message.text}
            </p>
          ) : null}

          <fieldset className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <legend className="px-1 text-sm font-medium text-gray-900">Review before sign</legend>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300"
                checked={policy.enableInReview}
                onChange={(e) => setLocal((p) => ({ ...p, enableInReview: e.target.checked }))}
              />
              <span>
                <span className="font-medium text-gray-900">Require “submit for review” before surgeon sign</span>
                <span className="mt-1 block text-xs text-gray-600">
                  Draft moves to <code className="rounded bg-gray-100 px-1">in_review</code> until a surgeon
                  attests. When off, surgeons may sign directly from draft (previous behavior).
                </span>
              </span>
            </label>
          </fieldset>

          <fieldset className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <legend className="px-1 text-sm font-medium text-gray-900">Nursing section sign-offs</legend>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              When review workflow is on, selected modules must have a nursing sign-off on the chart before
              the surgeon can sign the encounter.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {MODULE_OPTIONS.map((m) => (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-100 px-2 py-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={policy.nursingSignOffSectionKeys.includes(m.id)}
                      onChange={() => toggleSection(m.id)}
                    />
                    <span className="text-sm text-gray-800">{m.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save workflow settings'}
          </button>
        </form>
      )}
    </div>
  );
}
