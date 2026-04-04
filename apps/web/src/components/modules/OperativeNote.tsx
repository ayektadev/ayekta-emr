import { usePatientStore } from '../../store/patientStore';
import type { OperativeNote as OperativeNoteModel } from '../../types/patient.types';
import { getCurrentDate } from '../../utils/calculations';
import { ProviderFields } from '../shared/ProviderFields';

export default function OperativeNote() {
  const operativeNote = usePatientStore((state) => state.operativeNote);
  const updateOperativeNote = usePatientStore((state) => state.updateOperativeNote);

  const handleChange = (field: keyof OperativeNoteModel, value: string) => {
    updateOperativeNote({ [field]: value } as Partial<OperativeNoteModel>);
  };

  const setComplicationClass = (v: string) => {
    updateOperativeNote({
      opNoteComplicationClass: v as OperativeNoteModel['opNoteComplicationClass'],
    });
  };

  const setCurrentSurgeryDate = () => {
    updateOperativeNote({ dateOfSurgery: getCurrentDate() });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Operative Note</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6 space-y-6">
        {/* Surgery Details */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Surgery Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Surgery</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={operativeNote.dateOfSurgery}
                  onChange={(e) => handleChange('dateOfSurgery', e.target.value)}
                  className="flex-1 px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                />
                <button
                  onClick={setCurrentSurgeryDate}
                  className="px-3 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 text-sm whitespace-nowrap"
                >
                  Today
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Anesthesia Type</label>
              <select
                value={operativeNote.anesthesiaType}
                onChange={(e) => handleChange('anesthesiaType', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="general">General</option>
                <option value="regional">Regional</option>
                <option value="local">Local</option>
                <option value="sedation">Sedation</option>
                <option value="spinal">Spinal</option>
                <option value="epidural">Epidural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Case Duration</label>
              <input
                type="text"
                value={operativeNote.caseDuration}
                onChange={(e) => handleChange('caseDuration', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 2 hours, 45 minutes"
              />
            </div>
          </div>
        </section>

        {/* Care Team - Prefilled from Triage */}
        <section>
          <ProviderFields
            surgeonValue={operativeNote.surgeon}
            assistantsValue={operativeNote.assistants}
            anesthesiologistValue={operativeNote.anesthesiologist}
            onSurgeonChange={(value) => handleChange('surgeon', value)}
            onAssistantsChange={(value) => handleChange('assistants', value)}
            onAnesthesiologistChange={(value) => handleChange('anesthesiologist', value)}
            showAssistants={true}
            showAnesthesiologist={true}
            label="Surgical Team"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Circulating RN</label>
              <input
                type="text"
                value={operativeNote.circulatingRN}
                onChange={(e) => handleChange('circulatingRN', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surgical Technologist</label>
              <input
                type="text"
                value={operativeNote.surgicalTechnologist}
                onChange={(e) => handleChange('surgicalTechnologist', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Full name"
              />
            </div>
          </div>
        </section>

        {/* Diagnosis */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Diagnosis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pre-operative Diagnosis</label>
              <textarea
                value={operativeNote.preopDiagnosis}
                onChange={(e) => handleChange('preopDiagnosis', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Diagnosis before surgery..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Post-operative Diagnosis</label>
              <textarea
                value={operativeNote.postopDiagnosis}
                onChange={(e) => handleChange('postopDiagnosis', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Diagnosis confirmed after surgery..."
              />
            </div>
          </div>
        </section>

        {/* Procedure Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Procedure Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Procedure Performed</label>
              <textarea
                value={operativeNote.procedurePerformed}
                onChange={(e) => handleChange('procedurePerformed', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Detailed name of procedure..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Indication for Surgery</label>
              <textarea
                value={operativeNote.indicationForSurgery}
                onChange={(e) => handleChange('indicationForSurgery', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Why this surgery was necessary..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Surgical Findings</label>
              <textarea
                value={operativeNote.surgicalFindings}
                onChange={(e) => handleChange('surgicalFindings', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="What was found during surgery..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Operative Technique</label>
              <textarea
                value={operativeNote.operativeTechnique}
                onChange={(e) => handleChange('operativeTechnique', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Step-by-step description of the surgical technique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Specimens Sent to Pathology</label>
              <textarea
                value={operativeNote.specimensSent}
                onChange={(e) => handleChange('specimensSent', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List specimens sent for analysis..."
              />
            </div>
          </div>
        </section>

        <section className="font-clinical">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Procedure checklist</h3>
          <p className="text-xs text-ayekta-muted mb-4 max-w-3xl">
            Use the lists below for consistent coding (procedure type, closure, drains, specimen, hernia
            grade, complication category, blood loss). Keep the full story in the narrative fields above.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-ayekta-border rounded-md p-4 bg-gray-50/50">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Procedure performed (category)</label>
              <select
                value={operativeNote.opNoteProcedureCategory}
                onChange={(e) => handleChange('opNoteProcedureCategory', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="Hernia Repair">Hernia Repair</option>
                <option value="Mass Excision">Mass Excision</option>
                <option value="Hysterectomy">Hysterectomy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">If Other, specify</label>
              <input
                type="text"
                value={operativeNote.opNoteProcedureOther}
                onChange={(e) => handleChange('opNoteProcedureOther', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Procedure details</label>
              <textarea
                value={operativeNote.opNoteProcedureDetails}
                onChange={(e) => handleChange('opNoteProcedureDetails', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
                placeholder="Specifics when category is Other or needs elaboration…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Closure</label>
              <select
                value={operativeNote.opNoteClosure}
                onChange={(e) => handleChange('opNoteClosure', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="Primary">Primary</option>
                <option value="Delayed primary">Delayed primary</option>
                <option value="Secondary intention">Secondary intention</option>
                <option value="Mesh">Mesh</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Drains</label>
              <select
                value={operativeNote.opNoteDrains}
                onChange={(e) => handleChange('opNoteDrains', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="None">None</option>
                <option value="JP drain">JP drain</option>
                <option value="Penrose">Penrose</option>
                <option value="Chest tube">Chest tube</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Drains — other detail</label>
              <input
                type="text"
                value={operativeNote.opNoteDrainsOther}
                onChange={(e) => handleChange('opNoteDrainsOther', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Specimen</label>
              <select
                value={operativeNote.opNoteSpecimen}
                onChange={(e) => handleChange('opNoteSpecimen', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="None">None</option>
                <option value="Biopsy">Biopsy</option>
                <option value="Mass">Mass</option>
                <option value="Hysterectomy">Hysterectomy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Specimen — other</label>
              <input
                type="text"
                value={operativeNote.opNoteSpecimenOther}
                onChange={(e) => handleChange('opNoteSpecimenOther', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hernia F score</label>
              <select
                value={operativeNote.opNoteHerniaF}
                onChange={(e) => handleChange('opNoteHerniaF', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="F1 - Normal">F1 - Normal</option>
                <option value="F2 - Reducible with difficulty / painful">F2 - Reducible with difficulty / painful</option>
                <option value="F3 - Irreducible">F3 - Irreducible</option>
                <option value="F4 - Complicated (strangulated/obstructed/recurrent)">
                  F4 - Complicated (strangulated/obstructed/recurrent)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hernia H score</label>
              <select
                value={operativeNote.opNoteHerniaH}
                onChange={(e) => handleChange('opNoteHerniaH', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="H1 - Indirect &lt;1.5 cm">H1 - Indirect &lt;1.5 cm</option>
                <option value="H2 - Indirect &gt;1.5 cm">H2 - Indirect &gt;1.5 cm</option>
                <option value="H3 - Direct">H3 - Direct</option>
                <option value="H4 - Femoral">H4 - Femoral</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Hernia score details</label>
              <textarea
                value={operativeNote.opNoteHerniaDetails}
                onChange={(e) => handleChange('opNoteHerniaDetails', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
                placeholder="Recurrence, mesh, defect size…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Complications (class)</label>
              <select
                value={operativeNote.opNoteComplicationClass || ''}
                onChange={(e) => setComplicationClass(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              >
                <option value="">—</option>
                <option value="none">None</option>
                <option value="bleeding">Bleeding</option>
                <option value="infection">Infection</option>
                <option value="nerve_injury">Nerve injury</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">If Other, complication detail</label>
              <input
                type="text"
                value={operativeNote.opNoteComplicationClassDetail}
                onChange={(e) => handleChange('opNoteComplicationClassDetail', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">EBL (mL)</label>
              <input
                type="text"
                inputMode="numeric"
                value={operativeNote.opNoteEblMl}
                onChange={(e) => handleChange('opNoteEblMl', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
                placeholder="Numeric if known"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Outcome (short narrative)</label>
              <textarea
                value={operativeNote.opNoteOutcomeNarrative}
                onChange={(e) => handleChange('opNoteOutcomeNarrative', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-ayekta-border rounded-md"
                placeholder="Brief description of how the case ended (e.g., uncomplicated, hemostasis achieved)…"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="op-media"
                checked={operativeNote.opNotePostOpMedia}
                onChange={(e) => updateOperativeNote({ opNotePostOpMedia: e.target.checked })}
                className="rounded border-ayekta-border"
              />
              <label htmlFor="op-media" className="text-sm text-gray-700 cursor-pointer">
                Post-op media available (photo/video documentation)
              </label>
            </div>
          </div>
        </section>

        {/* Surgery Outcomes */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Surgery Outcomes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Blood Loss</label>
              <input
                type="text"
                value={operativeNote.estimatedBloodLoss}
                onChange={(e) => handleChange('estimatedBloodLoss', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., 50 mL, Minimal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sponge & Needle Count</label>
              <input
                type="text"
                value={operativeNote.spongeNeedleCount}
                onChange={(e) => handleChange('spongeNeedleCount', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Correct x 2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Complications</label>
              <textarea
                value={operativeNote.complications}
                onChange={(e) => handleChange('complications', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="None, or describe any complications..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Condition on Transfer</label>
              <input
                type="text"
                value={operativeNote.conditionOnTransfer}
                onChange={(e) => handleChange('conditionOnTransfer', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Stable, Good condition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Disposition</label>
              <select
                value={operativeNote.disposition}
                onChange={(e) => handleChange('disposition', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="pacu">PACU</option>
                <option value="icu">ICU</option>
                <option value="floor">Floor/Ward</option>
                <option value="home">Home</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Post-operative Orders</label>
              <p className="text-xs text-gray-600 mb-2">
                Note: Pain management is documented in Nursing Orders. Include other post-op instructions here.
              </p>
              <textarea
                value={operativeNote.postopOrders}
                onChange={(e) => handleChange('postopOrders', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Activity level, diet, monitoring, wound care..."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
