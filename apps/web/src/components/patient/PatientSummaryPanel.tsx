import { Link } from 'react-router-dom';
import { usePatientStore } from '../../store/patientStore';
import { encounterIdForPatient } from '../../db/utils/encounterIds';

export default function PatientSummaryPanel() {
  const demographics = usePatientStore((s) => s.demographics);
  const ishiId = usePatientStore((s) => s.ishiId);
  const triage = usePatientStore((s) => s.triage);
  const medications = usePatientStore((s) => s.medications);
  const updatedAt = usePatientStore((s) => s.updatedAt);

  const encId = ishiId ? encounterIdForPatient(ishiId) : '';

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 font-clinical">
      <div className="border border-ayekta-border rounded-md bg-[var(--ayekta-surface-elevated)] p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Demographics
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">
              {[demographics.firstName, demographics.lastName].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">DOB</dt>
            <dd className="font-medium text-gray-900">{demographics.dob || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Sex</dt>
            <dd className="font-medium text-gray-900">{demographics.gender || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Facility MRN / ISHI ID</dt>
            <dd className="font-mono text-xs text-gray-900">{ishiId || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Last chart update</dt>
            <dd className="font-mono text-xs text-gray-800">{updatedAt || '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="border border-ayekta-border rounded-md bg-[var(--ayekta-surface-elevated)] p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Latest vitals (triage)
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">BP</dt>
            <dd>{triage.bp || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">HR</dt>
            <dd>{triage.hr || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">SpO₂</dt>
            <dd>{triage.spo2 || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Temp</dt>
            <dd>{triage.temperature || '—'}</dd>
          </div>
        </dl>
        <p className="text-xs text-ayekta-muted mt-3">
          Edit in the <strong>Vitals & intake</strong> section.
        </p>
      </div>

      <div className="border border-ayekta-border rounded-md bg-[var(--ayekta-surface-elevated)] p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Allergies (summary)
        </h2>
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {demographics.allergies?.trim() ||
            (medications.allergies.length ? `${medications.allergies.length} recorded` : '—')}
        </p>
      </div>

      {encId ? (
        <p className="text-sm text-ayekta-muted">
          Active encounter record:{' '}
          <Link className="text-ayekta-orange underline font-mono text-xs" to={`/encounters/${encId}`}>
            {encId}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
