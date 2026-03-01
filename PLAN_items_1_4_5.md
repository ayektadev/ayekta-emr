# Implementation Plan — CLINICAL_FEEDBACK_SPEC.md Items 1, 4, 5

## Files to change (4 total)

1. `src/types/patient.types.ts` — add fields to Demographics, Consent, OperativeNote interfaces
2. `src/store/patientStore.ts` — add matching defaults to initialDemographics, initialConsent, initialOperativeNote
3. `src/components/modules/Demographics.tsx` — blood transfusion UI
4. `src/components/modules/Consent.tsx` — medical interpreter UI
5. `src/components/modules/OperativeNote.tsx` — circulating RN + scrub tech UI

---

## Item 1 — Blood Transfusion History (Demographics)

### Type change
After `bloodGroup: string` in the Demographics interface, add:
```ts
bloodTransfusionHistory: boolean;
bloodTransfusionDetails: string;
```

### Store default
In `initialDemographics`, after `bloodGroup: ''`, add:
```ts
bloodTransfusionHistory: false,
bloodTransfusionDetails: '',
```

### UI (Demographics.tsx)
Directly after the Blood Group `<select>` block, add a new `<div>`:
- Label: "Prior Blood Transfusion"
- Two pill-style radio buttons: "No" (default selected) and "Yes"
- When "Yes" is selected, slide in a textarea below:
  - Label: "Details (when, reason, any reactions)"
  - rows={2}, placeholder="e.g., Received 2 units pRBC in 2018 for GI bleed, no reactions"

UX pattern: use inline `onChange` on `demographics.bloodTransfusionHistory`. The conditional textarea renders only when `bloodTransfusionHistory === true`. No extra state — reads/writes directly to the store like every other field on this page.

---

## Item 4 — Medical Interpreter (Consent)

### Type change
In the Consent interface, add after `providerSignatureDate`:
```ts
interpreterUsed: boolean;
interpreterLanguage: string;
interpreterType: string;   // 'in-person' | 'phone' | 'video' | 'family-member' | ''
interpreterName: string;
```

### Store default
In `initialConsent`, after `providerSignatureDate: ''`, add:
```ts
interpreterUsed: false,
interpreterLanguage: '',
interpreterType: '',
interpreterName: '',
```

### UI (Consent.tsx)
Insert a new `<section>` between the Consent Statements section and the Signatures section:
- Section header: "Medical Interpreter" (same style as other section headers — orange)
- Yes/No toggle (same pill-radio pattern as item 1): "Was a medical interpreter used during this consent discussion?"
- When "Yes": reveal a styled sub-panel (light gray bg, rounded, padded) with:
  - Row 1: "Language" text input (placeholder: "e.g., Spanish, Hindi, Arabic")
  - Row 2: "Interpreter Type" — four horizontal radio options: In-Person / Phone / Video / Family Member
  - Row 3: "Interpreter Name / Service" text input (optional, placeholder: "e.g., AT&T Language Line, Maria Garcia")
- When "No": sub-panel is hidden

---

## Item 5 — Circulating RN & Surgical Technologist (Operative Note)

### Type change
In the OperativeNote interface, add after `caseDuration`:
```ts
circulatingRN: string;
surgicalTechnologist: string;
```

### Store default
In `initialOperativeNote`, after `caseDuration: ''`, add:
```ts
circulatingRN: '',
surgicalTechnologist: '',
```

### UI (OperativeNote.tsx)
The "Surgical Team" section currently renders only the `<ProviderFields>` shared component (surgeon, assistants, anesthesiologist). After that component, add two new text inputs inside the same `<section>` tag, in a 2-col grid:
- "Circulating RN" — text input, placeholder "Full name"
- "Surgical Technologist" — text input, placeholder "Full name"

Both write directly to the store via the existing `handleChange` pattern.

---

## UI consistency notes
- Yes/No toggles: use the same styling as existing radio inputs in the codebase — two `<label>` elements wrapping `<input type="radio">` arranged side by side, styled like the gender and other select fields.
- Conditional reveal: plain conditional rendering (`{field === true && <div>...</div>}`) — no animation needed, consistent with how the hernia scoring section appears conditionally in SurgicalNeeds.
- All new inputs use the existing Tailwind classes: `px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange`
