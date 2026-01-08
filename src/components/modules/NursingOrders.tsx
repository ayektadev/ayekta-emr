import { usePatientStore } from '../../store/patientStore';

/**
 * Component to capture post‑operative nursing orders and pain management regimens.
 * This mirrors the nursing orders page from the paper chart while allowing
 * structured inputs and free‑text where appropriate.
 */
export default function NursingOrders() {
  const nursingOrders = usePatientStore((state) => state.nursingOrders);
  const updateNursingOrders = usePatientStore((state) => state.updateNursingOrders);

  const handleChange = (field: keyof typeof nursingOrders, value: any) => {
    updateNursingOrders({ [field]: value });
  };

  // Nested change handlers for structured pain regimens
  const handlePreopMedChange = (
    field: keyof typeof nursingOrders.preopMeds,
    value: any
  ) => {
    updateNursingOrders({
      preopMeds: { ...nursingOrders.preopMeds, [field]: value },
    });
  };
  const handleIntraopMedChange = (
    field: keyof typeof nursingOrders.intraopMeds,
    value: any
  ) => {
    updateNursingOrders({
      intraopMeds: { ...nursingOrders.intraopMeds, [field]: value },
    });
  };
  const handlePacuMedChange = (
    field: keyof typeof nursingOrders.pacuMeds,
    value: any
  ) => {
    updateNursingOrders({
      pacuMeds: { ...nursingOrders.pacuMeds, [field]: value },
    });
  };
  const handleFloorMedChange = (
    field: keyof typeof nursingOrders.floorMeds,
    value: any
  ) => {
    updateNursingOrders({
      floorMeds: { ...nursingOrders.floorMeds, [field]: value },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Nursing Orders &amp; Pain Regimen</h2>
      <div className="space-y-6">
        {/* Admit & Condition */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Admission &amp; Condition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admit Diagnosis</label>
              <input
                type="text"
                value={nursingOrders.admitDiagnosis}
                onChange={(e) => handleChange('admitDiagnosis', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Diagnosis on admission"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Patient Condition</label>
              <input
                type="text"
                value={nursingOrders.patientCondition}
                onChange={(e) => handleChange('patientCondition', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Stable, Guarded"
              />
            </div>
          </div>
        </section>

        {/* Vitals & Activity */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Vitals &amp; Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vitals Frequency</label>
              <select
                value={nursingOrders.vitalsFrequency}
                onChange={(e) => handleChange('vitalsFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="q15min">Every 15 minutes</option>
                <option value="q1h">Every 1 hour</option>
                <option value="q4h">Every 4 hours</option>
                <option value="q8h">Every 8 hours</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Activity Orders</label>
              <select
                value={nursingOrders.activityOrders}
                onChange={(e) => handleChange('activityOrders', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="Bedrest">Bedrest (specify duration in notes)</option>
                <option value="Up with assist">Up with assist</option>
                <option value="Out of bed as tolerated">Out of bed as tolerated</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={nursingOrders.abdominalBinder}
                onChange={(e) => handleChange('abdominalBinder', e.target.checked)}
              />
              <span>Apply Abdominal Binder</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={nursingOrders.scrotalSupport}
                onChange={(e) => handleChange('scrotalSupport', e.target.checked)}
              />
              <span>Provide Scrotal Support</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={nursingOrders.straightCatheterIfNoVoid}
                onChange={(e) => handleChange('straightCatheterIfNoVoid', e.target.checked)}
              />
              <span>Straight Cath if No Void in 8h</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={nursingOrders.hlivWhenPO || false}
                onChange={(e) => handleChange('hlivWhenPO', e.target.checked)}
              />
              <span>HLIV when tolerating PO</span>
            </label>
          </div>
        </section>

        {/* Diet & IV */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Diet &amp; IV Fluids</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Diet</label>
              <select
                value={nursingOrders.diet}
                onChange={(e) => handleChange('diet', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="NPO">NPO</option>
                <option value="Clears">Clears</option>
                <option value="Clears then ADAT">Clears → Advance diet as tolerated</option>
                <option value="Regular">Regular</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IV Fluids</label>
              <select
                value={nursingOrders.ivFluids}
                onChange={(e) => handleChange('ivFluids', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select</option>
                <option value="NS">Normal Saline (NS)</option>
                <option value="LR">Lactated Ringer’s (LR)</option>
                <option value="D5 1/2 NS">D5 ½ NS</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Pain Regimens */}
        <section className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Pain Regimen</h3>
          {/* Pre‑op Medications */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Pre‑op</h4>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.preopMeds.acetaminophen}
                  onChange={(e) => handlePreopMedChange('acetaminophen', e.target.checked)}
                />
                <span>Acetaminophen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.preopMeds.ibuprofen}
                  onChange={(e) => handlePreopMedChange('ibuprofen', e.target.checked)}
                />
                <span>Ibuprofen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.preopMeds.ketorolac}
                  onChange={(e) => handlePreopMedChange('ketorolac', e.target.checked)}
                />
                <span>Ketorolac</span>
              </label>
              <div>
                <input
                  type="text"
                  value={nursingOrders.preopMeds.other}
                  onChange={(e) => handlePreopMedChange('other', e.target.value)}
                  className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-1 focus:ring-ayekta-orange text-sm"
                  placeholder="Other (specify)"
                />
              </div>
            </div>
          </div>
          {/* Intra‑op Medications */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Intra‑op</h4>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.intraopMeds.fentanyl}
                  onChange={(e) => handleIntraopMedChange('fentanyl', e.target.checked)}
                />
                <span>Fentanyl</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.intraopMeds.ketorolac}
                  onChange={(e) => handleIntraopMedChange('ketorolac', e.target.checked)}
                />
                <span>Ketorolac</span>
              </label>
              <div>
                <input
                  type="text"
                  value={nursingOrders.intraopMeds.other}
                  onChange={(e) => handleIntraopMedChange('other', e.target.value)}
                  className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-1 focus:ring-ayekta-orange text-sm"
                  placeholder="Other (specify)"
                />
              </div>
            </div>
          </div>
          {/* PACU Medications */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">PACU</h4>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.pacuMeds.acetaminophen}
                  onChange={(e) => handlePacuMedChange('acetaminophen', e.target.checked)}
                />
                <span>Acetaminophen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.pacuMeds.ibuprofen}
                  onChange={(e) => handlePacuMedChange('ibuprofen', e.target.checked)}
                />
                <span>Ibuprofen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.pacuMeds.tramadol}
                  onChange={(e) => handlePacuMedChange('tramadol', e.target.checked)}
                />
                <span>Tramadol</span>
              </label>
              <div>
                <input
                  type="text"
                  value={nursingOrders.pacuMeds.other}
                  onChange={(e) => handlePacuMedChange('other', e.target.value)}
                  className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-1 focus:ring-ayekta-orange text-sm"
                  placeholder="Other (specify)"
                />
              </div>
            </div>
          </div>
          {/* Floor Medications */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Floor</h4>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.floorMeds.acetaminophen}
                  onChange={(e) => handleFloorMedChange('acetaminophen', e.target.checked)}
                />
                <span>Acetaminophen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.floorMeds.ibuprofen}
                  onChange={(e) => handleFloorMedChange('ibuprofen', e.target.checked)}
                />
                <span>Ibuprofen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nursingOrders.floorMeds.tramadol}
                  onChange={(e) => handleFloorMedChange('tramadol', e.target.checked)}
                />
                <span>Tramadol</span>
              </label>
              <div>
                <input
                  type="text"
                  value={nursingOrders.floorMeds.other}
                  onChange={(e) => handleFloorMedChange('other', e.target.value)}
                  className="w-full px-2 py-1 border border-ayekta-border rounded focus:outline-none focus:ring-1 focus:ring-ayekta-orange text-sm"
                  placeholder="Other (specify)"
                />
              </div>
            </div>
          </div>
          {/* Additional Nursing Orders */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Other Orders / Comments</label>
            <textarea
              value={nursingOrders.otherOrders}
              onChange={(e) => handleChange('otherOrders', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              placeholder="Any additional nursing orders or medication instructions..."
            />
          </div>
        </section>
      </div>
    </div>
  );
}