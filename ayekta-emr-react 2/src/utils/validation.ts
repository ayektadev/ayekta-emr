import { z } from 'zod';

// Demographics validation schema
export const demographicsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string(),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(0),
  gender: z.string(),
  address: z.string(),
  aadhaar: z.string(),
  phone: z.string(),
  email: z.string().email('Invalid email format').or(z.literal('')),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelationship: z.string(),
  bloodGroup: z.string(),
  allergies: z.string(),
  currentMedications: z.string(),
  pastMedicalHistory: z.string(),
  pastSurgicalHistory: z.string(),
  familyHistory: z.string(),
  socialHistory: z.string(),
});

// Triage validation schema
export const triageSchema = z.object({
  date: z.string(),
  time: z.string(),
  temperature: z.string(),
  hr: z.string(),
  rr: z.string(),
  bp: z.string(),
  spo2: z.string(),
  weight: z.string(),
  height: z.string(),
  chiefComplaint: z.string(),
  historyOfPresentIllness: z.string(),
  reviewOfSystems: z.string(),
  physicalExamination: z.string(),
  painScale: z.number().min(0).max(10),
});

// Consent validation schema
export const consentSchema = z.object({
  patientGuardianName: z.string().min(1, 'Name is required'),
  relationshipToPatient: z.string(),
  signatureDate: z.string().min(1, 'Signature date is required'),
  understoodNature: z.boolean(),
  understoodRisks: z.boolean(),
  understoodAlternatives: z.boolean(),
  hadOpportunityToAsk: z.boolean(),
  consentToProcedure: z.boolean(),
  consentToAnesthesia: z.boolean(),
  consentToBloodProducts: z.boolean(),
  understoodFinancialResponsibility: z.boolean(),
  procedureName: z.string().min(1, 'Procedure name is required'),
  plannedDate: z.string(),
  performingSurgeon: z.string(),
  risksExplained: z.string(),
  benefitsExplained: z.string(),
  alternativesDiscussed: z.string(),
  witnessName: z.string(),
  witnessSignatureDate: z.string(),
  providerName: z.string(),
  providerSignatureDate: z.string(),
});

// Helper function to check if all consent checkboxes are checked
export function validateConsentCheckboxes(consent: any): boolean {
  return (
    consent.understoodNature &&
    consent.understoodRisks &&
    consent.understoodAlternatives &&
    consent.hadOpportunityToAsk &&
    consent.consentToProcedure &&
    consent.consentToAnesthesia &&
    consent.consentToBloodProducts &&
    consent.understoodFinancialResponsibility
  );
}
