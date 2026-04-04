import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../../store/patientStore';
import type { ComplicationLogEntry } from '../../types/patient.types';

export default function ComplicationsLog() {
  const entries = usePatientStore((s) => s.complicationLog);
  const add = usePatientStore((s) => s.addComplicationLogEntry);
  const remove = usePatientStore((s) => s.removeComplicationLogEntry);
  const updateEntry = usePatientStore((s) => s.updateComplicationLogEntry);

  const addRow = () => {
    add({
      id: uuidv4(),
      recordedAt: new Date().toISOString().slice(0, 16),
      timing: '',
      category: '',
      severity: '',
      description: '',
      management: '',
      recordedBy: '',
    });
  };

  const patch = (id: string, data: Partial<ComplicationLogEntry>) => {
    updateEntry(id, data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-clinical">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Complications log</h2>
          <p className="text-sm text-ayekta-muted max-w-2xl">
            Use one row per complication or adverse event. The operative note still holds your narrative
            summary; this log helps you record timing, severity, and what was done for each event.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="shrink-0 px-4 py-2 text-sm font-medium bg-ayekta-orange text-white rounded-md hover:opacity-90"
        >
          Add entry
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-ayekta-muted border border-dashed border-ayekta-border rounded-md p-8">
          No complication rows yet. Add an entry for each discrete event.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((e) => (
            <div
              key={e.id}
              className="border border-ayekta-border rounded-md bg-white p-4 space-y-3 text-sm"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry</span>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="text-xs text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Recorded (local)</label>
                  <input
                    type="datetime-local"
                    value={e.recordedAt}
                    onChange={(ev) => patch(e.id, { recordedAt: ev.target.value })}
                    className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Timing</label>
                  <select
                    value={e.timing}
                    onChange={(ev) =>
                      patch(e.id, { timing: ev.target.value as ComplicationLogEntry['timing'] })
                    }
                    className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                  >
                    <option value="">—</option>
                    <option value="intraoperative">Intraoperative</option>
                    <option value="immediate_postop">Immediate post-op</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Severity</label>
                  <select
                    value={e.severity}
                    onChange={(ev) =>
                      patch(e.id, { severity: ev.target.value as ComplicationLogEntry['severity'] })
                    }
                    className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                  >
                    <option value="">—</option>
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Category / type</label>
                <input
                  type="text"
                  value={e.category}
                  onChange={(ev) => patch(e.id, { category: ev.target.value })}
                  className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                  placeholder="e.g., Bleeding, infection, anaphylaxis"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea
                  value={e.description}
                  onChange={(ev) => patch(e.id, { description: ev.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Management</label>
                <textarea
                  value={e.management}
                  onChange={(ev) => patch(e.id, { management: ev.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Recorded by</label>
                <input
                  type="text"
                  value={e.recordedBy}
                  onChange={(ev) => patch(e.id, { recordedBy: ev.target.value })}
                  className="w-full px-2 py-1.5 border border-ayekta-border rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
