/**
 * Patient Card Component
 * 
 * Displays patient summary information in grid or list view.
 */

import { usePatientStatus } from '../../hooks/usePatientList';
import type { PatientSummary } from '../../types/patientList.types';

interface PatientCardProps {
  patient: PatientSummary;
  isSelected: boolean;
  onSelect: () => void;
  viewMode: 'grid' | 'list';
}

export default function PatientCard({
  patient,
  isSelected,
  onSelect,
  viewMode,
}: PatientCardProps) {
  if (viewMode === 'list') {
    return (
      <div
        className={`
          bg-white rounded-lg border p-3 flex items-center gap-4
          hover:shadow-md transition-shadow cursor-pointer
          ${isSelected ? 'border-ayekta-orange bg-orange-50' : 'border-gray-200'}
        `}
        onClick={onSelect}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-ayekta-orange border-gray-300 rounded focus:ring-ayekta-orange"
        />

        {/* Patient Info */}
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3">
            <p className="font-semibold text-gray-900">{patient.fullName}</p>
            <p className="text-xs text-gray-500">ISHI: {patient.ishiId}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">
              {patient.age} yrs • {patient.gender}
            </p>
          </div>
          <div className="col-span-3">
            <p className="text-sm text-gray-700 truncate" title={patient.procedure}>
              {patient.procedure}
            </p>
          </div>
          <div className="col-span-2">
            <StatusBadge status={patient.status} />
          </div>
          <div className="col-span-2 text-right">
            <p className="text-xs text-gray-500">
              {formatDate(patient.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`
        bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer
        ${isSelected ? 'border-ayekta-orange bg-orange-50' : 'border-gray-200'}
      `}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-ayekta-orange border-gray-300 rounded focus:ring-ayekta-orange"
          />
          <StatusBadge status={patient.status} />
        </div>
        <p className="text-xs text-gray-500">{formatDate(patient.updatedAt)}</p>
      </div>

      {/* Patient Info */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{patient.fullName}</h3>
        <p className="text-xs text-gray-500">ISHI: {patient.ishiId}</p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span>👤</span>
          <span>{patient.age} years • {patient.gender}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>🔪</span>
          <span className="truncate" title={patient.procedure}>{patient.procedure}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>👨‍⚕️</span>
          <span>{patient.provider}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const statusConfig = usePatientStatus(status as any);

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
        ${statusConfig.color}
      `}
    >
      <span>{statusConfig.icon}</span>
      <span>{statusConfig.label}</span>
    </span>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
