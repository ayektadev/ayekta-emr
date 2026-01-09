import { usePatientStore } from '../../store/patientStore';
import type { Medication } from '../../types/patient.types';

export default function Medications() {
  const medications = usePatientStore((state) => state.medications);
  const addCurrentMedication = usePatientStore((state) => state.addCurrentMedication);
  const removeCurrentMedication = usePatientStore((state) => state.removeCurrentMedication);
  const updateCurrentMedication = usePatientStore((state) => state.updateCurrentMedication);
  const addPrnMedication = usePatientStore((state) => state.addPrnMedication);
  const removePrnMedication = usePatientStore((state) => state.removePrnMedication);
  const updatePrnMedication = usePatientStore((state) => state.updatePrnMedication);
  const addPreopMedication = usePatientStore((state) => state.addPreopMedication);
  const removePreopMedication = usePatientStore((state) => state.removePreopMedication);
  const updatePreopMedication = usePatientStore((state) => state.updatePreopMedication);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Medications</h2>

      <div className="space-y-6">
        {/* Current Medications */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Current Medications</h3>
            <button
              onClick={() => addCurrentMedication({ id: '', name: '', dose: '', frequency: '', route: '', startDate: '', stopDate: '' })}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add Medication
            </button>
          </div>

          {medications.currentMedications.length === 0 ? (
            <p className="text-ayekta-muted text-sm">No current medications</p>
          ) : (
            <div className="space-y-4">
              {medications.currentMedications.map((med) => (
                <MedicationRow
                  key={med.id}
                  medication={med}
                  onUpdate={updateCurrentMedication}
                  onRemove={removeCurrentMedication}
                />
              ))}
            </div>
          )}
        </section>

        {/* PRN Medications */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">PRN (As Needed) Medications</h3>
            <button
              onClick={() => addPrnMedication({ id: '', name: '', dose: '', frequency: '', route: '', startDate: '', stopDate: '' })}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add PRN Medication
            </button>
          </div>

          {medications.prnMedications.length === 0 ? (
            <p className="text-ayekta-muted text-sm">No PRN medications</p>
          ) : (
            <div className="space-y-4">
              {medications.prnMedications.map((med) => (
                <MedicationRow
                  key={med.id}
                  medication={med}
                  onUpdate={updatePrnMedication}
                  onRemove={removePrnMedication}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pre-op Medications */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Pre-operative Medications</h3>
            <button
              onClick={() => addPreopMedication({ id: '', name: '', dose: '', frequency: '', route: '', startDate: '', stopDate: '' })}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add Pre-op Medication
            </button>
          </div>

          {medications.preopMedications.length === 0 ? (
            <p className="text-ayekta-muted text-sm">No pre-operative medications</p>
          ) : (
            <div className="space-y-4">
              {medications.preopMedications.map((med) => (
                <MedicationRow
                  key={med.id}
                  medication={med}
                  onUpdate={updatePreopMedication}
                  onRemove={removePreopMedication}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Medication Row Component
function MedicationRow({
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
            placeholder="e.g., Aspirin"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Dose</label>
          <input
            type="text"
            value={medication.dose}
            onChange={(e) => onUpdate(medication.id, { dose: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., 100 mg"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Frequency</label>
          <input
            type="text"
            value={medication.frequency}
            onChange={(e) => onUpdate(medication.id, { frequency: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., Once daily"
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
            <option value="iv">IV</option>
            <option value="im">IM</option>
            <option value="sc">SC</option>
            <option value="topical">Topical</option>
            <option value="inhaled">Inhaled</option>
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
          <label className="block text-xs font-medium mb-1">Stop Date</label>
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
