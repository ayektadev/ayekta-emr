/**
 * Module Management Store
 * 
 * Zustand store for managing module preferences, enabled state,
 * and user role configuration.
 */

import { create } from 'zustand';
import type {
  ModulePreferences,
  ModuleConfig,
  UserRole,
  MissionConfig,
} from '../types/module.types';
import { getAyektaDB, KV } from '../db/dexie/database';
import {
  MODULE_REGISTRY,
  getDefaultEnabledModules,
  validateDependencies,
  getAllDependencies,
} from '../utils/moduleRegistry';

// ============================================================================
// STORE TYPES
// ============================================================================

interface ModuleManagementState {
  // Module state
  enabledModules: Record<string, boolean>;
  moduleOrder: string[];
  favorites: string[];
  
  // User role
  currentRole: UserRole;
  
  // Mission state
  currentMission: MissionConfig | null;
  missions: MissionConfig[];
  
  // Loading state
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions - Module Management
  enableModule: (moduleId: string) => void;
  disableModule: (moduleId: string) => void;
  toggleModule: (moduleId: string) => void;
  setModuleOrder: (order: string[]) => void;
  toggleFavorite: (moduleId: string) => void;
  resetToDefaults: () => void;
  
  // Actions - Role Management
  setRole: (role: UserRole) => void;
  
  // Actions - Mission Management
  createMission: (mission: Omit<MissionConfig, 'id' | 'createdAt' | 'isActive'>) => void;
  updateMission: (id: string, updates: Partial<MissionConfig>) => void;
  deleteMission: (id: string) => void;
  setActiveMission: (id: string | null) => void;
  getCurrentMission: () => MissionConfig | null;
  
  // Actions - Persistence
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
  
  // Utilities
  getEnabledModuleConfigs: () => ModuleConfig[];
  canAccessModule: (moduleId: string) => boolean;
  getMissingDependencies: (moduleId: string) => string[];
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const getDefaultState = () => {
  const defaultEnabled = getDefaultEnabledModules();
  const enabledModules: Record<string, boolean> = {};
  
  defaultEnabled.forEach((moduleId) => {
    enabledModules[moduleId] = true;
  });
  
  return {
    enabledModules,
    moduleOrder: defaultEnabled,
    favorites: [] as string[],
    currentRole: 'surgeon' as UserRole,
    currentMission: null as MissionConfig | null,
    missions: [] as MissionConfig[],
    isLoading: false,
    isInitialized: false,
  };
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useModuleManagement = create<ModuleManagementState>((set, get) => ({
  ...getDefaultState(),
  
  // ============================================================================
  // MODULE MANAGEMENT ACTIONS
  // ============================================================================
  
  enableModule: (moduleId: string) => {
    const config = MODULE_REGISTRY[moduleId]?.config;
    if (!config) return;
    
    // Get all dependencies and enable them
    const dependencies = getAllDependencies(moduleId);
    
    set((state) => {
      const newEnabledModules = { ...state.enabledModules };
      
      // Enable the module
      newEnabledModules[moduleId] = true;
      
      // Enable all dependencies
      dependencies.forEach((depId) => {
        newEnabledModules[depId] = true;
      });
      
      // Add to order if not present
      const newOrder = [...state.moduleOrder];
      if (!newOrder.includes(moduleId)) {
        const configOrder = MODULE_REGISTRY[moduleId]?.config.order || 999;
        const insertIndex = newOrder.findIndex(
          (id) => (MODULE_REGISTRY[id]?.config.order || 999) > configOrder
        );
        if (insertIndex === -1) {
          newOrder.push(moduleId);
        } else {
          newOrder.splice(insertIndex, 0, moduleId);
        }
      }
      
      return { enabledModules: newEnabledModules, moduleOrder: newOrder };
    });
    
    // Auto-save
    get().savePreferences();
  },
  
  disableModule: (moduleId: string) => {
    const config = MODULE_REGISTRY[moduleId]?.config;
    if (!config || config.isCore) return; // Can't disable core modules
    
    set((state) => {
      const newEnabledModules = { ...state.enabledModules };
      delete newEnabledModules[moduleId];
      
      return { enabledModules: newEnabledModules };
    });
    
    // Auto-save
    get().savePreferences();
  },
  
  toggleModule: (moduleId: string) => {
    const { enabledModules } = get();
    if (enabledModules[moduleId]) {
      get().disableModule(moduleId);
    } else {
      get().enableModule(moduleId);
    }
  },
  
  setModuleOrder: (order: string[]) => {
    set({ moduleOrder: order });
    get().savePreferences();
  },
  
  toggleFavorite: (moduleId: string) => {
    set((state) => {
      const newFavorites = state.favorites.includes(moduleId)
        ? state.favorites.filter((id) => id !== moduleId)
        : [...state.favorites, moduleId];
      
      return { favorites: newFavorites };
    });
    get().savePreferences();
  },
  
  resetToDefaults: () => {
    set(getDefaultState());
    get().savePreferences();
  },
  
  // ============================================================================
  // ROLE MANAGEMENT ACTIONS
  // ============================================================================
  
  setRole: (role: UserRole) => {
    set({ currentRole: role });
    get().savePreferences();
  },
  
  // ============================================================================
  // MISSION MANAGEMENT ACTIONS
  // ============================================================================
  
  createMission: (missionData: Omit<MissionConfig, 'id' | 'createdAt' | 'isActive'>) => {
    const id = `mission_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newMission: MissionConfig = {
      ...missionData,
      id,
      createdAt: now,
      isActive: true,
    };
    
    set((state) => {
      // Deactivate all other missions
      const updatedMissions = state.missions.map((m) => ({
        ...m,
        isActive: m.id === id ? true : false,
      }));
      
      return {
        missions: [...updatedMissions, newMission],
        currentMission: newMission,
      };
    });
    
    // Save missions
    get().savePreferences();
  },
  
  updateMission: (id: string, updates: Partial<MissionConfig>) => {
    set((state) => {
      const updatedMissions = state.missions.map((mission) =>
        mission.id === id ? { ...mission, ...updates } : mission
      );
      
      const currentMission =
        state.currentMission?.id === id
          ? { ...state.currentMission, ...updates }
          : state.currentMission;
      
      return {
        missions: updatedMissions,
        currentMission,
      };
    });
    get().savePreferences();
  },
  
  deleteMission: (id: string) => {
    set((state) => {
      const updatedMissions = state.missions.filter((m) => m.id !== id);
      const currentMission =
        state.currentMission?.id === id ? null : state.currentMission;
      
      return {
        missions: updatedMissions,
        currentMission,
      };
    });
    get().savePreferences();
  },
  
  setActiveMission: (id: string | null) => {
    set((state) => {
      const updatedMissions = state.missions.map((mission) => ({
        ...mission,
        isActive: mission.id === id,
      }));
      
      const currentMission =
        id === null
          ? null
          : updatedMissions.find((m) => m.id === id) || null;
      
      return {
        missions: updatedMissions,
        currentMission,
      };
    });
    get().savePreferences();
  },
  
  getCurrentMission: () => {
    return get().currentMission;
  },
  
  // ============================================================================
  // PERSISTENCE ACTIONS
  // ============================================================================
  
  loadPreferences: async () => {
    set({ isLoading: true });
    
    try {
      const db = getAyektaDB();
      const preferencesRow = await db.keyValue.get(KV.modulePreferences);
      const missionsRow = await db.keyValue.get(KV.missions);
      const activeMissionRow = await db.keyValue.get(KV.activeMissionId);

      const preferences = preferencesRow?.v as ModulePreferences | undefined;
      const missions = missionsRow?.v as MissionConfig[] | undefined;
      const activeMissionId = activeMissionRow?.v as string | undefined;
      
      if (preferences) {
        set({
          enabledModules: preferences.enabledModules,
          moduleOrder: preferences.moduleOrder || get().moduleOrder,
          favorites: preferences.favorites || [],
        });
      }
      
      if (missions && missions.length > 0) {
        set({ missions });
        
        if (activeMissionId) {
          const activeMission = missions.find((m) => m.id === activeMissionId);
          if (activeMission) {
            set({ currentMission: activeMission });
          }
        }
      }
      
      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      console.error('Failed to load module preferences:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },
  
  savePreferences: async () => {
    const state = get();
    
    try {
      const db = getAyektaDB();
      const preferences: ModulePreferences = {
        enabledModules: state.enabledModules,
        moduleOrder: state.moduleOrder,
        favorites: state.favorites,
      };
      
      await db.keyValue.put({ k: KV.modulePreferences, v: preferences });
      await db.keyValue.put({ k: KV.missions, v: state.missions });
      
      if (state.currentMission) {
        await db.keyValue.put({
          k: KV.activeMissionId,
          v: state.currentMission.id,
        });
      }
    } catch (error) {
      console.error('Failed to save module preferences:', error);
    }
  },
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  getEnabledModuleConfigs: () => {
    const { enabledModules, moduleOrder } = get();
    
    return Object.values(MODULE_REGISTRY)
      .filter((module) => enabledModules[module.config.id])
      .sort(
        (a, b) =>
          moduleOrder.indexOf(a.config.id) - moduleOrder.indexOf(b.config.id)
      )
      .map((module) => module.config);
  },
  
  canAccessModule: (moduleId: string) => {
    const { currentRole } = get();
    const config = MODULE_REGISTRY[moduleId]?.config;
    
    if (!config) return false;
    
    return (
      config.allowedRoles.includes('all') ||
      config.allowedRoles.includes(currentRole)
    );
  },
  
  getMissingDependencies: (moduleId: string) => {
    const { enabledModules } = get();
    return validateDependencies(moduleId, Object.keys(enabledModules));
  },
}));
