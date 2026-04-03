import { usePatientStore } from '../../store/patientStore';
import { useModules } from '../../hooks/useModules';
import type { TabName } from '../../types/patient.types';

export default function TabNavigation() {
  const currentTab = usePatientStore((state) => state.currentTab);
  const setCurrentTab = usePatientStore((state) => state.setCurrentTab);
  
  // Get enabled modules from module management system
  const { modules } = useModules();

  // Map module configs to tab labels (using legacy labels for backwards compatibility)
  const tabLabels: Record<string, string> = {
    'demographics': 'Patient Information',
    'triage': 'Triage',
    'surgical-needs': 'Surgical Planning',
    'consent': 'Consent',
    'medications': 'Medications',
    'labs': 'Labs',
    'imaging': 'Imaging',
    'operative-note': 'Operative Note',
    'pre-anesthesia': 'Anesthesia Evaluation',
    'anesthesia-record': 'Anesthesia Record',
    'or-record': 'OR Record',
    'nursing-orders': 'Nursing Orders',
    'pacu': 'PACU',
    'floor-flow': 'Floor Flow',
    'progress-notes': 'Progress Notes',
    'discharge': 'Discharge',
    'follow-up-notes': 'Follow-up Notes',
  };

  // Filter to only show tabs that are both enabled and accessible
  const visibleTabs = modules.filter(
    (module) => module.tabName && tabLabels[module.tabName]
  );

  return (
    <div className="border-b border-ayekta-border sticky top-[73px] z-[999]" style={{ backgroundColor: '#FAF7F0' }}>
      <div className="max-w-7xl mx-auto">
        <nav className="flex overflow-x-auto">
          {visibleTabs.map((module) => {
            const tabId = module.tabName as TabName;
            const tabLabel = tabLabels[tabId];
            
            return (
              <button
                key={tabId}
                onClick={() => setCurrentTab(tabId)}
                className={`
                  px-6 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors
                  ${
                    currentTab === tabId
                      ? 'border-ayekta-orange text-ayekta-orange'
                      : 'border-transparent text-ayekta-muted hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                {tabLabel}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
