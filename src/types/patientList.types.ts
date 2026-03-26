/**
 * Patient List Types
 * 
 * Types for multi-patient management in Ayekta EMR.
 */

import type { PatientData } from './patient.types';

/**
 * Patient status in the surgical workflow
 */
export type PatientStatus = 
  | 'pre-op'
  | 'in-or'
  | 'pacu'
  | 'floor'
  | 'discharged'
  | 'follow-up';

/**
 * Patient summary for list view
 */
export interface PatientSummary {
  /** ISHI ID (unique identifier) */
  ishiId: string;
  
  /** Patient full name */
  fullName: string;
  
  /** Age in years */
  age: number;
  
  /** Gender */
  gender: string;
  
  /** Current status in workflow */
  status: PatientStatus;
  
  /** Planned or performed procedure */
  procedure: string;
  
  /** Associated mission ID */
  missionId?: string;
  
  /** Current provider */
  provider: string;
  
  /** Last updated timestamp */
  updatedAt: string;
  
  /** Created timestamp */
  createdAt: string;
  
  /** First saved timestamp */
  firstSavedAt?: string;
}

/**
 * Patient list filters
 */
export interface PatientFilters {
  /** Search by name or ISHI ID */
  search: string;
  
  /** Filter by status */
  status: PatientStatus | 'all';
  
  /** Filter by mission */
  missionId: string | 'all';
  
  /** Filter by provider */
  provider: string | 'all';
  
  /** Sort by field */
  sortBy: 'updatedAt' | 'createdAt' | 'name' | 'age';
  
  /** Sort order */
  sortOrder: 'asc' | 'desc';
}

/**
 * Patient list statistics
 */
export interface PatientStats {
  /** Total patients */
  total: number;
  
  /** Pre-op count */
  preOp: number;
  
  /** In OR count */
  inOr: number;
  
  /** PACU count */
  pacu: number;
  
  /** Floor count */
  floor: number;
  
  /** Discharged count */
  discharged: number;
  
  /** Follow-up count */
  followUp: number;
  
  /** Patients added today */
  todayCount: number;
  
  /** Patients added this week */
  weekCount: number;
}

/**
 * Bulk action type
 */
export type BulkAction = 
  | 'export-json'
  | 'export-csv'
  | 'print-labels'
  | 'print-summary'
  | 'discharge-selected';

/**
 * Patient list state
 */
export interface PatientListState {
  /** All patient summaries */
  patients: PatientSummary[];
  
  /** Currently selected patient IDs */
  selectedIds: string[];
  
  /** Current filters */
  filters: PatientFilters;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error message */
  error: string | null;
  
  /** Last sync timestamp */
  lastSync: string | null;
}

/**
 * Patient list actions
 */
export interface PatientListActions {
  // Load/Refresh
  loadPatients: () => Promise<void>;
  refreshPatients: () => Promise<void>;
  
  // Search/Filter
  setSearch: (search: string) => void;
  setStatusFilter: (status: PatientStatus | 'all') => void;
  setMissionFilter: (missionId: string | 'all') => void;
  setProviderFilter: (provider: string | 'all') => void;
  setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'name' | 'age') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  resetFilters: () => void;
  
  // Selection
  selectPatient: (ishiId: string) => void;
  deselectPatient: (ishiId: string) => void;
  toggleSelectPatient: (ishiId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  // Bulk Actions
  performBulkAction: (action: BulkAction) => Promise<void>;
  
  // Patient Management
  addPatient: (patient: PatientData) => void;
  updatePatient: (patient: PatientData) => void;
  removePatient: (ishiId: string) => void;
  
  // Status Updates
  updatePatientStatus: (ishiId: string, status: PatientStatus) => void;
  
  // Utilities
  getFilteredPatients: () => PatientSummary[];
  getStats: () => PatientStats;
  clearError: () => void;
}
