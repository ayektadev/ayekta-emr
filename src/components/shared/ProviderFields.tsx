import React, { useEffect, useState } from 'react';
import { usePatientStore } from '../../store/patientStore';

interface ProviderFieldsProps {
  surgeonValue: string;
  assistantsValue?: string;
  anesthesiologistValue?: string;
  onSurgeonChange: (value: string) => void;
  onAssistantsChange?: (value: string) => void;
  onAnesthesiologistChange?: (value: string) => void;
  showAssistants?: boolean;
  showAnesthesiologist?: boolean;
  label?: string;
}

/**
 * Reusable provider fields component that prefills from Triage attending surgeon
 * Includes an override toggle to allow manual entry when needed
 */
export const ProviderFields: React.FC<ProviderFieldsProps> = ({
  surgeonValue,
  assistantsValue = '',
  anesthesiologistValue = '',
  onSurgeonChange,
  onAssistantsChange,
  onAnesthesiologistChange,
  showAssistants = true,
  showAnesthesiologist = true,
  label = 'Care Team',
}) => {
  const attendingSurgeon = usePatientStore((state) => state.triage.attendingSurgeon);
  const [isOverridden, setIsOverridden] = useState(false);

  // Auto-fill from Triage if not overridden and surgeon field is empty
  useEffect(() => {
    if (!isOverridden && !surgeonValue && attendingSurgeon) {
      onSurgeonChange(attendingSurgeon);
    }
  }, [attendingSurgeon, surgeonValue, isOverridden, onSurgeonChange]);

  const handleToggleOverride = () => {
    setIsOverridden(!isOverridden);
  };

  // If surgeon value differs from attending surgeon, mark as overridden
  useEffect(() => {
    if (surgeonValue && attendingSurgeon && surgeonValue !== attendingSurgeon) {
      setIsOverridden(true);
    }
  }, [surgeonValue, attendingSurgeon]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ayekta-orange">{label}</h3>
        {attendingSurgeon && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Prefilled from Triage: {attendingSurgeon}
            </span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isOverridden}
                onChange={handleToggleOverride}
                className="rounded border-ayekta-border text-ayekta-orange focus:ring-ayekta-orange"
              />
              Override
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Surgeon</label>
          <input
            type="text"
            value={surgeonValue}
            onChange={(e) => onSurgeonChange(e.target.value)}
            disabled={!isOverridden && !!attendingSurgeon}
            className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Surgeon name"
          />
        </div>

        {showAssistants && onAssistantsChange && (
          <div>
            <label className="block text-sm font-medium mb-1">Assistant(s)</label>
            <input
              type="text"
              value={assistantsValue}
              onChange={(e) => onAssistantsChange(e.target.value)}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              placeholder="Comma-separated if multiple"
            />
          </div>
        )}

        {showAnesthesiologist && onAnesthesiologistChange && (
          <div>
            <label className="block text-sm font-medium mb-1">Anesthesiologist</label>
            <input
              type="text"
              value={anesthesiologistValue}
              onChange={(e) => onAnesthesiologistChange(e.target.value)}
              className="w-full px-3 py-2 border border-ayekta-border rounded focus:outline-none focus:ring-2 focus:ring-ayekta-orange"
              placeholder="Anesthesiologist name"
            />
          </div>
        )}
      </div>
    </div>
  );
};
