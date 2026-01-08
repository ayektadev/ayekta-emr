// Type definitions for Ayekta EMR

export interface Demographics {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: string;
  address: string;
  // Aadhaar number field removed as per updated specification
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bloodGroup: string;
  allergies: string;
  currentMedications: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  familyHistory: string;
  socialHistory: string;

  // Structured common medical history checklist
  pmhHTN: boolean;
  pmhDM2: boolean;
  pmhCOPD: boolean;
  pmhBPH: boolean;
  pmhOther: string;
}

export interface Triage {
  date: string;
  time: string;
  temperature: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
  weight: string;
  height: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: string;
  physicalExamination: string;
  painScale: number;

  /**
   * Name of the attending surgeon overseeing the history & physical exam.
   * Mirrors the Attending Surgeon field from the paper H&P form.
   */
  attendingSurgeon: string;

  /**
   * Provider name signing off on the history & physical examination.
   */
  hpProviderName: string;

  /**
   * Date of the provider's sign‑off on the H&P.
   */
  hpProviderSignatureDate: string;
}

export interface HerniaScore {
  herniaType: string;
  herniaSide: string;
  herniaSize: string;
  reducible: string;
  painLevel: string;
  durationOfSymptoms: string;
  previousRepair: string;
  complications: string;
}

export interface SurgicalNeeds {
  procedure: string;
  herniaScore: HerniaScore | null;
  urgencyLevel: string;
  anesthesiaType: string;
  specialEquipment: string;
  preopTesting: string;
  additionalNotes: string;

  /**
   * Planned operations checklist – maps to the paper Planned Operation section.
   * Each boolean corresponds to a specific procedure option. Laterality is captured
   * separately for inguinal hernia repair and hydrocelectomy.
   */
  opInguinalHerniaL: boolean;
  opInguinalHerniaR: boolean;
  opInguinalHerniaBilateral: boolean;
  opVentralUmbilicalHernia: boolean;
  opHysterectomy: boolean;
  opProstatectomy: boolean;
  opHydrocelectomyL: boolean;
  opHydrocelectomyR: boolean;
  opHydrocelectomyBilateral: boolean;
  opMassExcision: boolean;

  /**
   * Location for mass excision, if selected, and free text for other planned operations or comments.
   */
  massExcisionLocation: string;
  operationOther: string;

  /**
   * Hernia classification fields – size class (H1–H4), skin‑fold class (F1–F4) and
   * inguinoscrotal component (a/b/c). Displayed only when a hernia repair is selected.
   */
  herniaSizeClassification: string;
  skinFoldThicknessClassification: string;
  inguinoscrotalComponent: string;
}

export interface Consent {
  patientGuardianName: string;
  relationshipToPatient: string;
  signatureDate: string;
  understoodNature: boolean;
  understoodRisks: boolean;
  understoodAlternatives: boolean;
  hadOpportunityToAsk: boolean;
  consentToProcedure: boolean;
  consentToAnesthesia: boolean;
  consentToBloodProducts: boolean;
  understoodFinancialResponsibility: boolean;
  procedureName: string;
  plannedDate: string;
  performingSurgeon: string;
  risksExplained: string;
  benefitsExplained: string;
  alternativesDiscussed: string;
  witnessName: string;
  witnessSignatureDate: string;
  providerName: string;
  providerSignatureDate: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  startDate: string;
  stopDate: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: string;
}

export interface MedicationsModule {
  currentMedications: Medication[];
  allergies: Allergy[];
  prnMedications: Medication[];
  preopMedications: Medication[];
}

export interface LabTest {
  id: string;
  testName: string;
  dateOrdered: string;
  dateResulted: string;
  resultValue: string;
  referenceRange: string;
  status: string;
  interpretation: string;
}

export interface ImagingStudy {
  id: string;
  studyType: string;
  bodyPart: string;
  dateOrdered: string;
  datePerformed: string;
  findings: string;
  impression: string;
}

export interface OperativeNote {
  dateOfSurgery: string;
  surgeon: string;
  assistants: string;
  anesthesiologist: string;
  anesthesiaType: string;
  preopDiagnosis: string;
  postopDiagnosis: string;
  procedurePerformed: string;
  indicationForSurgery: string;
  surgicalFindings: string;
  operativeTechnique: string;
  specimensSent: string;
  estimatedBloodLoss: string;
  complications: string;
  spongeNeedleCount: string;
  conditionOnTransfer: string;
  disposition: string;
  postopOrders: string;

  /**
   * Duration of the case/surgery, e.g., "2 hours", "45 min". Corresponds to the Case duration field on the paper brief op note.
   */
  caseDuration: string;
}

export interface Discharge {
  dischargeDate: string;
  dischargeTime: string;
  dischargeInstructions: string;
  returnPrecautions: string;
  activityRestrictions: string;
  dietInstructions: string;
  woundCare: string;
  followupDate: string;
  followupTime: string;
  followupPlace: string;
  followupProvider: string;
  dischargeMedications: Medication[];
}

export interface PatientData {
  // Metadata
  ishiId: string;
  currentProvider: string;
  createdAt: string;
  updatedAt: string;

  // All modules
  demographics: Demographics;
  triage: Triage;
  surgicalNeeds: SurgicalNeeds;
  consent: Consent;
  medications: MedicationsModule;
  labs: LabTest[];
  imaging: ImagingStudy[];
  operativeNote: OperativeNote;
  discharge: Discharge;
}

export type TabName =
  | 'demographics'
  | 'triage'
  | 'surgical-needs'
  | 'consent'
  | 'medications'
  | 'labs'
  | 'imaging'
  | 'operative-note'
  | 'discharge';

export interface AppState extends PatientData {
  // UI state
  currentTab: TabName;
  isLoggedIn: boolean;

  // Actions
  setCurrentTab: (tab: TabName) => void;
  updateDemographics: (data: Partial<Demographics>) => void;
  updateTriage: (data: Partial<Triage>) => void;
  updateSurgicalNeeds: (data: Partial<SurgicalNeeds>) => void;
  updateConsent: (data: Partial<Consent>) => void;
  
  // Medication actions
  addCurrentMedication: (med: Medication) => void;
  removeCurrentMedication: (id: string) => void;
  updateCurrentMedication: (id: string, data: Partial<Medication>) => void;
  
  addAllergy: (allergy: Allergy) => void;
  removeAllergy: (id: string) => void;
  updateAllergy: (id: string, data: Partial<Allergy>) => void;
  
  addPrnMedication: (med: Medication) => void;
  removePrnMedication: (id: string) => void;
  updatePrnMedication: (id: string, data: Partial<Medication>) => void;
  
  addPreopMedication: (med: Medication) => void;
  removePreopMedication: (id: string) => void;
  updatePreopMedication: (id: string, data: Partial<Medication>) => void;
  
  // Lab actions
  addLab: (lab: LabTest) => void;
  removeLab: (id: string) => void;
  updateLab: (id: string, data: Partial<LabTest>) => void;
  
  // Imaging actions
  addImaging: (study: ImagingStudy) => void;
  removeImaging: (id: string) => void;
  updateImaging: (id: string, data: Partial<ImagingStudy>) => void;
  
  updateOperativeNote: (data: Partial<OperativeNote>) => void;
  updateDischarge: (data: Partial<Discharge>) => void;
  
  addDischargeMedication: (med: Medication) => void;
  removeDischargeMedication: (id: string) => void;
  updateDischargeMedication: (id: string, data: Partial<Medication>) => void;

  // Data management
  savePatient: () => void;
  loadPatient: (data: PatientData) => void;
  login: (provider: string) => void;
  logout: () => void;
  reset: () => void;
}

export const PROVIDERS = [
  'Dr. Neha Gill',
  'Dr. Venkat',
  'Dr. Sunil',
  'Dr. Rashmi',
  'Dr. Bhanu',
  'Dr. Tarun',
  'Dr. Kumar',
  'Dr. Prashanth',
] as const;

export type Provider = typeof PROVIDERS[number];
