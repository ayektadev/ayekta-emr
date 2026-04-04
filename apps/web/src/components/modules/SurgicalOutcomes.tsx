import { usePatientStore } from '../../store/patientStore';
import type { SurgicalOutcomesCapture } from '../../types/patient.types';

function TriState({
  value,
  onChange,
  name,
}: {
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === null} onChange={() => onChange(null)} />
        Unknown
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === true} onChange={() => onChange(true)} />
        Yes
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === false} onChange={() => onChange(false)} />
        No
      </label>
    </div>
  );
}

export default function SurgicalOutcomes() {
  const o = usePatientStore((s) => s.surgicalOutcomes);
  const update = usePatientStore((s) => s.updateSurgicalOutcomes);

  const set = <K extends keyof SurgicalOutcomesCapture>(key: K, value: SurgicalOutcomesCapture[K]) => {
    update({ [key]: value });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-clinical">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Surgical outcomes</h2>
      <p className="text-sm text-ayekta-muted mb-6">
        Record how the case ended, where the patient went next, and—when you know it—any readmission or return
        to the OR within about 30 days. Complement the operative note; do not duplicate every detail.
      </p>

      <div className="bg-white rounded-md border border-ayekta-border p-6 space-y-6 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Immediate procedure result</label>
          <select
            value={o.immediateOutcome}
            onChange={(e) =>
              set('immediateOutcome', e.target.value as SurgicalOutcomesCapture['immediateOutcome'])
            }
            className="w-full max-w-md px-3 py-2 border border-ayekta-border rounded-md"
          >
            <option value="">—</option>
            <option value="successful">Successful</option>
            <option value="successful_with_modifications">Successful with modifications</option>
            <option value="aborted">Aborted</option>
            <option value="converted">Converted / changed plan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Outcome narrative</label>
          <textarea
            value={o.outcomeNarrative}
            onChange={(e) => set('outcomeNarrative', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-ayekta-border rounded-md"
            placeholder="Short summary for handoff or review (e.g., stable to PACU, plan for follow-up)…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Disposition from OR</label>
            <input
              type="text"
              value={o.dispositionFromOR}
              onChange={(e) => set('dispositionFromOR', e.target.value)}
              className="w-full px-3 py-2 border border-ayekta-border rounded-md"
              placeholder="e.g., PACU, ward, extubated in OR"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unexpected findings</label>
            <textarea
              value={o.unexpectedFindings}
              onChange={(e) => set('unexpectedFindings', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-ayekta-border rounded-md"
            />
          </div>
        </div>

        <section className="border-t border-ayekta-border pt-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">30-day course (when known)</h3>
          <div>
            <p className="text-xs text-gray-600 mb-2">Readmission within 30 days</p>
            <TriState
              name="readmit"
              value={o.readmissionWithin30Days}
              onChange={(v) => set('readmissionWithin30Days', v)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Readmission notes</label>
            <textarea
              value={o.readmissionNotes}
              onChange={(e) => set('readmissionNotes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-ayekta-border rounded-md"
            />
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-2">Return to OR within 30 days</p>
            <TriState
              name="rtor"
              value={o.returnToORWithin30Days}
              onChange={(v) => set('returnToORWithin30Days', v)}
            />
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-2">Mortality related to this episode</p>
            <TriState
              name="mort"
              value={o.mortalityRelated}
              onChange={(v) => set('mortalityRelated', v)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
