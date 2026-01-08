import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  AppState,
  Demographics,
  Triage,
  SurgicalNeeds,
  Consent,
  Medication,
  Allergy,
  LabTest,
  ImagingStudy,
  OperativeNote,
  Discharge,
  PatientData,
  TabName,
  PreAnesthesia,
  AnesthesiaRecord,
  ORRecord,
  NursingOrders,
  PACUFlow,
  FloorFlow,
  ProgressNotesModule,
} from '../types/patient.types';
import { generateIshiId, getCurrentDate, getCurrentTime } from '../utils/calculations';
import { exportPatientToJSON, saveToStorage, clearStorage } from '../utils/storage';

// Initial empty state for all modules
const initialDemographics: Demographics = {
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  age: 0,
  gender: '',
  address: '',
  phone: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  bloodGroup: '',
  allergies: '',
  currentMedications: '',
  pastMedicalHistory: '',
  pastSurgicalHistory: '',
  familyHistory: '',
  socialHistory: '',

  // Structured past medical history checklist defaults
  pmhHTN: false,
  pmhDM2: false,
  pmhCOPD: false,
  pmhBPH: false,
  pmhOther: '',
};

const initialTriage: Triage = {
  date: getCurrentDate(),
  time: getCurrentTime(),
  temperature: '',
  hr: '',
  rr: '',
  bp: '',
  spo2: '',
  weight: '',
  height: '',
  chiefComplaint: '',
  historyOfPresentIllness: '',
  reviewOfSystems: '',
  physicalExamination: '',
  painScale: 0,

  // Attending surgeon and H&P sign-off fields
  attendingSurgeon: '',
  hpProviderName: '',
  hpProviderSignatureDate: '',
};

const initialSurgicalNeeds: SurgicalNeeds = {
  procedure: '',
  herniaScore: null,
  urgencyLevel: '',
  anesthesiaType: '',
  specialEquipment: '',
  preopTesting: '',
  additionalNotes: '',

  // Planned operations checklist default values
  opInguinalHerniaL: false,
  opInguinalHerniaR: false,
  opInguinalHerniaBilateral: false,
  opVentralUmbilicalHernia: false,
  opHysterectomy: false,
  opProstatectomy: false,
  opHydrocelectomyL: false,
  opHydrocelectomyR: false,
  opHydrocelectomyBilateral: false,
  opMassExcision: false,

  // Additional planned operations info defaults
  massExcisionLocation: '',
  operationOther: '',

  // Hernia classification defaults
  herniaSizeClassification: '',
  skinFoldThicknessClassification: '',
  inguinoscrotalComponent: '',
};

const initialConsent: Consent = {
  patientGuardianName: '',
  relationshipToPatient: '',
  signatureDate: '',
  understoodNature: false,
  understoodRisks: false,
  understoodAlternatives: false,
  hadOpportunityToAsk: false,
  consentToProcedure: false,
  consentToAnesthesia: false,
  consentToBloodProducts: false,
  understoodFinancialResponsibility: false,
  procedureName: '',
  plannedDate: '',
  performingSurgeon: '',
  risksExplained: '',
  benefitsExplained: '',
  alternativesDiscussed: '',
  witnessName: '',
  witnessSignatureDate: '',
  providerName: '',
  providerSignatureDate: '',
};

const initialOperativeNote: OperativeNote = {
  dateOfSurgery: '',
  surgeon: '',
  assistants: '',
  anesthesiologist: '',
  anesthesiaType: '',
  preopDiagnosis: '',
  postopDiagnosis: '',
  procedurePerformed: '',
  indicationForSurgery: '',
  surgicalFindings: '',
  operativeTechnique: '',
  specimensSent: '',
  estimatedBloodLoss: '',
  complications: '',
  spongeNeedleCount: '',
  conditionOnTransfer: '',
  disposition: '',
  postopOrders: '',

  // Case duration default
  caseDuration: '',
};

const initialDischarge: Discharge = {
  dischargeDate: '',
  dischargeTime: '',
  dischargeInstructions: '',
  returnPrecautions: '',
  activityRestrictions: '',
  dietInstructions: '',
  woundCare: '',
  followupDate: '',
  followupTime: '',
  followupPlace: '',
  followupProvider: '',
  dischargeMedications: [],

  // Extended discharge defaults
  rnNotes: '',
  dischargeCriteria: {
    voiding: false,
    ambulating: false,
    dietTolerated: false,
    painControlled: false,
    instructionsGiven: false,
    followUpBooked: false,
    woundClean: false,
  },
  mdVerificationName: '',
  mdVerificationDate: '',
  rnVerificationName: '',
  rnVerificationDate: '',
  medicationDispenseList: [],

  // New structured discharge fields
  dischargeDestination: '',
  noHeavyLifting: false,
  noBaths: false,
  showerInstructions: '',
  dressingInstructions: '',
  floorOrders: '',
};

// New initial state definitions for additional modules
const initialPreAnesthesia: PreAnesthesia = {
  procedure: '',
  preopDiagnosis: '',
  historyPresentIllness: '',
  pastMedicalHistory: '',
  pastSurgicalHistory: '',
  anesthesiaHistory: '',
  anesthesiaComplications: '',
  medicationsAllergies: '',
  substanceUse: '',
  vitals: '',
  airwayAssessment: '',
  rangeOfMotion: '',
  cardiovascularExam: '',
  pulmonaryExam: '',
  neurologicExam: '',
  labs: '',
  // Systemic disease checklist defaults to false
  systemDiseaseCardiovascular: false,
  systemDiseasePulmonary: false,
  systemDiseaseEndocrine: false,
  systemDiseaseRenal: false,
  systemDiseaseHepatic: false,
  systemDiseaseOther: '',
  anesthesiaComplicationsYes: false,
  mallampatiClass: '',
  asaClass: '',
  riskLevel: '',
  anesthesiaPlan: '',
  sedationPlan: '',
  providerName: '',
  providerSignatureDate: '',

  // Airway/dentition issues default
  airwayDentitionIssues: false,
};

const initialAnesthesiaRecord: AnesthesiaRecord = {
  rows: [],
};

const initialORRecord: ORRecord = {
  orEntryTime: '',
  orExitTime: '',
  anesthesiaStartTime: '',
  anesthesiaEndTime: '',
  procedureStartTime: '',
  procedureEndTime: '',
  timeOutCompleted: false,
  timeOutIdentityVerified: false,
  timeOutSiteMarked: false,
  timeOutAllergiesReviewed: false,
  timeOutEquipmentAvailable: false,
  timeOutAntibioticsGiven: false,
  surgeon: '',
  assistant: '',
  anesthesiologist: '',
  anesthesiaType: '',
  patientPosition: '',
  opInguinalHerniaL: false,
  opInguinalHerniaR: false,
  opInguinalHerniaBilateral: false,
  opVentralUmbilicalHernia: false,
  opHysterectomy: false,
  opProstatectomy: false,
  opHydrocelectomyL: false,
  opHydrocelectomyR: false,
  opHydrocelectomyBilateral: false,
  opMassExcision: false,
  massExcisionLocation: '',
  operationOther: '',
  instrumentCountCorrect: false,
  instrumentCountNotes: '',
  rnSignatureName: '',
  rnSignatureDate: '',

  // Start with no detailed instrument count entries; users can add rows in the UI
  instrumentCounts: [],
};

const initialNursingOrders: NursingOrders = {
  admitDiagnosis: '',
  patientCondition: '',
  vitalsFrequency: '',
  activityOrders: '',
  abdominalBinder: false,
  scrotalSupport: false,
  straightCatheterIfNoVoid: false,
  diet: '',
  ivFluids: '',
  hlivWhenPO: false,
  preopMeds: {
    acetaminophen: false,
    ibuprofen: false,
    ketorolac: false,
    other: '',
  },
  intraopMeds: {
    fentanyl: false,
    ketorolac: false,
    other: '',
  },
  pacuMeds: {
    acetaminophen: false,
    ibuprofen: false,
    tramadol: false,
    other: '',
  },
  floorMeds: {
    acetaminophen: false,
    ibuprofen: false,
    tramadol: false,
    other: '',
  },
  otherOrders: '',
};

const initialPACU: PACUFlow = {
  arrivalTime: '',
  tapBlock: '',
  closureType: '',
  dressing: '',
  drains: '',
  supportiveGarments: '',
  ivAccess: '',
  intakeOutput: '',
  nauseaVomiting: '',
  lastAntiemetic: '',
  foley: '',
  urineColor: '',
  urineClots: '',
  aldreteScore: '',
  rows: [],
};

const initialFloorFlow: FloorFlow = {
  arrivalTime: '',
  transportMethod: '',
  rows: [],
  assessment: {
    airway: '',
    breathing: '',
    circulation: '',
    neuro: '',
    surgicalSite: '',
    gi: '',
    gu: '',
  },
  interventions: {
    ambulated: false,
    voided: false,
    binderInPlace: false,
    scrotalSupportInPlace: false,
    iORecorded: false,
    familyUpdated: false,
  },
};

const initialProgressNotes: ProgressNotesModule = {
  notes: [],
};

export const usePatientStore = create<AppState>((set, get) => ({
  // Metadata
  ishiId: '',
  currentProvider: '',
  createdAt: '',
  updatedAt: '',

  // UI state
  currentTab: 'demographics',
  isLoggedIn: false,

  // All modules
  demographics: initialDemographics,
  triage: initialTriage,
  surgicalNeeds: initialSurgicalNeeds,
  consent: initialConsent,
  medications: {
    currentMedications: [],
    allergies: [],
    prnMedications: [],
    preopMedications: [],
  },
  labs: [],
  imaging: [],
  operativeNote: initialOperativeNote,
  discharge: initialDischarge,

  // New modules initial state
  preAnesthesia: initialPreAnesthesia,
  anesthesiaRecord: initialAnesthesiaRecord,
  orRecord: initialORRecord,
  nursingOrders: initialNursingOrders,
  pacu: initialPACU,
  floorFlow: initialFloorFlow,
  progressNotes: initialProgressNotes,

  // UI Actions
  setCurrentTab: (tab: TabName) => set({ currentTab: tab }),

  // Login/Logout
  login: (provider: string) => {
    const now = new Date().toISOString();
    set({
      isLoggedIn: true,
      currentProvider: provider,
      ishiId: generateIshiId(),
      createdAt: now,
      updatedAt: now,
    });
  },

  /**
   * Logout the current session. Clears any persisted data from IndexedDB/localStorage and
   * resets the application state back to the login screen. Because clearStorage
   * returns a promise, we trigger the reset once clearing is complete. If clearing
   * fails, we still reset the state to avoid being stuck in an inconsistent state.
   */
  logout: () => {
    // Attempt to clear persisted data; regardless of success, reset the in-memory state
    clearStorage()
      .catch((error) => {
        console.error('Failed to clear storage during logout:', error);
      })
      .finally(() => {
        get().reset();
      });
  },

  // Module updates
  updateDemographics: (data: Partial<Demographics>) =>
    set((state) => ({
      demographics: { ...state.demographics, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateTriage: (data: Partial<Triage>) =>
    set((state) => ({
      triage: { ...state.triage, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateSurgicalNeeds: (data: Partial<SurgicalNeeds>) =>
    set((state) => ({
      surgicalNeeds: { ...state.surgicalNeeds, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateConsent: (data: Partial<Consent>) =>
    set((state) => ({
      consent: { ...state.consent, ...data },
      updatedAt: new Date().toISOString(),
    })),

  // Medication actions
  addCurrentMedication: (med: Medication) =>
    set((state) => ({
      medications: {
        ...state.medications,
        currentMedications: [...state.medications.currentMedications, { ...med, id: uuidv4() }],
      },
      updatedAt: new Date().toISOString(),
    })),

  removeCurrentMedication: (id: string) =>
    set((state) => ({
      medications: {
        ...state.medications,
        currentMedications: state.medications.currentMedications.filter((m) => m.id !== id),
      },
      updatedAt: new Date().toISOString(),
    })),

  updateCurrentMedication: (id: string, data: Partial<Medication>) =>
    set((state) => ({
      medications: {
        ...state.medications,
        currentMedications: state.medications.currentMedications.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  // Allergy actions
  addAllergy: (allergy: Allergy) =>
    set((state) => ({
      medications: {
        ...state.medications,
        allergies: [...state.medications.allergies, { ...allergy, id: uuidv4() }],
      },
      updatedAt: new Date().toISOString(),
    })),

  removeAllergy: (id: string) =>
    set((state) => ({
      medications: {
        ...state.medications,
        allergies: state.medications.allergies.filter((a) => a.id !== id),
      },
      updatedAt: new Date().toISOString(),
    })),

  updateAllergy: (id: string, data: Partial<Allergy>) =>
    set((state) => ({
      medications: {
        ...state.medications,
        allergies: state.medications.allergies.map((a) =>
          a.id === id ? { ...a, ...data } : a
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  // PRN Medication actions
  addPrnMedication: (med: Medication) =>
    set((state) => ({
      medications: {
        ...state.medications,
        prnMedications: [...state.medications.prnMedications, { ...med, id: uuidv4() }],
      },
      updatedAt: new Date().toISOString(),
    })),

  removePrnMedication: (id: string) =>
    set((state) => ({
      medications: {
        ...state.medications,
        prnMedications: state.medications.prnMedications.filter((m) => m.id !== id),
      },
      updatedAt: new Date().toISOString(),
    })),

  updatePrnMedication: (id: string, data: Partial<Medication>) =>
    set((state) => ({
      medications: {
        ...state.medications,
        prnMedications: state.medications.prnMedications.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  // Preop Medication actions
  addPreopMedication: (med: Medication) =>
    set((state) => ({
      medications: {
        ...state.medications,
        preopMedications: [...state.medications.preopMedications, { ...med, id: uuidv4() }],
      },
      updatedAt: new Date().toISOString(),
    })),

  removePreopMedication: (id: string) =>
    set((state) => ({
      medications: {
        ...state.medications,
        preopMedications: state.medications.preopMedications.filter((m) => m.id !== id),
      },
      updatedAt: new Date().toISOString(),
    })),

  updatePreopMedication: (id: string, data: Partial<Medication>) =>
    set((state) => ({
      medications: {
        ...state.medications,
        preopMedications: state.medications.preopMedications.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  // Lab actions
  addLab: (lab: LabTest) =>
    set((state) => ({
      labs: [...state.labs, { ...lab, id: uuidv4() }],
      updatedAt: new Date().toISOString(),
    })),

  removeLab: (id: string) =>
    set((state) => ({
      labs: state.labs.filter((l) => l.id !== id),
      updatedAt: new Date().toISOString(),
    })),

  updateLab: (id: string, data: Partial<LabTest>) =>
    set((state) => ({
      labs: state.labs.map((l) => (l.id === id ? { ...l, ...data } : l)),
      updatedAt: new Date().toISOString(),
    })),

  // Imaging actions
  addImaging: (study: ImagingStudy) =>
    set((state) => ({
      imaging: [...state.imaging, { ...study, id: uuidv4() }],
      updatedAt: new Date().toISOString(),
    })),

  removeImaging: (id: string) =>
    set((state) => ({
      imaging: state.imaging.filter((i) => i.id !== id),
      updatedAt: new Date().toISOString(),
    })),

  updateImaging: (id: string, data: Partial<ImagingStudy>) =>
    set((state) => ({
      imaging: state.imaging.map((i) => (i.id === id ? { ...i, ...data } : i)),
      updatedAt: new Date().toISOString(),
    })),

  updateOperativeNote: (data: Partial<OperativeNote>) =>
    set((state) => ({
      operativeNote: { ...state.operativeNote, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateDischarge: (data: Partial<Discharge>) =>
    set((state) => ({
      discharge: { ...state.discharge, ...data },
      updatedAt: new Date().toISOString(),
    })),

  // Discharge medication actions
  addDischargeMedication: (med: Medication) =>
    set((state) => ({
      discharge: {
        ...state.discharge,
        dischargeMedications: [...state.discharge.dischargeMedications, { ...med, id: uuidv4() }],
      },
      updatedAt: new Date().toISOString(),
    })),

  removeDischargeMedication: (id: string) =>
    set((state) => ({
      discharge: {
        ...state.discharge,
        dischargeMedications: state.discharge.dischargeMedications.filter((m) => m.id !== id),
      },
      updatedAt: new Date().toISOString(),
    })),

  updateDischargeMedication: (id: string, data: Partial<Medication>) =>
    set((state) => ({
      discharge: {
        ...state.discharge,
        dischargeMedications: state.discharge.dischargeMedications.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  // Medication dispense actions
  addMedicationDispense: (med: Medication) =>
    set((state) => ({
      discharge: {
        ...state.discharge,
        medicationDispenseList: [
          ...(state.discharge.medicationDispenseList || []),
          { ...med, id: uuidv4() },
        ],
      },
      updatedAt: new Date().toISOString(),
    })),

  removeMedicationDispense: (id: string) =>
    set((state) => ({
      discharge: {
        ...state.discharge,
        medicationDispenseList: (state.discharge.medicationDispenseList || []).filter(
          (m) => m.id !== id
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  updateMedicationDispense: (id: string, data: Partial<Medication>) =>
    set((state) => ({
      discharge: {
        ...state.discharge,
        medicationDispenseList: (state.discharge.medicationDispenseList || []).map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  // New module update actions
  updatePreAnesthesia: (data: Partial<PreAnesthesia>) =>
    set((state) => ({
      preAnesthesia: { ...state.preAnesthesia, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateAnesthesiaRecord: (data: Partial<AnesthesiaRecord>) =>
    set((state) => ({
      anesthesiaRecord: { ...state.anesthesiaRecord, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateORRecord: (data: Partial<ORRecord>) =>
    set((state) => ({
      orRecord: { ...state.orRecord, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateNursingOrders: (data: Partial<NursingOrders>) =>
    set((state) => ({
      nursingOrders: { ...state.nursingOrders, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updatePACU: (data: Partial<PACUFlow>) =>
    set((state) => ({
      pacu: { ...state.pacu, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateFloorFlow: (data: Partial<FloorFlow>) =>
    set((state) => ({
      floorFlow: { ...state.floorFlow, ...data },
      updatedAt: new Date().toISOString(),
    })),

  updateProgressNotes: (data: Partial<ProgressNotesModule>) =>
    set((state) => ({
      progressNotes: { ...state.progressNotes, ...data },
      updatedAt: new Date().toISOString(),
    })),

  // Data management
  savePatient: () => {
    const state = get();
    const patientData: PatientData = {
      ishiId: state.ishiId,
      currentProvider: state.currentProvider,
      createdAt: state.createdAt,
      updatedAt: new Date().toISOString(),
      demographics: state.demographics,
      triage: state.triage,
      surgicalNeeds: state.surgicalNeeds,
      consent: state.consent,
      medications: state.medications,
      labs: state.labs,
      imaging: state.imaging,
      operativeNote: state.operativeNote,
      discharge: state.discharge,
      preAnesthesia: state.preAnesthesia,
      anesthesiaRecord: state.anesthesiaRecord,
      orRecord: state.orRecord,
      nursingOrders: state.nursingOrders,
      pacu: state.pacu,
      floorFlow: state.floorFlow,
      progressNotes: state.progressNotes,
    };

    // Export as JSON file
    exportPatientToJSON(patientData);

    // Also save to IndexedDB
    saveToStorage(patientData);
  },

  loadPatient: (data: PatientData) => {
    set({
      ishiId: data.ishiId,
      currentProvider: data.currentProvider,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      demographics: data.demographics,
      triage: data.triage,
      surgicalNeeds: data.surgicalNeeds,
      consent: data.consent,
      medications: data.medications,
      labs: data.labs,
      imaging: data.imaging,
      operativeNote: data.operativeNote,
      discharge: data.discharge,
      preAnesthesia: data.preAnesthesia,
      anesthesiaRecord: data.anesthesiaRecord,
      orRecord: data.orRecord,
      nursingOrders: data.nursingOrders,
      pacu: data.pacu,
      floorFlow: data.floorFlow,
      progressNotes: data.progressNotes,
      isLoggedIn: true,
    });

    // Save to IndexedDB
    saveToStorage(data);
  },

  reset: () => {
    set({
      ishiId: '',
      currentProvider: '',
      createdAt: '',
      updatedAt: '',
      currentTab: 'demographics',
      isLoggedIn: false,
      demographics: initialDemographics,
      triage: initialTriage,
      surgicalNeeds: initialSurgicalNeeds,
      consent: initialConsent,
      medications: {
        currentMedications: [],
        allergies: [],
        prnMedications: [],
        preopMedications: [],
      },
      labs: [],
      imaging: [],
      operativeNote: initialOperativeNote,
      discharge: initialDischarge,
      preAnesthesia: initialPreAnesthesia,
      anesthesiaRecord: initialAnesthesiaRecord,
      orRecord: initialORRecord,
      nursingOrders: initialNursingOrders,
      pacu: initialPACU,
      floorFlow: initialFloorFlow,
      progressNotes: initialProgressNotes,
    });
  },
}));
