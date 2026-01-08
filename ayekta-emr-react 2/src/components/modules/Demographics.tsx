import { usePatientStore } from '../../store/patientStore';
import { calculateAge } from '../../utils/calculations';

export default function Demographics() {
  const demographics = usePatientStore((state) => state.demographics);
  const updateDemographics = usePatientStore((state) => state.updateDemographics);

  const handleChange = (field: keyof typeof demographics, value: string | number) => {
    updateDemographics({ [field]: value });
  };

  const handleDobChange = (dob: string) => {
    const age = dob ? calculateAge(dob) : 0;
    updateDemographics({ dob, age });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Demographics</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6 space-y-6">
        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={demographics.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Middle Name</label>
              <input
                type="text"
                value={demographics.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={demographics.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={demographics.dob}
                onChange={(e) => handleDobChange(e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                value={demographics.age}
                readOnly
                className="w-full px-3 py-2 border border-ayekta-border rounded bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                value={demographics.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={demographics.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            {/* Aadhaar Number removed per updated specification */}

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={demographics.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={demographics.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input
                type="text"
                value={demographics.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="tel"
                value={demographics.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <input
                type="text"
                value={demographics.emergencyContactRelationship}
                onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              />
            </div>
          </div>
        </section>

        {/* Medical History */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-ayekta-orange">Medical History</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Blood Group</label>
              <select
                value={demographics.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              >
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Allergies</label>
              <textarea
                value={demographics.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List any known allergies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Medications</label>
              <textarea
                value={demographics.currentMedications}
                onChange={(e) => handleChange('currentMedications', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="List current medications..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Past Medical History</label>
              <textarea
                value={demographics.pastMedicalHistory}
                onChange={(e) => handleChange('pastMedicalHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Previous illnesses, chronic conditions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Past Surgical History</label>
              <textarea
                value={demographics.pastSurgicalHistory}
                onChange={(e) => handleChange('pastSurgicalHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Previous surgeries..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Family History</label>
              <textarea
                value={demographics.familyHistory}
                onChange={(e) => handleChange('familyHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Family medical history..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Social History</label>
              <textarea
                value={demographics.socialHistory}
                onChange={(e) => handleChange('socialHistory', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                placeholder="Smoking, alcohol, occupation..."
              />
            </div>

            {/* Common Medical History Checklist */}
            <div>
              <label className="block text-sm font-medium mb-1">Common Medical History</label>
              <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={demographics.pmhHTN}
                    onChange={(e) => updateDemographics({ pmhHTN: e.target.checked })}
                    className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
                  />
                  <span className="text-sm">HTN</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={demographics.pmhDM2}
                    onChange={(e) => updateDemographics({ pmhDM2: e.target.checked })}
                    className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
                  />
                  <span className="text-sm">DMII</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={demographics.pmhCOPD}
                    onChange={(e) => updateDemographics({ pmhCOPD: e.target.checked })}
                    className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
                  />
                  <span className="text-sm">COPD</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={demographics.pmhBPH}
                    onChange={(e) => updateDemographics({ pmhBPH: e.target.checked })}
                    className="w-4 h-4 text-ayekta-orange border-ayekta-border rounded focus:ring-ayekta-orange"
                  />
                  <span className="text-sm">BPH</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">Other Conditions</label>
                <input
                  type="text"
                  value={demographics.pmhOther}
                  onChange={(e) => updateDemographics({ pmhOther: e.target.value })}
                  className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
                  placeholder="Specify other conditions..."
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
