/** True when no sync API URL was set at build time (e.g. GitHub Pages static preview). */
export function isStaticDemoBuild(): boolean {
  return !(import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.trim();
}
