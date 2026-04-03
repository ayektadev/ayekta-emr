import { usePatientStore } from '../../store/patientStore';
import { SignatureField } from '../shared/SignatureField';
import type { FollowUpNote } from '../../types/patient.types';
import { v4 as uuidv4 } from 'uuid';

export default function FollowUpNotes() {
  const followUpNotes = usePatientStore((state) => state.followUpNotes);
  const operativeNote = usePatientStore((state) => state.operativeNote);
  const addFollowUpNote = usePatientStore((state) => state.addFollowUpNote);
  const removeFollowUpNote = usePatientStore((state) => state.removeFollowUpNote);
  const updateFollowUpNote = usePatientStore((state) => state.updateFollowUpNote);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Follow-up Appointment Notes</h2>

      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ayekta-muted">
            Document post-discharge follow-up visits
          </p>
          <button
            onClick={() =>
              addFollowUpNote({
                id: uuidv4(),
                visitDate: '',
                visitTime: '',
                chiefComplaint: '',
                intervalHistory: '',
                woundCheck: '',
                painLevel: '',
                complications: '',
                examination: '',
                assessment: '',
                plan: '',
                nextFollowUp: '',
                providerName: '',
                providerSignatureDate: '',
              })
            }
            className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
          >
            + Add Follow-up Visit
          </button>
        </div>

        {followUpNotes.notes.length === 0 ? (
          <p className="text-ayekta-muted text-sm">No follow-up visits recorded</p>
        ) : (
          <div className="space-y-6">
            {followUpNotes.notes.map((note) => (
              <FollowUpNoteCard
                key={note.id}
                note={note}
                operativeProcedure={operativeNote.procedurePerformed}
                onUpdate={updateFollowUpNote}
                onRemove={removeFollowUpNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FollowUpNoteCard({
  note,
  operativeProcedure,
  onUpdate,
  onRemove,
}: {
  note: FollowUpNote;
  operativeProcedure: string;
  onUpdate: (id: string, updates: Partial<FollowUpNote>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 border border-ayekta-border rounded bg-gray-50">
      {/* Header with date and remove button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Follow-up Visit
          {note.visitDate && ` - ${new Date(note.visitDate).toLocaleDateString()}`}
        </h3>
        <button
          onClick={() => onRemove(note.id)}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Visit Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1">Visit Date</label>
          <input
            type="date"
            value={note.visitDate}
            onChange={(e) => onUpdate(note.id, { visitDate: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Visit Time</label>
          <input
            type="time"
            value={note.visitTime}
            onChange={(e) => onUpdate(note.id, { visitTime: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Pain Level (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={note.painLevel}
            onChange={(e) => onUpdate(note.id, { painLevel: e.target.value })}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
            placeholder="0-10"
          />
        </div>
      </div>

      {/* Procedure Performed (auto-filled from Operative Note) */}
      {operativeProcedure && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <label className="block text-xs font-medium mb-1 text-blue-800">
            Procedure Performed (from Operative Note)
          </label>
          <p className="text-sm text-blue-900">{operativeProcedure}</p>
        </div>
      )}

      {/* Chief Complaint */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Chief Complaint</label>
        <input
          type="text"
          value={note.chiefComplaint}
          onChange={(e) => onUpdate(note.id, { chiefComplaint: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          placeholder="Reason for follow-up visit"
        />
      </div>

      {/* Interval History */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">
          Interval History (Since Discharge)
        </label>
        <textarea
          value={note.intervalHistory}
          onChange={(e) => onUpdate(note.id, { intervalHistory: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          rows={3}
          placeholder="Patient's recovery progress since discharge, symptoms, activities..."
        />
      </div>

      {/* Wound Check */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Wound/Incision Check</label>
        <textarea
          value={note.woundCheck}
          onChange={(e) => onUpdate(note.id, { woundCheck: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          rows={2}
          placeholder="Clean/dry/intact, signs of infection, healing progress..."
        />
      </div>

      {/* Complications */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Complications/Concerns</label>
        <textarea
          value={note.complications}
          onChange={(e) => onUpdate(note.id, { complications: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          rows={2}
          placeholder="Any complications or concerns since discharge..."
        />
      </div>

      {/* Physical Examination */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Physical Examination</label>
        <textarea
          value={note.examination}
          onChange={(e) => onUpdate(note.id, { examination: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          rows={3}
          placeholder="Focused physical exam findings..."
        />
      </div>

      {/* Assessment */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Assessment</label>
        <textarea
          value={note.assessment}
          onChange={(e) => onUpdate(note.id, { assessment: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          rows={2}
          placeholder="Clinical assessment of recovery status..."
        />
      </div>

      {/* Plan */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Plan</label>
        <textarea
          value={note.plan}
          onChange={(e) => onUpdate(note.id, { plan: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          rows={3}
          placeholder="Treatment plan, recommendations, activity restrictions..."
        />
      </div>

      {/* Next Follow-up */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">Next Follow-up</label>
        <input
          type="text"
          value={note.nextFollowUp}
          onChange={(e) => onUpdate(note.id, { nextFollowUp: e.target.value })}
          className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange text-sm"
          placeholder="e.g., 2 weeks, PRN, Discharged from care"
        />
      </div>

      {/* Provider Signature */}
      <div className="pt-4 border-t border-gray-200">
        <SignatureField
          label="Provider Signature"
          providerName={note.providerName}
          signatureDate={note.providerSignatureDate}
          onProviderNameChange={(value) => onUpdate(note.id, { providerName: value })}
          onSignatureDateChange={(value) =>
            onUpdate(note.id, { providerSignatureDate: value })
          }
        />
      </div>
    </div>
  );
}
