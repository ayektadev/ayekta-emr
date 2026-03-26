/**
 * Patient List Hooks
 * 
 * React hooks for working with the patient list system.
 */

import { useEffect, useMemo, useCallback } from 'react';
import { usePatientListStore } from '../store/patientListStore';
import type { PatientStatus } from '../types/patientList.types';

/**
 * Hook to manage patient list
 */
export function usePatientList() {
  const {
    patients,
    selectedIds,
    filters,
    isLoading,
    error,
    lastSync,
    loadPatients,
    refreshPatients,
    setSearch,
    setStatusFilter,
    setMissionFilter,
    setProviderFilter,
    setSortBy,
    setSortOrder,
    resetFilters,
    selectPatient,
    deselectPatient,
    toggleSelectPatient,
    selectAll,
    deselectAll,
    performBulkAction,
    updatePatientStatus,
    clearError,
    getFilteredPatients,
    getStats,
  } = usePatientListStore();

  // Get filtered and sorted patients
  const filteredPatients = useMemo(() => {
    return getFilteredPatients();
  }, [getFilteredPatients]);

  // Get statistics
  const stats = useMemo(() => {
    return getStats();
  }, [getStats]);

  // Check if patient is selected
  const isSelected = useCallback(
    (ishiId: string) => {
      return selectedIds.includes(ishiId);
    },
    [selectedIds]
  );

  // Check if all visible patients are selected
  const allSelected = useMemo(() => {
    if (filteredPatients.length === 0) return false;
    return filteredPatients.every((p) => selectedIds.includes(p.ishiId));
  }, [filteredPatients, selectedIds]);

  // Status counts for display
  const statusCounts = useMemo(() => {
    return {
      'pre-op': stats.preOp,
      'in-or': stats.inOr,
      pacu: stats.pacu,
      floor: stats.floor,
      discharged: stats.discharged,
      'follow-up': stats.followUp,
    };
  }, [stats]);

  // Get unique providers from patient list
  const providers = useMemo(() => {
    const providerSet = new Set(patients.map((p) => p.provider));
    return Array.from(providerSet).sort();
  }, [patients]);

  // Format last sync time
  const lastSyncFormatted = useMemo(() => {
    if (!lastSync) return null;
    const date = new Date(lastSync);
    return date.toLocaleString();
  }, [lastSync]);

  return {
    // State
    patients: filteredPatients,
    allPatients: patients,
    selectedIds,
    filters,
    isLoading,
    error,
    lastSync: lastSyncFormatted,
    stats,
    statusCounts,
    providers,

    // Selection
    isSelected,
    allSelected,
    selectPatient,
    deselectPatient,
    toggleSelectPatient,
    selectAll,
    deselectAll,
    selectedCount: selectedIds.length,

    // Filters
    setSearch,
    setStatusFilter,
    setMissionFilter,
    setProviderFilter,
    setSortBy,
    setSortOrder,
    resetFilters,

    // Actions
    loadPatients,
    refreshPatients,
    performBulkAction,
    updatePatientStatus,
    clearError,
  };
}

/**
 * Hook to initialize patient list on mount
 */
export function usePatientListInitialization() {
  const { loadPatients, isLoading } = usePatientListStore();

  useEffect(() => {
    loadPatients();
  }, []);

  return {
    isInitializing: isLoading,
    isReady: !isLoading,
  };
}

/**
 * Hook for patient status badge
 */
export function usePatientStatus(status: PatientStatus) {
  const statusConfig: Record<PatientStatus, { label: string; color: string; icon: string }> = {
    'pre-op': {
      label: 'Pre-Op',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '📋',
    },
    'in-or': {
      label: 'In OR',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '🔪',
    },
    pacu: {
      label: 'PACU',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '🏥',
    },
    floor: {
      label: 'Floor',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🛏️',
    },
    discharged: {
      label: 'Discharged',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✅',
    },
    'follow-up': {
      label: 'Follow-Up',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '📅',
    },
  };

  return statusConfig[status];
}

/**
 * Hook for patient list statistics display
 */
export function usePatientStats() {
  const { getStats } = usePatientListStore();

  const stats = useMemo(() => getStats(), [getStats]);

  const statusBreakdown = useMemo(
    () => [
      { label: 'Pre-Op', count: stats.preOp, color: 'text-yellow-600' },
      { label: 'In OR', count: stats.inOr, color: 'text-red-600' },
      { label: 'PACU', count: stats.pacu, color: 'text-orange-600' },
      { label: 'Floor', count: stats.floor, color: 'text-blue-600' },
      { label: 'Discharged', count: stats.discharged, color: 'text-green-600' },
      { label: 'Follow-Up', count: stats.followUp, color: 'text-purple-600' },
    ],
    [stats]
  );

  const recentActivity = useMemo(
    () => ({
      today: stats.todayCount,
      thisWeek: stats.weekCount,
    }),
    [stats]
  );

  return {
    total: stats.total,
    statusBreakdown,
    recentActivity,
  };
}
