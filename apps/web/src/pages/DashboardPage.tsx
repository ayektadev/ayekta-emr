import { useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePatientStore } from '../store/patientStore';
import { importPatientFromJSON } from '../utils/storage';

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
    navigate('/chart');
  };

  const onContinue = () => {
    if (!ishiId) return;
    navigate('/chart');
  };

  const onPickFile = () => fileRef.current?.click();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importPatientFromJSON(file);
      loadPatient(data);
      navigate('/chart');
    } catch {
      alert('Invalid patient file. Please upload a valid Ayekta JSON export.');
    }
    e.target.value = '';
  };

  return (
    <div className="p-8 max-w-2xl font-clinical">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Signed in as <strong>{user?.displayName}</strong>. Chart data is stored locally in IndexedDB
        (Dexie); cloud sync is not enabled in this build.
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
          Import JSON…
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
