import { usePatientStore } from '../../store/patientStore';
import { generateFullChartPDF } from '../../utils/fullChartPDF';

function Header() {
  const demographics = usePatientStore((state) => state.demographics);
  const currentProvider = usePatientStore((state) => state.currentProvider);
  const ishiId = usePatientStore((state) => state.ishiId);
  const savePatient = usePatientStore((state) => state.savePatient);
  const logout = usePatientStore((state) => state.logout);

  // Get full patient data for PDF generation
  const patientData = usePatientStore((state) => ({
    demographics: state.demographics,
    triage: state.triage,
    surgicalNeeds: state.surgicalNeeds,
    consent: state.consent,
    medications: state.medications,
    labs: state.labs,
    imaging: state.imaging,
    operativeNote: state.operativeNote,
    preAnesthesia: state.preAnesthesia,
    anesthesiaRecord: state.anesthesiaRecord,
    orRecord: state.orRecord,
    nursingOrders: state.nursingOrders,
    pacu: state.pacu,
    floorFlow: state.floorFlow,
    progressNotes: state.progressNotes,
    discharge: state.discharge,
    ishiId: state.ishiId,
    currentProvider: state.currentProvider,
    currentTab: state.currentTab,
    isLoggedIn: state.isLoggedIn,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  }));

  const patientName = demographics.firstName || demographics.lastName
    ? `${demographics.firstName} ${demographics.lastName}`.trim()
    : 'New Patient';

  const handleLogoClick = () => {
    if (confirm('Logout and return to login screen? Unsaved changes will be lost.')) {
      logout();
    }
  };

  const handleSave = () => {
    // Save JSON and get result
    const { jsonSuccess } = savePatient();

    // Generate comprehensive PDF
    let pdfSuccess = false;
    try {
      generateFullChartPDF(patientData);
      pdfSuccess = true;
    } catch (error) {
      console.error('Error generating PDF:', error);
    }

    // Show appropriate message based on results
    if (jsonSuccess && pdfSuccess) {
      alert('✅ Patient data saved successfully!\n\nFiles downloaded:\n• GH26' + patientData.ishiId + '.json\n• GH26' + patientData.ishiId + '_Chart.pdf');
    } else if (jsonSuccess && !pdfSuccess) {
      alert('⚠️ JSON file downloaded successfully, but PDF generation failed.\n\nCheck the console for error details.');
    } else if (!jsonSuccess && pdfSuccess) {
      alert('⚠️ PDF file downloaded successfully, but JSON export failed.\n\nCheck the console for error details.');
    } else {
      alert('❌ Failed to save patient data.\n\nBoth JSON and PDF exports failed. Check the console for error details.');
    }
  };

  const handleClearData = () => {
    if (confirm('Clear all patient data and return to login? This will permanently remove the current record.')) {
      // reuse logout to clear storage and reset state
      logout();
    }
  };

  return (
    <div id="header-block" className="sticky top-0 z-[1000] shadow-md" style={{ backgroundColor: '#FAF7F0' }}>
      <div className="flex items-center justify-between py-2 px-3 border-b border-ayekta-border">
        {/* Logo - clickable to logout */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleLogoClick}>
          <img
            src={`${import.meta.env.BASE_URL}logo-192.png`}
            alt="Ayekta Logo"
            className="h-14"
          />
          <div>
            <p className="text-xs text-ayekta-muted">Current Provider:</p>
            <p className="text-sm font-medium">{currentProvider}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex-1 text-center">
          <p id="currentPatient" className="text-base font-semibold">
            Current Patient: {patientName}
          </p>
          {ishiId && (
            <p id="ishi_id_display" className="text-xs text-ayekta-muted">
              ISHI ID: {ishiId}
            </p>
          )}
        </div>

      {/* Save and Clear Buttons */}
        <div className="flex gap-4">
          <button
            id="savePatientBtn"
            onClick={handleSave}
            className="py-2 px-6 bg-ayekta-orange text-white font-bold border-2 border-black rounded-md hover:opacity-90 transition-opacity"
          >
            Save Patient
          </button>
          <button
            id="clearDataBtn"
            onClick={handleClearData}
            className="py-2 px-6 bg-red-600 text-white font-bold border-2 border-black rounded-md hover:opacity-90 transition-opacity"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
