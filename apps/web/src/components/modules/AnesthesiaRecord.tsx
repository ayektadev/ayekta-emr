import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../../store/patientStore';

/**
 * Component to document intraoperative anesthesia and sedation events. Provides a
 * simple table where each row represents a time‑stamped event with optional
 * drug and notes. Users can add or remove rows as needed.
 */
export default function AnesthesiaRecord() {
  const anesthesiaRecord = usePatientStore((state) => state.anesthesiaRecord);
  const updateAnesthesiaRecord = usePatientStore((state) => state.updateAnesthesiaRecord);

  const handleTotalsChange = (field: keyof typeof anesthesiaRecord.totals, value: string) => {
    updateAnesthesiaRecord({
      totals: { ...anesthesiaRecord.totals, [field]: value },
    });
  };

  const handleRowChange = (
    id: string,
    field:
      | 'time'
      | 'bp'
      | 'hr'
      | 'rr'
      | 'spo2'
      | 'event'
      | 'drug'
      | 'notes'
      | 'painScore'
      | 'fluids'
      | 'urineOutput'
      | 'vasopressor',
    value: string
  ) => {
    const updatedRows = anesthesiaRecord.rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    updateAnesthesiaRecord({ rows: updatedRows });
  };

  const handleAddRow = () => {
    const newRow = {
      id: uuidv4(),
      time: '',
      bp: '',
      hr: '',
      rr: '',
      spo2: '',
      event: '',
      drug: '',
      notes: '',
      painScore: '',
      fluids: '',
      urineOutput: '',
      vasopressor: '',
    };
    updateAnesthesiaRecord({ rows: [...anesthesiaRecord.rows, newRow] });
  };

  const handleRemoveRow = (id: string) => {
    const updatedRows = anesthesiaRecord.rows.filter((row) => row.id !== id);
    updateAnesthesiaRecord({ rows: updatedRows });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Anesthesia / Sedation Record</h2>
      <div className="space-y-4">
        {anesthesiaRecord.rows.length === 0 && (
          <p className="text-ayekta-muted text-sm">No anesthesia events recorded.</p>
        )}
        {anesthesiaRecord.rows.map((row) => (
          <div
            key={row.id}
            className="bg-white rounded-lg shadow-sm border border-ayekta-border p-4 grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
          >
            {/* Time */}
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={row.time}
                onChange={(e) => handleRowChange(row.id, 'time', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            {/* BP */}
            <div>
              <label className="block text-sm font-medium mb-1">BP</label>
              <input
                type="text"
                value={row.bp}
                onChange={(e) => handleRowChange(row.id, 'bp', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 120/80"
              />
            </div>
            {/* HR */}
            <div>
              <label className="block text-sm font-medium mb-1">HR</label>
              <input
                type="text"
                value={row.hr}
                onChange={(e) => handleRowChange(row.id, 'hr', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="bpm"
              />
            </div>
            {/* RR */}
            <div>
              <label className="block text-sm font-medium mb-1">RR</label>
              <input
                type="text"
                value={row.rr}
                onChange={(e) => handleRowChange(row.id, 'rr', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="breaths/min"
              />
            </div>
            {/* SpO₂ */}
            <div>
              <label className="block text-sm font-medium mb-1">SpO₂</label>
              <input
                type="text"
                value={row.spo2}
                onChange={(e) => handleRowChange(row.id, 'spo2', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="%"
              />
            </div>

            {/* Pain Score */}
            <div>
              <label className="block text-sm font-medium mb-1">Pain</label>
              <input
                type="number"
                min="0"
                max="10"
                value={row.painScore || ''}
                onChange={(e) => handleRowChange(row.id, 'painScore', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="0–10"
              />
            </div>

            {/* Fluids/Drugs Total */}
            <div>
              <label className="block text-sm font-medium mb-1">IV Fluids</label>
              <input
                type="text"
                value={row.fluids || ''}
                onChange={(e) => handleRowChange(row.id, 'fluids', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 500 mL LR"
              />
            </div>

            {/* Urine Output */}
            <div>
              <label className="block text-sm font-medium mb-1">UO (mL)</label>
              <input
                type="text"
                value={row.urineOutput || ''}
                onChange={(e) => handleRowChange(row.id, 'urineOutput', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="mL"
              />
            </div>

            {/* Vasopressor */}
            <div>
              <label className="block text-sm font-medium mb-1">Vasopressor</label>
              <input
                type="text"
                value={row.vasopressor || ''}
                onChange={(e) => handleRowChange(row.id, 'vasopressor', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Drug + dose"
              />
            </div>
            {/* Event */}
            <div>
              <label className="block text-sm font-medium mb-1">Event</label>
              <input
                type="text"
                value={row.event}
                onChange={(e) => handleRowChange(row.id, 'event', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Induction, incision, etc."
              />
            </div>
            {/* Drug */}
            <div>
              <label className="block text-sm font-medium mb-1">Drug</label>
              <input
                type="text"
                value={row.drug}
                onChange={(e) => handleRowChange(row.id, 'drug', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Propofol 200mg"
              />
            </div>
            {/* Notes and remove button */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                type="text"
                value={row.notes}
                onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange mb-2"
                placeholder="Additional details..."
              />
              <button
                onClick={() => handleRemoveRow(row.id)}
                className="text-red-600 text-sm self-start hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={handleAddRow}
          className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
        >
          + Add Event
        </button>

        {/* Intraoperative Totals */}
        <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6 mt-2">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Intraoperative Totals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total IV Fluid</label>
              <input
                type="text"
                value={anesthesiaRecord.totals.totalIVFluid}
                onChange={(e) => handleTotalsChange('totalIVFluid', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 1500 mL LR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Urine Output</label>
              <input
                type="text"
                value={anesthesiaRecord.totals.totalUrineOutput}
                onChange={(e) => handleTotalsChange('totalUrineOutput', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 350 mL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Estimated Blood Loss</label>
              <input
                type="text"
                value={anesthesiaRecord.totals.totalBloodLoss}
                onChange={(e) => handleTotalsChange('totalBloodLoss', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 200 mL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vasopressors Used</label>
              <input
                type="text"
                value={anesthesiaRecord.totals.vasopressorsUsed}
                onChange={(e) => handleTotalsChange('vasopressorsUsed', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Phenylephrine PRN x3 doses"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}