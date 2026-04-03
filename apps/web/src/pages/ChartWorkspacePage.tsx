import { usePatientStore } from '../store/patientStore';
import { Navigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import TabNavigation from '../components/layout/TabNavigation';
import LazyModuleLoader from '../components/shared/LazyModuleLoader';

function ModuleTransitionFallback() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayekta-orange" />
        </div>
        <p className="text-center text-ayekta-muted mt-4">Loading module…</p>
      </div>
    </div>
  );
}

export default function ChartWorkspacePage() {
  const ishiId = usePatientStore((s) => s.ishiId);
  const currentTab = usePatientStore((s) => s.currentTab);

  if (!ishiId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app min-h-screen bg-gray-50 flex-1">
      <Header />
      <TabNavigation />
      <main className="pt-2">
        <LazyModuleLoader moduleId={currentTab} fallback={<ModuleTransitionFallback />} />
      </main>
    </div>
  );
}
