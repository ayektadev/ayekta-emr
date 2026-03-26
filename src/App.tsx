import { usePatientStore } from './store/patientStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useRestorePatient } from './hooks/useRestorePatient';
import { useModuleInitialization } from './hooks/useModules';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from './components/layout/LoginScreen';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import GoogleDriveSync from './components/shared/GoogleDriveSync';
import LazyModuleLoader from './components/shared/LazyModuleLoader';
import Settings from './components/settings/Settings';
import PatientList from './components/patients/PatientList';

function App() {
  const isLoggedIn = usePatientStore((state) => state.isLoggedIn);
  const currentTab = usePatientStore((state) => state.currentTab);

  // Auto-save to IndexedDB
  useAutoSave();

  // Restore patient from IndexedDB on app start
  const isRestoring = useRestorePatient();

  // Initialize module system
  const { isInitializing: modulesInitializing } = useModuleInitialization();

  // Show loading while checking for saved patient or initializing modules
  if (isRestoring || modulesInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <img src={`${import.meta.env.BASE_URL}logo-192.png`} alt="Loading" className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-ayekta-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="app min-h-screen bg-gray-50">
      <Routes>
        {/* Patient List / Dashboard Route */}
        <Route path="/patients" element={<PatientList />} />
        
        {/* Settings Route */}
        <Route path="/settings" element={<Settings />} />
        
        {/* Main App Route - Default */}
        <Route
          path="/*"
          element={
            <>
              <Header />
              <TabNavigation />

              {/* Google Drive Sync - Fixed position bottom right, compact */}
              <div className="fixed bottom-4 right-4 z-[1000] w-48">
                <GoogleDriveSync />
              </div>

              {/* Tab content panels - lazy loaded modules based on currentTab */}
              <main className="pt-2">
                <LazyModuleLoader
                  moduleId={currentTab}
                  fallback={<ModuleTransitionFallback />}
                />
              </main>
            </>
          }
        />
      </Routes>
    </div>
  );
}

// ============================================================================
// MODULE TRANSITION FALLBACK
// ============================================================================

function ModuleTransitionFallback() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayekta-orange"></div>
        </div>
        <p className="text-center text-ayekta-muted mt-4">Loading module...</p>
      </div>
    </div>
  );
}

export default App;
