import { useEffect, useRef } from 'react';
import { usePatientStore } from '../store/patientStore';
import { saveToStorage } from '../utils/storage';

/**
 * Auto-save patient data to IndexedDB with debouncing
 * Saves 2 seconds after the last change
 */
export function useAutoSave() {
  const patient = usePatientStore((state) => ({
    ishiId: state.ishiId,
    currentProvider: state.currentProvider,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    demographics: state.demographics,
    triage: state.triage,
    surgicalNeeds: state.surgicalNeeds,
    consent: state.consent,
    medications: state.medications,
    labs: state.labs,
    imaging: state.imaging,
    operativeNote: state.operativeNote,
    discharge: state.discharge,
    preAnesthesia: state.preAnesthesia,
    anesthesiaRecord: state.anesthesiaRecord,
    orRecord: state.orRecord,
    nursingOrders: state.nursingOrders,
    pacu: state.pacu,
    floorFlow: state.floorFlow,
    progressNotes: state.progressNotes,
    followUpNotes: state.followUpNotes,
  }));

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Skip auto-save if no patient is loaded
    if (!patient.ishiId) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveToStorage(patient).catch((error) => {
        console.error('Auto-save failed:', error);
      });
    }, 2000); // 2 second debounce

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [patient]);
}
