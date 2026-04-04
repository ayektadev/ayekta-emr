import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEncounterById } from '../db/repositories/encounterRepository';
import type { LocalEncounterRow } from '../db/dexie/schemaTypes';

export default function EncounterDetailPage() {
  const { id: encounterId = '' } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(!!encounterId);
  const [row, setRow] = useState<LocalEncounterRow | undefined>();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!encounterId) {
        setLoading(false);
        setRow(undefined);
        return;
      }
      setLoading(true);
      const e = await getEncounterById(encounterId);
      if (!cancelled) {
        setRow(e);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [encounterId]);

  if (!encounterId) {
    return (
      <div className="p-8 font-clinical text-sm text-ayekta-muted">Missing encounter id.</div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 font-clinical text-sm text-ayekta-muted">Loading encounter…</div>
    );
  }

  if (!row) {
    return (
      <div className="p-8 max-w-lg font-clinical">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Encounter not found</h1>
        <p className="text-sm text-ayekta-muted mb-4">
          That visit could not be found on this device. It may belong to another workstation or an older
          export.
        </p>
        <Link to="/patients" className="text-sm text-ayekta-orange font-medium hover:underline">
          Back to patients
        </Link>
      </div>
    );
  }

  const patientId = row.patientId;

  return (
    <div className="max-w-2xl mx-auto p-6 font-clinical">
      <div className="text-xs text-gray-500 mb-4">
        <Link to="/patients" className="hover:text-gray-800">
          Patients
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <Link to={`/patients/${patientId}`} className="hover:text-gray-800 font-mono">
          {patientId}
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="font-mono text-gray-700">Encounter</span>
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">Visit summary</h1>
      <p className="text-sm text-ayekta-muted mb-6">
        Identifiers and status for this visit. To edit clinical documentation, open the patient chart from
        the link below.
      </p>

      <dl className="border border-ayekta-border rounded-md bg-white divide-y divide-gray-100 text-sm">
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Visit ID</dt>
          <dd className="col-span-2 font-mono text-xs break-all">{row.id}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Patient</dt>
          <dd className="col-span-2">
            <Link
              to={`/patients/${patientId}`}
              className="font-mono text-xs text-ayekta-orange hover:underline"
            >
              {patientId}
            </Link>
          </dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Visit type</dt>
          <dd className="col-span-2 capitalize">
            {row.encounterType.replace(/_/g, ' ')}
          </dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Status</dt>
          <dd className="col-span-2 capitalize">{row.status}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Chart save reference</dt>
          <dd className="col-span-2 font-mono text-xs break-all">{row.currentVersionId}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Last updated</dt>
          <dd className="col-span-2 font-mono text-xs">
            {new Date(row.updatedAt).toLocaleString()}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <Link
          to={`/patients/${patientId}`}
          className="inline-flex text-sm font-medium text-ayekta-orange hover:underline"
        >
          Open patient chart
        </Link>
      </div>
    </div>
  );
}
