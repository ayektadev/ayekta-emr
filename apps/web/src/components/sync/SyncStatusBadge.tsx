import { useEffect } from 'react';
import { useSyncStatusStore } from '../../store/syncStatusStore';

export function SyncStatusBadge() {
  const pendingCount = useSyncStatusStore((s) => s.pendingCount);
  const errorCount = useSyncStatusStore((s) => s.errorCount);
  const isOnline = useSyncStatusStore((s) => s.isOnline);
  const isProcessing = useSyncStatusStore((s) => s.isProcessing);
  const refreshCounts = useSyncStatusStore((s) => s.refreshCounts);
  const runProcessor = useSyncStatusStore((s) => s.runProcessor);

  useEffect(() => {
    void refreshCounts();
  }, [refreshCounts]);

  const label = !isOnline
    ? 'Offline — sync paused'
    : isProcessing
      ? 'Syncing…'
      : errorCount > 0
        ? `Sync issue — ${errorCount} in error`
        : pendingCount > 0
          ? `${pendingCount} to upload`
          : 'Synced';

  const tone = !isOnline
    ? 'bg-amber-100 text-amber-950 border-amber-300'
    : isProcessing
      ? 'bg-sky-100 text-sky-950 border-sky-300'
      : errorCount > 0
        ? 'bg-red-100 text-red-950 border-red-300'
        : pendingCount > 0
          ? 'bg-orange-100 text-orange-950 border-orange-300'
          : 'bg-emerald-100 text-emerald-950 border-emerald-300';

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm border tabular-nums ${tone}`}
        role="status"
        aria-live="polite"
        title={label}
      >
        <span className="sr-only">Sync status: </span>
        {!isOnline ? (
          <>
            <span aria-hidden>○</span> Offline
          </>
        ) : isProcessing ? (
          <>
            <span className="inline-block size-2 rounded-full bg-sky-600 motion-safe:animate-pulse" aria-hidden />
            Syncing
          </>
        ) : errorCount > 0 ? (
          <>
            <span aria-hidden>!</span> Error ({errorCount})
          </>
        ) : pendingCount > 0 ? (
          <>
            <span aria-hidden>↑</span> {pendingCount} pending
          </>
        ) : (
          <>
            <span aria-hidden>✓</span> Up to date
          </>
        )}
      </span>
      {isOnline && (pendingCount > 0 || errorCount > 0) && (
        <button
          type="button"
          onClick={() => void runProcessor()}
          disabled={isProcessing}
          className="text-xs font-medium px-2 py-1 rounded-sm border border-ayekta-border text-gray-700 hover:bg-white/80 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ayekta-orange focus-visible:ring-offset-1"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
