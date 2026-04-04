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
  /** Nurse intake queue (Blueprint §5). */
  intake: '/intake',
  /** Nurse documents hub → per-patient chart Documents. */
  documents: '/documents',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminFacilities: '/admin/facilities',
  adminAudit: '/admin/audit',
  adminConfig: '/admin/config',
  settings: '/settings',
} as const;

export type NavItem = { to: string; label: string; roles: readonly ClinicalRole[] | readonly ['all'] };

export const PRIMARY_NAV: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', roles: ['all'] },
  { to: ROUTES.patients, label: 'Patients', roles: ['all'] },
  { to: ROUTES.intake, label: 'Intake queue', roles: ['nurse'] },
  { to: ROUTES.documents, label: 'Documents', roles: ['nurse'] },
  { to: ROUTES.analytics, label: 'Mission', roles: ['surgeon', 'admin'] },
  { to: ROUTES.adminUsers, label: 'Users', roles: ['admin'] },
  { to: ROUTES.adminFacilities, label: 'Facilities', roles: ['admin'] },
  { to: ROUTES.adminAudit, label: 'Audit', roles: ['admin'] },
  { to: ROUTES.adminConfig, label: 'Workflow', roles: ['admin'] },
  { to: ROUTES.settings, label: 'Settings', roles: ['all'] },
];

export function navForRole(role: ClinicalRole): NavItem[] {
  return PRIMARY_NAV.filter(
    (item) => item.roles[0] === 'all' || (item.roles as readonly ClinicalRole[]).includes(role)
  );
}
