import type { ClinicalRole } from './clinical-role';

/** Top-level route paths (basename is applied by the host app). */
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  patients: '/patients',
  patient: (id: string) => `/patients/${id}`,
  encounter: (id: string) => `/encounters/${id}`,
  chart: '/chart',
  analytics: '/analytics',
  admin: '/admin',
  settings: '/settings',
} as const;

export type NavItem = { to: string; label: string; roles: readonly ClinicalRole[] | readonly ['all'] };

export const PRIMARY_NAV: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', roles: ['all'] },
  { to: ROUTES.patients, label: 'Patients', roles: ['all'] },
  { to: ROUTES.chart, label: 'Chart', roles: ['all'] },
  { to: ROUTES.analytics, label: 'Analytics', roles: ['surgeon', 'admin'] },
  { to: ROUTES.admin, label: 'Admin', roles: ['admin'] },
  { to: ROUTES.settings, label: 'Settings', roles: ['all'] },
];

export function navForRole(role: ClinicalRole): NavItem[] {
  return PRIMARY_NAV.filter(
    (item) => item.roles[0] === 'all' || (item.roles as readonly ClinicalRole[]).includes(role)
  );
}
