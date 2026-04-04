# Ayekta v2 — FHIR mapping matrix (Phase 1)

Source: Engineering Blueprint §13. Internal domain is canonical; FHIR is import/export only.

| Internal | FHIR resources | Notes |
|----------|----------------|-------|
| Patient + PatientIdentifier | Patient | MRN and Ayekta UUID as identifiers |
| Encounter + EncounterVersion | Encounter | Versioning via `Encounter.extension` or linked Provenance (TBD at API layer) |
| VitalsPanel | Observation (panel) | LOINC-coded where possible |
| WoundFollowUp | Observation | Structured wound metrics |
| Encounter assessment / diagnoses | Condition | Problem list + encounter diagnoses |
| MedicationOrder | MedicationRequest | Active orders vs documented home meds TBD |
| ProcedureRecord | Procedure + DocumentReference | Narrative op note as DocumentReference |
| LabResult | DiagnosticReport + Observation | Shipped in bundle export (`fhirExport.ts`); import merges via `mergeClinicalResourcesFromFhirBundle` |
| ImagingOrder / reports | DiagnosticReport | Not a PACS archive |
| Attachment | DocumentReference | Signed URLs from object storage |

**v1 scope:** selected resource import/export and bundle export for handoff — not a full FHIR server.
