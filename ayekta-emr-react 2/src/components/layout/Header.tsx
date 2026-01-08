import { usePatientStore } from '../../store/patientStore';

function Header() {
  const demographics = usePatientStore((state) => state.demographics);
  const currentProvider = usePatientStore((state) => state.currentProvider);
  const ishiId = usePatientStore((state) => state.ishiId);
  const savePatient = usePatientStore((state) => state.savePatient);
  const logout = usePatientStore((state) => state.logout);

  const patientName = demographics.firstName || demographics.lastName
    ? `${demographics.firstName} ${demographics.lastName}`.trim()
    : 'New Patient';

  const handleLogoClick = () => {
    if (confirm('Logout and return to login screen? Unsaved changes will be lost.')) {
      logout();
    }
  };

  const handleSave = () => {
    savePatient();
    alert('Patient data saved and downloaded!');
  };

  const handleClearData = () => {
    if (confirm('Clear all patient data and return to login? This will permanently remove the current record.')) {
      // reuse logout to clear storage and reset state
      logout();
    }
  };

  return (
    <div id="header-block" className="sticky top-0 z-[1000] bg-white shadow-md">
      <div className="flex items-center justify-between p-3 border-b border-ayekta-border">
        {/* Logo - clickable to logout */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleLogoClick}>
          <img
            src="/logo-192.png"
            alt="Ayekta Logo"
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-lg font-bold">Ayekta EMR</h1>
            <p className="text-xs text-ayekta-muted">Provider: {currentProvider}</p>
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
