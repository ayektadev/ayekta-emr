import { Link } from 'react-router-dom';
import { ROUTES } from '@ayekta/shared-types';

/**
 * Nurse “Documents” top-level route (Blueprint §5): chart attachments live per patient.
 */
export default function DocumentsHubPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 font-clinical space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
      <p className="text-sm text-gray-600 leading-relaxed">
        File attachments and FHIR exports are managed <strong>inside each patient chart</strong> under the{' '}
        <strong>Documents</strong> section. Queue a file there; it stays on this device until sync uploads it to
        the API (when <code className="text-xs bg-gray-100 px-1">VITE_SYNC_API_BASE</code> is set and you run
        sync).
      </p>
      <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
        <li>
          <Link to={ROUTES.patients} className="text-ayekta-orange font-medium hover:underline">
            Patients
          </Link>
          — open a chart and choose <strong>Documents</strong>, or append{' '}
          <code className="text-xs bg-gray-100 px-1">?s=documents</code> to a patient URL.
        </li>
        <li>
          Use <strong>Choose file</strong> to store the binary locally; completed server files appear in the same
          panel when online.
        </li>
      </ul>
    </div>
  );
}
