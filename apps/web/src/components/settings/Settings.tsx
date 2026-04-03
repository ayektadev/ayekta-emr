/**
 * Settings Page
 * 
 * Main settings page with tabs for:
 * - Module Configuration
 * - Role Management
 * - Mission Management
 * - Application Settings
 */

import { useState } from 'react';
import ModuleConfiguration from './ModuleConfiguration';
import { useUserRole, useMissions } from '../../hooks/useModules';
import type { UserRole } from '../../types/module.types';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'modules' | 'roles' | 'missions'>('modules');

  return (
    <div className="min-h-screen bg-gray-50 font-clinical">
      {/* Header */}
      <div className="bg-white border-b border-ayekta-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-ayekta-muted mt-1">
            Configure modules, roles, and missions for your deployment
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-ayekta-border">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6">
            <TabButton
              label="Modules"
              isActive={activeTab === 'modules'}
              onClick={() => setActiveTab('modules')}
            />
            <TabButton
              label="Roles"
              isActive={activeTab === 'roles'}
              onClick={() => setActiveTab('roles')}
            />
            <TabButton
              label="Missions"
              isActive={activeTab === 'missions'}
              onClick={() => setActiveTab('missions')}
            />
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'modules' && <ModuleConfiguration />}
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'missions' && <MissionManagement />}
      </div>
    </div>
  );
}

// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-3 text-sm font-medium border-b-2 transition-colors
        ${
          isActive
            ? 'border-ayekta-orange text-gray-900'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }
      `}
    >
      {label}
    </button>
  );
}

// ============================================================================
// ROLE MANAGEMENT COMPONENT
// ============================================================================

function RoleManagement() {
  const { currentRole, setRole, roleName, roleDescription } = useUserRole();

  const roles: { id: UserRole; name: string; description: string }[] = [
    {
      id: 'surgeon',
      name: 'Surgeon',
      description: 'Full access to surgical modules and patient records',
    },
    {
      id: 'nurse',
      name: 'Nurse',
      description: 'Access to nursing modules and patient vitals',
    },
    {
      id: 'anesthesiologist',
      name: 'Anesthesiologist',
      description: 'Access to anesthesia and perioperative modules',
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access including user and mission management',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Role Management</h2>
        <p className="text-ayekta-muted">
          Select your role to customize module access and navigation
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => setRole(role.id)}
            className={`
              p-6 rounded-lg border-2 cursor-pointer transition-all
              ${
                currentRole === role.id
                  ? 'border-ayekta-orange bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{role.name}</h3>
                <p className="text-gray-600 mt-1">{role.description}</p>
              </div>
              {currentRole === role.id && (
                <div className="w-6 h-6 rounded-full bg-ayekta-orange flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Current Role Display */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900">Current Role</h3>
        <p className="text-blue-800 mt-1">
          You are currently viewing as <strong>{roleName}</strong>
        </p>
        <p className="text-blue-600 text-sm mt-2">{roleDescription}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MISSION MANAGEMENT COMPONENT
// ============================================================================

function MissionManagement() {
  const { missions, activeMission, createMission, deleteMission, setActiveMission } =
    useMissions();

  const [isCreating, setIsCreating] = useState(false);
  const [newMission, setNewMission] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    teamLead: '',
    localPartners: '',
  });

  const handleCreate = () => {
    if (!newMission.name || !newMission.location) return;

    createMission({
      name: newMission.name,
      location: newMission.location,
      startDate: newMission.startDate,
      endDate: newMission.endDate,
      teamLead: newMission.teamLead,
      localPartners: newMission.localPartners.split(',').map((s) => s.trim()),
    });

    setNewMission({
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      teamLead: '',
      localPartners: '',
    });
    setIsCreating(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Mission Management</h2>
        <p className="text-ayekta-muted">
          Create and manage surgical missions/camps
        </p>
      </div>

      {/* Active Mission Banner */}
      {activeMission && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Active Mission</h3>
              <p className="text-green-800 mt-1">
                <strong>{activeMission.name}</strong> - {activeMission.location}
              </p>
              <p className="text-green-600 text-sm mt-1">
                {activeMission.startDate} to {activeMission.endDate}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      )}

      {/* Create Mission Form */}
      {isCreating && (
        <div className="mb-6 p-6 bg-white border border-ayekta-border rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Create New Mission</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Mission Name *
              </label>
              <input
                type="text"
                value={newMission.name}
                onChange={(e) =>
                  setNewMission({ ...newMission, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Ghana 2026 Q1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <input
                type="text"
                value={newMission.location}
                onChange={(e) =>
                  setNewMission({ ...newMission, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Accra, Ghana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newMission.startDate}
                onChange={(e) =>
                  setNewMission({ ...newMission, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                value={newMission.endDate}
                onChange={(e) =>
                  setNewMission({ ...newMission, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Team Lead
              </label>
              <input
                type="text"
                value={newMission.teamLead}
                onChange={(e) =>
                  setNewMission({ ...newMission, teamLead: e.target.value })
                }
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Dr. Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Local Partners
              </label>
              <input
                type="text"
                value={newMission.localPartners}
                onChange={(e) =>
                  setNewMission({
                    ...newMission,
                    localPartners: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Comma-separated"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Create Mission
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Missions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">All Missions</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
          >
            + New Mission
          </button>
        </div>

        {missions.length === 0 ? (
          <p className="text-ayekta-muted text-sm">
            No missions created yet. Click "New Mission" to get started.
          </p>
        ) : (
          <div className="grid gap-4">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`
                  p-4 rounded-lg border transition-all
                  ${
                    mission.isActive
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{mission.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {mission.location} • {mission.startDate} to {mission.endDate}
                    </p>
                    {mission.teamLead && (
                      <p className="text-sm text-gray-500 mt-1">
                        Lead: {mission.teamLead}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!mission.isActive && (
                      <button
                        onClick={() => setActiveMission(mission.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => deleteMission(mission.id)}
                      className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
