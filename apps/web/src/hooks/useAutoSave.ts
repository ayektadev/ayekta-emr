import { useEffect, useRef } from 'react';
import { getPatientDataSnapshot, usePatientStore } from '../store/patientStore';
import { saveToStorage } from '../utils/storage';

/**
 * Auto-save full chart to IndexedDB (debounced). Uses a complete snapshot so partial slices cannot
 * overwrite the draft. Schedules a debounced sync outbox enqueue (see chartSyncEnqueue).
 */
export function useAutoSave() {
  const ishiId = usePatientStore((s) => s.ishiId);
  const updatedAt = usePatientStore((s) => s.updatedAt);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!ishiId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const full = getPatientDataSnapshot(usePatientStore.getState());
      if (!full) return;
      void saveToStorage(full)
        .then(() =>
          import('../services/chartSyncEnqueue').then((m) => m.scheduleAutosaveChartSync(full))
        )
        .catch((error) => {
          console.error('Auto-save failed:', error);
        });
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ishiId, updatedAt]);
}
