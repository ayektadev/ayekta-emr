import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../../store/patientStore';
import { SignatureField } from '../shared/SignatureField';

/**
 * Progress Notes component
 *
 * Allows providers to capture daily progress notes for post‑operative patients.
 * Each note includes structured fields for the post‑operative day (POD), date/time,
 * pain and diet tolerance, presence of nausea/vomiting, flatus, bowel movements,
 * ambulation and voiding, a focused physical exam, foley/CBI status and urine color,
 * assessment and plan, and provider signature.
 */
export default function ProgressNotes() {
  const progressNotes = usePatientStore((state) => state.progressNotes);
  const updateProgressNotes = usePatientStore((state) => state.updateProgressNotes);
  const currentProvider = usePatientStore((state) => state.currentProvider);

  // Helper to add a new progress note with default values
  const addNote = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    const newNote = {
      id: uuidv4(),
      pod: progressNotes.notes.length + 1,
      date,
      time,
      painLevel: '',
      toleratingPO: false,
      nauseaVomiting: false,
      flatus: false,
      bowelMovement: false,
      ambulation: false,
      voiding: false,
      exam: '',
      foley: '',
      cbi: '',
      urineColor: '',
      assessmentPlan: '',
      painCategory: '',
      dietTolerance: '',
      orientationStatus: '',
      planAdvanceDiet: false,
      planAmbulate: false,
      planDCFoley: false,
      planDischargeHome: false,
      planMedicationChanges: false,
      planOther: '',
      providerName: currentProvider,
      providerSignatureDate: date,
      // New structured exam fields default to empty strings
      lungsExam: '',
      abdomenExam: '',
      woundStatus: '',
      rnOrders: '',
    };
    updateProgressNotes({ notes: [...progressNotes.notes, newNote] });
  };

  // Helper to remove a note by ID
  const removeNote = (id: string) => {
    updateProgressNotes({ notes: progressNotes.notes.filter((n) => n.id !== id) });
  };

  // Helper to update a specific note
  const updateNote = (id: string, field: keyof typeof progressNotes.notes[0], value: any) => {
    const updatedNotes = progressNotes.notes.map((n) =>
      n.id === id ? { ...n, [field]: value } : n
    );
    updateProgressNotes({ notes: updatedNotes });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Progress Notes</h2>
      <div className="mb-4">
        <button
          onClick={addNote}
          className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
        >
          + Add Note
        </button>
      </div>

      {progressNotes.notes.length === 0 ? (
        <p className="text-ayekta-muted text-sm">No progress notes have been recorded.</p>
      ) : (
        <div className="space-y-8">
          {progressNotes.notes.map((note) => (
            <div key={note.id} className="p-4 border border-ayekta-border rounded bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Post‑operative Day {note.pod}</h3>
                <button
                  onClick={() => removeNote(note.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove Note
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={note.date}
                    onChange={(e) => updateNote(note.id, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={note.time}
                    onChange={(e) => updateNote(note.id, 'time', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Pain Level (0–10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={note.painLevel}
                    onChange={(e) => updateNote(note.id, 'painLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  />
                </div>

                {/* Pain category and diet tolerance selections */}
                <div>
                  <label className="block text-xs font-medium mb-1">Pain Category</label>
                  <select
                    value={note.painCategory || ''}
                    onChange={(e) => updateNote(note.id, 'painCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Minimal/Well-controlled">Minimal / Well-controlled</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Poorly controlled">Poorly controlled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Diet Tolerance</label>
                  <select
                    value={note.dietTolerance || ''}
                    onChange={(e) => updateNote(note.id, 'dietTolerance', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Liquids">Liquids</option>
                    <option value="Regular">Regular</option>
                    <option value="Not tolerating">Not tolerating</option>
                    <option value="Not attempted">Not attempted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Orientation</label>
                  <select
                    value={note.orientationStatus || ''}
                    onChange={(e) => updateNote(note.id, 'orientationStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  >
                    <option value="">Select</option>
                    <option value="AAOx3">AAOx3</option>
                    <option value="AAOx4">AAOx4</option>
                    <option value="NAD">NAD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Symptom checkboxes */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${note.id}-toleratingPO`}
                    checked={note.toleratingPO}
                    onChange={(e) => updateNote(note.id, 'toleratingPO', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <label htmlFor={`${note.id}-toleratingPO`} className="text-sm">Tolerating PO</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${note.id}-nauseaVomiting`}
                    checked={note.nauseaVomiting}
                    onChange={(e) => updateNote(note.id, 'nauseaVomiting', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <label htmlFor={`${note.id}-nauseaVomiting`} className="text-sm">Nausea/Vomiting</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${note.id}-flatus`}
                    checked={note.flatus}
                    onChange={(e) => updateNote(note.id, 'flatus', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <label htmlFor={`${note.id}-flatus`} className="text-sm">Flatus</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${note.id}-bowelMovement`}
                    checked={note.bowelMovement}
                    onChange={(e) => updateNote(note.id, 'bowelMovement', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <label htmlFor={`${note.id}-bowelMovement`} className="text-sm">Bowel Movement</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${note.id}-ambulation`}
                    checked={note.ambulation}
                    onChange={(e) => updateNote(note.id, 'ambulation', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <label htmlFor={`${note.id}-ambulation`} className="text-sm">Ambulating</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${note.id}-voiding`}
                    checked={note.voiding}
                    onChange={(e) => updateNote(note.id, 'voiding', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <label htmlFor={`${note.id}-voiding`} className="text-sm">Voiding</label>
                </div>
              </div>

              {/* Exam */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Focused Physical Exam</label>
                <textarea
                  value={note.exam}
                  onChange={(e) => updateNote(note.id, 'exam', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="Free‑text exam findings: lungs, abdomen, incisions..."
                />
              </div>

              {/* Structured Exam Findings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Lungs exam dropdown */}
                <div>
                  <label className="block text-xs font-medium mb-1">Lungs Exam</label>
                  <select
                    value={note.lungsExam || ''}
                    onChange={(e) => updateNote(note.id, 'lungsExam', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  >
                    <option value="">Select</option>
                    <option value="CTA">CTA (Clear to auscultation)</option>
                    <option value="Coarse">Coarse</option>
                    <option value="Decreased Left">Decreased (Left)</option>
                    <option value="Decreased Right">Decreased (Right)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Abdomen exam dropdown */}
                <div>
                  <label className="block text-xs font-medium mb-1">Abdomen Exam</label>
                  <select
                    value={note.abdomenExam || ''}
                    onChange={(e) => updateNote(note.id, 'abdomenExam', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Soft">Soft</option>
                    <option value="Distended">Distended</option>
                    <option value="Tender Upper">Tender (Upper)</option>
                    <option value="Tender Lower">Tender (Lower)</option>
                    <option value="Tender RLQ">Tender (RLQ)</option>
                    <option value="Tender LLQ">Tender (LLQ)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Wound status dropdown */}
                <div>
                  <label className="block text-xs font-medium mb-1">Wound Status</label>
                  <select
                    value={note.woundStatus || ''}
                    onChange={(e) => updateNote(note.id, 'woundStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  >
                    <option value="">Select</option>
                    <option value="CDI">Clean/Dry/Intact (CDI)</option>
                    <option value="Serosanguinous">Serosanguinous staining</option>
                    <option value="Saturated">Saturated</option>
                    <option value="Swelling">Swelling</option>
                    <option value="Induration">Induration</option>
                    <option value="Purulence">Purulence</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* RN Orders / Daily Orders */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">RN Orders / Daily Orders</label>
                <textarea
                  value={note.rnOrders || ''}
                  onChange={(e) => updateNote(note.id, 'rnOrders', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="Nursing directives for this shift..."
                />
              </div>

              {/* Foley/CBI and urine */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Foley</label>
                  <input
                    type="text"
                    value={note.foley}
                    onChange={(e) => updateNote(note.id, 'foley', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                    placeholder="e.g., In place, draining yellow urine"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">CBI</label>
                  <input
                    type="text"
                    value={note.cbi}
                    onChange={(e) => updateNote(note.id, 'cbi', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                    placeholder="e.g., Running, clear"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Urine Color</label>
                  <input
                    type="text"
                    value={note.urineColor}
                    onChange={(e) => updateNote(note.id, 'urineColor', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                    placeholder="e.g., Clear yellow"
                  />
                </div>
              </div>

              {/* Assessment & Plan */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Assessment & Plan</label>
                <textarea
                  value={note.assessmentPlan}
                  onChange={(e) => updateNote(note.id, 'assessmentPlan', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="Advance diet, ambulate, discontinue Foley, discharge home..."
                />
              </div>

              {/* Plan Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={note.planAdvanceDiet || false}
                    onChange={(e) => updateNote(note.id, 'planAdvanceDiet', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <span className="text-sm">Advance diet</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={note.planAmbulate || false}
                    onChange={(e) => updateNote(note.id, 'planAmbulate', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <span className="text-sm">Out of bed / Ambulate</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={note.planDCFoley || false}
                    onChange={(e) => updateNote(note.id, 'planDCFoley', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                    <span className="text-sm">Discontinue Foley</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={note.planDischargeHome || false}
                    onChange={(e) => updateNote(note.id, 'planDischargeHome', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <span className="text-sm">Discharge home</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={note.planMedicationChanges || false}
                    onChange={(e) => updateNote(note.id, 'planMedicationChanges', e.target.checked)}
                    className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
                  />
                  <span className="text-sm">Medication changes</span>
                </label>
              </div>

              {/* Other Plan */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Other Plan Items</label>
                <input
                  type="text"
                  value={note.planOther || ''}
                  onChange={(e) => updateNote(note.id, 'planOther', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="Other plan actions..."
                />
              </div>

              {/* Provider signature */}
              <div className="mt-4">
                <SignatureField
                  label="Provider Signature"
                  providerName={note.providerName}
                  signatureDate={note.providerSignatureDate}
                  onProviderNameChange={(value) => updateNote(note.id, 'providerName', value)}
                  onSignatureDateChange={(value) => updateNote(note.id, 'providerSignatureDate', value)}
                  showAutoFillButton={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}