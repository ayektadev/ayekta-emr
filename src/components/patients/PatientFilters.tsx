/**
 * Patient Filters Component
 * 
 * Search, filter, and sort controls for patient list.
 */

import type { PatientFilters } from '../../types/patientList.types';
import type { MissionConfig } from '../../types/module.types';

interface PatientFiltersProps {
  filters: PatientFilters;
  providers: string[];
  missions: MissionConfig[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: PatientFilters['status']) => void;
  onMissionChange: (value: PatientFilters['missionId']) => void;
  onProviderChange: (value: PatientFilters['provider']) => void;
  onSortByChange: (value: PatientFilters['sortBy']) => void;
  onSortOrderChange: (value: PatientFilters['sortOrder']) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export default function PatientFilters({
  filters,
  providers,
  missions,
  onSearchChange,
  onStatusChange,
  onMissionChange,
  onProviderChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
  resultCount,
  totalCount,
}: PatientFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pre-op', label: 'Pre-Op' },
    { value: 'in-or', label: 'In OR' },
    { value: 'pacu', label: 'PACU' },
    { value: 'floor', label: 'Floor' },
    { value: 'discharged', label: 'Discharged' },
    { value: 'follow-up', label: 'Follow-Up' },
  ];

  const sortOptions = [
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'age', label: 'Age' },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.missionId !== 'all' ||
    filters.provider !== 'all';

  return (
    <div className="bg-white border-b border-ayekta-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Name or ISHI ID..."
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mission Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏥 Mission
            </label>
            <select
              value={filters.missionId}
              onChange={(e) => onMissionChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
            >
              <option value="all">All Missions</option>
              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.name}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👨‍⚕️ Provider
            </label>
            <select
              value={filters.provider}
              onChange={(e) => onProviderChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
            >
              <option value="all">All Providers</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔀 Sort By
            </label>
            <div className="flex gap-1">
              <select
                value={filters.sortBy}
                onChange={(e) => onSortByChange(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onSortOrderChange(filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-ayekta-border rounded hover:bg-gray-50 transition-colors"
                title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{resultCount}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> patients
            </p>
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="text-sm text-ayekta-orange hover:text-ayekta-orange/80 transition-colors"
              >
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
