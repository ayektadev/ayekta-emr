# Clinical Feedback — Implementation Specification

**Source**: Clinical Design Partner Feedback
**Date**: 2026-03-01
**Status**: Draft — Awaiting Prioritization

---

## Overview

This document maps each piece of clinical feedback to the specific files, types, and UI changes required to implement it. Each change is assessed for scope, complexity, and impact on existing data structures.

---

## 1. Patient Information → Blood Transfusion History

**Feedback**: Under Blood Group, add a question asking whether the patient has ever received a blood transfusion.

### Current State
`Demographics.tsx` has a `bloodGroup` field (string) inside the `Demographics` type in `patient.types.ts`. There is no transfusion history field.

### Proposed Changes

**`src/types/patient.types.ts`** — `Demographics` interface
Add two fields:
```ts
bloodTransfusionHistory: boolean;       // yes/no toggle
bloodTransfusionDetails: string;        // conditional free-text if yes
```

**`src/components/modules/Demographics.tsx`**
Below the Blood Group input, add:
- A labeled yes/no radio or checkbox: *"Has the patient ever received a blood transfusion?"*
- If **Yes**, reveal a conditional textarea: *"Please describe (when, reason, any reactions)"*
- Use `watch('bloodTransfusionHistory')` from React Hook Form to conditionally render the detail field.

**`src/store/patientStore.ts`**
The `updateDemographics` action already accepts a `Partial<Demographics>`, so no store changes needed — just ensure defaults are added.

**Default values**:
```ts
bloodTransfusionHistory: false,
bloodTransfusionDetails: '',
```

**Complexity**: Low — 2 new fields, conditional render, no breaking changes.

---

## 2. Patient Information → MET Score for Anesthesia Clearance

**Feedback**: In Common Medical History, add a line to calculate the patient's Metabolic Equivalent of Task (METs) score to determine if they can be cleared for anesthesia without preoperative testing.

### Background
The Duke Activity Status Index (DASI) or a simplified MET estimation is used pre-operatively. A score ≥ 4 METs generally indicates adequate functional capacity for clearance without further cardiac workup (per ACC/AHA guidelines).

### Proposed Changes

**`src/types/patient.types.ts`** — `Demographics` interface
Add:
```ts
metActivities: {
  selfCare: boolean;           // Can dress/bathe/use toilet? (1 MET)
  walkIndoors: boolean;        // Walk indoors around the house? (1 MET)
  walkFlat: boolean;           // Walk 1-2 blocks on flat ground? (2 METs)
  lightHousework: boolean;     // Light housework (dusting, washing dishes)? (2 METs)
  climbStairs: boolean;        // Climb a flight of stairs or walk up a hill? (4 METs)
  runShortDistance: boolean;   // Run a short distance? (4 METs)
  heavyHousework: boolean;     // Heavy housework (scrubbing floors, moving furniture)? (4 METs)
  moderateRecreation: boolean; // Moderate recreational activities (golf, bowling, dancing)? (4 METs)
  strenuousSports: boolean;    // Strenuous sports (swimming, singles tennis, football)? (8 METs)
};
metScore: number;              // Calculated, stored for PDF display
```

**`src/utils/calculations.ts`**
Add `calculateMETs(activities: MetActivities): number` function:
```ts
// Simplified MET scoring (each activity represents minimum MET level achieved)
// Returns highest MET level the patient can perform
export function calculateMETs(activities: MetActivities): number {
  if (activities.strenuousSports) return 8;
  if (activities.heavyHousework || activities.moderateRecreation ||
      activities.climbStairs || activities.runShortDistance) return 4;
  if (activities.lightHousework || activities.walkFlat) return 2;
  if (activities.selfCare || activities.walkIndoors) return 1;
  return 0;
}
```

**`src/components/modules/Demographics.tsx`**
In the Medical History section, add a new "Functional Capacity (METs)" subsection:
- Brief instruction: *"Check all activities the patient can perform without chest pain or shortness of breath:"*
- Checklist of activities (organized low → high METs)
- Auto-calculated result displayed as: **"Estimated METs: X"**
- Interpretation banner:
  - `< 4 METs` → amber warning: *"Poor functional capacity — consider preoperative cardiac workup"*
  - `≥ 4 METs` → green: *"Adequate functional capacity — may proceed without additional preop cardiac testing"*
  - `0` → gray: *"No activities selected"*

**Placement options** (choose one — recommend A):
- **A) Demographics tab** — Keeps all patient background data together; quickest to access.
- **B) Pre-Anesthesia Evaluation tab** — Logically tied to anesthesia clearance workflow; anesthesiologist completes it. The `PreAnesthesia` type would receive the MET fields instead.
- **C) Both** — Demographics stores the raw checklist; Pre-Anesthesia displays the computed result read-only.

**Complexity**: Medium — new calculation utility, checklist UI, conditional indicator. No breaking changes.

---

## 3. Triage → Structured Physical Examination

**Feedback**: Add system sections to prompt surgeons to document a full physical exam (e.g., General, Cardiac, Pulmonary, Abdominal, etc.). Optionally allow selecting from preset options per system (similar to Epic's approach), but that may be complex.

### Current State
`Triage.tsx` has a single `physicalExamination` textarea (free text). The type is `string`.

### Proposed Approach

Two tiers are described below. Recommend **Tier 1** as a pragmatic first step.

---

#### Tier 1 (Recommended) — Structured Text Sections per System

Replace the single `physicalExamination` textarea with one textarea per body system. Surgeons type their own findings but are prompted by the system label.

**`src/types/patient.types.ts`** — `Triage` interface
Replace `physicalExamination: string` with:
```ts
physicalExamination: {
  general: string;       // e.g., "Alert, oriented, no acute distress"
  cardiac: string;       // e.g., "RRR, no murmurs/rubs/gallops"
  pulmonary: string;     // e.g., "CTA bilaterally, no wheezes/crackles"
  abdominal: string;     // e.g., "Soft, NT/ND, no organomegaly"
  extremities: string;   // e.g., "No edema, pulses 2+ bilaterally"
  neurological: string;  // e.g., "CN II-XII grossly intact, no focal deficits"
  skin: string;          // e.g., "No rashes, wounds healing well"
  other: string;         // Free text for anything else
};
```

**`src/components/modules/Triage.tsx`**
Replace the single physical exam textarea with a grid of labeled textareas, one per system. Each textarea should be a single row by default (expandable). Add a section header *"Physical Examination"* with system labels.

**`src/store/patientStore.ts`**
Update the default Triage state and any auto-sync logic. The Pre-Anesthesia module also reads from Triage HPI — confirm that physical exam sync is not currently used (it isn't, based on exploration).

**Migration**: Existing saved records with `physicalExamination` as a string will need a one-time migration. Recommend adding a migration step in `useRestorePatient.ts` that checks `typeof triage.physicalExamination === 'string'` and moves the string value into the `general` field.

---

#### Tier 2 (Future) — Selectable Findings per System (Epic-style)

Each system would have a set of predefined normal/abnormal finding chips (e.g., "RRR", "Murmur present", "S3 gallop") that toggle on/off, plus a free-text override.

**Trade-offs**:
- Pros: Faster documentation, structured data for analytics
- Cons: Significant UI work, larger type surface, risk of clinicians not documenting unusual findings because a chip didn't exist
- Recommendation: Defer until Tier 1 is validated with clinical partners

**Complexity (Tier 1)**: Medium — type restructure, migration guard, UI refactor of one section. Backward-compatible with migration.

---

## 4. Consent → Medical Interpreter

**Feedback**: Add a section indicating whether a medical interpreter was used.

### Current State
`Consent.tsx` has patient, witness, and provider signature sections but no interpreter field.

### Proposed Changes

**`src/types/patient.types.ts`** — `Consent` interface
Add:
```ts
interpreterUsed: boolean;
interpreterLanguage: string;    // Language interpreted (e.g., "Spanish")
interpreterType: 'in-person' | 'phone' | 'video' | 'family-member' | '';
interpreterName: string;        // Optional: interpreter's name or service (e.g., "AT&T Language Line")
```

**`src/components/modules/Consent.tsx`**
Add a new subsection — *"Medical Interpreter"* — placed after the consent checkboxes and before the signature section:
- Yes/No toggle: *"Was a medical interpreter used?"*
- If **Yes**, reveal:
  - Language field (text input)
  - Interpreter type (radio: In-Person / Phone / Video / Family Member)
  - Interpreter name/service (optional text input)

**Rationale**: CMS and Joint Commission standards require documentation of language access services when provided. This field also has legal protective value.

**Default values**:
```ts
interpreterUsed: false,
interpreterLanguage: '',
interpreterType: '',
interpreterName: '',
```

**Complexity**: Low — 4 new fields, conditional render, no breaking changes.

---

## 5. Operative Note → Circulating RN & Surgical Technologist

**Feedback**: Add fields for Circulating RN and Surgical Technologist to the Surgical Team section.

### Current State
`OperativeNote.tsx` has `surgeon`, `assistants`, and `anesthesiologist` fields. The `OperativeNote` type in `patient.types.ts` reflects the same.

### Proposed Changes

**`src/types/patient.types.ts`** — `OperativeNote` interface
Add:
```ts
circulatingRN: string;
surgicalTechnologist: string;
```

**`src/components/modules/OperativeNote.tsx`**
In the Surgical Team section, add two new text inputs after the existing team fields:
- *"Circulating RN"* — text input
- *"Surgical Technologist"* — text input

**Note**: The OR Record (`ORRecord.tsx`) has a separate RN Signature section. These are different: Operative Note documents who was present for the permanent medical record, while OR Record captures real-time time-out and RN sign-off. Both should be filled.

**Default values**:
```ts
circulatingRN: '',
surgicalTechnologist: '',
```

**Complexity**: Very Low — 2 new string fields, 2 new text inputs. No breaking changes.

---

## 6. Anesthesia Record → Urine Output, IV Fluids & Vasopressors

**Feedback**: Add sections for urine output, intravenous fluid administration, and vasopressor administration.

### Current State
`AnesthesiaRecord.tsx` has dynamic rows with a `fluids` column per row. There is no dedicated structured tracking for cumulative fluid totals, urine output, or vasopressor infusions.

### Proposed Changes

Two additions are recommended:

---

#### 6a. Per-Row Columns (inline with existing time-stamped rows)

**`src/types/patient.types.ts`** — `AnesthesiaRecordRow` interface
Add to existing row type:
```ts
urineOutput: string;       // mL (per interval)
vasopressor: string;       // Drug name + dose/rate (e.g., "Phenylephrine 100mcg IV")
```

The existing `fluids` column can be clarified/renamed to `ivFluids` or kept as-is with `urineOutput` and `vasopressor` added alongside it.

---

#### 6b. Summary Totals Section (below the row table)

Add a static summary panel at the bottom of the Anesthesia Record:

**`src/types/patient.types.ts`** — `AnesthesiaRecord` interface
Add a `totals` sub-object:
```ts
totals: {
  totalIVFluid: string;         // e.g., "1500 mL LR"
  totalUrineOutput: string;     // e.g., "350 mL"
  totalBloodLoss: string;       // e.g., "200 mL" (complements Operative Note EBL)
  vasopressorsUsed: string;     // Summary of vasopressors, e.g., "Phenylephrine PRN x3 doses"
};
```

**`src/components/modules/AnesthesiaRecord.tsx`**
- Add `urineOutput` and `vasopressor` columns to the row table (can be hidden by default and toggled with a "Show More Columns" control to avoid horizontal overflow)
- Add a *"Intraoperative Totals"* summary card below the table with the 4 total fields

**Rationale**: Cumulative fluid balance is a critical patient safety metric and standard of care documentation. Vasopressor documentation is required for CRNA/anesthesiologist credentialing audits.

**Complexity**: Medium — new columns in existing dynamic table (responsive design consideration), plus new summary section. No breaking changes; new fields default to empty strings.

---

## 7. Discharge → Medication Instruction Tab

**Feedback**: Add a discharge medication instruction tab.

### Current State
`Discharge.tsx` has a `dischargeMedications` list (array of `Medication` objects with name, dose, frequency, route, start/stop date) and a `medicationDispenseList` free-text field. There is no dedicated per-medication instruction or patient-facing medication card.

### Proposed Changes

**`src/types/patient.types.ts`** — Update `Discharge` interface
Extend the existing discharge medication type with instruction fields:
```ts
interface DischargeMedication extends Medication {
  instructions: string;      // Patient-facing: e.g., "Take with food. Do not crush."
  purpose: string;           // Patient-facing: e.g., "For pain management"
  isNew: boolean;            // New prescription vs. continuing home medication
  refillsProvided: number;   // Number of refills on script
}
```

**`src/components/modules/Discharge.tsx`**
Two options (recommend A):

- **Option A** — Expand existing medication rows
  Each row in the discharge medication list gets two new fields: *"Purpose (for patient)"* and *"Special Instructions"*. A toggle `isNew` marks it as a new prescription. Minimal UI change.

- **Option B** — Dedicated "Medication Instructions" subsection
  Add a new collapsible panel *"Medication Instructions Sheet"* that renders a print-friendly list of all discharge medications with their purpose and instructions. Includes a *"Print Medication Instructions"* button that generates a simplified patient-facing PDF (separate from the full discharge summary PDF).

**Option B detail** — New patient-facing PDF (`src/utils/medicationInstructionsPDF.ts`):
- Header: Patient name, date, provider
- Table: Medication | Purpose | Dose/Frequency/Route | Instructions | # Refills
- Footer: pharmacy contact, follow-up reminder, emergency contact instructions

**Complexity**:
- Option A: Low — extend existing type and row UI
- Option B: Medium — new PDF utility, new subsection UI; adds significant clinical value for patient literacy and safety

---

## Summary Table

| # | Section | Change | Files Affected | Complexity | Priority (suggested) |
|---|---------|--------|----------------|------------|----------------------|
| 1 | Demographics | Blood transfusion history | `patient.types.ts`, `Demographics.tsx` | Low | High |
| 2 | Demographics | MET score calculator | `patient.types.ts`, `Demographics.tsx`, `calculations.ts` | Medium | High |
| 3 | Triage | Structured physical exam by system | `patient.types.ts`, `Triage.tsx`, `useRestorePatient.ts` | Medium | Medium |
| 4 | Consent | Medical interpreter section | `patient.types.ts`, `Consent.tsx` | Low | High |
| 5 | Operative Note | Circulating RN + Scrub Tech fields | `patient.types.ts`, `OperativeNote.tsx` | Very Low | High |
| 6 | Anesthesia Record | UO, IV fluids, vasopressors | `patient.types.ts`, `AnesthesiaRecord.tsx` | Medium | High |
| 7 | Discharge | Medication instruction tab/PDF | `patient.types.ts`, `Discharge.tsx`, new PDF util | Low–Medium | Medium |

---

## Implementation Order (Recommended)

1. **Items 1, 4, 5** — All very low/low complexity with high clinical value. Ship together.
2. **Item 6a** — Add columns to existing Anesthesia Record rows (low surface area).
3. **Item 2** — MET calculator (depends on placement decision; see options in §2).
4. **Item 6b** — Anesthesia totals summary panel.
5. **Item 3 (Tier 1)** — Structured physical exam (requires migration logic).
6. **Item 7 Option A** — Discharge medication instruction fields.
7. **Item 7 Option B** — Patient-facing medication PDF (if desired).
8. **Item 3 (Tier 2)** — Epic-style selectable exam findings (future).

---

## Open Questions for Clinical Partner

1. **MET score placement**: Should this live in Demographics (completed by intake staff) or Pre-Anesthesia Evaluation (completed by the anesthesiologist)? Or both?
2. **Physical exam**: Is Tier 1 (free-text per system) sufficient for current workflows, or is structured selection important from the start?
3. **Anesthesia Record columns**: The existing row table already has ~10 columns. Should UO and vasopressors be always-visible or hidden behind a toggle to manage horizontal space on tablets?
4. **Discharge medications PDF**: Should this be a patient-take-home document (simple, large font, translated eventually) or a clinical handoff document? This affects formatting and scope.
5. **Interpreter**: Should there be a signature line for the interpreter, or is documenting the service/type sufficient?
