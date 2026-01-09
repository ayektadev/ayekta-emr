# FHIR Conversion Architecture

## Overview

This document outlines the bidirectional FHIR conversion system for Ayekta EMR. The system allows:
1. **Export**: Convert internal PatientData format → FHIR Bundle (R4)
2. **Import**: Convert FHIR Bundle → internal PatientData format
3. **Backwards Compatibility**: Detect and load both FHIR and legacy JSON formats

## FHIR Resources Used

### Core Resources
- **Patient** - Demographics information
- **Encounter** - The surgical encounter/episode of care
- **Condition** - Diagnoses, medical history
- **Procedure** - Surgical procedures performed
- **Observation** - Vital signs, lab results, physical exam findings
- **MedicationStatement** - Current medications
- **AllergyIntolerance** - Allergies
- **DocumentReference** - Consent forms, operative notes
- **CarePlan** - Surgical planning, anesthesia plan, nursing orders

### Mapping Strategy

#### Demographics → Patient Resource
```
demographics.firstName → Patient.name[0].given[0]
demographics.lastName → Patient.name[0].family
demographics.dateOfBirth → Patient.birthDate
demographics.gender → Patient.gender
demographics.mrn → Patient.identifier[0].value (system: MRN)
ishiId → Patient.identifier[1].value (system: ISHI)
demographics.phoneNumber → Patient.telecom[0].value
demographics.emergencyContact → Patient.contact[0]
```

#### Triage → Observation Resources (Vital Signs)
```
triage.heartRate → Observation (code: 8867-4 Heart rate)
triage.bloodPressure → Observation (code: 85354-9 Blood pressure)
triage.respiratoryRate → Observation (code: 9279-1 Respiratory rate)
triage.oxygenSaturation → Observation (code: 2708-6 Oxygen saturation)
triage.temperature → Observation (code: 8310-5 Body temperature)
triage.weight → Observation (code: 29463-7 Body weight)
triage.historyOfPresentIllness → Observation (code: clinical-notes)
```

#### SurgicalNeeds → Procedure Resource
```
surgicalNeeds.procedure → Procedure.code.text
surgicalNeeds.procedureType → Procedure.category
surgicalNeeds.laterality → Procedure.bodySite
```

#### Medications → MedicationStatement Resources
```
medications.medicationName → MedicationStatement.medicationCodeableConcept.text
medications.dosage → MedicationStatement.dosage[0].text
medications.frequency → MedicationStatement.dosage[0].timing
```

#### PreAnesthesia → Multiple Resources
- Vital signs → Observation resources
- ASA class → Observation (custom code)
- Anesthesia plan → CarePlan

#### OperativeNote → Procedure Resource (detailed)
```
operativeNote.procedurePerformed → Procedure.code.text
operativeNote.findings → Procedure.note
operativeNote.complications → Procedure.complication
```

#### Labs/Imaging → DiagnosticReport + Observation
```
labs.testName → DiagnosticReport.code
labs.result → Observation.value
imaging.studyType → DiagnosticReport.code
imaging.findings → DiagnosticReport.conclusion
```

## File Structure

```
src/services/fhir/
├── fhirExport.ts       # Convert PatientData → FHIR Bundle
├── fhirImport.ts       # Convert FHIR Bundle → PatientData
├── fhirMappings.ts     # Mapping constants (LOINC codes, etc.)
└── fhirValidation.ts   # Validate FHIR resources
```

## Backwards Compatibility Strategy

### Detection Logic
```typescript
export function detectJSONFormat(data: any): 'fhir' | 'legacy' {
  if (data.resourceType === 'Bundle') {
    return 'fhir';
  }
  if (data.demographics && data.ishiId) {
    return 'legacy';
  }
  throw new Error('Unknown JSON format');
}
```

### Import Flow
```typescript
export async function importPatientData(file: File): Promise<PatientData> {
  const jsonData = await parseJSON(file);
  const format = detectJSONFormat(jsonData);

  if (format === 'fhir') {
    return convertFHIRToPatientData(jsonData);
  } else {
    return jsonData as PatientData; // Legacy format
  }
}
```

## Export Behavior

When "Save Patient" is clicked:
1. Generate internal PatientData JSON (for local download - legacy format)
2. Convert to FHIR Bundle
3. Upload **FHIR Bundle** to Google Drive (cloud storage is FHIR-compliant)
4. Generate PDF from PatientData
5. Upload PDF to Google Drive

This ensures:
- Local downloads remain in familiar legacy format
- Cloud storage is FHIR-compliant for interoperability
- Both formats can be imported via "Existing Patient"

## FHIR Bundle Structure

```json
{
  "resourceType": "Bundle",
  "type": "document",
  "identifier": {
    "system": "urn:ayekta:emr",
    "value": "GH26{ishiId}"
  },
  "timestamp": "2026-01-09T...",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "identifier": [
          {
            "system": "urn:ayekta:mrn",
            "value": "{mrn}"
          },
          {
            "system": "urn:ayekta:ishi",
            "value": "{ishiId}"
          }
        ],
        "name": [
          {
            "family": "...",
            "given": ["..."]
          }
        ],
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Encounter",
        "status": "in-progress",
        "subject": { "reference": "Patient/{id}" },
        ...
      }
    },
    ...
  ]
}
```

## Implementation Steps

1. Create FHIR mapping constants (LOINC codes, value sets)
2. Implement `convertPatientDataToFHIR()` function
3. Implement `convertFHIRToPatientData()` function
4. Update `importPatientFromJSON()` to detect and handle both formats
5. Update `savePatient()` to:
   - Export legacy JSON for local download
   - Convert to FHIR for Google Drive upload
6. Test round-trip conversion (export → import → verify)

## Testing Strategy

1. **Legacy Import Test**: Load old JSON files, verify all fields populate
2. **FHIR Export Test**: Export patient data, validate FHIR Bundle structure
3. **FHIR Import Test**: Import FHIR Bundle, verify all fields populate correctly
4. **Round-trip Test**: Export FHIR → Import FHIR → Compare with original
5. **Interoperability Test**: Validate FHIR Bundle with external validator

## Notes

- Use FHIR R4 (current standard)
- Follow US Core profiles where applicable
- Custom extensions for Ayekta-specific fields (e.g., ISHI ID)
- Include provenance metadata (currentProvider, timestamps)
