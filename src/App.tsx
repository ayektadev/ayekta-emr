import { usePatientStore } from './store/patientStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useRestorePatient } from './hooks/useRestorePatient';
import LoginScreen from './components/layout/LoginScreen';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';

// Module imports
import Demographics from './components/modules/Demographics';
import Triage from './components/modules/Triage';
import SurgicalNeeds from './components/modules/SurgicalNeeds';
import Consent from './components/modules/Consent';
import Medications from './components/modules/Medications';
import Labs from './components/modules/Labs';
import Imaging from './components/modules/Imaging';
import OperativeNote from './components/modules/OperativeNote';
import Discharge from './components/modules/Discharge';
import PreAnesthesia from './components/modules/PreAnesthesia';
import AnesthesiaRecord from './components/modules/AnesthesiaRecord';
import ORRecord from './components/modules/ORRecord';
import NursingOrders from './components/modules/NursingOrders';
import PACU from './components/modules/PACU';
import FloorFlow from './components/modules/FloorFlow';
import ProgressNotes from './components/modules/ProgressNotes';

function App() {
  const isLoggedIn = usePatientStore((state) => state.isLoggedIn);
  const currentTab = usePatientStore((state) => state.currentTab);
  
  // Auto-save to IndexedDB
  useAutoSave();
  
  // Restore patient from IndexedDB on app start
  const isRestoring = useRestorePatient();

  // Show loading while checking for saved patient
  if (isRestoring) {
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
      <Header />
      <TabNavigation />

      {/* Tab content panels - conditional rendering based on currentTab */}
      <main className="pt-2">
        {currentTab === 'demographics' && <Demographics />}
        {currentTab === 'triage' && <Triage />}
        {currentTab === 'surgical-needs' && <SurgicalNeeds />}
        {currentTab === 'consent' && <Consent />}
        {currentTab === 'medications' && <Medications />}
        {currentTab === 'labs' && <Labs />}
        {currentTab === 'imaging' && <Imaging />}
        {currentTab === 'operative-note' && <OperativeNote />}
        {currentTab === 'discharge' && <Discharge />}
        {currentTab === 'pre-anesthesia' && <PreAnesthesia />}
        {currentTab === 'anesthesia-record' && <AnesthesiaRecord />}
        {currentTab === 'or-record' && <ORRecord />}
        {currentTab === 'nursing-orders' && <NursingOrders />}
        {currentTab === 'pacu' && <PACU />}
        {currentTab === 'floor-flow' && <FloorFlow />}
        {currentTab === 'progress-notes' && <ProgressNotes />}
      </main>
    </div>
  );
}

export default App;
