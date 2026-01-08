import { usePatientStore } from '../../store/patientStore';
import { getCurrentDate, getCurrentTime } from '../../utils/calculations';
import type { Medication } from '../../types/patient.types';
import { SignatureField } from '../shared/SignatureField';
import { generateDischargeSummaryPDF } from '../../utils/dischargePDF';

export default function Discharge() {
  const discharge = usePatientStore((state) => state.discharge);
  const updateDischarge = usePatientStore((state) => state.updateDischarge);
  const demographics = usePatientStore((state) => state.demographics);
  const surgicalNeeds = usePatientStore((state) => state.surgicalNeeds);
  const ishiId = usePatientStore((state) => state.ishiId);

  // Dispense medication actions (now the single medication list)
  const addMedicationDispense = usePatientStore((state) => state.addMedicationDispense);
  const removeMedicationDispense = usePatientStore((state) => state.removeMedicationDispense);
  const updateMedicationDispense = usePatientStore((state) => state.updateMedicationDispense);

  const handleChange = (field: keyof typeof discharge, value: string) => {
    updateDischarge({ [field]: value });
  };

  const handleCriteriaChange = (criteriaField: keyof NonNullable<typeof discharge.dischargeCriteria>, value: boolean) => {
    updateDischarge({
      dischargeCriteria: {
        voiding: false,
        ambulating: false,
        dietTolerated: false,
        painControlled: false,
        instructionsGiven: false,
        followUpBooked: false,
        woundClean: false,
        ...discharge.dischargeCriteria,
        [criteriaField]: value,
      },
    });
  };

  const setCurrentDischargeDateTime = () => {
    updateDischarge({
      dischargeDate: getCurrentDate(),
      dischargeTime: getCurrentTime(),
    });
  };

  const setCurrentFollowupDate = () => {
    updateDischarge({ followupDate: getCurrentDate() });
  };

  const handlePrintDischargeSummary = () => {
    generateDischargeSummaryPDF({
      demographics,
      discharge,
      surgicalNeeds,
      ishiId,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Discharge Planning</h2>
        <button
          onClick={handlePrintDischargeSummary}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Discharge Summary
        </button>
      </div>

      <div className="space-y-6">
        {/* Discharge Details */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Discharge Details</h3>
            <button
              onClick={setCurrentDischargeDateTime}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              Set Current Date/Time
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discharge Date</label>
              <input
                type="date"
                value={discharge.dischargeDate}
                onChange={(e) => handleChange('dischargeDate', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discharge Time</label>
              <input
                type="time"
                value={discharge.dischargeTime}
                onChange={(e) => handleChange('dischargeTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
        {/* Discharge Destination */}
        <div>
          <label className="block text-sm font-medium mb-1">Discharge Destination</label>
          <select
            value={discharge.dischargeDestination || ''}
            onChange={(e) => handleChange('dischargeDestination', e.target.value)}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
          >
            <option value="">Select</option>
            <option value="Home">Home</option>
            <option value="Other">Other</option>
          </select>
        </div>
          </div>
        </section>

        {/* Discharge Orders & Instructions */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Discharge Orders &amp; Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* General and Return Precautions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">General Instructions</label>
              <textarea
                value={discharge.dischargeInstructions}
                onChange={(e) => handleChange('dischargeInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="General discharge instructions for patient..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Return Precautions (When to Seek Emergency Care)</label>
              <textarea
                value={discharge.returnPrecautions}
                onChange={(e) => handleChange('returnPrecautions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Warning signs that require immediate medical attention..."
              />
            </div>

            {/* Diet Instructions */}
            <div>
              <label className="block text-sm font-medium mb-1">Diet Instructions</label>
              <select
                value={discharge.dietInstructions || ''}
                onChange={(e) => handleChange('dietInstructions', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="Regular">Regular diet</option>
                <option value="Increase water">Increase water intake</option>
                <option value="Other">Other</option>
              </select>
              {/* If 'Other' is selected, specify details in General Instructions section */}
            </div>

            {/* Activity Restrictions */}
            <div>
              <label className="block text-sm font-medium mb-1">Activity Restrictions</label>
              <select
                value={discharge.activityRestrictions || ''}
                onChange={(e) => handleChange('activityRestrictions', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="As tolerated">As tolerated</option>
                <option value="Increase with pain">Increase with pain</option>
                <option value="Other">Other</option>
              </select>
              {/* If 'Other' is selected, specify details in General Instructions section */}
            </div>

            {/* Specific Restrictions */}
            <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={discharge.noHeavyLifting || false}
                  onChange={(e) => updateDischarge({ noHeavyLifting: e.target.checked })}
                />
                <span>No heavy lifting</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={discharge.noBaths || false}
                  onChange={(e) => updateDischarge({ noBaths: e.target.checked })}
                />
                <span>No baths (shower only)</span>
              </label>
            </div>

            {/* Shower & Dressing Instructions */}
            <div>
              <label className="block text-sm font-medium mb-1">Shower Instructions</label>
              <textarea
                value={discharge.showerInstructions || ''}
                onChange={(e) => updateDischarge({ showerInstructions: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Remove dressing after 48h, shower with soap and water, pat dry..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dressing Instructions</label>
              <textarea
                value={discharge.dressingInstructions || ''}
                onChange={(e) => updateDischarge({ dressingInstructions: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="When and how to change dressings..."
              />
            </div>

            {/* Wound Care */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Wound Care Instructions</label>
              <textarea
                value={discharge.woundCare}
                onChange={(e) => handleChange('woundCare', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="How to care for surgical site or wounds..."
              />
            </div>
          </div>
        </section>

        {/* RN Notes & Floor Orders */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">RN Notes &amp; Floor Orders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">RN Notes</label>
              <textarea
                value={discharge.rnNotes || ''}
                onChange={(e) => updateDischarge({ rnNotes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Notes, observations and handoff information..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Floor Orders</label>
              <textarea
                value={discharge.floorOrders || ''}
                onChange={(e) => updateDischarge({ floorOrders: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Nursing orders for the floor or ward staff..."
              />
            </div>
          </div>
        </section>

        {/* Discharge Criteria Checklist */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Discharge Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.voiding || false}
                onChange={(e) => handleCriteriaChange('voiding', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Voiding spontaneously</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.ambulating || false}
                onChange={(e) => handleCriteriaChange('ambulating', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Ambulating appropriately</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.dietTolerated || false}
                onChange={(e) => handleCriteriaChange('dietTolerated', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Tolerating regular diet</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.painControlled || false}
                onChange={(e) => handleCriteriaChange('painControlled', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Pain controlled</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.instructionsGiven || false}
                onChange={(e) => handleCriteriaChange('instructionsGiven', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Instructions given / understood</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.followUpBooked || false}
                onChange={(e) => handleCriteriaChange('followUpBooked', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Follow‑up appointment booked</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={discharge.dischargeCriteria?.woundClean || false}
                onChange={(e) => handleCriteriaChange('woundClean', e.target.checked)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <span className="text-sm">Wound clean / no infection</span>
            </label>
          </div>
        </section>

        {/* Verification Section */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Provider Verification</h3>
          <div className="space-y-4">
            <div>
              <SignatureField
                label="MD Verification"
                providerName={discharge.mdVerificationName || ''}
                signatureDate={discharge.mdVerificationDate || ''}
                onProviderNameChange={(value) => updateDischarge({ mdVerificationName: value })}
                onSignatureDateChange={(value) => updateDischarge({ mdVerificationDate: value })}
                showAutoFillButton={true}
              />
            </div>
            <div>
              <SignatureField
                label="RN Verification"
                providerName={discharge.rnVerificationName || ''}
                signatureDate={discharge.rnVerificationDate || ''}
                onProviderNameChange={(value) => updateDischarge({ rnVerificationName: value })}
                onSignatureDateChange={(value) => updateDischarge({ rnVerificationDate: value })}
                showAutoFillButton={false}
              />
            </div>
          </div>
        </section>

        {/* Medications Dispensed at Discharge */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Medications Dispensed at Discharge</h3>
            <button
              onClick={() =>
                addMedicationDispense({ id: '', name: '', dose: '', frequency: '', route: '', startDate: '', stopDate: '' })
              }
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add Medication
            </button>
          </div>
          {(!discharge.medicationDispenseList || discharge.medicationDispenseList.length === 0) ? (
            <p className="text-ayekta-muted text-sm">No medications dispensed at discharge.</p>
          ) : (
            <div className="space-y-4">
              {discharge.medicationDispenseList!.map((med) => (
                <DispenseMedicationRow
                  key={med.id}
                  medication={med}
                  onUpdate={updateMedicationDispense}
                  onRemove={removeMedicationDispense}
                />
              ))}
            </div>
          )}
        </section>

        {/* Follow-up Appointment */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Follow-up Appointment</h3>
            <button
              onClick={setCurrentFollowupDate}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              Set Today
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Date</label>
              <input
                type="date"
                value={discharge.followupDate}
                onChange={(e) => handleChange('followupDate', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Time</label>
              <input
                type="time"
                value={discharge.followupTime}
                onChange={(e) => handleChange('followupTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Location</label>
              <input
                type="text"
                value={discharge.followupPlace}
                onChange={(e) => handleChange('followupPlace', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Clinic name or address..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Provider</label>
              <input
                type="text"
                value={discharge.followupProvider}
                onChange={(e) => handleChange('followupProvider', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Provider name..."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Medication dispense row component (the single medication list for discharge)
function DispenseMedicationRow({
  medication,
  onUpdate,
  onRemove,
}: {
  medication: Medication;
  onUpdate: (id: string, updates: Partial<Medication>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 border border-ayekta-border rounded">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1">Medication Name</label>
          <input
            type="text"
            value={medication.name}
            onChange={(e) => onUpdate(medication.id, { name: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., Ibuprofen"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Dose</label>
          <input
            type="text"
            value={medication.dose}
            onChange={(e) => onUpdate(medication.id, { dose: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., 400 mg"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Quantity</label>
          <input
            type="text"
            value={medication.frequency}
            onChange={(e) => onUpdate(medication.id, { frequency: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., #10 tablets"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Instructions</label>
          <input
            type="text"
            value={medication.route}
            onChange={(e) => onUpdate(medication.id, { route: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., Take one tablet twice daily"
          />
        </div>
      </div>
      <button
        onClick={() => onRemove(medication.id)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Remove
      </button>
    </div>
  );
}
