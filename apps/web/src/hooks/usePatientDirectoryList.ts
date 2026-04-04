import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePatientStore } from '../store/patientStore';
import { getPersistenceContext } from '../db/repositories/persistenceContext';
import { listPatientsForFacility } from '../db/repositories/patientRepository';
import type { LocalPatientRow } from '../db/dexie/schemaTypes';

export function patientDirectoryLabel(p: LocalPatientRow): string {
  const name = `${p.firstName} ${p.lastName}`.trim();
  return name || p.id;
}

/**
 * Shared list for Patients and Intake Queue (same Dexie source, role-specific pages).
 */
export function usePatientDirectoryList() {
  const user = useAuthStore((s) => s.user);
  const ishiId = usePatientStore((s) => s.ishiId);
  const demographics = usePatientStore((s) => s.demographics);

  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<LocalPatientRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const ctx = getPersistenceContext();
    const list = await listPatientsForFacility(ctx);
    setRows(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const merged = useMemo(() => {
    const ctx = getPersistenceContext();
    const byId = new Map(rows.map((r) => [r.id, r]));
    if (ishiId && !byId.has(ishiId)) {
      byId.set(ishiId, {
        id: ishiId,
        tenantId: ctx.tenantId,
        facilityId: ctx.facilityId,
        firstName: demographics.firstName ?? '',
        lastName: demographics.lastName ?? '',
        dob: demographics.dob ?? '',
        sex: demographics.gender ?? '',
        updatedAt: Date.now(),
      });
    }
    return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [rows, ishiId, demographics]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter((p) => {
      return (
        p.id.toLowerCase().includes(q) ||
        patientDirectoryLabel(p).toLowerCase().includes(q) ||
        (p.dob && p.dob.toLowerCase().includes(q))
      );
    });
  }, [merged, query]);

  return { query, setQuery, filtered, loading, refresh };
}
