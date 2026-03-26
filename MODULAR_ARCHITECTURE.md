# Modular Architecture Guide

## Overview

Ayekta EMR now features a **modular architecture** that allows NGOs to customize which clinical modules are enabled per deployment. This enables:

- **Smaller initial bundle sizes** - Modules are lazy-loaded on demand
- **Customizable workflows** - Enable only what your mission needs
- **Role-based access** - Different views for surgeons, nurses, and admins
- **Mission-specific configurations** - Different setups for different surgical camps

---

## Core Concepts

### Module Registry

All modules are registered in `src/utils/moduleRegistry.ts` with:
- Unique ID
- Display name and description
- Category (core, preoperative, intraoperative, postoperative, optional)
- Role-based access control
- Dependencies on other modules
- Display order

### Module Categories

| Category | Description | Can Disable? |
|----------|-------------|--------------|
| **Core** | Essential modules (Demographics, Triage) | ❌ No |
| **Preoperative** | Pre-op assessment and planning | ✅ Yes |
| **Intraoperative** | OR and anesthesia documentation | ✅ Yes |
| **Postoperative** | Recovery and discharge | ✅ Yes |
| **Optional** | Additional features | ✅ Yes |

### User Roles

| Role | Access Level |
|------|--------------|
| **Surgeon** | Full surgical modules and patient records |
| **Nurse** | Nursing modules, vitals, medications |
| **Anesthesiologist** | Anesthesia and perioperative modules |
| **Admin** | Full system access + configuration |

---

## File Structure

```
src/
├── types/
│   └── module.types.ts          # Type definitions for modules
├── utils/
│   └── moduleRegistry.ts        # Module registry & utilities
├── store/
│   └── moduleManagementStore.ts # Zustand store for module state
├── hooks/
│   └── useModules.ts            # React hooks for module system
├── components/
│   ├── settings/
│   │   ├── Settings.tsx         # Main settings page
│   │   └── ModuleConfiguration.tsx # Module toggle UI
│   ├── shared/
│   │   └── LazyModuleLoader.tsx # Lazy loading wrapper
│   └── layout/
│       └── TabNavigation.tsx    # Dynamic tab generation
└── App.tsx                       # Updated with routing
```

---

## How It Works

### 1. Module Registration

Each module is defined with metadata:

```typescript
'surgical-needs': {
  id: 'surgical-needs',
  name: 'Surgical Needs',
  description: 'Procedure planning and hernia scoring',
  category: 'preoperative',
  tabName: 'surgical-needs',
  enabledByDefault: true,
  allowedRoles: ['surgeon', 'nurse'],
  requiresPatient: true,
  dependencies: ['demographics', 'triage'],
  icon: 'Stethoscope',
  order: 3,
  isCore: false,
}
```

### 2. Lazy Loading

Modules are loaded on-demand using React.lazy():

```typescript
const MODULE_COMPONENTS: Record<string, LazyExoticComponent> = {
  'demographics': lazy(() => import('../components/modules/Demographics')),
  'triage': lazy(() => import('../components/modules/Triage')),
  // ... etc
};
```

### 3. Dynamic Navigation

TabNavigation only shows enabled modules:

```typescript
const { modules } = useModules();

const visibleTabs = modules.filter(
  (module) => module.tabName && tabLabels[module.tabName]
);
```

### 4. State Persistence

Module preferences are saved to IndexedDB:
- Enabled/disabled state
- Custom module order
- Favorite modules
- Active mission

---

## User Guide

### Accessing Settings

1. Click the **⚙️ Settings** button in the header
2. Navigate between tabs:
   - **Modules** - Enable/disable clinical modules
   - **Roles** - Switch user role
   - **Missions** - Manage surgical camps

### Configuring Modules

1. Go to **Settings > Modules**
2. Expand a category (Core, Preoperative, etc.)
3. Toggle modules on/off using the switch
4. Dependencies are auto-enabled
5. Core modules cannot be disabled

### Switching Roles

1. Go to **Settings > Roles**
2. Select your role:
   - Surgeon
   - Nurse
   - Anesthesiologist
   - Admin
3. Navigation updates automatically

### Managing Missions

1. Go to **Settings > Missions**
2. Click **+ New Mission**
3. Enter mission details:
   - Name (e.g., "Ghana 2026 Q1")
   - Location
   - Dates
   - Team lead
   - Local partners
4. Click **Create Mission**
5. Activate missions with one click

---

## Developer Guide

### Adding a New Module

1. **Create the module component** in `src/components/modules/`

2. **Add type definition** in `src/types/patient.types.ts`:
   ```typescript
   export interface NewModuleData {
     // fields...
   }
   ```

3. **Add to Zustand store** in `src/store/patientStore.ts`:
   ```typescript
   const initialNewModule: NewModuleData = { ... };
   updateNewModule: (data: Partial<NewModuleData>) => ...
   ```

4. **Register in module registry** (`src/utils/moduleRegistry.ts`):
   ```typescript
   'new-module': {
     id: 'new-module',
     name: 'New Module',
     // ... config
   }
   ```

5. **Add lazy import**:
   ```typescript
   'new-module': lazy(() => import('../components/modules/NewModule')),
   ```

6. **Add to TabNavigation labels**:
   ```typescript
   'new-module': 'Display Name',
   ```

### Using Module Hooks

```typescript
import { useModules, useUserRole, useMissions } from '../hooks/useModules';

function MyComponent() {
  const { modules, isModuleEnabled, toggleModule } = useModules();
  const { currentRole, setRole } = useUserRole();
  const { activeMission, missions } = useMissions();
  
  // Use in your component...
}
```

### Checking Module Access

```typescript
import { canAccessModule, getModuleConfig } from '../utils/moduleRegistry';

if (canAccessModule('operative-note', 'surgeon')) {
  // Show surgeon-specific content
}

const config = getModuleConfig('consent');
if (config?.isCore) {
  // Handle core module
}
```

---

## API Reference

### useModules Hook

```typescript
const {
  // State
  modules,              // Enabled module configs
  allModules,           // All available modules
  favorites,            // Favorite module IDs
  currentRole,          // Current user role
  isLoading,            // Loading state
  isInitialized,        // Initialization complete
  
  // Actions
  enableModule,         // Enable a module
  disableModule,        // Disable a module
  toggleModule,         // Toggle on/off
  toggleFavorite,       // Add/remove favorite
  
  // Utilities
  isModuleEnabled,      // Check if enabled
  isFavorite,           // Check if favorite
  canAccessModule,      // Check role access
  getMissingDependencies, // Get required deps
  getModuleComponent,   // Get lazy component
  getModulesByCategory, // Filter by category
} = useModules();
```

### useUserRole Hook

```typescript
const {
  currentRole,          // Current role ID
  setRole,              // Change role
  roleName,             // Display name
  roleDescription,      // Role description
} = useUserRole();
```

### useMissions Hook

```typescript
const {
  currentMission,       // Active mission
  missions,             // All missions
  activeMission,        // Currently active
  createMission,        // Create new
  updateMission,        // Update existing
  deleteMission,        // Delete
  setActiveMission,     // Switch active
  
  // Utilities
  isMissionActive,      // Check if active
  getMissionStats,      // Get statistics
} = useMissions();
```

---

## Best Practices

### For NGOs

1. **Start with defaults** - Default configuration works for most missions
2. **Disable unused modules** - Reduces confusion for users
3. **Use missions** - Group patients by surgical camp
4. **Set appropriate roles** - Match user's clinical role

### For Developers

1. **Always lazy load** - Never import modules directly
2. **Respect dependencies** - Enable required modules first
3. **Test role access** - Verify each role sees correct modules
4. **Handle loading states** - Show spinners during lazy load
5. **Preserve data** - Disabling modules doesn't delete data

---

## Troubleshooting

### Module not showing in navigation

1. Check if module is enabled in Settings
2. Verify role has access to module
3. Check module dependencies are met
4. Clear browser cache and reload

### "Module not found" error

1. Verify module is registered in moduleRegistry.ts
2. Check lazy import path is correct
3. Ensure module component exports default

### Changes not persisting

1. Check IndexedDB storage in browser dev tools
2. Verify savePreferences() is called
3. Clear storage and reconfigure

### Role switch not updating UI

1. Verify setRole() is called
2. Check canAccessModule() for new role
3. Reload page if needed

---

## Migration Guide

### From Previous Version

If upgrading from the non-modular version:

1. **All modules enabled by default** - No functionality lost
2. **Data preserved** - All patient data remains intact
3. **UI unchanged** - Same tabs, same workflow
4. **New features opt-in** - Settings, missions, roles

### Future Updates

The modular architecture enables:
- Plugin system (Phase 7)
- Multi-language support (Phase 4)
- Advanced reporting (Phase 2)
- Vital signs trending (Phase 3)

---

## Support

For issues or questions:
- Check this documentation first
- Review module configuration in Settings
- Contact your mission administrator
- File GitHub issue for bugs

---

**Built with ❤️ for surgical NGOs worldwide**
