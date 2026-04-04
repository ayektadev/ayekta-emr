import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import type { TabName } from '../../types/patient.types';

type Props = {
  moduleId: TabName;
  sectionLabel: string;
};

export default function SectionNursingSignOffBar({ moduleId, sectionLabel }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const entry = usePatientStore((s) => s.clinicalWorkflow?.sectionNursingSignOff?.[moduleId]);
  const signOff = usePatientStore((s) => s.signOffNursingSection);

  const canSign = role === 'nurse' || role === 'admin';

  if (entry?.signedAt) {
    return (
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
        <span className="font-medium">Nursing sign-off</span>
        <span className="text-emerald-800"> — {sectionLabel}</span>
        <p className="mt-1 text-xs text-emerald-900/90">
          Signed by {entry.signedByDisplayName} ({entry.signedByUsername}) ·{' '}
          {new Date(entry.signedAt).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-medium text-gray-900">Nursing sign-off</span>
          <span className="text-gray-600"> — {sectionLabel}</span>
          <p className="mt-0.5 text-xs text-gray-500">
            Required for surgeon attestation when review workflow is enabled in Admin → Workflow.
          </p>
        </div>
        {canSign ? (
          <button
            type="button"
            onClick={() => signOff(moduleId)}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Sign off section
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            Sign in as <strong>nurse</strong> or <strong>admin</strong> to sign off this section.
          </p>
        )}
      </div>
    </div>
  );
}
