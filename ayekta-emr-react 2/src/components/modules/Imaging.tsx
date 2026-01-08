import { usePatientStore } from '../../store/patientStore';
import type { ImagingStudy } from '../../types/patient.types';

export default function Imaging() {
  const imaging = usePatientStore((state) => state.imaging);
  const addImaging = usePatientStore((state) => state.addImaging);
  const removeImaging = usePatientStore((state) => state.removeImaging);
  const updateImaging = usePatientStore((state) => state.updateImaging);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Imaging Studies</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ayekta-muted">
            Track imaging studies ordered and results received
          </p>
          <button
            onClick={() => addImaging({ id: '', studyType: '', bodyPart: '', dateOrdered: '', datePerformed: '', findings: '', impression: '' })}
            className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
          >
            + Add Imaging Study
          </button>
        </div>

        {imaging.length === 0 ? (
          <p className="text-ayekta-muted text-sm">No imaging studies recorded</p>
        ) : (
          <div className="space-y-4">
            {imaging.map((study) => (
              <ImagingRow
                key={study.id}
                study={study}
                onUpdate={updateImaging}
                onRemove={removeImaging}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImagingRow({
  study,
  onUpdate,
  onRemove,
}: {
  study: ImagingStudy;
  onUpdate: (id: string, updates: Partial<ImagingStudy>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 border border-ayekta-border rounded">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1">Study Type</label>
          <select
            value={study.studyType}
            onChange={(e) => onUpdate(study.id, { studyType: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          >
            <option value="">Select...</option>
            <option value="xray">X-Ray</option>
            <option value="ct">CT Scan</option>
            <option value="mri">MRI</option>
            <option value="ultrasound">Ultrasound</option>
            <option value="mammogram">Mammogram</option>
            <option value="dexa">DEXA Scan</option>
            <option value="pet">PET Scan</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Body Part</label>
          <input
            type="text"
            value={study.bodyPart}
            onChange={(e) => onUpdate(study.id, { bodyPart: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., Chest, Abdomen, Right knee"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Date Ordered</label>
          <input
            type="date"
            value={study.dateOrdered}
            onChange={(e) => onUpdate(study.id, { dateOrdered: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Date Performed</label>
          <input
            type="date"
            value={study.datePerformed}
            onChange={(e) => onUpdate(study.id, { datePerformed: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Findings</label>
          <textarea
            value={study.findings}
            onChange={(e) => onUpdate(study.id, { findings: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="Detailed findings from the study..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Impression</label>
          <textarea
            value={study.impression}
            onChange={(e) => onUpdate(study.id, { impression: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="Radiologist's impression and conclusion..."
          />
        </div>
      </div>

      <button
        onClick={() => onRemove(study.id)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Remove
      </button>
    </div>
  );
}
