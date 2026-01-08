import { usePatientStore } from '../../store/patientStore';
import type { ImagingStudy, ImageAttachment } from '../../types/patient.types';
import { v4 as uuidv4 } from 'uuid';

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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ImageAttachment[] = [];

    // Supported medical imaging formats
    const supportedFormats = [
      'image/', // All image types (jpg, png, gif, bmp, tiff, etc.)
      'application/pdf',
      'application/dicom', // DICOM files
      'application/x-dicom',
      '.dcm', // DICOM extension
      '.dicom',
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type - allow images, PDFs, and DICOM
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const isSupported =
        file.type.startsWith('image/') ||
        file.type === 'application/pdf' ||
        file.type === 'application/dicom' ||
        file.type === 'application/x-dicom' ||
        fileExtension === 'dcm' ||
        fileExtension === 'dicom';

      if (!isSupported) {
        alert(`File ${file.name} is not a supported format. Please upload images, PDFs, or DICOM files.`);
        continue;
      }

      // Check file size (max 25MB for medical images)
      if (file.size > 25 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 25MB.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const attachment: ImageAttachment = {
          id: uuidv4(),
          filename: file.name,
          fileType: file.type,
          base64Data: base64,
          uploadDate: new Date().toISOString(),
        };
        newAttachments.push(attachment);
      } catch (error) {
        console.error('Error reading file:', error);
        alert(`Error uploading ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      const currentAttachments = study.attachments || [];
      onUpdate(study.id, {
        attachments: [...currentAttachments, ...newAttachments],
      });
    }

    // Reset file input
    e.target.value = '';
  };

  const removeAttachment = (attachmentId: string) => {
    const updatedAttachments = (study.attachments || []).filter((att) => att.id !== attachmentId);
    onUpdate(study.id, { attachments: updatedAttachments });
  };

  const downloadAttachment = (attachment: ImageAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.base64Data;
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        {/* Image Attachments Section */}
        <div className="md:col-span-2 border-t border-ayekta-border pt-4 mt-2">
          <label className="block text-xs font-medium mb-2">Image Attachments</label>
          <div className="flex items-center gap-4 mb-3">
            <input
              type="file"
              accept="image/*,.pdf,.dcm,.dicom,application/pdf,application/dicom,application/x-dicom"
              multiple
              onChange={handleFileUpload}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-ayekta-orange file:text-white hover:file:bg-opacity-90 file:cursor-pointer"
            />
            <span className="text-xs text-ayekta-muted">
              Upload medical images (JPG, PNG, DICOM, PDF, etc. - max 25MB each)
            </span>
          </div>

          {/* Display uploaded attachments */}
          {study.attachments && study.attachments.length > 0 && (
            <div className="space-y-2">
              {study.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {attachment.fileType.startsWith('image/') ? (
                      <img
                        src={attachment.base64Data}
                        alt={attachment.filename}
                        className="w-16 h-16 object-cover rounded cursor-pointer"
                        onClick={() => window.open(attachment.base64Data, '_blank')}
                        title="Click to view full size"
                      />
                    ) : attachment.fileType === 'application/pdf' ? (
                      <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center cursor-pointer" onClick={() => window.open(attachment.base64Data, '_blank')} title="Click to view PDF">
                        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center" title="Medical image file">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm3 2v8h8V5H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.filename}</p>
                      <p className="text-xs text-ayekta-muted">
                        {attachment.fileType.includes('dicom') ? 'DICOM Image' : attachment.fileType === 'application/pdf' ? 'PDF Document' : 'Medical Image'} • Uploaded: {new Date(attachment.uploadDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadAttachment(attachment)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Download"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(study.id)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Remove Study
      </button>
    </div>
  );
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
