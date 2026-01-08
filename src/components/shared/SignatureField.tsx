import React from 'react';
import { usePatientStore } from '../../store/patientStore';
import { getCurrentDate } from '../../utils/calculations';

interface SignatureFieldProps {
  label: string;
  providerName: string;
  signatureDate: string;
  onProviderNameChange: (value: string) => void;
  onSignatureDateChange: (value: string) => void;
  showAutoFillButton?: boolean;
}

/**
 * Reusable signature component that can auto-fill the logged-in provider's name and current date
 */
export const SignatureField: React.FC<SignatureFieldProps> = ({
  label,
  providerName,
  signatureDate,
  onProviderNameChange,
  onSignatureDateChange,
  showAutoFillButton = true,
}) => {
  const currentProvider = usePatientStore((state) => state.currentProvider);

  const handleAutoFill = () => {
    if (currentProvider) {
      onProviderNameChange(currentProvider);
    }
    onSignatureDateChange(getCurrentDate());
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Provider Name</label>
          <input
            type="text"
            value={providerName}
            onChange={(e) => onProviderNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
            placeholder="Provider name"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Signature Date</label>
          <input
            type="date"
            value={signatureDate}
            onChange={(e) => onSignatureDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
          />
        </div>
        {showAutoFillButton && (
          <div className="md:col-span-1 flex items-end">
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-4 py-2 bg-ayekta-orange text-white rounded hover:bg-opacity-90 transition-colors text-sm"
            >
              Sign Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
