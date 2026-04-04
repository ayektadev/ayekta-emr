import type { PatientData } from '../types/patient.types';
import { upsertPendingChartBundlePush } from './syncQueue';

let autosaveTimer: ReturnType<typeof setTimeout> | undefined;

export async function notifyChartSavedForSync(
  data: PatientData,
  pdf: Blob | undefined | null
): Promise<void> {
  await upsertPendingChartBundlePush(data, pdf ?? undefined);
  const { useSyncStatusStore } = await import('../store/syncStatusStore');
  await useSyncStatusStore.getState().refreshCounts();
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    void useSyncStatusStore.getState().runProcessor();
  }
}

/** Debounced enqueue after autosave so typing does not flood the outbox. */
export function scheduleAutosaveChartSync(data: PatientData): void {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    void notifyChartSavedForSync(data, undefined);
  }, 12_000);
}
