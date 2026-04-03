# Ayekta EMR - React Migration

> Offline-first Electronic Medical Records System (v5.24)

## 📋 Overview

Ayekta EMR is a modular, offline-first electronic medical records system custom-built for ISHI. This React version maintains 100% feature parity with the original HTML implementation while providing a modern, maintainable codebase.

## ✨ Features

- **100% Offline Capability** - Works without internet connection
- **PWA Support** - Installable on mobile and desktop
- **9 Clinical Modules**:
  - Demographics
  - Triage
  - Surgical Needs Assessment
  - Consent Forms
  - Medications Management
  - Laboratory Tests
  - Imaging Studies
  - Operative Notes
  - Discharge Planning

- **Data Management**:
  - Export patient data as JSON
  - Import existing patient files
  - IndexedDB persistence
  - Automatic age calculation
  - ISHI ID generation

- **Print Functions**:
  - Consent form printing
  - Discharge summary PDF generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### First Launch

1. Open `http://localhost:5173` (or your dev server URL)
2. Sign in with mock accounts: `surgeon` / `surgeon`, `nurse` / `nurse`, or `admin` / `admin`
3. From **Dashboard**, start a new chart, import JSON, or continue an autosaved draft
4. Clinical modules live under **Chart** in the sidebar

## 📁 Project Structure

```
ayekta-emr/
├── apps/web/                 # Vite React PWA
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── packages/shared-types/    # Tenant, roles, routes, domain stubs
├── docs/v2/                  # Postgres + FHIR drafts (Phase 1)
└── package.json              # npm workspaces (root scripts)
```

## 🏗️ Architecture

### Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Validation**: Zod
- **Storage**: Dexie (IndexedDB) + legacy localforage one-shot migration
- **PDF Generation**: jsPDF
- **PWA**: vite-plugin-pwa
- **Styling**: Tailwind CSS + Legacy CSS

### State Management

All patient data is managed through Zustand store (`src/store/patientStore.ts`):

```typescript
import { usePatientStore } from './store/patientStore';

function Component() {
  const demographics = usePatientStore((state) => state.demographics);
  const updateDemographics = usePatientStore((state) => state.updateDemographics);
  
  // Update demographics
  updateDemographics({ firstName: 'John', lastName: 'Doe' });
}
```

### Data Persistence

- **IndexedDB**: Automatic background saving via localForage
- **JSON Export**: Manual export via "Save Patient" button
- **JSON Import**: Load existing patient files via "Existing Patient"

## 🎨 Design System

### Colors

```css
--ayekta-orange: #ef4826   /* Primary accent */
--ayekta-border: #bdbdbd   /* Borders */
--ayekta-muted: #666       /* Muted text */
--ayekta-tab: #f3f3f3      /* Tab background */
```

### Typography

- Font Family: `ui-monospace, Menlo, Consolas, monospace`
- Line Height: `1.35`

### Key UI Patterns

- **Form Grid**: Responsive grid with `minmax(200px, 1fr)`
- **Accordions**: Collapsible sections for medications, labs
- **Sticky Tabs**: Navigation remains visible while scrolling
- **Orange Focus**: All inputs highlight with Ayekta orange on focus

## 📊 Clinical Modules

### Demographics
Patient identification, contact information, medical history

### Triage
Vital signs, chief complaint, physical examination

### Surgical Needs
Procedure assessment with conditional hernia scoring

### Consent
Comprehensive surgical consent with all required checkboxes

### Medications
- Current medications
- Allergies
- PRN medications
- Pre-op medications

### Labs
Order and track laboratory tests with results

### Imaging
Order and track imaging studies with findings

### Operative Note
Complete surgical documentation

### Discharge
Discharge instructions, follow-up, discharge medications

## 🔒 Data Security

- All data stored locally (IndexedDB)
- No server transmission
- Offline-first architecture
- Patient files encrypted at OS level

## 🖨️ Print Functions

### Consent Form
```typescript
window.print(); // Browser print with CSS media query
```

### Discharge Summary
```typescript
import { generateDischargePDF } from './utils/discharge-pdf';

generateDischargePDF(patientData);
```

## 🧪 Development

### Key Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding a New Field

1. Update types in `src/types/patient.types.ts`
2. Update store in `src/store/patientStore.ts`
3. Add field to relevant module component
4. Update validation if needed

### Code Style

- TypeScript strict mode enabled
- ESLint + TypeScript rules
- Functional components with hooks
- Descriptive variable names
- Comments for complex logic

## 📱 PWA Installation

### Desktop
1. Click install icon in browser address bar
2. App runs in standalone window

### Mobile
1. Add to Home Screen from browser menu
2. App runs full-screen

## 🐛 Troubleshooting

### App won't load
- Clear browser cache and reload
- Check browser console for errors
- Verify Node.js version (18+)

### Data not saving
- Check IndexedDB storage quota
- Clear storage and try again
- Check browser console for errors

### Print not working
- Ensure browser print dialog shows
- Check print preview
- Try different browser

## 📝 Version History

- **v5.24** - React migration with full feature parity
- **v5.24aa** - Original HTML version with JSON import/export

## 🤝 Contributing

This is a custom-built system for ISHI. For modifications:

1. Test thoroughly with existing patient files
2. Maintain backward compatibility with JSON format
3. Preserve visual design and UX patterns
4. Update documentation

## 📄 License

Custom-built for ISHI Medical Services

## 🙏 Acknowledgments

- Original design: ISHI Medical Team
- React migration: Complete feature preservation
- Built with modern web standards for offline reliability

---

**Custom built for ISHI — v5.24**
