/**
 * Module Registry Types
 * 
 * Defines the structure for dynamically loadable modules in Ayekta EMR.
 * Enables NGOs to customize which modules are active per deployment.
 */

/**
 * Module categories for organization and filtering
 */
export type ModuleCategory = 
  | 'core'           // Always enabled, essential for any deployment
  | 'preoperative'   // Pre-op assessment and planning
  | 'intraoperative' // OR and anesthesia
  | 'postoperative'  // PACU, floor, recovery
  | 'administrative' // Patient management, reporting
  | 'optional'       // Nice-to-have features;


/**
 * User roles that can access modules
 */
export type UserRole = 'surgeon' | 'nurse' | 'admin' | 'anesthesiologist' | 'all';

/**
 * Module configuration
 */
export interface ModuleConfig {
  /** Unique module identifier */
  id: string;
  
  /** Display name for UI */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Module category */
  category: ModuleCategory;
  
  /** Tab name (matches patient.types.ts TabName) */
  tabName?: string;
  
  /** Whether module is enabled by default */
  enabledByDefault: boolean;
  
  /** Which roles can access this module */
  allowedRoles: UserRole[];
  
  /** Whether module requires patient context */
  requiresPatient: boolean;
  
  /** Module dependencies (other module IDs that must be enabled) */
  dependencies?: string[];
  
  /** Icon name (from lucide-react) */
  icon: string;
  
  /** Order in navigation (lower = first) */
  order: number;
  
  /** Whether module is a core module (cannot be disabled) */
  isCore: boolean;
}

/**
 * Lazy-loaded module component
 */
export interface LazyModule {
  /** Module configuration */
  config: ModuleConfig;
  
  /** Lazy-loaded React component */
  component: React.LazyExoticComponent<React.ComponentType>;
}

/**
 * Module registry - maps module IDs to their configurations and components
 */
export type ModuleRegistry = Record<string, LazyModule>;

/**
 * User preferences for module visibility and order
 */
export interface ModulePreferences {
  /** Map of module ID to enabled state */
  enabledModules: Record<string, boolean>;
  
  /** Custom module order (module IDs in preferred order) */
  moduleOrder?: string[];
  
  /** Favorite modules (quick access) */
  favorites?: string[];
}

/**
 * Mission/Camp configuration
 */
export interface MissionConfig {
  /** Unique mission identifier */
  id: string;
  
  /** Mission name (e.g., "Ghana 2026 Q1") */
  name: string;
  
  /** Location */
  location: string;
  
  /** Start date */
  startDate: string;
  
  /** End date */
  endDate: string;
  
  /** Visiting team lead */
  teamLead: string;
  
  /** Local partners */
  localPartners: string[];
  
  /** Module overrides for this mission */
  modulePreferences?: ModulePreferences;
  
  /** Custom fields for this mission */
  customFields?: Record<string, any>;
  
  /** Whether mission is active */
  isActive: boolean;
  
  /** Date mission was created */
  createdAt: string;
}

/**
 * User role configuration
 */
export interface RoleConfig {
  /** Role identifier */
  id: UserRole;
  
  /** Display name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Modules this role can access */
  accessibleModules: string[];
  
  /** Default modules shown for this role */
  defaultModules: string[];
  
  /** Whether role can manage other users */
  canManageUsers: boolean;
  
  /** Whether role can export data */
  canExportData: boolean;
  
  /** Whether role can manage missions */
  canManageMissions: boolean;
}
