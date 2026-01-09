import { useState } from 'react';
import { usePatientStore } from '../../store/patientStore';
import { generateFullChartPDF } from '../../utils/fullChartPDF';
import { uploadPatientDataToDrive, isUserSignedIn } from '../../services/googleDrive';

function Header() {
  const demographics = usePatientStore((state) => state.demographics);
  const currentProvider = usePatientStore((state) => state.currentProvider);
  const ishiId = usePatientStore((state) => state.ishiId);
  const savePatient = usePatientStore((state) => state.savePatient);
  const logout = usePatientStore((state) => state.logout);

  const [isUploading, setIsUploading] = useState(false);

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
    followUpNotes: state.followUpNotes,
    discharge: state.discharge,
    ishiId: state.ishiId,
    currentProvider: state.currentProvider,
    currentTab: state.currentTab,
    isLoggedIn: state.isLoggedIn,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    firstSavedAt: state.firstSavedAt,
  }));

  const patientName = demographics.firstName || demographics.lastName
    ? `${demographics.firstName} ${demographics.lastName}`.trim()
    : 'New Patient';

  const handleLogoClick = () => {
    if (confirm('Logout and return to login screen? Unsaved changes will be lost.')) {
      logout();
    }
  };

  // Helper function to trigger PDF download locally (Safari compatible)
  const downloadPDFLocally = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);

    setTimeout(() => {
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }, 0);
  };

  const handleSave = async () => {
    setIsUploading(true);

    try {
      // Save JSON and get result
      const { jsonSuccess } = savePatient();

      // Generate comprehensive PDF
      let pdfBlob: Blob | null = null;
      let pdfSuccess = false;
      try {
        pdfBlob = generateFullChartPDF(patientData);
        pdfSuccess = true;

        // Trigger local PDF download immediately (independent of Google Drive)
        downloadPDFLocally(pdfBlob, `GH26${patientData.ishiId}_Chart.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }

      // Upload to Google Drive if signed in (parallel to local download)
      let driveUploadSuccess = false;
      if (isUserSignedIn() && jsonSuccess && pdfSuccess && pdfBlob) {
        try {
          const jsonContent = JSON.stringify(patientData, null, 2);
          // Pass timestamps for Google Drive file metadata
          await uploadPatientDataToDrive(
            patientData.ishiId,
            jsonContent,
            pdfBlob,
            patientData.firstSavedAt,
            patientData.updatedAt
          );
          driveUploadSuccess = true;
          console.log('Files uploaded to Google Drive successfully');
        } catch (error) {
          console.error('Failed to upload to Google Drive:', error);
        }
      }

      // Show appropriate message based on results
      let message = '';
      if (jsonSuccess && pdfSuccess) {
        message = '✅ Patient data saved successfully!\n\nFiles downloaded:\n• GH26' + patientData.ishiId + '.json\n• GH26' + patientData.ishiId + '_Chart.pdf';
        if (driveUploadSuccess) {
          message += '\n\n☁️ Files uploaded to Google Drive';
        } else if (isUserSignedIn()) {
          message += '\n\n⚠️ Google Drive upload failed (files saved locally)';
        } else {
          message += '\n\nℹ️ Sign in to Google Drive to enable cloud backup';
        }
      } else if (jsonSuccess && !pdfSuccess) {
        message = '⚠️ JSON file downloaded successfully, but PDF generation failed.\n\nCheck the console for error details.';
      } else if (!jsonSuccess && pdfSuccess) {
        message = '⚠️ PDF file downloaded successfully, but JSON export failed.\n\nCheck the console for error details.';
      } else {
        message = '❌ Failed to save patient data.\n\nBoth JSON and PDF exports failed. Check the console for error details.';
      }

      alert(message);
    } finally {
      setIsUploading(false);
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
            disabled={isUploading}
            className="py-2 px-6 bg-ayekta-orange text-white font-bold border-2 border-black rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Saving...' : 'Save Patient'}
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
