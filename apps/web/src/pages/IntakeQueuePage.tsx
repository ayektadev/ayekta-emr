import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePatientStore } from '../store/patientStore';
import { patientDirectoryLabel, usePatientDirectoryList } from '../hooks/usePatientDirectoryList';

/**
 * Nurse-facing intake queue (Blueprint §5): same local directory as Patients, links open chart at Triage.
 */
export default function IntakeQueuePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const startNew = usePatientStore((s) => s.startNewPatientSession);
  const { query, setQuery, filtered, loading, refresh } = usePatientDirectoryList();

  const onRegister = () => {
    if (!user) return;
    startNew(user.displayName);
    const id = usePatientStore.getState().ishiId;
    if (id) navigate(`/patients/${id}?s=demographics`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-clinical">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Intake queue</h1>
          <p className="text-sm text-ayekta-muted mt-1 max-w-xl">
            Patients on this device—open a chart at <strong>Triage</strong> to continue intake (vitals, H&amp;P,
            chief complaint). List matches the local facility mirror; sync when online updates the server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void refresh()}
            className="py-2.5 px-4 rounded-md border border-ayekta-border text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="py-2.5 px-4 rounded-md bg-ayekta-orange text-white text-sm font-medium border border-black/10 hover:opacity-90"
          >
            New patient
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="intake-search" className="sr-only">
          Search intake list
        </label>
        <input
          id="intake-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID, or date of birth…"
          className="w-full max-w-md px-3 py-2 text-sm border border-ayekta-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ayekta-orange/40"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ayekta-muted">Loading list…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ayekta-muted border border-dashed border-ayekta-border rounded-md p-8">
          No patients match this search. Start a new patient or import a chart from the dashboard.
        </p>
      ) : (
        <div className="border border-ayekta-border rounded-md overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 border-b border-ayekta-border">
              <tr>
                <th className="px-3 py-2 font-medium">Patient</th>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">DOB</th>
                <th className="px-3 py-2 font-medium">Sex</th>
                <th className="px-3 py-2 font-medium">Updated</th>
                <th className="px-3 py-2 font-medium">Intake</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="px-3 py-2">
                    <Link
                      to={`/patients/${p.id}?s=triage`}
                      className="font-medium text-gray-900 hover:text-ayekta-orange"
                    >
                      {patientDirectoryLabel(p)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{p.id}</td>
                  <td className="px-3 py-2 text-gray-700">{p.dob || '—'}</td>
                  <td className="px-3 py-2 text-gray-700">{p.sex || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">
                    {new Date(p.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/patients/${p.id}?s=triage`}
                      className="text-ayekta-orange text-sm font-medium hover:underline"
                    >
                      Open triage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
