import { DEFAULT_FACILITY_ID, DEFAULT_TENANT_ID } from '@ayekta/shared-types';
import { useAuthStore } from '../../store/authStore';

export interface PersistenceContext {
  tenantId: string;
  facilityId: string;
  username?: string;
}

export function getPersistenceContext(): PersistenceContext {
  const u = useAuthStore.getState().user;
  return {
    tenantId: u?.tenantId ?? DEFAULT_TENANT_ID,
    facilityId: u?.facilityId ?? DEFAULT_FACILITY_ID,
    username: u?.username,
  };
}
