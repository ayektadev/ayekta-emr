import { usePatientStore } from '../../store/patientStore';
import { getCurrentDate } from '../../utils/calculations';

export default function OperativeNote() {
  const operativeNote = usePatientStore((state) => state.operativeNote);
  const updateOperativeNote = usePatientStore((state) => state.updateOperativeNote);

  const handleChange = (field: keyof typeof operativeNote, value: string) => {
    updateOperativeNote({ [field]: value });
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
              <label className="block text-sm font-medium mb-1">Surgeon</label>
              <input
                type="text"
                value={operativeNote.surgeon}
                onChange={(e) => handleChange('surgeon', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assistant(s)</label>
              <input
                type="text"
                value={operativeNote.assistants}
                onChange={(e) => handleChange('assistants', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Comma-separated if multiple"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Anesthesiologist</label>
              <input
                type="text"
                value={operativeNote.anesthesiologist}
                onChange={(e) => handleChange('anesthesiologist', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
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
              <textarea
                value={operativeNote.postopOrders}
                onChange={(e) => handleChange('postopOrders', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Medications, activity level, diet, monitoring..."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
