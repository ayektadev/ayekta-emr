import { useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePatientStore } from '../store/patientStore';
import { parseLegacyPatientJson } from '../migration/legacyJson';
import {
  extractPatientStubFromBundle,
  isFhirBundleJson,
  mergeClinicalResourcesFromFhirBundle,
  patientDataFromEmptyAppStateWithFhirStub,
} from '../services/fhir/fhirImport';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const startNew = usePatientStore((s) => s.startNewPatientSession);
  const loadPatient = usePatientStore((s) => s.loadPatient);
  const ishiId = usePatientStore((s) => s.ishiId);
  const fileRef = useRef<HTMLInputElement>(null);

  const onNewPatient = () => {
    if (!user) return;
    startNew(user.displayName);
    const id = usePatientStore.getState().ishiId;
    if (id) navigate(`/patients/${id}`);
  };

  const onContinue = () => {
    if (!ishiId) return;
    navigate(`/patients/${ishiId}`);
  };

  const onPickFile = () => fileRef.current?.click();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const raw: unknown = JSON.parse(text);

      if (isFhirBundleJson(raw)) {
        const stub = extractPatientStubFromBundle(raw);
        if (!stub) {
          alert('This FHIR bundle has no Patient entry we can import.');
          e.target.value = '';
          return;
        }
        usePatientStore.getState().reset();
        const base = patientDataFromEmptyAppStateWithFhirStub(usePatientStore.getState(), stub);
        loadPatient(mergeClinicalResourcesFromFhirBundle(raw, base));
      } else {
        const result = parseLegacyPatientJson(raw);
        if (!result.ok) {
          alert(result.error || 'Invalid patient file.');
          e.target.value = '';
          return;
        }
        loadPatient(result.data);
      }

      const id = usePatientStore.getState().ishiId;
      if (id) navigate(`/patients/${id}`);
    } catch {
      alert('Invalid file. Use an Ayekta chart JSON export or a FHIR R4 Bundle with a Patient entry.');
    }
    e.target.value = '';
  };

  return (
    <div className="p-8 max-w-2xl font-clinical">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Signed in as <strong>{user?.displayName}</strong>. Charts save on this device as you work—you can
        document care without an internet connection. Use <strong>Save w/ PDF</strong> on the chart for a PDF
        download and sync queue update.
      </p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onNewPatient}
          className="py-3 px-4 rounded-md bg-ayekta-orange text-white font-semibold border-2 border-black hover:opacity-90 text-left"
        >
          New patient chart
        </button>
        <button
          type="button"
          onClick={onPickFile}
          className="py-3 px-4 rounded-md border-2 border-gray-400 font-medium hover:bg-gray-100 text-left"
        >
          Import chart JSON or FHIR bundle…
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
        <button
          type="button"
          disabled={!ishiId}
          onClick={onContinue}
          className="py-3 px-4 rounded-md border-2 border-gray-400 font-medium hover:bg-gray-100 text-left disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue charting{ishiId ? ` (${ishiId})` : ''}
        </button>
      </div>
    </div>
  );
}
