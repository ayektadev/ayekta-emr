import { useState, useEffect } from 'react';
import { usePatientStore } from '../../store/patientStore';
import { generateFullChartPDF } from '../../utils/fullChartPDF';
import { getPatientDataSnapshot } from '../../store/patientStore';
import { notifyChartSavedForSync } from '../../services/chartSyncEnqueue';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const demographics = usePatientStore((state) => state.demographics);
  const currentProvider = usePatientStore((state) => state.currentProvider);
  const ishiId = usePatientStore((state) => state.ishiId);
  const savePatient = usePatientStore((state) => state.savePatient);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Track changes to patient data
  const updatedAt = usePatientStore((state) => state.updatedAt);

  useEffect(() => {
    // Mark as having unsaved changes when data updates
    if (saveStatus === 'saved') {
      console.log('Patient data updated, resetting save status to idle');
      setSaveStatus('idle');
    }
  }, [updatedAt]);

  // Listen for successful sync events to update status
  useEffect(() => {
    const handleSyncComplete = () => {
      // When sync queue processes successfully, update status
      console.log('Sync complete event received, current status:', saveStatus);
      if (saveStatus === 'saving') {
        console.log('Updating status from saving to saved');
        setSaveStatus('saved');
      }
    };

    // Listen for custom sync event
    window.addEventListener('ayekta-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('ayekta-sync-complete', handleSyncComplete);
    };
  }, [saveStatus]);

  const patientName = demographics.firstName || demographics.lastName
    ? `${demographics.firstName} ${demographics.lastName}`.trim()
    : 'New Patient';

  const handleLogoClick = () => {
    if (confirm('Return to dashboard? Your chart stays saved locally.')) {
      navigate('/dashboard');
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
    console.log('Save button clicked');
    setIsUploading(true);
    setSaveStatus('saving');

    try {
      // Always save to IndexedDB first (for offline access)
      savePatient();

      // Get fresh patient data from store right before generating PDF
      const freshPatientData = usePatientStore.getState();
      const currentPatientData = {
        ishiId: freshPatientData.ishiId,
        currentProvider: freshPatientData.currentProvider,
        currentTab: freshPatientData.currentTab,
        createdAt: freshPatientData.createdAt,
        updatedAt: freshPatientData.updatedAt,
        firstSavedAt: freshPatientData.firstSavedAt,
        demographics: freshPatientData.demographics,
        triage: freshPatientData.triage,
        surgicalNeeds: freshPatientData.surgicalNeeds,
        consent: freshPatientData.consent,
        medications: freshPatientData.medications,
        labs: freshPatientData.labs,
        imaging: freshPatientData.imaging,
        operativeNote: freshPatientData.operativeNote,
        preAnesthesia: freshPatientData.preAnesthesia,
        anesthesiaRecord: freshPatientData.anesthesiaRecord,
        orRecord: freshPatientData.orRecord,
        nursingOrders: freshPatientData.nursingOrders,
        pacu: freshPatientData.pacu,
        floorFlow: freshPatientData.floorFlow,
        progressNotes: freshPatientData.progressNotes,
        followUpNotes: freshPatientData.followUpNotes,
        discharge: freshPatientData.discharge,
        preOpChecklist: freshPatientData.preOpChecklist,
        complicationLog: freshPatientData.complicationLog,
        surgicalOutcomes: freshPatientData.surgicalOutcomes,
      };

      console.log('Generating PDF with data updatedAt:', currentPatientData.updatedAt);

      // Generate PDF
      let pdfBlob: Blob | null = null;
      try {
        pdfBlob = generateFullChartPDF(currentPatientData);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setSaveStatus('error');
        setIsUploading(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
      }

      const snapshot = getPatientDataSnapshot(usePatientStore.getState());
      if (snapshot) {
        await notifyChartSavedForSync(snapshot, pdfBlob);
        downloadPDFLocally(pdfBlob, `GH26${snapshot.ishiId}_Chart.pdf`);
      }
      setSaveStatus('saved');
      window.dispatchEvent(new CustomEvent('ayekta-sync-complete'));
      setIsUploading(false);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setIsUploading(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
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

      {/* Save w/ PDF: IndexedDB + audit + sync queue (with PDF) + local PDF download */}
        <div className="flex gap-4">
          <Link
            to="/settings"
            className="py-2 px-4 text-sm text-gray-700 font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="Settings"
          >
            Settings
          </Link>

          <button
            id="savePatientBtn"
            type="button"
            onClick={handleSave}
            disabled={isUploading || saveStatus === 'saving'}
            className={`py-2 px-6 text-white font-bold border-2 border-black rounded-md transition-all ${
              saveStatus === 'saving'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-ayekta-orange hover:opacity-90'
            }`}
          >
            {saveStatus === 'saving'
              ? 'Saving…'
              : saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'error'
                  ? 'Error'
                  : 'Save w/ PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
