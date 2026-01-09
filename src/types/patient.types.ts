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
  attachments?: ImageAttachment[];
}

export interface ImageAttachment {
  id: string;
  filename: string;
  fileType: string;
  base64Data: string;
  uploadDate: string;
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

  /**
   * Free‑text notes from the RN regarding post‑operative orders and instructions.
   */
  rnNotes?: string;

  /**
   * Structured discharge criteria checklist. When true, the criterion has been met.
   */
  dischargeCriteria?: {
    voiding: boolean;
    ambulating: boolean;
    dietTolerated: boolean;
    painControlled: boolean;
    instructionsGiven: boolean;
    followUpBooked: boolean;
    woundClean: boolean;
  };

  /**
   * Verification by the attending physician and nurse that the discharge instructions
   * have been reviewed and the patient meets criteria. Names and dates are optional
   * to allow saving progress before final sign‑off.
   */
  mdVerificationName?: string;
  mdVerificationDate?: string;
  rnVerificationName?: string;
  rnVerificationDate?: string;

  /**
   * Medications dispensed to the patient at discharge, including dose and quantity.
   */
  medicationDispenseList?: Medication[];

  /**
   * Destination at discharge. Typically "Home" or "Other". If "Other" is selected,
   * additional details should be captured in dischargeInstructions or follow‑up fields.
   */
  dischargeDestination?: string;

  /** Indicates whether the patient should avoid heavy lifting after discharge. */
  noHeavyLifting?: boolean;

  /** Indicates whether the patient should avoid bathing (shower only). */
  noBaths?: boolean;

  /**
   * Specific instructions for showering after surgery. Allows free‑text entry
   * (e.g., when showering can begin, how to cover the wound).
   */
  showerInstructions?: string;

  /**
   * Instructions regarding wound dressing changes, if different from general wound care.
   */
  dressingInstructions?: string;

  /**
   * Nursing or floor orders at the time of discharge. Allows the RN to document
   * any specific directives for ongoing care or coordination with ward staff.
   */
  floorOrders?: string;
}

/**
 * Represents a single instrument count entry. Each row captures the name of the
 * instrument or sponge along with the number counted at the start and end of
 * the procedure. This allows scrub nurses to record individual counts and
 * reconcile them before closing.
 */
export interface InstrumentCountRow {
  id: string;
  /** Name or description of the instrument (e.g., Knife handle, Sponge, Clip). */
  instrumentName: string;
  /** Number of this instrument present at the start of the procedure. */
  countStart: string;
  /** Number of this instrument present at the end of the procedure. */
  countEnd: string;
}

/**
 * Pre‑anesthesia evaluation details capturing the patient’s medical history,
 * physical assessment and anesthesia plan. Mirrors the paper pre‑anesthesia
 * evaluation form while allowing free‑text and structured data entry.
 */
export interface PreAnesthesia {
  procedure: string;
  preopDiagnosis: string;
  historyPresentIllness: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  anesthesiaHistory: string;
  anesthesiaComplications: string;
  medicationsAllergies: string;
  substanceUse: string;
  vitals: string;
  airwayAssessment: string;
  rangeOfMotion: string;
  cardiovascularExam: string;
  pulmonaryExam: string;
  neurologicExam: string;
  labs: string;
  /**
   * Structured past medical history for anesthesia assessment. These booleans
   * correspond to the systemic disease categories outlined on the paper
   * pre‑anesthesia evaluation. A checked value indicates the patient has
   * a history of that organ system disease. The other field allows free‑text
   * entry of additional conditions.
   */
  systemDiseaseCardiovascular: boolean;
  systemDiseasePulmonary: boolean;
  systemDiseaseEndocrine: boolean;
  systemDiseaseRenal: boolean;
  systemDiseaseHepatic: boolean;
  systemDiseaseOther: string;
  /**
   * Indicates whether the patient has had complications with anesthesia in
   * the past. If true, additional details can be recorded in
   * `anesthesiaComplications`.
   */
  anesthesiaComplicationsYes: boolean;
  /**
   * Mallampati airway classification (I, II, III, IV). Using a string
   * rather than a number allows direct storage of the class label.
   */
  mallampatiClass: string;
  asaClass: string;
  riskLevel: string;
  anesthesiaPlan: string;
  /**
   * Optional description of the planned sedation technique or adjuncts.
   */
  sedationPlan: string;
  providerName: string;
  providerSignatureDate: string;

  /**
   * Indicates if the patient has any airway or dentition issues (e.g., difficult airway,
   * loose or missing teeth, limited mouth opening) that could complicate intubation.
   */
  airwayDentitionIssues?: boolean;
}

/**
 * A single row in the anesthesia/sedation record. Allows recording time points
 * with associated events, drugs administered and any notes. The list of rows
 * composes the full anesthesia record.
 */
export interface AnesthesiaRecordRow {
  id: string;
  time: string;
  /**
   * Blood pressure documented at this timepoint. Free‑text to allow
   * entry of systolic/diastolic (e.g., 120/80).
   */
  bp: string;
  /**
   * Heart rate recorded in beats per minute.
   */
  hr: string;
  /**
   * Respiratory rate recorded in breaths per minute.
   */
  rr: string;
  /**
   * Oxygen saturation percentage (SpO₂) at this timepoint.
   */
  spo2: string;
  /**
   * Description of the intraoperative event occurring at this time
   * (e.g., induction, incision, closure).
   */
  event: string;
  /**
   * Drug administered at this time (e.g., Propofol 200 mg).
   */
  drug: string;
  /**
   * Additional notes or observations.
   */
  notes: string;

  /**
   * Numeric pain score recorded at this timepoint (0–10). Allows tracking
   * the patient’s comfort level during the intraoperative period.
   */
  painScore?: string;

  /**
   * Total amount of fluids or drugs administered at this timepoint (e.g., mL of
   * crystalloid, total sedation bolus). Free‑text to accommodate varying units.
   */
  fluids?: string;
}

export interface AnesthesiaRecord {
  rows: AnesthesiaRecordRow[];
}

/**
 * Operating room (OR) record capturing timing of key events, Time Out checklist,
 * team members, anesthesia, patient positioning and procedure selection. It
 * mirrors the paper OR record while retaining structured EMR benefits.
 */
export interface ORRecord {
  orEntryTime: string;
  orExitTime: string;
  anesthesiaStartTime: string;
  anesthesiaEndTime: string;
  procedureStartTime: string;
  procedureEndTime: string;
  timeOutCompleted: boolean;
  timeOutIdentityVerified: boolean;
  timeOutSiteMarked: boolean;
  timeOutAllergiesReviewed: boolean;
  timeOutEquipmentAvailable: boolean;
  timeOutAntibioticsGiven: boolean;
  surgeon: string;
  assistant: string;
  anesthesiologist: string;
  anesthesiaType: string;
  patientPosition: string;
  // Procedure checklist mirrors the planned operations from SurgicalNeeds
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
  massExcisionLocation: string;
  operationOther: string;
  instrumentCountCorrect: boolean;
  instrumentCountNotes: string;
  rnSignatureName: string;
  rnSignatureDate: string;

  /**
   * Detailed instrument counts recorded during the procedure. Each entry
   * corresponds to a specific instrument with start and end tallies. This
   * supplements the overall instrument count correctness indicator.
   */
  instrumentCounts?: InstrumentCountRow[];
}

/**
 * Nursing orders capture post‑operative instructions including vitals schedule,
 * activity restrictions, nursing interventions, diet, IV fluids and pain
 * management regimens.
 */
export interface NursingOrders {
  admitDiagnosis: string;
  patientCondition: string;
  vitalsFrequency: string;
  activityOrders: string;
  abdominalBinder: boolean;
  scrotalSupport: boolean;
  straightCatheterIfNoVoid: boolean;
  diet: string;
  ivFluids: string;
  /**
   * Flag indicating that a heplock intravenous line should be maintained once
   * the patient tolerates oral intake. Mirrors the “HLIV when tolerating PO”
   * checkbox on the paper nursing orders form.
   */
  hlivWhenPO?: boolean;
  /**
   * Structured pain management regimen for the pre‑operative phase. Each
   * medication corresponds to a checkbox; `other` allows free‑text entry for
   * additional analgesics. Doses should be predetermined in the UI.
   */
  preopMeds: {
    acetaminophen: boolean;
    ibuprofen: boolean;
    ketorolac: boolean;
    other: string;
  };
  /**
   * Structured pain management regimen for the intra‑operative phase. Not
   * all medications apply to this phase, so unused properties are omitted.
   */
  intraopMeds: {
    fentanyl: boolean;
    ketorolac: boolean;
    other: string;
  };
  /**
   * Structured pain management regimen for the PACU phase.
   */
  pacuMeds: {
    acetaminophen: boolean;
    ibuprofen: boolean;
    tramadol: boolean;
    other: string;
  };
  /**
   * Structured pain management regimen for the floor phase.
   */
  floorMeds: {
    acetaminophen: boolean;
    ibuprofen: boolean;
    tramadol: boolean;
    other: string;
  };
  /**
   * Additional nursing orders or comments not covered by the structured fields.
   */
  otherOrders: string;
}

/**
 * Row structure for the PACU flowsheet capturing time‑stamped vitals and
 * interventions. The list of rows composes the full PACU record.
 */
export interface PACURow {
  id: string;
  time: string;
  hr: string;
  bp: string;
  spo2: string;
  painScore: string;
  medsGiven: string;
  notes: string;
}

export interface PACUFlow {
  arrivalTime: string;
  tapBlock: string;
  closureType: string;
  dressing: string;
  drains: string;
  supportiveGarments: string;
  ivAccess: string;
  intakeOutput: string;
  nauseaVomiting: string;
  lastAntiemetic: string;
  foley: string;
  urineColor: string;
  urineClots: string;
  aldreteScore: string;
  rows: PACURow[];
}

/**
 * Row structure for floor flowsheet entries. Similar to the PACU row but used
 * once the patient has transferred to the ward.
 */
export interface FloorFlowRow {
  id: string;
  time: string;
  hr: string;
  bp: string;
  spo2: string;
  painScore: string;
  medsGiven: string;
  notes: string;
}

export interface NursingAssessment {
  airway: string;
  breathing: string;
  circulation: string;
  neuro: string;
  surgicalSite: string;
  gi: string;
  gu: string;
}

export interface NursingInterventions {
  ambulated: boolean;
  voided: boolean;
  binderInPlace: boolean;
  scrotalSupportInPlace: boolean;
  iORecorded: boolean;
  familyUpdated: boolean;
}

export interface FloorFlow {
  arrivalTime: string;
  transportMethod: string;
  rows: FloorFlowRow[];
  assessment: NursingAssessment;
  interventions: NursingInterventions;
}

/**
 * A single progress note entry capturing a post‑operative day, subjective and
 * objective findings and an assessment/plan. Multiple notes compose the
 * ProgressNotesModule.
 */
export interface ProgressNote {
  id: string;
  pod: number;
  date: string;
  time: string;
  painLevel: string;
  toleratingPO: boolean;
  nauseaVomiting: boolean;
  flatus: boolean;
  bowelMovement: boolean;
  ambulation: boolean;
  voiding: boolean;
  exam: string;
  foley: string;
  cbi: string;
  urineColor: string;
  assessmentPlan: string;
  /**
   * Category of pain control for the note (e.g., minimal/well controlled,
   * moderate, poorly controlled). This complements the numeric pain level.
   */
  painCategory?: string;
  /**
   * Diet tolerance noted during the assessment (e.g., liquids, regular,
   * not tolerating, not attempted).
   */
  dietTolerance?: string;
  /**
   * Orientation or mental status of the patient (e.g., AAOx3, AOx4, NAD).
   */
  orientationStatus?: string;
  /**
   * Structured plan checkboxes. Each boolean corresponds to a common
   * postoperative plan element from the paper progress notes. If true,
   * that plan item is part of the assessment.
   */
  planAdvanceDiet?: boolean;
  planAmbulate?: boolean;
  planDCFoley?: boolean;
  planDischargeHome?: boolean;
  planMedicationChanges?: boolean;
  /**
   * Free‑text field for any additional plan items not covered by the
   * predefined checkboxes.
   */
  planOther?: string;
  providerName: string;
  providerSignatureDate: string;

  /**
   * Examination findings for lung auscultation. Suggested values: CTA (clear
   * to auscultation), coarse, decreased (with side), or other descriptors.
   */
  lungsExam?: string;
  /**
   * Abdominal exam findings. Suggested values: Soft, Distended, Tender
   * (specify location), or other descriptors.
   */
  abdomenExam?: string;
  /**
   * Surgical wound status. Suggested values: Clean/Dry/Intact (CDI),
   * Serosanguinous staining, Saturated, Swelling, Induration, Purulence,
   * or other descriptors.
   */
  woundStatus?: string;
  /**
   * Orders or notes from nursing staff for the floor shift, capturing day‑to‑day
   * directives that accompany the provider’s assessment and plan.
   */
  rnOrders?: string;
}

export interface ProgressNotesModule {
  notes: ProgressNote[];
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

  /** Pre‑anesthesia evaluation captured prior to surgery */
  preAnesthesia: PreAnesthesia;
  /** Intraoperative anesthesia/sedation record */
  anesthesiaRecord: AnesthesiaRecord;
  /** Operating room record documenting timing, checklist and procedure */
  orRecord: ORRecord;
  /** Nursing orders and post‑op instructions */
  nursingOrders: NursingOrders;
  /** Post anesthesia care unit (PACU) flowsheet */
  pacu: PACUFlow;
  /** Floor flowsheet once the patient is transferred from PACU */
  floorFlow: FloorFlow;
  /** Daily progress notes */
  progressNotes: ProgressNotesModule;
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
  | 'discharge'
  | 'pre-anesthesia'
  | 'anesthesia-record'
  | 'or-record'
  | 'nursing-orders'
  | 'pacu'
  | 'floor-flow'
  | 'progress-notes';

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

  addMedicationDispense: (med: Medication) => void;
  removeMedicationDispense: (id: string) => void;
  updateMedicationDispense: (id: string, data: Partial<Medication>) => void;

  // New module update actions
  updatePreAnesthesia: (data: Partial<PreAnesthesia>) => void;
  updateAnesthesiaRecord: (data: Partial<AnesthesiaRecord>) => void;
  updateORRecord: (data: Partial<ORRecord>) => void;
  updateNursingOrders: (data: Partial<NursingOrders>) => void;
  updatePACU: (data: Partial<PACUFlow>) => void;
  updateFloorFlow: (data: Partial<FloorFlow>) => void;
  updateProgressNotes: (data: Partial<ProgressNotesModule>) => void;

  // Data management
  savePatient: () => { jsonSuccess: boolean };
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
