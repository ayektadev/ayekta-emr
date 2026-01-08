import { usePatientStore } from '../../store/patientStore';
import { getCurrentDate } from '../../utils/calculations';

export default function Consent() {
  const consent = usePatientStore((state) => state.consent);
  const updateConsent = usePatientStore((state) => state.updateConsent);

  const handleChange = (field: keyof typeof consent, value: string | boolean) => {
    updateConsent({ [field]: value });
  };

  const setCurrentDate = (field: 'signatureDate' | 'witnessSignatureDate' | 'providerSignatureDate') => {
    updateConsent({ [field]: getCurrentDate() });
  };

  // Check if all required checkboxes are checked
  const allCheckboxesChecked =
    consent.understoodNature &&
    consent.understoodRisks &&
    consent.understoodAlternatives &&
    consent.hadOpportunityToAsk &&
    consent.consentToProcedure &&
    consent.consentToAnesthesia &&
    consent.consentToBloodProducts &&
    consent.understoodFinancialResponsibility;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Surgical Consent</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6 space-y-6">
        {/* Procedure Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Procedure Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Procedure Name</label>
              <input
                type="text"
                value={consent.procedureName}
                onChange={(e) => handleChange('procedureName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Planned Date</label>
              <input
                type="date"
                value={consent.plannedDate}
                onChange={(e) => handleChange('plannedDate', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Performing Surgeon</label>
              <input
                type="text"
                value={consent.performingSurgeon}
                onChange={(e) => handleChange('performingSurgeon', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Explanation Details */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Explanation Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Risks Explained</label>
              <textarea
                value={consent.risksExplained}
                onChange={(e) => handleChange('risksExplained', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List risks discussed with patient..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Benefits Explained</label>
              <textarea
                value={consent.benefitsExplained}
                onChange={(e) => handleChange('benefitsExplained', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List benefits discussed with patient..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alternatives Discussed</label>
              <textarea
                value={consent.alternativesDiscussed}
                onChange={(e) => handleChange('alternativesDiscussed', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List alternative treatments discussed..."
              />
            </div>
          </div>
        </section>

        {/* Consent Statements */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Consent Statements</h3>
          {!allCheckboxesChecked && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              All checkboxes must be checked to provide valid consent
            </div>
          )}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.understoodNature}
                onChange={(e) => handleChange('understoodNature', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I understand the nature and purpose of the procedure that has been explained to me.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.understoodRisks}
                onChange={(e) => handleChange('understoodRisks', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I understand the risks and complications that may occur, including but not limited to bleeding, infection, and adverse reactions to anesthesia.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.understoodAlternatives}
                onChange={(e) => handleChange('understoodAlternatives', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I understand the alternative treatments available and have chosen to proceed with this procedure.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.hadOpportunityToAsk}
                onChange={(e) => handleChange('hadOpportunityToAsk', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I have had the opportunity to ask questions and all my questions have been answered to my satisfaction.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.consentToProcedure}
                onChange={(e) => handleChange('consentToProcedure', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I consent to the performance of this procedure.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.consentToAnesthesia}
                onChange={(e) => handleChange('consentToAnesthesia', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I consent to the administration of anesthesia as deemed necessary by the anesthesiologist.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.consentToBloodProducts}
                onChange={(e) => handleChange('consentToBloodProducts', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I consent to the administration of blood products if deemed medically necessary.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.understoodFinancialResponsibility}
                onChange={(e) => handleChange('understoodFinancialResponsibility', e.target.checked)}
                className="mt-1 w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
              />
              <span className="text-sm">
                I understand my financial responsibility for this procedure.
              </span>
            </label>
          </div>
        </section>

        {/* Signatures */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Signatures</h3>
          <div className="grid grid-cols-1 gap-6">
            {/* Patient/Guardian Signature */}
            <div className="p-4 border border-ayekta-border rounded">
              <h4 className="font-medium mb-3">Patient/Guardian</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={consent.patientGuardianName}
                    onChange={(e) => handleChange('patientGuardianName', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Relationship to Patient</label>
                  <input
                    type="text"
                    value={consent.relationshipToPatient}
                    onChange={(e) => handleChange('relationshipToPatient', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                    placeholder="Self, Parent, Guardian..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Signature Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={consent.signatureDate}
                      onChange={(e) => handleChange('signatureDate', e.target.value)}
                      className="flex-1 px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                    />
                    <button
                      onClick={() => setCurrentDate('signatureDate')}
                      className="px-3 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 text-sm whitespace-nowrap"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Witness Signature */}
            <div className="p-4 border border-ayekta-border rounded">
              <h4 className="font-medium mb-3">Witness</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Witness Name</label>
                  <input
                    type="text"
                    value={consent.witnessName}
                    onChange={(e) => handleChange('witnessName', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Signature Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={consent.witnessSignatureDate}
                      onChange={(e) => handleChange('witnessSignatureDate', e.target.value)}
                      className="flex-1 px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                    />
                    <button
                      onClick={() => setCurrentDate('witnessSignatureDate')}
                      className="px-3 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 text-sm whitespace-nowrap"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Signature */}
            <div className="p-4 border border-ayekta-border rounded">
              <h4 className="font-medium mb-3">Provider</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Provider Name</label>
                  <input
                    type="text"
                    value={consent.providerName}
                    onChange={(e) => handleChange('providerName', e.target.value)}
                    className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Signature Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={consent.providerSignatureDate}
                      onChange={(e) => handleChange('providerSignatureDate', e.target.value)}
                      className="flex-1 px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                    />
                    <button
                      onClick={() => setCurrentDate('providerSignatureDate')}
                      className="px-3 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 text-sm whitespace-nowrap"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consent Status */}
        {allCheckboxesChecked && (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            ✓ All required consent statements have been acknowledged
          </div>
        )}
      </div>
    </div>
  );
}
