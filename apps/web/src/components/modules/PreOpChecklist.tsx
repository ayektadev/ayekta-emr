import { usePatientStore } from '../../store/patientStore';
import type { PreOpChecklist as PreOpChecklistModel } from '../../types/patient.types';

const ASA_OPTIONS = ['', 'I', 'II', 'III', 'IV', 'V', 'I-E', 'II-E', 'III-E', 'IV-E', 'V-E'];

export default function PreOpChecklist() {
  const preOpChecklist = usePatientStore((s) => s.preOpChecklist);
  const update = usePatientStore((s) => s.updatePreOpChecklist);

  const set = <K extends keyof PreOpChecklistModel>(key: K, value: PreOpChecklistModel[K]) => {
    update({ [key]: value });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-clinical">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Pre-operative checklist</h2>
      <p className="text-sm text-ayekta-muted mb-6">
        Complete before induction: ASA class, consent, NPO, site marking, and the checks your team uses before
        time-out. Add a short note if anything is deferred or exceptional.
      </p>

      <div className="bg-white rounded-md border border-ayekta-border p-6 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ASA class</label>
            <select
              value={preOpChecklist.asaClass}
              onChange={(e) => set('asaClass', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md focus:outline-none focus:ring-2 focus:ring-ayekta-orange/30"
            >
              {ASA_OPTIONS.map((o) => (
                <option key={o || 'empty'} value={o}>
                  {o || '—'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Consent obtained</label>
            <select
              value={preOpChecklist.consentObtained}
              onChange={(e) =>
                set('consentObtained', e.target.value as PreOpChecklistModel['consentObtained'])
              }
              className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md focus:outline-none focus:ring-2 focus:ring-ayekta-orange/30"
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Verification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {(
              [
                ['allergiesReviewed', 'Allergies reviewed with patient'],
                ['npoConfirmed', 'NPO / fasting appropriate'],
                ['siteMarked', 'Operative site marked when applicable'],
                ['imagingReviewed', 'Key imaging reviewed'],
                ['labsReviewed', 'Relevant labs reviewed'],
                ['medsReconciled', 'Medications reconciled'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preOpChecklist[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="rounded border-ayekta-border"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">DVT prophylaxis plan</label>
            <input
              type="text"
              value={preOpChecklist.dvtProphylaxisPlan}
              onChange={(e) => set('dvtProphylaxisPlan', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              placeholder="e.g., SCDs, pharmacologic, none"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Anticoagulation held (when applicable)</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ac-held"
                  checked={preOpChecklist.anticoagulationHeld === null}
                  onChange={() => set('anticoagulationHeld', null)}
                />
                Not documented
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ac-held"
                  checked={preOpChecklist.anticoagulationHeld === true}
                  onChange={() => set('anticoagulationHeld', true)}
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ac-held"
                  checked={preOpChecklist.anticoagulationHeld === false}
                  onChange={() => set('anticoagulationHeld', false)}
                />
                No / N/A
              </label>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs font-medium text-gray-600">Beta-blocker continuation (when applicable)</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bb"
                  checked={preOpChecklist.betaBlockerContinued === null}
                  onChange={() => set('betaBlockerContinued', null)}
                />
                Not documented
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bb"
                  checked={preOpChecklist.betaBlockerContinued === true}
                  onChange={() => set('betaBlockerContinued', true)}
                />
                Continued
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bb"
                  checked={preOpChecklist.betaBlockerContinued === false}
                  onChange={() => set('betaBlockerContinued', false)}
                />
                Held / N/A
              </label>
            </div>
          </div>
        </section>

        <section>
          <label className="block text-xs font-medium text-gray-600 mb-1">Additional notes</label>
          <textarea
            value={preOpChecklist.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
            placeholder="Timeouts, exceptions, communication to OR…"
          />
        </section>
      </div>
    </div>
  );
}
