import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useRestorePatient } from './hooks/useRestorePatient';
import { useModuleInitialization } from './hooks/useModules';
import { RequireAuth } from './app/RequireAuth';
import { AppShell } from './app/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChartWorkspacePage from './pages/ChartWorkspacePage';
import PlaceholderPage from './pages/PlaceholderPage';
import Settings from './components/settings/Settings';

function BootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <img src={`${import.meta.env.BASE_URL}logo-192.png`} alt="Loading" className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-ayekta-muted">Loading…</p>
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
          <Route path="/patients" element={<PlaceholderPage title="Patients" />} />
          <Route path="/patients/:id" element={<PlaceholderPage title="Patient" />} />
          <Route path="/encounters/:id" element={<PlaceholderPage title="Encounter" />} />
          <Route path="/chart" element={<ChartWorkspacePage />} />
          <Route path="/analytics" element={<PlaceholderPage title="Mission analytics" />} />
          <Route path="/admin" element={<PlaceholderPage title="Administration" />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
