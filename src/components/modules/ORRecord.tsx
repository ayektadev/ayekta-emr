import { usePatientStore } from '../../store/patientStore';
import { v4 as uuidv4 } from 'uuid';
import { ProviderFields } from '../shared/ProviderFields';

/**
 * Component for documenting the intraoperative OR record. Captures key timing
 * events, Time Out checklist, team members, anesthesia type, patient
 * positioning, procedure checklist and instrument count verification.
 */
export default function ORRecord() {
  const orRecord = usePatientStore((state) => state.orRecord);
  const updateORRecord = usePatientStore((state) => state.updateORRecord);

  // Handle changes for instrument count rows
  const handleInstrumentRowChange = (
    id: string,
    field: 'instrumentName' | 'countStart' | 'countEnd',
    value: string
  ) => {
    const updatedRows = (orRecord.instrumentCounts || []).map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    updateORRecord({ instrumentCounts: updatedRows });
  };

  const addInstrumentRow = () => {
    const newRow = {
      id: uuidv4(),
      instrumentName: '',
      countStart: '',
      countEnd: '',
    };
    updateORRecord({ instrumentCounts: [...(orRecord.instrumentCounts || []), newRow] });
  };

  const removeInstrumentRow = (id: string) => {
    const updatedRows = (orRecord.instrumentCounts || []).filter((row) => row.id !== id);
    updateORRecord({ instrumentCounts: updatedRows });
  };

  const handleChange = (field: keyof typeof orRecord, value: any) => {
    updateORRecord({ [field]: value });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Operating Room Record</h2>

      <div className="space-y-6">
        {/* Timing Section */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Timing of Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">OR Entry Time</label>
              <input
                type="time"
                value={orRecord.orEntryTime}
                onChange={(e) => handleChange('orEntryTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OR Exit Time</label>
              <input
                type="time"
                value={orRecord.orExitTime}
                onChange={(e) => handleChange('orExitTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anesthesia Start Time</label>
              <input
                type="time"
                value={orRecord.anesthesiaStartTime}
                onChange={(e) => handleChange('anesthesiaStartTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anesthesia End Time</label>
              <input
                type="time"
                value={orRecord.anesthesiaEndTime}
                onChange={(e) => handleChange('anesthesiaEndTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Procedure Start Time</label>
              <input
                type="time"
                value={orRecord.procedureStartTime}
                onChange={(e) => handleChange('procedureStartTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Procedure End Time</label>
              <input
                type="time"
                value={orRecord.procedureEndTime}
                onChange={(e) => handleChange('procedureEndTime', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Time Out Checklist */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Time Out Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.timeOutCompleted}
                onChange={(e) => handleChange('timeOutCompleted', e.target.checked)}
              />
              <span>Time Out Completed</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.timeOutIdentityVerified}
                onChange={(e) => handleChange('timeOutIdentityVerified', e.target.checked)}
              />
              <span>Identity Verified</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.timeOutSiteMarked}
                onChange={(e) => handleChange('timeOutSiteMarked', e.target.checked)}
              />
              <span>Site Marked</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.timeOutAllergiesReviewed}
                onChange={(e) => handleChange('timeOutAllergiesReviewed', e.target.checked)}
              />
              <span>Allergies Reviewed</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.timeOutEquipmentAvailable}
                onChange={(e) => handleChange('timeOutEquipmentAvailable', e.target.checked)}
              />
              <span>Equipment &amp; Implants Ready</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.timeOutAntibioticsGiven}
                onChange={(e) => handleChange('timeOutAntibioticsGiven', e.target.checked)}
              />
              <span>Antibiotics Administered</span>
            </label>
          </div>
        </section>

        {/* Team & Anesthesia */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <ProviderFields
            surgeonValue={orRecord.surgeon}
            assistantsValue={orRecord.assistant}
            anesthesiologistValue={orRecord.anesthesiologist}
            onSurgeonChange={(value) => handleChange('surgeon', value)}
            onAssistantsChange={(value) => handleChange('assistant', value)}
            onAnesthesiologistChange={(value) => handleChange('anesthesiologist', value)}
            showAssistants={true}
            showAnesthesiologist={true}
            label="OR Team"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Anesthesia Type</label>
              <select
                value={orRecord.anesthesiaType}
                onChange={(e) => handleChange('anesthesiaType', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select type</option>
                <option value="General">General</option>
                <option value="Regional">Regional</option>
                <option value="Local">Local</option>
                <option value="Spinal">Spinal</option>
                <option value="Epidural">Epidural</option>
                <option value="MAC">MAC/IV Sedation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Patient Position</label>
              <select
                value={orRecord.patientPosition}
                onChange={(e) => handleChange('patientPosition', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select position</option>
                <option value="Supine">Supine</option>
                <option value="Prone">Prone</option>
                <option value="Lateral Left">Lateral Left</option>
                <option value="Lateral Right">Lateral Right</option>
                <option value="Lithotomy">Lithotomy</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Procedure Checklist */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Procedure Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opInguinalHerniaL}
                onChange={(e) => handleChange('opInguinalHerniaL', e.target.checked)}
              />
              <span>Inguinal Hernia Repair (Left)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opInguinalHerniaR}
                onChange={(e) => handleChange('opInguinalHerniaR', e.target.checked)}
              />
              <span>Inguinal Hernia Repair (Right)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opInguinalHerniaBilateral}
                onChange={(e) => handleChange('opInguinalHerniaBilateral', e.target.checked)}
              />
              <span>Inguinal Hernia Repair (Bilateral)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opVentralUmbilicalHernia}
                onChange={(e) => handleChange('opVentralUmbilicalHernia', e.target.checked)}
              />
              <span>Ventral/Umbilical Hernia Repair</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opHysterectomy}
                onChange={(e) => handleChange('opHysterectomy', e.target.checked)}
              />
              <span>Hysterectomy</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opProstatectomy}
                onChange={(e) => handleChange('opProstatectomy', e.target.checked)}
              />
              <span>Prostatectomy</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opHydrocelectomyL}
                onChange={(e) => handleChange('opHydrocelectomyL', e.target.checked)}
              />
              <span>Hydrocelectomy (Left)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opHydrocelectomyR}
                onChange={(e) => handleChange('opHydrocelectomyR', e.target.checked)}
              />
              <span>Hydrocelectomy (Right)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opHydrocelectomyBilateral}
                onChange={(e) => handleChange('opHydrocelectomyBilateral', e.target.checked)}
              />
              <span>Hydrocelectomy (Bilateral)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orRecord.opMassExcision}
                onChange={(e) => handleChange('opMassExcision', e.target.checked)}
              />
              <span>Mass Excision</span>
            </label>
          </div>
          {orRecord.opMassExcision && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Mass Excision Location</label>
              <input
                type="text"
                value={orRecord.massExcisionLocation}
                onChange={(e) => handleChange('massExcisionLocation', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Other/Comments</label>
            <textarea
              value={orRecord.operationOther}
              onChange={(e) => handleChange('operationOther', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              placeholder="Other procedures or comments..."
            />
          </div>
        </section>

        {/* Instrument Counts & Signature */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Instrument Counts &amp; Signature</h3>
          {/* Dynamic instrument counts table */}
          <div className="mb-4">
            {(orRecord.instrumentCounts && orRecord.instrumentCounts.length > 0) ? (
              <div className="space-y-2">
                {orRecord.instrumentCounts!.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border border-ayekta-border p-2 rounded"
                  >
                    <div>
                      <label className="block text-xs font-medium mb-1">Instrument</label>
                      <input
                        type="text"
                        value={row.instrumentName}
                        onChange={(e) => handleInstrumentRowChange(row.id, 'instrumentName', e.target.value)}
                        className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                        placeholder="e.g., Knife handle"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Count Start</label>
                      <input
                        type="number"
                        value={row.countStart}
                        onChange={(e) => handleInstrumentRowChange(row.id, 'countStart', e.target.value)}
                        className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Count End</label>
                      <input
                        type="number"
                        value={row.countEnd}
                        onChange={(e) => handleInstrumentRowChange(row.id, 'countEnd', e.target.value)}
                        className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
                        min="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-5 md:mt-0">
                      <button
                        onClick={() => removeInstrumentRow(row.id)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ayekta-muted text-sm">No instrument counts recorded.</p>
            )}
            <button
              onClick={addInstrumentRow}
              className="mt-3 px-3 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-xs"
            >
              + Add Instrument
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={orRecord.instrumentCountCorrect}
                  onChange={(e) => handleChange('instrumentCountCorrect', e.target.checked)}
                />
                <span>Instrument Count Correct</span>
              </label>
              <textarea
                value={orRecord.instrumentCountNotes}
                onChange={(e) => handleChange('instrumentCountNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Notes on instrument/sponges counts..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RN Signature Name</label>
              <input
                type="text"
                value={orRecord.rnSignatureName}
                onChange={(e) => handleChange('rnSignatureName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
              <label className="block text-sm font-medium mb-1 mt-3">RN Signature Date</label>
              <input
                type="date"
                value={orRecord.rnSignatureDate}
                onChange={(e) => handleChange('rnSignatureDate', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}