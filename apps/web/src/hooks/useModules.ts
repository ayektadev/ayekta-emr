/**
 * Module Management Hooks
 * 
 * React hooks for working with the module registry and management system.
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useModuleManagement } from '../store/moduleManagementStore';
import { MODULE_REGISTRY, getModuleConfig } from '../utils/moduleRegistry';
import type { ModuleConfig, UserRole } from '../types/module.types';

/**
 * Hook to manage module loading and access
 */
export function useModules() {
  const {
    enabledModules,
    moduleOrder,
    favorites,
    currentRole,
    isLoading,
    isInitialized,
    enableModule,
    disableModule,
    toggleModule,
    toggleFavorite,
    canAccessModule,
    getMissingDependencies,
  } = useModuleManagement();

  // Get all enabled module configs, sorted by order
  const enabledModuleConfigs = useMemo(() => {
    return Object.values(MODULE_REGISTRY)
      .filter((module) => enabledModules[module.config.id])
      .filter((module) => canAccessModule(module.config.id))
      .sort(
        (a, b) =>
          moduleOrder.indexOf(a.config.id) - moduleOrder.indexOf(b.config.id)
      )
      .map((module) => module.config);
  }, [enabledModules, moduleOrder, currentRole]);

  // Get all available modules (for settings page)
  const allModuleConfigs = useMemo(() => {
    return Object.values(MODULE_REGISTRY)
      .map((module) => module.config)
      .sort((a, b) => a.order - b.order);
  }, []);

  // Get modules by category
  const getModulesByCategory = useCallback(
    (category: string) => {
      return enabledModuleConfigs.filter(
        (config) => config.category === category
      );
    },
    [enabledModuleConfigs]
  );

  // Check if module is enabled
  const isModuleEnabled = useCallback(
    (moduleId: string) => {
      return enabledModules[moduleId] === true;
    },
    [enabledModules]
  );

  // Check if module is favorite
  const isFavorite = useCallback(
    (moduleId: string) => {
      return favorites.includes(moduleId);
    },
    [favorites]
  );

  // Get module component by ID
  const getModuleComponent = useCallback(
    (moduleId: string) => {
      const module = MODULE_REGISTRY[moduleId];
      if (!module) {
        console.warn(`Module "${moduleId}" not found in registry`);
        return null;
      }
      return module.component;
    },
    []
  );

  return {
    // State
    modules: enabledModuleConfigs,
    allModules: allModuleConfigs,
    favorites,
    currentRole,
    isLoading,
    isInitialized,

    // Actions
    enableModule,
    disableModule,
    toggleModule,
    toggleFavorite,

    // Utilities
    isModuleEnabled,
    isFavorite,
    canAccessModule,
    getMissingDependencies,
    getModuleComponent,
    getModulesByCategory,
    getModuleConfig,
  };
}

/**
 * Hook to manage user roles
 */
export function useUserRole() {
  const { currentRole, setRole } = useModuleManagement();

  const roleLabels: Record<UserRole | 'all', string> = {
    surgeon: 'Surgeon',
    nurse: 'Nurse',
    admin: 'Administrator',
    anesthesiologist: 'Anesthesiologist',
    all: 'All Users',
  };

  const roleDescriptions: Record<UserRole | 'all', string> = {
    surgeon: 'Full access to surgical modules and patient records',
    nurse: 'Access to nursing modules and patient vitals',
    admin: 'Full system access including user and mission management',
    anesthesiologist: 'Access to anesthesia and perioperative modules',
    all: 'Access to all modules',
  };

  return {
    currentRole,
    setRole,
    roleName: roleLabels[currentRole],
    roleDescription: roleDescriptions[currentRole],
  };
}

/**
 * Hook to manage missions
 */
export function useMissions() {
  const {
    currentMission,
    missions,
    createMission,
    updateMission,
    deleteMission,
    setActiveMission,
  } = useModuleManagement();

  const activeMission = useMemo(() => {
    return missions.find((m) => m.isActive) || null;
  }, [missions]);

  const isMissionActive = useCallback(
    (missionId: string) => {
      return activeMission?.id === missionId;
    },
    [activeMission]
  );

  const getMissionStats = useCallback((missionId: string) => {
    void missionId; // TODO: patient counting per mission
    return {
      patientCount: 0,
      completedCount: 0,
      upcomingCount: 0,
    };
  }, []);

  return {
    // State
    currentMission,
    missions,
    activeMission,

    // Actions
    createMission,
    updateMission,
    deleteMission,
    setActiveMission,

    // Utilities
    isMissionActive,
    getMissionStats,
  };
}

/**
 * Hook to initialize module system on app mount
 */
export function useModuleInitialization() {
  const { loadPreferences, isLoading, isInitialized } = useModuleManagement();

  useEffect(() => {
    if (!isInitialized) {
      loadPreferences();
    }
  }, [isInitialized]);

  return {
    isInitializing: isLoading || !isInitialized,
    isReady: isInitialized && !isLoading,
  };
}

/**
 * Hook to get module component with error handling
 */
export function useModuleComponent(moduleId: string) {
  const { isModuleEnabled, canAccessModule, getModuleComponent } = useModules();

  const enabled = isModuleEnabled(moduleId);
  const accessible = canAccessModule(moduleId);
  const Component = getModuleComponent(moduleId);

  return {
    Component,
    isEnabled: enabled,
    isAccessible: accessible,
    isReady: enabled && accessible && Component !== null,
  };
}

/**
 * Hook for module settings page
 */
export function useModuleSettings() {
  const {
    enabledModules,
    toggleModule,
    toggleFavorite,
    resetToDefaults,
    getMissingDependencies,
  } = useModuleManagement();

  const allModules = useMemo(() => {
    return Object.values(MODULE_REGISTRY)
      .map((module) => module.config)
      .sort((a, b) => a.order - b.order);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allModules.forEach((module: { category: string }) => cats.add(module.category));
    return Array.from(cats);
  }, [allModules]);

  const modulesByCategory = useMemo(() => {
    const result: Record<string, ModuleConfig[]> = {};
    categories.forEach((category) => {
      result[category] = allModules.filter(
        (module: { category: string }) => module.category === category
      );
    });
    return result;
  }, [allModules, categories]);

  return {
    // State
    modules: modulesByCategory,
    categories,
    enabledCount: Object.keys(enabledModules).length,
    totalCount: allModules.length,

    // Actions
    toggleModule,
    toggleFavorite,
    resetToDefaults,

    // Utilities
    getMissingDependencies,
  };
}
