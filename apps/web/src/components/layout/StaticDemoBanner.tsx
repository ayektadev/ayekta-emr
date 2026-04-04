import { isStaticDemoBuild } from '../../utils/deploymentMode';

/**
 * Shown on static / mock deployments so visitors know there is no server sync yet.
 */
export default function StaticDemoBanner() {
  if (!isStaticDemoBuild()) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950 sm:text-sm"
    >
      <strong className="font-semibold">Demo preview</strong>
      <span className="text-amber-900">
        {' '}
        — UI and local-only charts in this browser. No API or cloud database is connected yet; sign in with{' '}
        <strong>surgeon</strong>, <strong>nurse</strong>, or <strong>admin</strong> (password matches username).
      </span>
    </div>
  );
}
