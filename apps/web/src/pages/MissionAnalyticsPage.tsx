import { metricsToCsvRows } from '../services/missionMetrics';
import { useMissionMetricsQuery } from '../hooks/queries/useMissionMetricsQuery';

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</div>
    </div>
  );
}

export default function MissionAnalyticsPage() {
  const { data: m, isError, error, isPending, isFetching, refetch } = useMissionMetricsQuery();
  const err = isError
    ? error instanceof Error
      ? error.message
      : 'Could not read local metrics.'
    : null;

  const onExport = () => {
    if (!m) return;
    const stamp = m.capturedAtIso.replace(/[:.]/g, '-');
    downloadText(`ayekta-mission-metrics-${stamp}.csv`, metricsToCsvRows(m));
  };

  return (
    <div className="p-8 max-w-4xl font-sans space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Mission analytics</h1>
          <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
            Operational counts from IndexedDB plus <strong>structured clinical rollups</strong> (Chunk G) from the
            latest editable chart (<strong>draft</strong> or <strong>in review</strong>) per local encounter. Metrics load through <strong>TanStack Query</strong>{' '}
            (Chunk I) with refresh and short-lived cache. Export CSV includes both layers.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="text-sm font-medium px-4 py-2 rounded-sm border border-ayekta-border text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange disabled:opacity-50"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            disabled={!m}
            onClick={onExport}
            className="text-sm font-medium px-4 py-2 rounded-sm bg-ayekta-orange text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange"
          >
            Export CSV report
          </button>
        </div>
      </div>

      {err && (
        <p className="text-sm text-red-800 border border-red-200 rounded-md px-3 py-2 bg-red-50" role="alert">
          {err}
        </p>
      )}

      {isPending && !m && (
        <p className="text-sm text-ayekta-muted" role="status">
          Loading metrics…
        </p>
      )}

      {m && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Operational (Dexie)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard label="Patients (local)" value={m.localPatients} />
              <MetricCard label="Encounters (local)" value={m.localEncounters} />
              <MetricCard label="Signed versions" value={m.signedEncounterVersions} />
              <MetricCard label="Draft versions" value={m.draftEncounterVersions} />
              <MetricCard label="In review versions" value={m.inReviewEncounterVersions} />
              <MetricCard label="Superseded versions" value={m.supersededEncounterVersions} />
              <MetricCard label="Pending attachments" value={m.pendingAttachments} />
              <MetricCard label="Registered attachments" value={m.registeredAttachmentsMeta} />
              <MetricCard label="Sync queue (pending)" value={m.syncOutboxPending} />
              <MetricCard label="Sync queue (error)" value={m.syncOutboxError} />
              <MetricCard label="Audit events (local)" value={m.auditEventsTotal} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Structured clinical (draft charts)</h2>
            <p className="text-xs text-ayekta-muted mb-2">
              One snapshot per local encounter (current draft JSON). Charts not yet mirrored to encounters are
              omitted until persistence runs.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard label="Charts in rollup" value={m.clinical.chartsInRollup} />
              <MetricCard label="Pts w/ procedure text" value={m.clinical.patientsWithProcedureDocumented} />
              <MetricCard label="Pts w/ dx text" value={m.clinical.patientsWithDiagnosisDocumented} />
              <MetricCard label="Complication log rows" value={m.clinical.complicationLogEntries} />
              <MetricCard
                label="Op note complication flag"
                value={m.clinical.patientsWithOpNoteComplicationFlag}
              />
              <div className="border border-ayekta-border rounded-md p-4 bg-white col-span-2 sm:col-span-3">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Complication log by severity</div>
                <div className="text-sm text-gray-800 tabular-nums flex flex-wrap gap-x-4 gap-y-1">
                  <span>Minor {m.clinical.complicationBySeverity.minor}</span>
                  <span>Moderate {m.clinical.complicationBySeverity.moderate}</span>
                  <span>Major {m.clinical.complicationBySeverity.major}</span>
                  <span>Critical {m.clinical.complicationBySeverity.critical}</span>
                  <span>Unset {m.clinical.complicationBySeverity.unset}</span>
                </div>
              </div>
              <MetricCard label="Progress notes (all)" value={m.clinical.progressNotesTotal} />
              <MetricCard label="Progress notes w/ wound" value={m.clinical.progressNotesWithWoundStatus} />
              <MetricCard label="Follow-up visits" value={m.clinical.followUpNotesTotal} />
              <MetricCard label="FU w/ next scheduled" value={m.clinical.followUpNotesWithNextScheduled} />
              <MetricCard label="Pts w/ discharge date" value={m.clinical.patientsWithDischargeDate} />
              <MetricCard label="Pts w/ outcome recorded" value={m.clinical.patientsWithOutcomeImmediate} />
              <MetricCard label="30d readmit = yes" value={m.clinical.patientsReadmission30dYes} />
              <MetricCard label="30d re-OR = yes" value={m.clinical.patientsReturnToOR30dYes} />
              <MetricCard label="Mortality flag = yes" value={m.clinical.patientsMortalityRelatedYes} />
              <MetricCard label="Lab result rows" value={m.clinical.labsRowsTotal} />
              <MetricCard label="Imaging studies" value={m.clinical.imagingStudiesTotal} />
              <MetricCard label="Home/PRN/preop med rows" value={m.clinical.homeMedRowsTotal} />
              <MetricCard label="Allergy rows" value={m.clinical.allergyRowsTotal} />
              <MetricCard label="Pts w/ planned procedure" value={m.clinical.patientsWithPlannedProcedure} />
            </div>
            <details className="mt-3 text-xs text-gray-600">
              <summary className="cursor-pointer text-ayekta-orange font-medium">Planned procedure checkboxes (patients)</summary>
              <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1 list-none pl-0">
                <li>Inguinal L: {m.clinical.plannedProcedurePatients.inguinalHerniaL}</li>
                <li>Inguinal R: {m.clinical.plannedProcedurePatients.inguinalHerniaR}</li>
                <li>Inguinal bilateral: {m.clinical.plannedProcedurePatients.inguinalHerniaBilateral}</li>
                <li>Ventral/umbilical: {m.clinical.plannedProcedurePatients.ventralUmbilical}</li>
                <li>Hysterectomy: {m.clinical.plannedProcedurePatients.hysterectomy}</li>
                <li>Prostatectomy: {m.clinical.plannedProcedurePatients.prostatectomy}</li>
                <li>Hydrocele L/R/bi: {m.clinical.plannedProcedurePatients.hydroceleL} /{' '}
                  {m.clinical.plannedProcedurePatients.hydroceleR} / {m.clinical.plannedProcedurePatients.hydroceleBilateral}
                </li>
                <li>Mass excision: {m.clinical.plannedProcedurePatients.massExcision}</li>
              </ul>
            </details>
          </div>

          <p className="text-xs text-ayekta-muted tabular-nums">Captured {m.capturedAtIso}</p>
        </>
      )}
    </div>
  );
}
