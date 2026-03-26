/**
 * New Patient Modal
 * 
 * Quick-create modal for new patient registration.
 */

import { useState } from 'react';
import { usePatientStore } from '../../store/patientStore';
import { usePatientListStore } from '../../store/patientListStore';
import { generateIshiId, getCurrentDate } from '../../utils/calculations';

interface NewPatientModalProps {
  onClose: () => void;
}

export default function NewPatientModal({ onClose }: NewPatientModalProps) {
  const { addPatient } = usePatientListStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    address: '',
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const ishiId = generateIshiId();

      // Create initial patient data
      const patientData = {
        ishiId,
        currentProvider: usePatientStore.getState().currentProvider || 'Unknown',
        createdAt: now,
        updatedAt: now,
        firstSavedAt: now,
        demographics: {
          firstName: formData.firstName,
          middleName: '',
          lastName: formData.lastName,
          dob: formData.dob,
          age: calculateAge(formData.dob),
          gender: formData.gender || 'Not specified',
          address: formData.address || '',
          phone: formData.phone || '',
          email: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelationship: '',
          bloodGroup: '',
          bloodTransfusionHistory: false,
          bloodTransfusionDetails: '',
          allergies: '',
          currentMedications: '',
          pastMedicalHistory: '',
          pastSurgicalHistory: '',
          familyHistory: '',
          socialHistory: '',
          pmhHTN: false,
          pmhDM2: false,
          pmhCOPD: false,
          pmhBPH: false,
          pmhOther: '',
        },
        triage: {
          date: getCurrentDate(),
          time: new Date().toTimeString().slice(0, 5),
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
          attendingSurgeon: '',
          hpProviderName: '',
          hpProviderSignatureDate: '',
        },
        surgicalNeeds: {
          procedure: '',
          herniaScore: null,
          urgencyLevel: '',
          anesthesiaType: '',
          specialEquipment: '',
          preopTesting: '',
          additionalNotes: '',
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
          herniaSizeClassification: '',
          skinFoldThicknessClassification: '',
          inguinoscrotalComponent: '',
        },
        consent: {
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
          interpreterUsed: false,
          interpreterLanguage: '',
          interpreterType: '',
          interpreterName: '',
        },
        medications: {
          currentMedications: [],
          allergies: [],
          prnMedications: [],
          preopMedications: [],
        },
        labs: [],
        imaging: [],
        operativeNote: {
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
          caseDuration: '',
          circulatingRN: '',
          surgicalTechnologist: '',
        },
        discharge: {
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
          dischargeDestination: '',
          noHeavyLifting: false,
          noBaths: false,
          showerInstructions: '',
          dressingInstructions: '',
          floorOrders: '',
        },
        preAnesthesia: {
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
          vitalHR: '',
          vitalBP: '',
          vitalRR: '',
          vitalO2Sat: '',
          vitalTemp: '',
          vitalHeight: '',
          vitalWeight: '',
          airwayAssessment: '',
          rangeOfMotion: '',
          cardiovascularExam: '',
          pulmonaryExam: '',
          neurologicExam: '',
          labs: '',
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
          airwayDentitionIssues: false,
        },
        anesthesiaRecord: {
          rows: [],
          totals: {
            totalIVFluid: '',
            totalUrineOutput: '',
            totalBloodLoss: '',
            vasopressorsUsed: '',
          },
        },
        orRecord: {
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
          instrumentCounts: [],
        },
        nursingOrders: {
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
        },
        pacu: {
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
        },
        floorFlow: {
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
        },
        progressNotes: {
          notes: [],
        },
        followUpNotes: {
          notes: [],
        },
      };

      // Add to patient list
      await addPatient(patientData);

      // Close modal and redirect to patient
      onClose();
      
      // Optionally: redirect to the new patient
      // window.location.href = `/patient/${ishiId}`;
    } catch (err) {
      console.error('Failed to create patient:', err);
      setError('Failed to create patient. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">New Patient Registration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Enter first name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              placeholder="Enter address"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
          >
            {isCreating ? 'Creating...' : 'Create Patient'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
