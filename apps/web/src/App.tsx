import { useEffect } from 'react';
import { useChartDensityStore } from './store/chartDensityStore';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useRestorePatient } from './hooks/useRestorePatient';
import { useModuleInitialization } from './hooks/useModules';
import { RequireAuth } from './app/RequireAuth';
import { RequireRoles } from './app/RequireRoles';
import { AppShell } from './app/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChartRedirectPage from './pages/ChartRedirectPage';
import PatientsListPage from './pages/PatientsListPage';
import PatientWorkspacePage from './pages/PatientWorkspacePage';
import EncounterDetailPage from './pages/EncounterDetailPage';
import MissionAnalyticsPage from './pages/MissionAnalyticsPage';
import IntakeQueuePage from './pages/IntakeQueuePage';
import DocumentsHubPage from './pages/DocumentsHubPage';
import AdminHomePage from './pages/AdminHomePage';
import AdminSectionPlaceholder from './pages/admin/AdminSectionPlaceholder';
import WorkflowConfigPage from './pages/admin/WorkflowConfigPage';
import Settings from './components/settings/Settings';

function BootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <img src={`${import.meta.env.BASE_URL}logo-192.png`} alt="Loading" className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 text-sm font-sans">Loading…</p>
      </div>
    </div>
  );
}

function App() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    try {
      document.documentElement.dataset.chartDensity = useChartDensityStore.getState().density;
    } catch {
      /* ignore */
    }
    const unsub = useChartDensityStore.subscribe((s) => {
      try {
        document.documentElement.dataset.chartDensity = s.density;
      } catch {
        /* ignore */
      }
    });
    return unsub;
  }, []);

  useAutoSave();

  const isRestoring = useRestorePatient();
  const { isInitializing: modulesInitializing } = useModuleInitialization();

  const bootBusy = !hydrated || (!!user && (isRestoring || modulesInitializing));

  if (bootBusy) {
    return <BootLoading />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/:id" element={<PatientWorkspacePage />} />
          <Route path="/encounters/:id" element={<EncounterDetailPage />} />
          <Route path="/chart" element={<ChartRedirectPage />} />
          <Route path="/analytics" element={<MissionAnalyticsPage />} />
          <Route element={<RequireRoles allow={['nurse', 'admin']} />}>
            <Route path="intake" element={<IntakeQueuePage />} />
            <Route path="documents" element={<DocumentsHubPage />} />
          </Route>
          <Route path="/admin" element={<AdminHomePage />} />
          <Route element={<RequireRoles allow={['admin']} />}>
            <Route
              path="admin/users"
              element={
                <AdminSectionPlaceholder
                  title="Users"
                  body="Tenant user accounts and roles will be managed here against the API (create/deactivate, password reset). Today, seed users live in Postgres migration 004."
                />
              }
            />
            <Route
              path="admin/facilities"
              element={
                <AdminSectionPlaceholder
                  title="Facilities"
                  body="Sites under your tenant: names, identifiers, and active status. Aligns with blueprint facilities table and JWT facility claims."
                />
              }
            />
            <Route
              path="admin/audit"
              element={
                <AdminSectionPlaceholder
                  title="Audit"
                  body="Cross-patient audit views (server sync_events, local auditEventsLocal export) will surface here for compliance review."
                />
              }
            />
            <Route path="admin/config" element={<WorkflowConfigPage />} />
          </Route>
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
