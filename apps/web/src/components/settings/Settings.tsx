import { useEffect, useState } from 'react';
import { useAuthStore, type AuthUser } from '../../store/authStore';
import { getAyektaDB } from '../../db/dexie/database';
import { countOutboxByStatus, listPendingOutbox } from '../../db/repositories/syncOutboxRepository';
import { useSyncStatusStore } from '../../store/syncStatusStore';
import { useChartDensityStore, type ChartDensity } from '../../store/chartDensityStore';
import { processSyncQueue } from '../../services/syncQueue';
import { clearMockSyncTransportState } from '../../services/syncTransport';
import ModuleConfiguration from './ModuleConfiguration';
import { useUserRole, useMissions } from '../../hooks/useModules';
import type { UserRole } from '../../types/module.types';

type SettingsNav = 'session' | 'modules' | 'role' | 'mission' | 'local' | 'sync';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const [nav, setNav] = useState<SettingsNav>('session');
  const [stats, setStats] = useState<{
    patients: number;
    encounters: number;
    versions: number;
    outboxPending: number;
    outboxError: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const db = getAyektaDB();
        const [patients, encounters, versions, pending, outboxError] = await Promise.all([
          db.patients.count(),
          db.encounters.count(),
          db.encounterVersions.count(),
          listPendingOutbox(),
          countOutboxByStatus('error'),
        ]);
        if (!cancelled) {
          setStats({
            patients,
            encounters,
            versions,
            outboxPending: pending.length,
            outboxError,
          });
        }
      } catch {
        if (!cancelled) setStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const navItems: { id: SettingsNav; label: string; hint: string }[] = [
    { id: 'session', label: 'Session', hint: 'Who is signed in and where' },
    { id: 'modules', label: 'Chart sections', hint: 'Enabled documentation modules' },
    { id: 'role', label: 'Workspace role', hint: 'Nurse vs surgeon navigation' },
    { id: 'mission', label: 'Deployment', hint: 'Mission / camp context' },
    { id: 'local', label: 'This device', hint: 'Storage summary' },
    { id: 'sync', label: 'Sync & display', hint: 'Queue, conflicts demo, chart density' },
  ];

  return (
    <div className="min-h-full bg-[var(--ayekta-surface)] font-clinical">
      <div className="border-b border-ayekta-border bg-[var(--ayekta-surface-elevated)]">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Workspace configuration</h1>
          <p className="text-sm text-ayekta-muted mt-1 max-w-2xl">
            Change which chart sections appear, set your role and mission labels, and see how much data is
            stored on this computer. Open Settings whenever the workflow or device setup changes.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
        <nav
          className="lg:w-52 shrink-0 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0"
          aria-label="Settings sections"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setNav(item.id)}
              aria-current={nav === item.id ? 'page' : undefined}
              className={`text-left px-3 py-2 rounded-md text-sm border transition-colors whitespace-nowrap lg:whitespace-normal ${
                nav === item.id
                  ? 'border-ayekta-orange bg-orange-50/40 text-gray-900'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="font-medium block">{item.label}</span>
              <span className="text-xs text-ayekta-muted hidden lg:block">{item.hint}</span>
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {nav === 'session' && <SessionPanel user={user} />}
          {nav === 'modules' && <ModuleConfiguration />}
          {nav === 'role' && <RolePanel />}
          {nav === 'mission' && <MissionPanel />}
          {nav === 'local' && <LocalDataPanel stats={stats} />}
          {nav === 'sync' && <SyncAndDisplayPanel stats={stats} />}
        </div>
      </div>
    </div>
  );
}

function SessionPanel({ user }: { user: AuthUser | null }) {
  if (!user) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Session</h2>
      <dl className="border border-ayekta-border rounded-md bg-white divide-y divide-gray-100 text-sm max-w-xl">
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Display name</dt>
          <dd className="col-span-2 text-gray-900">{user.displayName}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Username</dt>
          <dd className="col-span-2 font-mono text-xs">{user.username}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Clinical role</dt>
          <dd className="col-span-2 capitalize">{user.role}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Organization ID</dt>
          <dd className="col-span-2 font-mono text-xs break-all">{user.tenantId}</dd>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          <dt className="text-gray-500">Site ID</dt>
          <dd className="col-span-2 font-mono text-xs break-all">{user.facilityId}</dd>
        </div>
      </dl>
      <p className="text-xs text-ayekta-muted max-w-xl">
        Training sign-in: your username chooses the demo profile. Organization and site IDs group patients on
        shared devices; change them only when your deployment instructions say to.
      </p>
    </section>
  );
}

function RolePanel() {
  const { currentRole, setRole, roleName, roleDescription } = useUserRole();

  const roles: { id: UserRole; name: string; description: string }[] = [
    {
      id: 'surgeon',
      name: 'Surgeon',
      description: 'Operative documentation, consent, OR and post-op modules.',
    },
    {
      id: 'nurse',
      name: 'Nurse',
      description: 'Intake, vitals, floor care, and nursing orders.',
    },
    {
      id: 'anesthesiologist',
      name: 'Anesthesiologist',
      description: 'Pre-anesthesia and anesthesia record workflows.',
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full module access including configuration.',
    },
  ];

  return (
    <section className="space-y-4 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Workspace role</h2>
      <p className="text-sm text-ayekta-muted">
        Picks which chart sections are offered first for your login on this device. It does not replace
        hospital credentialing—only the layout you see here.
      </p>
      <div className="space-y-2">
        {roles.map((role) => (
          <label
            key={role.id}
            className={`flex gap-3 p-3 rounded-md border cursor-pointer text-sm ${
              currentRole === role.id
                ? 'border-ayekta-orange bg-orange-50/30'
                : 'border-ayekta-border bg-white hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="clinical-role"
              checked={currentRole === role.id}
              onChange={() => setRole(role.id)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-gray-900">{role.name}</span>
              <span className="block text-ayekta-muted text-xs mt-0.5">{role.description}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="text-xs text-gray-600 border border-ayekta-border rounded-md px-3 py-2 bg-gray-50">
        Active preset: <strong className="text-gray-900">{roleName}</strong>. {roleDescription}
      </div>
    </section>
  );
}

function MissionPanel() {
  const { missions, activeMission, createMission, deleteMission, setActiveMission } = useMissions();

  const [isCreating, setIsCreating] = useState(false);
  const [newMission, setNewMission] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    teamLead: '',
    localPartners: '',
  });

  const handleCreate = () => {
    if (!newMission.name || !newMission.location) return;

    createMission({
      name: newMission.name,
      location: newMission.location,
      startDate: newMission.startDate,
      endDate: newMission.endDate,
      teamLead: newMission.teamLead,
      localPartners: newMission.localPartners.split(',').map((s) => s.trim()),
    });

    setNewMission({
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      teamLead: '',
      localPartners: '',
    });
    setIsCreating(false);
  };

  return (
    <section className="space-y-4 max-w-2xl">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Deployment context</h2>
      <p className="text-sm text-ayekta-muted">
        Optional labels for a camp or trip (name, dates, location). Set the active one so reports and lists
        stay grouped the way your team expects.
      </p>

      {activeMission && (
        <div className="border border-ayekta-border rounded-md px-4 py-3 bg-white text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active deployment</p>
              <p className="font-medium text-gray-900">{activeMission.name}</p>
              <p className="text-ayekta-muted text-xs mt-1">
                {activeMission.location}
                {activeMission.startDate || activeMission.endDate
                  ? ` · ${activeMission.startDate} – ${activeMission.endDate}`
                  : ''}
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded border border-ayekta-border text-gray-700">
              Active
            </span>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="border border-ayekta-border rounded-md p-4 bg-white text-sm space-y-3">
          <p className="font-medium text-gray-900">New deployment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Name"
              required
              value={newMission.name}
              onChange={(v) => setNewMission({ ...newMission, name: v })}
              placeholder="e.g. Northern Region Q1"
            />
            <Field
              label="Location"
              required
              value={newMission.location}
              onChange={(v) => setNewMission({ ...newMission, location: v })}
            />
            <Field
              label="Start"
              value={newMission.startDate}
              onChange={(v) => setNewMission({ ...newMission, startDate: v })}
              type="date"
            />
            <Field
              label="End"
              value={newMission.endDate}
              onChange={(v) => setNewMission({ ...newMission, endDate: v })}
              type="date"
            />
            <Field
              label="Clinical lead"
              value={newMission.teamLead}
              onChange={(v) => setNewMission({ ...newMission, teamLead: v })}
            />
            <Field
              label="Partners (comma-separated)"
              value={newMission.localPartners}
              onChange={(v) => setNewMission({ ...newMission, localPartners: v })}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleCreate}
              className="px-3 py-1.5 text-sm bg-ayekta-orange text-white rounded-md hover:opacity-90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-sm border border-ayekta-border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900">All deployments</h3>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="text-sm px-3 py-1.5 border border-ayekta-border rounded-md hover:bg-gray-50"
        >
          Add
        </button>
      </div>

      {missions.length === 0 ? (
        <p className="text-sm text-ayekta-muted">None defined.</p>
      ) : (
        <ul className="space-y-2">
          {missions.map((mission) => (
            <li
              key={mission.id}
              className={`border rounded-md px-3 py-2 text-sm flex flex-wrap items-center justify-between gap-2 ${
                mission.isActive ? 'border-ayekta-orange/50 bg-orange-50/20' : 'border-ayekta-border bg-white'
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{mission.name}</p>
                <p className="text-xs text-ayekta-muted">
                  {mission.location}
                  {mission.startDate || mission.endDate
                    ? ` · ${mission.startDate} – ${mission.endDate}`
                    : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {!mission.isActive && (
                  <button
                    type="button"
                    onClick={() => setActiveMission(mission.id)}
                    className="text-xs px-2 py-1 border border-ayekta-border rounded hover:bg-gray-50"
                  >
                    Set active
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteMission(mission.id)}
                  className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-ayekta-border rounded-md focus:outline-none focus:ring-2 focus:ring-ayekta-orange/30"
      />
    </div>
  );
}

function SyncAndDisplayPanel({
  stats,
}: {
  stats: {
    patients: number;
    encounters: number;
    versions: number;
    outboxPending: number;
    outboxError: number;
  } | null;
}) {
  const refreshCounts = useSyncStatusStore((s) => s.refreshCounts);
  const runProcessor = useSyncStatusStore((s) => s.runProcessor);
  const isProcessing = useSyncStatusStore((s) => s.isProcessing);
  const density = useChartDensityStore((s) => s.density);
  const setDensity = useChartDensityStore((s) => s.setDensity);
  const [simConflict, setSimConflict] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('ayekta-sync-simulate-conflict') === '1'
  );
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const onToggleConflict = (on: boolean) => {
    setSimConflict(on);
    try {
      if (on) localStorage.setItem('ayekta-sync-simulate-conflict', '1');
      else {
        localStorage.removeItem('ayekta-sync-simulate-conflict');
        clearMockSyncTransportState();
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="space-y-6 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sync &amp; display</h2>
      <p className="text-sm text-ayekta-muted">
        Phase 7 uses a local outbox plus a mock server (or set{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">VITE_SYNC_API_BASE</code> for HTTP). Save a chart,
        then watch the header badge. Use <strong>Sync now</strong> to flush immediately.
      </p>

      <div className="border border-ayekta-border rounded-md bg-white p-4 space-y-3 text-sm">
        <h3 className="font-medium text-gray-900">Outbox</h3>
        {stats ? (
          <ul className="space-y-1 text-gray-700">
            <li>Pending pushes: {stats.outboxPending}</li>
            <li>Errored rows: {stats.outboxError}</li>
          </ul>
        ) : (
          <p className="text-ayekta-muted">Could not read counts.</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className="px-3 py-1.5 text-sm bg-ayekta-orange text-white rounded-md hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange"
            disabled={isProcessing}
            onClick={() => {
              void (async () => {
                const r = await processSyncQueue();
                await refreshCounts();
                setSyncMsg(`Processed: ${r.succeeded} ok, ${r.failed} failed, ${r.conflicts} conflicts.`);
              })();
            }}
          >
            {isProcessing ? 'Running…' : 'Run sync processor'}
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm border border-ayekta-border rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange"
            onClick={() => void refreshCounts()}
          >
            Refresh counts
          </button>
        </div>
        {syncMsg && (
          <p className="text-xs text-gray-600" role="status">
            {syncMsg}
          </p>
        )}
      </div>

      <fieldset className="border border-ayekta-border rounded-md bg-white p-4 space-y-2 text-sm">
        <legend className="text-sm font-medium text-gray-900 px-1">Demo: conflict</legend>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={simConflict}
            onChange={(e) => onToggleConflict(e.target.checked)}
            className="mt-1"
          />
          <span>
            Simulate server conflict on the next push (mock transport). Turn off after testing, then use{' '}
            <strong>Keep local &amp; retry</strong> in the banner if needed.
          </span>
        </label>
      </fieldset>

      <fieldset className="border border-ayekta-border rounded-md bg-white p-4 space-y-3 text-sm">
        <legend className="text-sm font-medium text-gray-900 px-1">Chart density</legend>
        <p className="text-xs text-ayekta-muted">
          Compact mode tightens type and caps content width for long-form notes (OpenEMR-style preference).
        </p>
        {(['comfortable', 'compact'] as ChartDensity[]).map((d) => (
          <label key={d} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="chart-density"
              checked={density === d}
              onChange={() => setDensity(d)}
            />
            <span className="capitalize">{d}</span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        className="text-sm text-ayekta-orange font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange rounded-sm"
        onClick={() => void runProcessor()}
      >
        Also run global sync (same as header)
      </button>
    </section>
  );
}

function LocalDataPanel({
  stats,
}: {
  stats: {
    patients: number;
    encounters: number;
    versions: number;
    outboxPending: number;
    outboxError: number;
  } | null;
}) {
  return (
    <section className="space-y-4 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Storage on this device</h2>
      <p className="text-sm text-ayekta-muted">
        Rough counts of what is saved in the browser. If a number looks wrong after import, sign out and
        back in, or ask your technical contact—this panel does not upload or clear data by itself.
      </p>
      {stats ? (
        <dl className="border border-ayekta-border rounded-md bg-white divide-y divide-gray-100 text-sm">
          <div className="px-4 py-3 flex justify-between">
            <dt className="text-gray-600">Patients saved</dt>
            <dd className="font-mono">{stats.patients}</dd>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <dt className="text-gray-600">Visits</dt>
            <dd className="font-mono">{stats.encounters}</dd>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <dt className="text-gray-600">Saved chart versions</dt>
            <dd className="font-mono">{stats.versions}</dd>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <dt className="text-gray-600">Queued sync (pending)</dt>
            <dd className="font-mono">{stats.outboxPending}</dd>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <dt className="text-gray-600">Sync errors</dt>
            <dd className="font-mono">{stats.outboxError}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-ayekta-muted">Could not read storage summary.</p>
      )}
    </section>
  );
}
