/**
 * Patient List Page
 * 
 * Main dashboard for viewing, searching, and managing all patients.
 */

import { useState } from 'react';
import { usePatientList } from '../../hooks/usePatientList';
import { useMissions } from '../../hooks/useModules';
import PatientCard from './PatientCard';
import PatientFilters from './PatientFilters';
import PatientStats from './PatientStats';
import BulkActions from './BulkActions';
import NewPatientModal from './NewPatientModal';

export default function PatientList() {
  const {
    patients,
    allPatients,
    selectedIds,
    filters,
    isLoading,
    error,
    lastSync,
    stats,
    providers,
    isSelected,
    allSelected,
    toggleSelectPatient,
    selectAll,
    deselectAll,
    setSearch,
    setStatusFilter,
    setMissionFilter,
    setProviderFilter,
    setSortBy,
    setSortOrder,
    resetFilters,
    performBulkAction,
    loadPatients,
  } = usePatientList();

  const { missions } = useMissions();
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-ayekta-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-sm text-ayekta-muted mt-1">
                {stats.total} patients • Last sync: {lastSync || 'Never'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => loadPatients()}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title="Refresh patient list"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setIsNewPatientModalOpen(true)}
                className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors"
              >
                + New Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <PatientStats stats={stats} />

      {/* Filters and Search */}
      <PatientFilters
        filters={filters}
        providers={providers}
        missions={missions}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onMissionChange={setMissionFilter}
        onProviderChange={setProviderFilter}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onReset={resetFilters}
        resultCount={patients.length}
        totalCount={allPatients.length}
      />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          onDeselectAll={deselectAll}
          onExportJson={() => performBulkAction('export-json')}
          onExportCsv={() => performBulkAction('export-csv')}
          onPrintLabels={() => performBulkAction('print-labels')}
          onPrintSummary={() => performBulkAction('print-summary')}
        />
      )}

      {/* Patient List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayekta-orange mx-auto"></div>
            <p className="text-ayekta-muted mt-4">Loading patients...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800">Error Loading Patients</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700">No Patients Found</h3>
            <p className="text-ayekta-muted mt-2">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first patient record'}
            </p>
            {!filters.search && filters.status === 'all' && (
              <button
                onClick={() => setIsNewPatientModalOpen(true)}
                className="mt-4 px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors"
              >
                + New Patient
              </button>
            )}
          </div>
        ) : (
          <>
            {/* View Toggle and Select All */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-ayekta-orange border-gray-300 rounded focus:ring-ayekta-orange"
                  />
                  <span className="text-sm text-gray-600">
                    Select all ({patients.length})
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'grid'
                      ? 'bg-ayekta-orange text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'list'
                      ? 'bg-ayekta-orange text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Patient Grid/List */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-2'
              }
            >
              {patients.map((patient: any) => (
                <PatientCard
                  key={patient.ishiId}
                  patient={patient}
                  isSelected={isSelected(patient.ishiId)}
                  onSelect={() => toggleSelectPatient(patient.ishiId)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* New Patient Modal */}
      {isNewPatientModalOpen && (
        <NewPatientModal
          onClose={() => setIsNewPatientModalOpen(false)}
        />
      )}
    </div>
  );
}
