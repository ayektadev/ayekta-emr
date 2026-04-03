import { create } from 'zustand';
import type { ClinicalRole } from '@ayekta/shared-types';
import { DEFAULT_FACILITY_ID, DEFAULT_TENANT_ID } from '@ayekta/shared-types';
import { getAyektaDB } from '../db/dexie/database';

const TRUST_MS = 1000 * 60 * 60 * 24 * 30; // 30 days — offline unlock window for mock auth

export interface AuthUser {
  username: string;
  displayName: string;
  role: ClinicalRole;
  tenantId: string;
  facilityId: string;
}

interface MockAccount {
  username: string;
  password: string;
  displayName: string;
  role: ClinicalRole;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  { username: 'surgeon', password: 'surgeon', displayName: 'Demo Surgeon', role: 'surgeon' },
  { username: 'nurse', password: 'nurse', displayName: 'Demo Nurse', role: 'nurse' },
  { username: 'admin', password: 'admin', displayName: 'Demo Admin', role: 'admin' },
];

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    const db = getAyektaDB();
    const row = await db.authSession.get('current');
    if (row && row.trustedUntil > Date.now()) {
      set({
        user: {
          username: row.username,
          displayName: row.displayName,
          role: row.role,
          tenantId: row.tenantId,
          facilityId: row.facilityId,
        },
        hydrated: true,
      });
      return;
    }
    if (row) {
      await db.authSession.delete('current');
    }
    set({ user: null, hydrated: true });
  },

  login: async (username: string, password: string) => {
    const match = MOCK_ACCOUNTS.find(
      (a) => a.username === username && a.password === password
    );
    if (!match) return false;

    const user: AuthUser = {
      username: match.username,
      displayName: match.displayName,
      role: match.role,
      tenantId: DEFAULT_TENANT_ID,
      facilityId: DEFAULT_FACILITY_ID,
    };

    const db = getAyektaDB();
    await db.authSession.put({
      id: 'current',
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      tenantId: user.tenantId,
      facilityId: user.facilityId,
      trustedUntil: Date.now() + TRUST_MS,
    });

    set({ user });
    return true;
  },
}));
