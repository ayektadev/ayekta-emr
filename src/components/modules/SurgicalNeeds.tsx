import { usePatientStore } from '../../store/patientStore';
import { useEffect } from 'react';

export default function SurgicalNeeds() {
  const surgicalNeeds = usePatientStore((state) => state.surgicalNeeds);
  const updateSurgicalNeeds = usePatientStore((state) => state.updateSurgicalNeeds);

  const handleChange = (field: keyof typeof surgicalNeeds, value: string | boolean) => {
    updateSurgicalNeeds({ [field]: value });
  };

  const handleHerniaScoreChange = (field: string, value: string) => {
    if (surgicalNeeds.herniaScore) {
      updateSurgicalNeeds({
        herniaScore: {
          ...surgicalNeeds.herniaScore,
          [field]: value,
        },
      });
    }
  };

  // Determine if an inguinal hernia operation is selected.  Only when one of these is true
  // should the hernia scoring and classification appear.  We intentionally exclude ventral/umbilical
  // repairs because the paper's classification applies only to inguinal hernias.
  const herniaSelected =
    surgicalNeeds.opInguinalHerniaL ||
    surgicalNeeds.opInguinalHerniaR ||
    surgicalNeeds.opInguinalHerniaBilateral;

  // Auto-show or hide the hernia scoring section based solely on whether an inguinal hernia
  // operation has been selected.  When shown, initialize the score object and classification fields;
  // when hidden, clear them.
  useEffect(() => {
    const shouldShowHernia = herniaSelected;
    if (shouldShowHernia && !surgicalNeeds.herniaScore) {
      updateSurgicalNeeds({
        herniaScore: {
          herniaType: '',
          herniaSide: '',
          herniaSize: '',
          reducible: '',
          painLevel: '',
          durationOfSymptoms: '',
          previousRepair: '',
          complications: '',
        },
        herniaSizeClassification: '',
        skinFoldThicknessClassification: '',
        inguinoscrotalComponent: '',
      });
    } else if (!shouldShowHernia && surgicalNeeds.herniaScore) {
      updateSurgicalNeeds({
        herniaScore: null,
        herniaSizeClassification: '',
        skinFoldThicknessClassification: '',
        inguinoscrotalComponent: '',
      });
    }
  }, [herniaSelected, surgicalNeeds.herniaScore, updateSurgicalNeeds]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Surgical Planning</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6 space-y-6">
        {/* Procedure Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Procedure Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Planned Procedure</label>
              <input
                type="text"
                value={surgicalNeeds.procedure}
                onChange={(e) => handleChange('procedure', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="e.g., Inguinal hernia repair, Laparoscopic cholecystectomy..."
              />
              {/* Inform the user that the hernia scoring section will appear when an inguinal hernia repair is selected */}
              {herniaSelected && (
                <p className="text-xs text-ayekta-orange mt-1">
                  Hernia scoring and classification will appear below
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Urgency Level</label>
                <select
                  value={surgicalNeeds.urgencyLevel}
                  onChange={(e) => handleChange('urgencyLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="elective">Elective</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Anesthesia Type</label>
                <select
                  value={surgicalNeeds.anesthesiaType}
                  onChange={(e) => handleChange('anesthesiaType', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="general">General</option>
                  <option value="regional">Regional</option>
                  <option value="local">Local</option>
                  <option value="sedation">Sedation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Special Equipment Required</label>
              <textarea
                value={surgicalNeeds.specialEquipment}
                onChange={(e) => handleChange('specialEquipment', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List any special equipment needed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pre-operative Testing</label>
              <textarea
                value={surgicalNeeds.preopTesting}
                onChange={(e) => handleChange('preopTesting', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="ECG, chest X-ray, lab work..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea
                value={surgicalNeeds.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Any additional surgical considerations..."
              />
            </div>
          </div>
        </section>

        {/* Planned Operations */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Planned Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opInguinalHerniaL}
                onChange={(e) => handleChange('opInguinalHerniaL', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Inguinal Hernia Repair – Left</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opInguinalHerniaR}
                onChange={(e) => handleChange('opInguinalHerniaR', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Inguinal Hernia Repair – Right</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opInguinalHerniaBilateral}
                onChange={(e) => handleChange('opInguinalHerniaBilateral', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Inguinal Hernia Repair – Bilateral</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opVentralUmbilicalHernia}
                onChange={(e) => handleChange('opVentralUmbilicalHernia', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Ventral/Umbilical Hernia Repair</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opHysterectomy}
                onChange={(e) => handleChange('opHysterectomy', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Hysterectomy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opProstatectomy}
                onChange={(e) => handleChange('opProstatectomy', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Prostatectomy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opHydrocelectomyL}
                onChange={(e) => handleChange('opHydrocelectomyL', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Hydrocelectomy – Left</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opHydrocelectomyR}
                onChange={(e) => handleChange('opHydrocelectomyR', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Hydrocelectomy – Right</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opHydrocelectomyBilateral}
                onChange={(e) => handleChange('opHydrocelectomyBilateral', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Hydrocelectomy – Bilateral</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={surgicalNeeds.opMassExcision}
                onChange={(e) => handleChange('opMassExcision', e.target.checked)}
                className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">Mass Excision</span>
            </label>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mass Excision Location</label>
              <input
                type="text"
                value={surgicalNeeds.massExcisionLocation}
                onChange={(e) => handleChange('massExcisionLocation', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Specify location..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Other / Comments</label>
              <textarea
                value={surgicalNeeds.operationOther}
                onChange={(e) => handleChange('operationOther', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Any other procedures or comments..."
              />
            </div>
          </div>
        </section>

        {/* Hernia Scoring - Conditional */}
        {surgicalNeeds.herniaScore && (
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Hernia Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hernia Type</label>
                <select
                  value={surgicalNeeds.herniaScore.herniaType}
                  onChange={(e) => handleHerniaScoreChange('herniaType', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="inguinal">Inguinal</option>
                  <option value="femoral">Femoral</option>
                  <option value="umbilical">Umbilical</option>
                  <option value="incisional">Incisional</option>
                  <option value="hiatal">Hiatal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hernia Side</label>
                <select
                  value={surgicalNeeds.herniaScore.herniaSide}
                  onChange={(e) => handleHerniaScoreChange('herniaSide', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="bilateral">Bilateral</option>
                  <option value="midline">Midline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hernia Size</label>
                <select
                  value={surgicalNeeds.herniaScore.herniaSize}
                  onChange={(e) => handleHerniaScoreChange('herniaSize', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="small">Small (&lt; 2 cm)</option>
                  <option value="medium">Medium (2-5 cm)</option>
                  <option value="large">Large (&gt; 5 cm)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reducible</label>
                <select
                  value={surgicalNeeds.herniaScore.reducible}
                  onChange={(e) => handleHerniaScoreChange('reducible', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="partially">Partially</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pain Level</label>
                <select
                  value={surgicalNeeds.herniaScore.painLevel}
                  onChange={(e) => handleHerniaScoreChange('painLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration of Symptoms</label>
                <input
                  type="text"
                  value={surgicalNeeds.herniaScore.durationOfSymptoms}
                  onChange={(e) => handleHerniaScoreChange('durationOfSymptoms', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  placeholder="e.g., 3 months, 1 year..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Previous Repair</label>
                <select
                  value={surgicalNeeds.herniaScore.previousRepair}
                  onChange={(e) => handleHerniaScoreChange('previousRepair', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Complications</label>
                <textarea
                  value={surgicalNeeds.herniaScore.complications}
                  onChange={(e) => handleHerniaScoreChange('complications', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  placeholder="Incarceration, strangulation, etc..."
                />
              </div>
            </div>

            {/* Inguinal Hernia Classification – shown only when an inguinal hernia is selected */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Size Classification (H1–H4)</label>
                <select
                  value={surgicalNeeds.herniaSizeClassification}
                  onChange={(e) => handleChange('herniaSizeClassification', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="H1">H1 – Reduces spontaneously on lying down</option>
                  <option value="H2">H2 – Groin only, reduces completely with gentle manipulation</option>
                  <option value="H3">H3 – Inguinoscrotal, reducible with manual manipulation</option>
                  <option value="H4">H4 – Irreducible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skin‑fold Thickness (F1–F4)</label>
                <select
                  value={surgicalNeeds.skinFoldThicknessClassification}
                  onChange={(e) => handleChange('skinFoldThicknessClassification', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="F1">F1 – ≤ 15 mm</option>
                  <option value="F2">F2 – 15–25 mm</option>
                  <option value="F3">F3 – 26–35 mm</option>
                  <option value="F4">F4 – &gt; 35 mm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Inguinoscrotal Component</label>
                <select
                  value={surgicalNeeds.inguinoscrotalComponent}
                  onChange={(e) => handleChange('inguinoscrotalComponent', e.target.value)}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                >
                  <option value="">Select...</option>
                  <option value="a">a – Inguinoscrotal component &lt; 10 cm</option>
                  <option value="b">b – Inguinoscrotal component 10–20 cm</option>
                  <option value="c">c – Inguinoscrotal component &gt; 20 cm</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
