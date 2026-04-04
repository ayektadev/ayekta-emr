import { useEffect } from 'react';
import { useSyncStatusStore } from '../../store/syncStatusStore';
import { SyncConflictBanner } from './SyncConflictBanner';

/**
 * Subscribes to online/offline, periodic sync attempts, and initial outbox counts.
 */
export function SyncBootstrap() {
  const refreshCounts = useSyncStatusStore((s) => s.refreshCounts);
  const runProcessor = useSyncStatusStore((s) => s.runProcessor);

  useEffect(() => {
    void refreshCounts();

    const onOnline = () => {
      useSyncStatusStore.setState({ isOnline: true });
      void refreshCounts();
      void runProcessor();
    };
    const onOffline = () => {
      useSyncStatusStore.setState({ isOnline: false });
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const interval = window.setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        void runProcessor();
      }
    }, 45_000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.clearInterval(interval);
    };
  }, [refreshCounts, runProcessor]);

  return <SyncConflictBanner />;
}
