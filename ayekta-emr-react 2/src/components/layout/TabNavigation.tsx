import { usePatientStore } from '../../store/patientStore';
import type { TabName } from '../../types/patient.types';

interface Tab {
  id: TabName;
  label: string;
}

const tabs: Tab[] = [
  { id: 'demographics', label: 'Demographics' },
  { id: 'triage', label: 'Triage' },
  { id: 'surgical-needs', label: 'Surgical Needs' },
  { id: 'consent', label: 'Consent' },
  { id: 'medications', label: 'Medications' },
  { id: 'labs', label: 'Labs' },
  { id: 'imaging', label: 'Imaging' },
  { id: 'operative-note', label: 'Operative Note' },
  { id: 'discharge', label: 'Discharge' },
];

export default function TabNavigation() {
  const currentTab = usePatientStore((state) => state.currentTab);
  const setCurrentTab = usePatientStore((state) => state.setCurrentTab);

  return (
    <div className="border-b border-ayekta-border bg-white sticky top-[60px] z-[999]">
      <div className="max-w-7xl mx-auto">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                px-6 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${
                  currentTab === tab.id
                    ? 'border-ayekta-orange text-ayekta-orange'
                    : 'border-transparent text-ayekta-muted hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
