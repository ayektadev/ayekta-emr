import { useSyncStatusStore } from '../../store/syncStatusStore';

export function SyncConflictBanner() {
  const conflicts = useSyncStatusStore((s) => s.conflicts);
  const dismissConflict = useSyncStatusStore((s) => s.dismissConflict);
  const resolveKeepLocalAndRetry = useSyncStatusStore((s) => s.resolveKeepLocalAndRetry);

  if (conflicts.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[10001] p-3 pointer-events-none flex justify-center"
      role="presentation"
    >
      <div
        className="pointer-events-auto max-w-lg w-full border border-red-300 bg-red-50 text-red-950 rounded-md shadow-lg p-4 text-sm"
        role="alert"
        aria-live="assertive"
      >
        <p className="font-semibold mb-1">Sync conflict</p>
        <ul className="list-disc pl-4 space-y-2 mb-3">
          {conflicts.map((c) => (
            <li key={c.clientId}>
              <span className="font-mono text-xs">{c.entityId}</span>
              <span className="block text-red-900/90">{c.message}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-red-900/80 mb-3">
          The server&apos;s chart revision changed (optimistic lock). Pull runs after each sync batch; use{' '}
          <strong>Keep local &amp; retry</strong> only if you intend to overwrite the server copy — the app
          aligns your stored revision first. Prefer pulling again from another device or after a successful sync
          if you need server data.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm font-medium bg-red-800 text-white rounded-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-950 focus-visible:ring-offset-2"
            onClick={() => {
              void (async () => {
                const list = [...conflicts];
                for (const c of list) {
                  await resolveKeepLocalAndRetry(c.clientId);
                }
              })();
            }}
          >
            Keep local &amp; retry upload
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm border border-red-400 rounded-sm hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2"
            onClick={() => conflicts.forEach((c) => dismissConflict(c.clientId))}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
