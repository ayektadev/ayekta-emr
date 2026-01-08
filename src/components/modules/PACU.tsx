import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../../store/patientStore';

/**
 * Component for the Post Anesthesia Care Unit (PACU) flowsheet. Captures
 * arrival details, interventions and a time‑stamped table for vital signs and
 * medications administered. Rows can be added or removed dynamically.
 */
export default function PACU() {
  const pacu = usePatientStore((state) => state.pacu);
  const updatePACU = usePatientStore((state) => state.updatePACU);

  const handleFieldChange = (field: keyof typeof pacu, value: any) => {
    updatePACU({ [field]: value });
  };

  const handleRowChange = (id: string, field: keyof (typeof pacu.rows[0]), value: string) => {
    const updatedRows = pacu.rows.map((row) => (row.id === id ? { ...row, [field]: value } : row));
    updatePACU({ rows: updatedRows });
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
    updatePACU({ rows: [...pacu.rows, newRow] });
  };

  const handleRemoveRow = (id: string) => {
    updatePACU({ rows: pacu.rows.filter((row) => row.id !== id) });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">PACU Flowsheet</h2>
      <div className="space-y-6">
        {/* Arrival & Interventions */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Arrival &amp; Interventions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Arrival Time</label>
              <input
                type="time"
                value={pacu.arrivalTime}
                onChange={(e) => handleFieldChange('arrivalTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TAP Block / Regional Anesthesia</label>
              <input
                type="text"
                value={pacu.tapBlock}
                onChange={(e) => handleFieldChange('tapBlock', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Yes/No or details"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Closure Type</label>
              <select
                value={pacu.closureType}
                onChange={(e) => handleFieldChange('closureType', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="Dermabond">Dermabond</option>
                <option value="Staples">Staples</option>
                <option value="Sutures">Sutures</option>
                <option value="Steri-Strips">Steri-Strips</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dressing</label>
              <input
                type="text"
                value={pacu.dressing}
                onChange={(e) => handleFieldChange('dressing', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Type and status of dressing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Drains Present</label>
              <input
                type="text"
                value={pacu.drains}
                onChange={(e) => handleFieldChange('drains', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., None, JP drain"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supportive Garments</label>
              <input
                type="text"
                value={pacu.supportiveGarments}
                onChange={(e) => handleFieldChange('supportiveGarments', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Binder, Scrotal support..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IV Access</label>
              <input
                type="text"
                value={pacu.ivAccess}
                onChange={(e) => handleFieldChange('ivAccess', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Site and gauge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Intake / Output</label>
              <input
                type="text"
                value={pacu.intakeOutput}
                onChange={(e) => handleFieldChange('intakeOutput', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Fluids in/out, urine volume, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nausea/Vomiting</label>
              <input
                type="text"
                value={pacu.nauseaVomiting}
                onChange={(e) => handleFieldChange('nauseaVomiting', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., None, Mild, Severe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Antiemetic (Time)</label>
              <input
                type="time"
                value={pacu.lastAntiemetic}
                onChange={(e) => handleFieldChange('lastAntiemetic', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Foley Catheter</label>
              <select
                value={pacu.foley}
                onChange={(e) => handleFieldChange('foley', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urine Color</label>
              <input
                type="text"
                value={pacu.urineColor}
                onChange={(e) => handleFieldChange('urineColor', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Clear, Blood tinged"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urine Clots</label>
              <input
                type="text"
                value={pacu.urineClots}
                onChange={(e) => handleFieldChange('urineClots', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., None, Few"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aldrete Score</label>
              <select
                value={pacu.aldreteScore}
                onChange={(e) => handleFieldChange('aldreteScore', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>
        </section>

        {/* Vitals / Meds Table */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">PACU Vital Signs &amp; Medications</h3>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              + Add Row
            </button>
          </div>
          {pacu.rows.length === 0 ? (
            <p className="text-ayekta-muted text-sm">No PACU observations recorded.</p>
          ) : (
            <div className="space-y-4">
              {pacu.rows.map((row) => (
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
      </div>
    </div>
  );
}