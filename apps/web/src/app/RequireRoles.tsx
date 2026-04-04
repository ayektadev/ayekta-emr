import { Navigate, Outlet } from 'react-router-dom';
import type { ClinicalRole } from '@ayekta/shared-types';
import { useAuthStore } from '../store/authStore';

/** Restricts child routes to the given roles (Chunk H IA guards). */
export function RequireRoles({ allow }: { allow: readonly ClinicalRole[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
