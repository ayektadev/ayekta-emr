import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../../store/patientStore';

/**
 * Component for the floor/ward flowsheet after PACU. Includes arrival details,
 * a time‑stamped vitals and medications table, nursing assessment and
 * interventions checklist. Rows can be added or removed.
 */
export default function FloorFlow() {
  const floorFlow = usePatientStore((state) => state.floorFlow);
  const updateFloorFlow = usePatientStore((state) => state.updateFloorFlow);

  const handleFieldChange = (field: keyof typeof floorFlow, value: any) => {
    updateFloorFlow({ [field]: value });
  };

  const handleRowChange = (id: string, field: keyof (typeof floorFlow.rows[0]), value: string) => {
    const updatedRows = floorFlow.rows.map((row) => (row.id === id ? { ...row, [field]: value } : row));
    updateFloorFlow({ rows: updatedRows });
  };

  const handleAddRow = () => {
    const newRow = {
      id: uuidv4(),
      time: '',
      hr: '',
      bp: '',
      spo2: '',
      painScore: '',
      medsGiven: '',
      notes: '',
    };
    updateFloorFlow({ rows: [...floorFlow.rows, newRow] });
  };

  const handleRemoveRow = (id: string) => {
    updateFloorFlow({ rows: floorFlow.rows.filter((row) => row.id !== id) });
  };

  const handleAssessmentChange = (field: keyof typeof floorFlow.assessment, value: string) => {
    updateFloorFlow({ assessment: { ...floorFlow.assessment, [field]: value } });
  };

  const handleInterventionChange = (field: keyof typeof floorFlow.interventions, value: boolean) => {
    updateFloorFlow({ interventions: { ...floorFlow.interventions, [field]: value } });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Floor Flowsheet</h2>
      <div className="space-y-6">
        {/* Arrival */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Arrival Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Arrival Time</label>
              <input
                type="time"
                value={floorFlow.arrivalTime}
                onChange={(e) => handleFieldChange('arrivalTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transport Method</label>
              <input
                type="text"
                value={floorFlow.transportMethod}
                onChange={(e) => handleFieldChange('transportMethod', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Wheelchair, Ambulation, Bed"
              />
            </div>
          </div>
        </section>

        {/* Vitals Table */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Floor Vital Signs &amp; Medications</h3>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add Row
            </button>
          </div>
          {floorFlow.rows.length === 0 ? (
            <p className="text-ayekta-muted text-sm">No floor observations recorded.</p>
          ) : (
            <div className="space-y-4">
              {floorFlow.rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end"
                >
                  <div>
                    <label className="block text-xs font-medium mb-1">Time</label>
                    <input
                      type="time"
                      value={row.time}
                      onChange={(e) => handleRowChange(row.id, 'time', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">HR</label>
                    <input
                      type="text"
                      value={row.hr}
                      onChange={(e) => handleRowChange(row.id, 'hr', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">BP</label>
                    <input
                      type="text"
                      value={row.bp}
                      onChange={(e) => handleRowChange(row.id, 'bp', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">SpO₂</label>
                    <input
                      type="text"
                      value={row.spo2}
                      onChange={(e) => handleRowChange(row.id, 'spo2', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Pain</label>
                    <input
                      type="text"
                      value={row.painScore}
                      onChange={(e) => handleRowChange(row.id, 'painScore', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Meds Given</label>
                    <input
                      type="text"
                      value={row.medsGiven}
                      onChange={(e) => handleRowChange(row.id, 'medsGiven', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1">Notes</label>
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                      className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-xs mb-1"
                    />
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-red-600 text-xs self-start hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assessment & Interventions */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Assessment &amp; Interventions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Airway</label>
              <input
                type="text"
                value={floorFlow.assessment.airway}
                onChange={(e) => handleAssessmentChange('airway', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Breathing</label>
              <input
                type="text"
                value={floorFlow.assessment.breathing}
                onChange={(e) => handleAssessmentChange('breathing', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Circulation</label>
              <input
                type="text"
                value={floorFlow.assessment.circulation}
                onChange={(e) => handleAssessmentChange('circulation', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Neurologic</label>
              <input
                type="text"
                value={floorFlow.assessment.neuro}
                onChange={(e) => handleAssessmentChange('neuro', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surgical Site</label>
              <input
                type="text"
                value={floorFlow.assessment.surgicalSite}
                onChange={(e) => handleAssessmentChange('surgicalSite', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GI</label>
              <input
                type="text"
                value={floorFlow.assessment.gi}
                onChange={(e) => handleAssessmentChange('gi', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GU</label>
              <input
                type="text"
                value={floorFlow.assessment.gu}
                onChange={(e) => handleAssessmentChange('gu', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>

          {/* Interventions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={floorFlow.interventions.ambulated}
                onChange={(e) => handleInterventionChange('ambulated', e.target.checked)}
              />
              <span>Ambulated/Out of Bed</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={floorFlow.interventions.voided}
                onChange={(e) => handleInterventionChange('voided', e.target.checked)}
              />
              <span>Voided</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={floorFlow.interventions.binderInPlace}
                onChange={(e) => handleInterventionChange('binderInPlace', e.target.checked)}
              />
              <span>Abdominal Binder In Place</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={floorFlow.interventions.scrotalSupportInPlace}
                onChange={(e) => handleInterventionChange('scrotalSupportInPlace', e.target.checked)}
              />
              <span>Scrotal Support In Place</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={floorFlow.interventions.iORecorded}
                onChange={(e) => handleInterventionChange('iORecorded', e.target.checked)}
              />
              <span>I/O Recorded</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={floorFlow.interventions.familyUpdated}
                onChange={(e) => handleInterventionChange('familyUpdated', e.target.checked)}
              />
              <span>Family Updated</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}