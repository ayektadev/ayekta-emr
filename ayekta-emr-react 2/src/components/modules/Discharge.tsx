import { usePatientStore } from '../../store/patientStore';
import { getCurrentDate, getCurrentTime } from '../../utils/calculations';
import type { Medication } from '../../types/patient.types';

export default function Discharge() {
  const discharge = usePatientStore((state) => state.discharge);
  const updateDischarge = usePatientStore((state) => state.updateDischarge);
  const addDischargeMedication = usePatientStore((state) => state.addDischargeMedication);
  const removeDischargeMedication = usePatientStore((state) => state.removeDischargeMedication);
  const updateDischargeMedication = usePatientStore((state) => state.updateDischargeMedication);

  const handleChange = (field: keyof typeof discharge, value: string) => {
    updateDischarge({ [field]: value });
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Discharge Planning</h2>

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
          </div>
        </section>

        {/* Discharge Instructions */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Discharge Instructions</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">General Instructions</label>
              <textarea
                value={discharge.dischargeInstructions}
                onChange={(e) => handleChange('dischargeInstructions', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="General discharge instructions for patient..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Return Precautions (When to Seek Emergency Care)</label>
              <textarea
                value={discharge.returnPrecautions}
                onChange={(e) => handleChange('returnPrecautions', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Warning signs that require immediate medical attention..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Activity Restrictions</label>
              <textarea
                value={discharge.activityRestrictions}
                onChange={(e) => handleChange('activityRestrictions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Physical activity limitations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Diet Instructions</label>
              <textarea
                value={discharge.dietInstructions}
                onChange={(e) => handleChange('dietInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Dietary guidelines and restrictions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Wound Care Instructions</label>
              <textarea
                value={discharge.woundCare}
                onChange={(e) => handleChange('woundCare', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="How to care for surgical site or wounds..."
              />
            </div>
          </div>
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

        {/* Discharge Medications */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Discharge Medications</h3>
            <button
              onClick={() => addDischargeMedication({ id: '', name: '', dose: '', frequency: '', route: '', startDate: '', stopDate: '' })}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add Medication
            </button>
          </div>

          {discharge.dischargeMedications.length === 0 ? (
            <p className="text-ayekta-muted text-sm">No discharge medications prescribed</p>
          ) : (
            <div className="space-y-4">
              {discharge.dischargeMedications.map((med) => (
                <DischargeMedicationRow
                  key={med.id}
                  medication={med}
                  onUpdate={updateDischargeMedication}
                  onRemove={removeDischargeMedication}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Discharge Medication Row Component
function DischargeMedicationRow({
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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
          <label className="block text-xs font-medium mb-1">Frequency</label>
          <input
            type="text"
            value={medication.frequency}
            onChange={(e) => onUpdate(medication.id, { frequency: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., Every 6 hours as needed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Route</label>
          <select
            value={medication.route}
            onChange={(e) => onUpdate(medication.id, { route: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          >
            <option value="">Select...</option>
            <option value="oral">Oral</option>
            <option value="topical">Topical</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={medication.startDate}
            onChange={(e) => onUpdate(medication.id, { startDate: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Stop Date (if applicable)</label>
          <input
            type="date"
            value={medication.stopDate}
            onChange={(e) => onUpdate(medication.id, { stopDate: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
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
