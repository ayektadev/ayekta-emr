/**
 * Module Registry
 * 
 * Central registry for all dynamically loadable modules in Ayekta EMR.
 * Enables lazy loading, module management, and role-based access control.
 */

import { lazy } from 'react';
import type { ModuleConfig, ModuleRegistry, UserRole, ModuleCategory } from '../types/module.types';

// ============================================================================
// MODULE CONFIGURATIONS
// ============================================================================

/**
 * Core module configurations
 * 
 * Each module defines:
 * - id: Unique identifier
 * - name: Display name
 * - description: What the module does
 * - category: Functional category
 * - tabName: Matches TabName in patient.types.ts
 * - enabledByDefault: Whether to enable on first install
 * - allowedRoles: Which roles can access
 * - requiresPatient: Needs active patient context
 * - dependencies: Other modules this requires
 * - icon: lucide-react icon name
 * - order: Navigation order
 * - isCore: Cannot be disabled
 */

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  // ============================================================================
  // CORE MODULES (Cannot be disabled)
  // ============================================================================
  'demographics': {
    id: 'demographics',
    name: 'Demographics',
    description: 'Patient identification, contact information, and medical history',
    category: 'core',
    tabName: 'demographics',
    enabledByDefault: true,
    allowedRoles: ['all'],
    requiresPatient: true,
    icon: 'User',
    order: 1,
    isCore: true,
  },
  
  'triage': {
    id: 'triage',
    name: 'Triage',
    description: 'Vital signs, chief complaint, and initial assessment',
    category: 'core',
    tabName: 'triage',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse', 'anesthesiologist'],
    requiresPatient: true,
    icon: 'Activity',
    order: 2,
    isCore: true,
  },
  
  // ============================================================================
  // PREOPERATIVE MODULES
  // ============================================================================
  'surgical-needs': {
    id: 'surgical-needs',
    name: 'Surgical Needs',
    description: 'Procedure planning, urgency assessment, and hernia scoring',
    category: 'preoperative',
    tabName: 'surgical-needs',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse'],
    requiresPatient: true,
    dependencies: ['demographics', 'triage'],
    icon: 'Stethoscope',
    order: 3,
    isCore: false,
  },
  
  'consent': {
    id: 'consent',
    name: 'Consent',
    description: 'Surgical consent forms with all required acknowledgments',
    category: 'preoperative',
    tabName: 'consent',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse'],
    requiresPatient: true,
    dependencies: ['surgical-needs'],
    icon: 'FileCheck',
    order: 4,
    isCore: false,
  },
  
  'pre-anesthesia': {
    id: 'pre-anesthesia',
    name: 'Pre-Anesthesia',
    description: 'Pre-anesthesia evaluation and risk assessment',
    category: 'preoperative',
    tabName: 'pre-anesthesia',
    enabledByDefault: true,
    allowedRoles: ['anesthesiologist', 'surgeon'],
    requiresPatient: true,
    dependencies: ['triage'],
    icon: 'Pill',
    order: 5,
    isCore: false,
  },
  
  // ============================================================================
  // MEDICATION & DIAGNOSTICS
  // ============================================================================
  'medications': {
    id: 'medications',
    name: 'Medications',
    description: 'Current medications, allergies, PRN, and pre-op medications',
    category: 'preoperative',
    tabName: 'medications',
    enabledByDefault: true,
    allowedRoles: ['all'],
    requiresPatient: true,
    icon: 'Pill',
    order: 6,
    isCore: false,
  },
  
  'labs': {
    id: 'labs',
    name: 'Labs',
    description: 'Laboratory test orders and results tracking',
    category: 'preoperative',
    tabName: 'labs',
    enabledByDefault: true,
    allowedRoles: ['all'],
    requiresPatient: true,
    icon: 'TestTube',
    order: 7,
    isCore: false,
  },
  
  'imaging': {
    id: 'imaging',
    name: 'Imaging',
    description: 'Imaging studies with findings and impressions',
    category: 'preoperative',
    tabName: 'imaging',
    enabledByDefault: true,
    allowedRoles: ['all'],
    requiresPatient: true,
    icon: 'Scan',
    order: 8,
    isCore: false,
  },
  
  // ============================================================================
  // INTRAOPERATIVE MODULES
  // ============================================================================
  'or-record': {
    id: 'or-record',
    name: 'OR Record',
    description: 'Operating room timing, time-out checklist, and instrument counts',
    category: 'intraoperative',
    tabName: 'or-record',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse', 'anesthesiologist'],
    requiresPatient: true,
    dependencies: ['surgical-needs'],
    icon: 'Clock',
    order: 9,
    isCore: false,
  },
  
  'anesthesia-record': {
    id: 'anesthesia-record',
    name: 'Anesthesia Record',
    description: 'Intraoperative anesthesia and sedation documentation',
    category: 'intraoperative',
    tabName: 'anesthesia-record',
    enabledByDefault: true,
    allowedRoles: ['anesthesiologist', 'surgeon'],
    requiresPatient: true,
    dependencies: ['pre-anesthesia'],
    icon: 'HeartPulse',
    order: 10,
    isCore: false,
  },
  
  'nursing-orders': {
    id: 'nursing-orders',
    name: 'Nursing Orders',
    description: 'Post-operative nursing instructions and interventions',
    category: 'intraoperative',
    tabName: 'nursing-orders',
    enabledByDefault: true,
    allowedRoles: ['nurse'],
    requiresPatient: true,
    icon: 'ClipboardList',
    order: 11,
    isCore: false,
  },
  
  'operative-note': {
    id: 'operative-note',
    name: 'Operative Note',
    description: 'Complete surgical documentation with findings and technique',
    category: 'intraoperative',
    tabName: 'operative-note',
    enabledByDefault: true,
    allowedRoles: ['surgeon'],
    requiresPatient: true,
    dependencies: ['or-record'],
    icon: 'FileText',
    order: 12,
    isCore: false,
  },
  
  // ============================================================================
  // POSTOPERATIVE MODULES
  // ============================================================================
  'pacu': {
    id: 'pacu',
    name: 'PACU',
    description: 'Post-anesthesia care unit flowsheet and monitoring',
    category: 'postoperative',
    tabName: 'pacu',
    enabledByDefault: true,
    allowedRoles: ['nurse', 'anesthesiologist', 'surgeon'],
    requiresPatient: true,
    dependencies: ['anesthesia-record'],
    icon: 'Bed',
    order: 13,
    isCore: false,
  },
  
  'floor-flow': {
    id: 'floor-flow',
    name: 'Floor Flow',
    description: 'Ward nursing flowsheet and assessments',
    category: 'postoperative',
    tabName: 'floor-flow',
    enabledByDefault: true,
    allowedRoles: ['nurse', 'surgeon'],
    requiresPatient: true,
    dependencies: ['pacu'],
    icon: 'Hospital',
    order: 14,
    isCore: false,
  },
  
  'progress-notes': {
    id: 'progress-notes',
    name: 'Progress Notes',
    description: 'Daily post-operative progress notes (POD #)',
    category: 'postoperative',
    tabName: 'progress-notes',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse'],
    requiresPatient: true,
    icon: 'Notebook',
    order: 15,
    isCore: false,
  },
  
  'discharge': {
    id: 'discharge',
    name: 'Discharge',
    description: 'Discharge planning, instructions, and follow-up',
    category: 'postoperative',
    tabName: 'discharge',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse'],
    requiresPatient: true,
    icon: 'LogOut',
    order: 16,
    isCore: false,
  },
  
  'follow-up-notes': {
    id: 'follow-up-notes',
    name: 'Follow-Up',
    description: 'Post-discharge follow-up appointment documentation',
    category: 'postoperative',
    tabName: 'follow-up-notes',
    enabledByDefault: true,
    allowedRoles: ['surgeon', 'nurse'],
    requiresPatient: false,
    dependencies: ['discharge'],
    icon: 'CalendarCheck',
    order: 17,
    isCore: false,
  },
};

// ============================================================================
// LAZY-LOADED MODULE COMPONENTS
// ============================================================================

/**
 * Map of module IDs to their lazy-loaded components
 * 
 * Uses React.lazy() for code-splitting and dynamic imports.
 * Each module is loaded only when accessed.
 */
const MODULE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'demographics': lazy(() => import('../components/modules/Demographics')),
  'triage': lazy(() => import('../components/modules/Triage')),
  'surgical-needs': lazy(() => import('../components/modules/SurgicalNeeds')),
  'consent': lazy(() => import('../components/modules/Consent')),
  'medications': lazy(() => import('../components/modules/Medications')),
  'labs': lazy(() => import('../components/modules/Labs')),
  'imaging': lazy(() => import('../components/modules/Imaging')),
  'operative-note': lazy(() => import('../components/modules/OperativeNote')),
  'discharge': lazy(() => import('../components/modules/Discharge')),
  'pre-anesthesia': lazy(() => import('../components/modules/PreAnesthesia')),
  'anesthesia-record': lazy(() => import('../components/modules/AnesthesiaRecord')),
  'or-record': lazy(() => import('../components/modules/ORRecord')),
  'nursing-orders': lazy(() => import('../components/modules/NursingOrders')),
  'pacu': lazy(() => import('../components/modules/PACU')),
  'floor-flow': lazy(() => import('../components/modules/FloorFlow')),
  'progress-notes': lazy(() => import('../components/modules/ProgressNotes')),
  'follow-up-notes': lazy(() => import('../components/modules/FollowUpNotes')),
};

// ============================================================================
// MODULE REGISTRY
// ============================================================================

/**
 * Complete module registry combining configs and components
 */
export const MODULE_REGISTRY: ModuleRegistry = Object.fromEntries(
  Object.entries(MODULE_CONFIGS).map(([id, config]) => [
    id,
    {
      config,
      component: MODULE_COMPONENTS[id],
    },
  ])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all modules for a specific category
 */
export function getModulesByCategory(category: string): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS)
    .filter((config) => config.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get all modules accessible to a specific role
 */
export function getModulesForRole(role: UserRole): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS)
    .filter(
      (config) =>
        config.allowedRoles.includes('all') || config.allowedRoles.includes(role)
    )
    .sort((a, b) => a.order - b.order);
}

/**
 * Get enabled modules based on preferences
 */
export function getEnabledModules(
  enabledModuleIds: string[]
): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS)
    .filter((config) => enabledModuleIds.includes(config.id))
    .sort((a, b) => a.order - b.order);
}

/**
 * Get a specific module config by ID
 */
export function getModuleConfig(moduleId: string): ModuleConfig | undefined {
  return MODULE_CONFIGS[moduleId];
}

/**
 * Check if a module can be accessed by a role
 */
export function canAccessModule(moduleId: string, role: UserRole): boolean {
  const config = MODULE_CONFIGS[moduleId];
  if (!config) return false;
  
  return (
    config.allowedRoles.includes('all') ||
    config.allowedRoles.includes(role)
  );
}

/**
 * Get all available categories
 */
export function getModuleCategories(): ModuleCategory[] {
  const categories = new Set<ModuleCategory>();
  Object.values(MODULE_CONFIGS).forEach((config) => {
    categories.add(config.category);
  });
  return Array.from(categories);
}

/**
 * Get default enabled module IDs
 */
export function getDefaultEnabledModules(): string[] {
  return Object.values(MODULE_CONFIGS)
    .filter((config) => config.enabledByDefault)
    .map((config) => config.id);
}

/**
 * Get core module IDs (cannot be disabled)
 */
export function getCoreModules(): string[] {
  return Object.values(MODULE_CONFIGS)
    .filter((config) => config.isCore)
    .map((config) => config.id);
}

/**
 * Validate module dependencies
 * Returns array of missing dependency module IDs
 */
export function validateDependencies(
  moduleId: string,
  enabledModules: string[]
): string[] {
  const config = MODULE_CONFIGS[moduleId];
  if (!config || !config.dependencies) return [];
  
  return config.dependencies.filter(
    (depId) => !enabledModules.includes(depId)
  );
}

/**
 * Get all dependencies for a module (including nested)
 */
export function getAllDependencies(moduleId: string): string[] {
  const config = MODULE_CONFIGS[moduleId];
  if (!config || !config.dependencies) return [];
  
  const allDeps = new Set<string>();
  
  function collectDependencies(depId: string) {
    if (allDeps.has(depId)) return;
    allDeps.add(depId);
    
    const depConfig = MODULE_CONFIGS[depId];
    if (depConfig?.dependencies) {
      depConfig.dependencies.forEach((nestedDepId) => {
        collectDependencies(nestedDepId);
      });
    }
  }
  
  config.dependencies.forEach(collectDependencies);
  return Array.from(allDeps);
}

// Export types
export type { ModuleConfig, UserRole, ModuleCategory } from '../types/module.types';
