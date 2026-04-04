import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getEncountersForPatient } from '../../db/repositories/encounterRepository';
import type { LocalEncounterRow } from '../../db/dexie/schemaTypes';

interface Props {
  patientId: string;
}

export default function PatientEncountersPanel({ patientId }: Props) {
  const [rows, setRows] = useState<LocalEncounterRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await getEncountersForPatient(patientId);
      if (!cancelled) setRows(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return (
    <div className="max-w-5xl mx-auto p-4 font-clinical">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Visits for this patient
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ayekta-muted border border-dashed border-ayekta-border rounded-md p-6">
          No visits listed yet. After you save the chart, a visit entry will show here. You can open it to
          see identifiers and timing.
        </p>
      ) : (
        <div className="border border-ayekta-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">Encounter</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link to={`/encounters/${r.id}`} className="text-ayekta-orange hover:underline">
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{r.encounterType}</td>
                  <td className="px-3 py-2 capitalize">{r.status}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">
                    {new Date(r.updatedAt).toLocaleString()}
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
