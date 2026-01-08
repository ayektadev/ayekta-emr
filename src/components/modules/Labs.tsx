import { usePatientStore } from '../../store/patientStore';
import type { LabTest } from '../../types/patient.types';

export default function Labs() {
  const labs = usePatientStore((state) => state.labs);
  const addLab = usePatientStore((state) => state.addLab);
  const removeLab = usePatientStore((state) => state.removeLab);
  const updateLab = usePatientStore((state) => state.updateLab);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Laboratory Tests</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ayekta-muted">
            Track laboratory tests ordered and results received
          </p>
          <button
            onClick={() => addLab({ id: '', testName: '', dateOrdered: '', dateResulted: '', resultValue: '', referenceRange: '', status: '', interpretation: '' })}
            className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
          >
            + Add Lab Test
          </button>
        </div>

        {labs.length === 0 ? (
          <p className="text-ayekta-muted text-sm">No lab tests recorded</p>
        ) : (
          <div className="space-y-4">
            {labs.map((lab) => (
              <LabRow key={lab.id} lab={lab} onUpdate={updateLab} onRemove={removeLab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LabRow({
  lab,
  onUpdate,
  onRemove,
}: {
  lab: LabTest;
  onUpdate: (id: string, updates: Partial<LabTest>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 border border-ayekta-border rounded">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1">Test Name</label>
          <input
            type="text"
            value={lab.testName}
            onChange={(e) => onUpdate(lab.id, { testName: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., CBC, BMP, HbA1c"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Date Ordered</label>
          <input
            type="date"
            value={lab.dateOrdered}
            onChange={(e) => onUpdate(lab.id, { dateOrdered: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Date Resulted</label>
          <input
            type="date"
            value={lab.dateResulted}
            onChange={(e) => onUpdate(lab.id, { dateResulted: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <select
            value={lab.status}
            onChange={(e) => onUpdate(lab.id, { status: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          >
            <option value="">Select...</option>
            <option value="ordered">Ordered</option>
            <option value="pending">Pending</option>
            <option value="resulted">Resulted</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Result Value</label>
          <input
            type="text"
            value={lab.resultValue}
            onChange={(e) => onUpdate(lab.id, { resultValue: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., 7.2, 140/90, Negative"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Reference Range</label>
          <input
            type="text"
            value={lab.referenceRange}
            onChange={(e) => onUpdate(lab.id, { referenceRange: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="e.g., 4.0-6.0, < 140"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Interpretation</label>
          <input
            type="text"
            value={lab.interpretation}
            onChange={(e) => onUpdate(lab.id, { interpretation: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="Normal, Abnormal, Critical..."
          />
        </div>
      </div>

      <button
        onClick={() => onRemove(lab.id)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Remove
      </button>
    </div>
  );
}
