/**
 * Module Configuration Component
 * 
 * Settings page for enabling/disabling modules and managing preferences.
 */

import { useState } from 'react';
import { useModuleSettings } from '../../hooks/useModules';
import { useModuleManagement } from '../../store/moduleManagementStore';
import type { ModuleConfig } from '../../types/module.types';

export default function ModuleConfiguration() {
  const {
    modules,
    categories,
    enabledCount,
    totalCount,
    toggleModule,
    toggleFavorite,
    getMissingDependencies,
    resetToDefaults,
  } = useModuleSettings();

  const [expandedCategory, setExpandedCategory] = useState<string | null>('core');

  const categoryLabels: Record<string, string> = {
    core: 'Core Modules',
    preoperative: 'Preoperative',
    intraoperative: 'Intraoperative',
    postoperative: 'Postoperative',
    administrative: 'Administrative',
    optional: 'Optional',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Chart documentation modules</h2>
        <p className="text-sm text-ayekta-muted">
          Turn chart sections on or off for this device. Sections required for a minimal chart stay on; turning
          a section off hides it from the chart tabs but does not delete what you already entered.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Modules Enabled</span>
            <div className="text-2xl font-bold">
              {enabledCount} / {totalCount}
            </div>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-ayekta-orange border border-ayekta-orange rounded hover:bg-orange-50 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryModules = modules[category] || [];
          const isExpanded = expandedCategory === category;

          return (
            <div
              key={category}
              className="bg-white rounded-lg shadow-sm border border-ayekta-border overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category)
                }
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">
                    {categoryLabels[category] || category}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({categoryModules.length} modules)
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Category Modules */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {categoryModules.map((module) => (
                    <ModuleRow
                      key={module.id}
                      module={module}
                      toggleModule={toggleModule}
                      toggleFavorite={toggleFavorite}
                      getMissingDependencies={getMissingDependencies}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 border border-ayekta-border rounded-md bg-gray-50 text-xs text-gray-600">
        <p className="font-medium text-gray-800 mb-2">Behavior</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>When you turn on a section, any required sections turn on with it.</li>
          <li>Use the star to pin sections you open often; they move to the top of this list only.</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE ROW COMPONENT
// ============================================================================

interface ModuleRowProps {
  module: ModuleConfig;
  toggleModule: (moduleId: string) => void;
  toggleFavorite: (moduleId: string) => void;
  getMissingDependencies: (moduleId: string) => string[];
}

function ModuleRow({
  module,
  toggleModule,
  toggleFavorite,
  getMissingDependencies,
}: ModuleRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const enabledModules = useModuleManagement((s) => s.enabledModules);
  const isOn = module.isCore || enabledModules[module.id] === true;
  const missingDeps = getMissingDependencies(module.id);
  const hasMissingDeps = missingDeps.length > 0;

  const iconMap: Record<string, JSX.Element> = {
    User: <UserIcon />,
    Activity: <ActivityIcon />,
    Stethoscope: <StethoscopeIcon />,
    FileCheck: <FileCheckIcon />,
    Pill: <PillIcon />,
    TestTube: <TestTubeIcon />,
    Scan: <ScanIcon />,
    Clock: <ClockIcon />,
    HeartPulse: <HeartPulseIcon />,
    ClipboardList: <ClipboardListIcon />,
    FileText: <FileTextIcon />,
    Bed: <BedIcon />,
    Hospital: <HospitalIcon />,
    Notebook: <NotebookIcon />,
    LogOut: <LogOutIcon />,
    CalendarCheck: <CalendarCheckIcon />,
  };

  return (
    <div
      className="px-4 py-3 hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-ayekta-orange">
            {iconMap[module.icon] || <PackageIcon />}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{module.name}</h4>
              {module.isCore && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600">
                  Core
                </span>
              )}
              {hasMissingDeps && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 rounded-full text-yellow-700">
                  Requires dependencies
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
            
            {/* Dependencies warning */}
            {hasMissingDeps && (
              <p className="text-xs text-yellow-600 mt-1">
                Requires: {missingDeps.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Favorite toggle */}
          <button
            onClick={() => toggleFavorite(module.id)}
            className={`p-2 rounded transition-colors ${
              isHovered ? 'hover:bg-gray-200' : ''
            }`}
            title="Add to favorites"
          >
            <StarIcon filled={false} />
          </button>

          {/* Enable/Disable toggle */}
          <button
            onClick={() => !module.isCore && toggleModule(module.id)}
            disabled={module.isCore}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              module.isCore
                ? 'bg-gray-400 cursor-not-allowed'
                : isOn
                  ? 'bg-ayekta-orange'
                  : 'bg-gray-300'
            }`}
          >
            <span className="sr-only">Toggle module</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isOn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function StethoscopeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function FileCheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  );
}

function TestTubeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function HeartPulseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function ClipboardListIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function HospitalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}
