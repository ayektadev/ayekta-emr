/**
 * Patient List Store
 * 
 * Zustand store for managing multiple patients with IndexedDB persistence.
 * Provides search, filter, sort, and bulk action capabilities.
 */

import { create } from 'zustand';
import localforage from 'localforage';
import type { PatientData } from '../types/patient.types';
import type {
  PatientSummary,
  PatientFilters,
  PatientStats,
  PatientStatus,
  BulkAction,
  PatientListState,
  PatientListActions,
} from '../types/patientList.types';

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

const PATIENT_LIST_DB = localforage.createInstance({
  name: 'ayekta-emr-patients',
  storeName: 'patient-list',
  description: 'Multi-patient list storage',
});

const PATIENTS_KEY = 'patients';
const LAST_SYNC_KEY = 'last-sync';

// ============================================================================
// DEFAULT STATE
// ============================================================================

const defaultFilters: PatientFilters = {
  search: '',
  status: 'all',
  missionId: 'all',
  provider: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

const initialState: PatientListState = {
  patients: [],
  selectedIds: [],
  filters: defaultFilters,
  isLoading: false,
  error: null,
  lastSync: null,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert PatientData to PatientSummary
 */
function toPatientSummary(patient: PatientData): PatientSummary {
  const fullName = `${patient.demographics.firstName} ${patient.demographics.lastName}`.trim();
  
  // Determine status based on available data
  let status: PatientStatus = 'pre-op';
  if (patient.discharge.dischargeDate) {
    status = 'discharged';
  } else if (patient.floorFlow.arrivalTime) {
    status = 'floor';
  } else if (patient.pacu.arrivalTime) {
    status = 'pacu';
  } else if (patient.orRecord.procedureStartTime) {
    status = 'in-or';
  } else if (patient.preAnesthesia.procedure || patient.surgicalNeeds.procedure) {
    status = 'pre-op';
  }
  
  // Get procedure from surgical needs or operative note
  const procedure = 
    patient.operativeNote.procedurePerformed ||
    patient.surgicalNeeds.procedure ||
    patient.preAnesthesia.procedure ||
    'Not specified';

  return {
    ishiId: patient.ishiId,
    fullName,
    age: patient.demographics.age,
    gender: patient.demographics.gender,
    status,
    procedure,
    missionId: undefined, // TODO: Add mission tracking to PatientData
    provider: patient.currentProvider,
    updatedAt: patient.updatedAt,
    createdAt: patient.createdAt,
    firstSavedAt: patient.firstSavedAt,
  };
}

/**
 * Calculate patient statistics
 */
function calculateStats(patients: PatientSummary[]): PatientStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: patients.length,
    preOp: patients.filter((p) => p.status === 'pre-op').length,
    inOr: patients.filter((p) => p.status === 'in-or').length,
    pacu: patients.filter((p) => p.status === 'pacu').length,
    floor: patients.filter((p) => p.status === 'floor').length,
    discharged: patients.filter((p) => p.status === 'discharged').length,
    followUp: patients.filter((p) => p.status === 'follow-up').length,
    todayCount: patients.filter(
      (p) => new Date(p.createdAt) >= today
    ).length,
    weekCount: patients.filter(
      (p) => new Date(p.createdAt) >= weekAgo
    ).length,
  };
}

/**
 * Sort patients
 */
function sortPatients(
  patients: PatientSummary[],
  sortBy: PatientFilters['sortBy'],
  sortOrder: PatientFilters['sortOrder']
): PatientSummary[] {
  return [...patients].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case 'age':
        comparison = a.age - b.age;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
      default:
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter patients
 */
function filterPatients(
  patients: PatientSummary[],
  filters: PatientFilters
): PatientSummary[] {
  return patients.filter((patient) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        patient.fullName.toLowerCase().includes(searchLower) ||
        patient.ishiId.includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all' && patient.status !== filters.status) {
      return false;
    }

    // Mission filter
    if (filters.missionId !== 'all' && patient.missionId !== filters.missionId) {
      return false;
    }

    // Provider filter
    if (filters.provider !== 'all' && patient.provider !== filters.provider) {
      return false;
    }

    return true;
  });
}

// ============================================================================
// STORE TYPE
// ============================================================================

type PatientListStore = PatientListState & PatientListActions;

// ============================================================================
// STORE CREATION
// ============================================================================

export const usePatientListStore = create<PatientListStore>((set, get) => ({
  ...initialState,

  // ============================================================================
  // LOAD/REFRESH
  // ============================================================================

  loadPatients: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load patients from IndexedDB
      const patientsData = await PATIENT_LIST_DB.getItem<PatientData[]>(PATIENTS_KEY);
      const lastSync = await PATIENT_LIST_DB.getItem<string>(LAST_SYNC_KEY);

      if (patientsData) {
        const summaries = patientsData.map(toPatientSummary);
        set({
          patients: summaries,
          lastSync: lastSync || new Date().toISOString(),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      set({
        error: 'Failed to load patients',
        isLoading: false,
      });
    }
  },

  refreshPatients: async () => {
    await get().loadPatients();
  },

  // ============================================================================
  // SEARCH/FILTER
  // ============================================================================

  setSearch: (search: string) => {
    set((state) => ({
      filters: { ...state.filters, search },
    }));
  },

  setStatusFilter: (status: PatientStatus | 'all') => {
    set((state) => ({
      filters: { ...state.filters, status },
    }));
  },

  setMissionFilter: (missionId: string | 'all') => {
    set((state) => ({
      filters: { ...state.filters, missionId },
    }));
  },

  setProviderFilter: (provider: string | 'all') => {
    set((state) => ({
      filters: { ...state.filters, provider },
    }));
  },

  setSortBy: (sortBy: PatientFilters['sortBy']) => {
    set((state) => ({
      filters: { ...state.filters, sortBy },
    }));
  },

  setSortOrder: (sortOrder: PatientFilters['sortOrder']) => {
    set((state) => ({
      filters: { ...state.filters, sortOrder },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters, selectedIds: [] });
  },

  // ============================================================================
  // SELECTION
  // ============================================================================

  selectPatient: (ishiId: string) => {
    set((state) => ({
      selectedIds: [...state.selectedIds, ishiId],
    }));
  },

  deselectPatient: (ishiId: string) => {
    set((state) => ({
      selectedIds: state.selectedIds.filter((id) => id !== ishiId),
    }));
  },

  toggleSelectPatient: (ishiId: string) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(ishiId)
        ? state.selectedIds.filter((id) => id !== ishiId)
        : [...state.selectedIds, ishiId],
    }));
  },

  selectAll: () => {
    const { getFilteredPatients } = get();
    const filtered = getFilteredPatients();
    set({
      selectedIds: filtered.map((p) => p.ishiId),
    });
  },

  deselectAll: () => {
    set({ selectedIds: [] });
  },

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================

  performBulkAction: async (action: BulkAction) => {
    const { selectedIds, patients } = get();
    const selectedPatients = patients.filter((p) => selectedIds.includes(p.ishiId));

    console.log(`Performing bulk action: ${action} on ${selectedPatients.length} patients`);

    switch (action) {
      case 'export-json':
        // Export selected patients as JSON files
        selectedPatients.forEach((patient) => {
          // TODO: Implement export
          console.log('Export JSON:', patient.ishiId);
        });
        break;

      case 'export-csv':
        // Export selected patients as CSV
        // TODO: Implement CSV export
        console.log('Export CSV:', selectedPatients.length, 'patients');
        break;

      case 'print-labels':
        // Print patient labels
        // TODO: Implement label printing
        console.log('Print labels:', selectedPatients.length, 'patients');
        break;

      case 'print-summary':
        // Print patient summary
        // TODO: Implement summary printing
        console.log('Print summary:', selectedPatients.length, 'patients');
        break;

      case 'discharge-selected':
        // Mark selected patients as discharged
        // TODO: Implement bulk discharge
        console.log('Discharge:', selectedPatients.length, 'patients');
        break;
    }

    // Clear selection after action
    get().deselectAll();
  },

  // ============================================================================
  // PATIENT MANAGEMENT
  // ============================================================================

  addPatient: async (patient: PatientData) => {
    set((state) => {
      const newSummary = toPatientSummary(patient);
      const newPatients = [...state.patients, newSummary];

      return {
        patients: newPatients,
        updatedAt: new Date().toISOString(),
      };
    });
  },

  updatePatient: async (patient: PatientData) => {
    set((state) => {
      const newSummary = toPatientSummary(patient);
      const newPatients = state.patients.map((p) =>
        p.ishiId === patient.ishiId ? newSummary : p
      );

      return {
        patients: newPatients,
        updatedAt: new Date().toISOString(),
      };
    });
  },

  removePatient: async (ishiId: string) => {
    set((state) => ({
      patients: state.patients.filter((p) => p.ishiId !== ishiId),
      selectedIds: state.selectedIds.filter((id) => id !== ishiId),
    }));
  },

  // ============================================================================
  // STATUS UPDATES
  // ============================================================================

  updatePatientStatus: (ishiId: string, status: PatientStatus) => {
    set((state) => ({
      patients: state.patients.map((p) =>
        p.ishiId === ishiId ? { ...p, status } : p
      ),
    }));
  },

  // ============================================================================
  // UTILITIES
  // ============================================================================

  getFilteredPatients: () => {
    const { patients, filters } = get();
    const filtered = filterPatients(patients, filters);
    return sortPatients(filtered, filters.sortBy, filters.sortOrder);
  },

  getStats: () => {
    const { patients } = get();
    return calculateStats(patients);
  },

  clearError: () => {
    set({ error: null });
  },
}));
