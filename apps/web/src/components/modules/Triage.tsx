import { usePatientStore } from '../../store/patientStore';
import { getCurrentDate, getCurrentTime } from '../../utils/calculations';
import { SignatureField } from '../shared/SignatureField';

export default function Triage() {
  const triage = usePatientStore((state) => state.triage);
  const updateTriage = usePatientStore((state) => state.updateTriage);

  const handleChange = (field: keyof typeof triage, value: string | number) => {
    updateTriage({ [field]: value });
  };

  const setCurrentDateTime = () => {
    updateTriage({
      date: getCurrentDate(),
      time: getCurrentTime(),
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Triage</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6 space-y-6">
        {/* Date and Time */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ayekta-orange">Date & Time</h3>
            <button
              onClick={setCurrentDateTime}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              Set Current Date/Time
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={triage.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={triage.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Attending Surgeon */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Attending Surgeon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Attending Surgeon</label>
              <select
                value={triage.attendingSurgeon}
                onChange={(e) => handleChange('attendingSurgeon', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="VB">VB</option>
                <option value="AS">AS</option>
                <option value="SW">SW</option>
                <option value="FA">FA</option>
                <option value="ZS">ZS</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* H&P Sign‑off */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">History & Physical Sign‑off</h3>
          <SignatureField
            label="Provider Signature"
            providerName={triage.hpProviderName}
            signatureDate={triage.hpProviderSignatureDate}
            onProviderNameChange={(value) => handleChange('hpProviderName', value)}
            onSignatureDateChange={(value) => handleChange('hpProviderSignatureDate', value)}
            showAutoFillButton={true}
          />
        </section>

        {/* Vital Signs */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Vital Signs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Temperature (°F)</label>
              <input
                type="text"
                value={triage.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="98.6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
              <input
                type="text"
                value={triage.hr}
                onChange={(e) => handleChange('hr', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Respiratory Rate</label>
              <input
                type="text"
                value={triage.rr}
                onChange={(e) => handleChange('rr', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Blood Pressure</label>
              <input
                type="text"
                value={triage.bp}
                onChange={(e) => handleChange('bp', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SpO2 (%)</label>
              <input
                type="text"
                value={triage.spo2}
                onChange={(e) => handleChange('spo2', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="98"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input
                type="text"
                value={triage.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <input
                type="text"
                value={triage.height}
                onChange={(e) => handleChange('height', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="170"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pain Scale (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={triage.painScale}
                onChange={(e) => handleChange('painScale', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Assessment */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Assessment</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chief Complaint</label>
              <textarea
                value={triage.chiefComplaint}
                onChange={(e) => handleChange('chiefComplaint', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Main reason for visit..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">History of Present Illness</label>
              <textarea
                value={triage.historyOfPresentIllness}
                onChange={(e) => handleChange('historyOfPresentIllness', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Detailed history of current condition..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Review of Systems</label>
              <textarea
                value={triage.reviewOfSystems}
                onChange={(e) => handleChange('reviewOfSystems', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Systematic review of body systems..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Physical Examination</label>
              <textarea
                value={triage.physicalExamination}
                onChange={(e) => handleChange('physicalExamination', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Physical exam findings..."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
