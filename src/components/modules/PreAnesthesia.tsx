import { usePatientStore } from '../../store/patientStore';
import { SignatureField } from '../shared/SignatureField';

/**
 * Component for capturing the pre‑anesthesia evaluation. This mirrors the paper
 * pre‑anesthesia form while leveraging the EMR’s structured fields and
 * conveniences like autofill and date pickers.
 */
export default function PreAnesthesia() {
  const preAnesthesia = usePatientStore((state) => state.preAnesthesia);
  const updatePreAnesthesia = usePatientStore((state) => state.updatePreAnesthesia);
  const demographics = usePatientStore((state) => state.demographics);
  const surgicalNeeds = usePatientStore((state) => state.surgicalNeeds);
  const triage = usePatientStore((state) => state.triage);
  const updateTriage = usePatientStore((state) => state.updateTriage);

  // Generic change handler that supports string and boolean values. The type
  // annotation uses `any` for the value to permit both strings and booleans.
  const handleChange = (field: keyof typeof preAnesthesia, value: any) => {
    updatePreAnesthesia({ [field]: value } as any);

    // Bidirectional sync: Update Triage HPI when PreAnesthesia HPI changes
    if (field === 'historyPresentIllness') {
      updateTriage({ historyOfPresentIllness: value });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Anesthesia Evaluation</h2>
      <div className="space-y-6">
        {/* Procedure and Diagnosis */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Procedure &amp; Diagnosis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Proposed Procedure <span className="text-xs text-gray-500">(from Surgical Planning)</span>
              </label>
              <input
                type="text"
                value={surgicalNeeds.procedure || preAnesthesia.procedure}
                onChange={(e) => handleChange('procedure', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                placeholder="Procedure will auto-fill from Surgical Planning"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pre‑op Diagnosis</label>
              <input
                type="text"
                value={preAnesthesia.preopDiagnosis}
                onChange={(e) => handleChange('preopDiagnosis', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* History */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Medical &amp; Anesthesia History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                History of Present Illness <span className="text-xs text-gray-500">(synced with Triage)</span>
              </label>
              <textarea
                value={triage.historyOfPresentIllness || preAnesthesia.historyPresentIllness}
                onChange={(e) => handleChange('historyPresentIllness', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Auto-fills from Triage, editable here and syncs back"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Past Medical History <span className="text-xs text-gray-500">(from Patient Information)</span>
              </label>
              <textarea
                value={demographics.pastMedicalHistory}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                placeholder="No past medical history recorded in Patient Information"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Past Surgical History <span className="text-xs text-gray-500">(from Patient Information)</span>
              </label>
              <textarea
                value={demographics.pastSurgicalHistory}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                placeholder="No past surgical history recorded in Patient Information"
              />
            </div>
            {/* Systemic Diseases */}
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-medium mb-2">Systemic Diseases</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preAnesthesia.systemDiseaseCardiovascular}
                    onChange={(e) => handleChange('systemDiseaseCardiovascular', e.target.checked as any)}
                  />
                  <span>Cardiovascular</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preAnesthesia.systemDiseasePulmonary}
                    onChange={(e) => handleChange('systemDiseasePulmonary', e.target.checked as any)}
                  />
                  <span>Pulmonary</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preAnesthesia.systemDiseaseEndocrine}
                    onChange={(e) => handleChange('systemDiseaseEndocrine', e.target.checked as any)}
                  />
                  <span>Endocrine</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preAnesthesia.systemDiseaseRenal}
                    onChange={(e) => handleChange('systemDiseaseRenal', e.target.checked as any)}
                  />
                  <span>Renal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preAnesthesia.systemDiseaseHepatic}
                    onChange={(e) => handleChange('systemDiseaseHepatic', e.target.checked as any)}
                  />
                  <span>Hepatic</span>
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={preAnesthesia.systemDiseaseOther}
                  onChange={(e) => handleChange('systemDiseaseOther', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  placeholder="Other conditions..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anesthesia History (incl. previous complications)</label>
              <textarea
                value={preAnesthesia.anesthesiaHistory}
                onChange={(e) => handleChange('anesthesiaHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anesthesia Complications</label>
              <textarea
                value={preAnesthesia.anesthesiaComplications}
                onChange={(e) => handleChange('anesthesiaComplications', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="anesthesiaComplicationsYes"
                checked={preAnesthesia.anesthesiaComplicationsYes}
                onChange={(e) => handleChange('anesthesiaComplicationsYes', e.target.checked as any)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <label htmlFor="anesthesiaComplicationsYes" className="text-sm">Prior anesthesia complications?</label>
            </div>

            {/* Airway/Dentition issues */}
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="airwayDentitionIssues"
                checked={preAnesthesia.airwayDentitionIssues || false}
                onChange={(e) => handleChange('airwayDentitionIssues', e.target.checked as any)}
                className="h-4 w-4 text-ayekta-orange border-ayekta-border rounded"
              />
              <label htmlFor="airwayDentitionIssues" className="text-sm">Airway / Dentition issues (loose teeth, limited opening)</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Allergies <span className="text-xs text-gray-500">(from Patient Information)</span>
              </label>
              <textarea
                value={demographics.allergies}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                placeholder="No allergies recorded in Patient Information"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Substance Use (tobacco/alcohol/other)</label>
              <textarea
                value={preAnesthesia.substanceUse}
                onChange={(e) => handleChange('substanceUse', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Assessment */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Physical Assessment</h3>

          {/* Structured Vital Signs */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3 text-gray-700">Vital Signs</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">HR (bpm)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalHR}
                  onChange={(e) => handleChange('vitalHR', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalBP}
                  onChange={(e) => handleChange('vitalBP', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">RR (breaths/min)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalRR}
                  onChange={(e) => handleChange('vitalRR', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="16"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">O2 Sat (%)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalO2Sat}
                  onChange={(e) => handleChange('vitalO2Sat', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="98"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Temp (°F)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalTemp}
                  onChange={(e) => handleChange('vitalTemp', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="98.6"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Height (cm)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalHeight}
                  onChange={(e) => handleChange('vitalHeight', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="170"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={preAnesthesia.vitalWeight}
                  onChange={(e) => handleChange('vitalWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* Physical Exam Findings */}
          <h4 className="text-md font-semibold mb-3 text-gray-700">Physical Examination</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Airway Assessment</label>
              <textarea
                value={preAnesthesia.airwayAssessment}
                onChange={(e) => handleChange('airwayAssessment', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Range of Motion</label>
              <textarea
                value={preAnesthesia.rangeOfMotion}
                onChange={(e) => handleChange('rangeOfMotion', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cardiovascular Exam</label>
              <textarea
                value={preAnesthesia.cardiovascularExam}
                onChange={(e) => handleChange('cardiovascularExam', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pulmonary Exam</label>
              <textarea
                value={preAnesthesia.pulmonaryExam}
                onChange={(e) => handleChange('pulmonaryExam', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Neurologic Exam</label>
              <textarea
                value={preAnesthesia.neurologicExam}
                onChange={(e) => handleChange('neurologicExam', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Labs/Imaging</label>
              <textarea
                value={preAnesthesia.labs}
                onChange={(e) => handleChange('labs', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Plan */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Anesthesia Plan &amp; Risk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ASA Class</label>
              <select
                value={preAnesthesia.asaClass}
                onChange={(e) => handleChange('asaClass', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mallampati Class</label>
              <select
                value={preAnesthesia.mallampatiClass}
                onChange={(e) => handleChange('mallampatiClass', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Risk Level</label>
              <select
                value={preAnesthesia.riskLevel}
                onChange={(e) => handleChange('riskLevel', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">Anesthesia Plan</label>
              <textarea
                value={preAnesthesia.anesthesiaPlan}
                onChange={(e) => handleChange('anesthesiaPlan', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sedation Plan / Adjuncts</label>
              <textarea
                value={preAnesthesia.sedationPlan}
                onChange={(e) => handleChange('sedationPlan', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., MAC with midazolam, regional block"
              />
            </div>
          </div>
        </section>

        {/* Provider Sign‑Off */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Provider Sign‑Off</h3>
          <SignatureField
            label="Anesthesiologist Signature"
            providerName={preAnesthesia.providerName}
            signatureDate={preAnesthesia.providerSignatureDate}
            onProviderNameChange={(value) => handleChange('providerName', value)}
            onSignatureDateChange={(value) => handleChange('providerSignatureDate', value)}
            showAutoFillButton={true}
          />
        </section>
      </div>
    </div>
  );
}