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
    });
  },
}));
