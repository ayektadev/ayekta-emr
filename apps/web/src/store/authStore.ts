import { create } from 'zustand';
import type { ClinicalRole } from '@ayekta/shared-types';
import { DEFAULT_FACILITY_ID, DEFAULT_TENANT_ID } from '@ayekta/shared-types';
import { getAyektaDB } from '../db/dexie/database';
import { appendLocalAuditEvent } from '../db/repositories/auditRepository';

const TRUST_MS = 1000 * 60 * 60 * 24 * 30; // 30 days — offline unlock window

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

function isClinicalRole(r: string): r is ClinicalRole {
  return r === 'surgeon' || r === 'nurse' || r === 'admin';
}

interface AuthState {
  user: AuthUser | null;
  /** Bearer token for `VITE_SYNC_API_BASE` when JWT auth is enabled on the API. */
  accessToken: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
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
        accessToken: row.accessToken?.trim() || null,
        hydrated: true,
      });
      return;
    }
    if (row) {
      await db.authSession.delete('current');
    }
    set({ user: null, accessToken: null, hydrated: true });
  },

  login: async (username: string, password: string) => {
    const base = (import.meta.env.VITE_SYNC_API_BASE as string | undefined)?.replace(/\/$/, '');

    if (base) {
      const tenantSlug =
        (import.meta.env.VITE_SYNC_TENANT_SLUG as string | undefined)?.trim() || 'default';
      try {
        const res = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password, tenantSlug }),
        });
        if (!res.ok) {
          return false;
        }
        const j = (await res.json()) as {
          accessToken?: string;
          user?: {
            username?: string;
            displayName?: string;
            role?: string;
            tenantId?: string;
            facilityId?: string;
          };
        };
        const token = j.accessToken?.trim();
        const u = j.user;
        if (!token || !u?.role || !isClinicalRole(u.role) || !u.tenantId || !u.facilityId) {
          return false;
        }
        const user: AuthUser = {
          username: u.username ?? username.trim(),
          displayName: u.displayName ?? u.username ?? username.trim(),
          role: u.role,
          tenantId: u.tenantId,
          facilityId: u.facilityId,
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
          accessToken: token,
        });

        set({ user, accessToken: token });

        void appendLocalAuditEvent({
          tenantId: user.tenantId,
          facilityId: user.facilityId,
          username: user.username,
          entityType: 'session',
          entityId: user.username,
          action: 'login_success',
          occurredAt: Date.now(),
        });

        return true;
      } catch {
        return false;
      }
    }

    const match = MOCK_ACCOUNTS.find(
      (a) => a.username === username.trim() && a.password === password
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

    set({ user, accessToken: null });

    void appendLocalAuditEvent({
      tenantId: user.tenantId,
      facilityId: user.facilityId,
      username: user.username,
      entityType: 'session',
      entityId: user.username,
      action: 'login_success',
      occurredAt: Date.now(),
    });

    return true;
  },
}));
