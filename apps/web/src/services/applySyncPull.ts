import type { PatientData } from '../types/patient.types';
import { persistChartSnapshot } from '../db/repositories/persistenceBridge';
import { usePatientStore } from '../store/patientStore';
import { setServerRevisionForPatient } from './syncServerRevision';

export type PulledBundle = {
  entityType?: string;
  entityId?: string;
  payloadJson?: unknown;
  meta?: { serverRevision?: number; updatedAt?: string | null };
};

export type ApplyPullOptions = {
  /** Patients with pending local pushes: refresh revision only, do not overwrite chart (Chunk D). */
  revisionOnlyEntityIds?: ReadonlySet<string>;
};

export async function applyPulledBundles(
  bundles: unknown[],
  options?: ApplyPullOptions
): Promise<void> {
  const revOnly = options?.revisionOnlyEntityIds;
  for (const raw of bundles) {
    const bundle = raw as PulledBundle;
    if (bundle.entityType !== 'chart_bundle' || !bundle.entityId || bundle.payloadJson == null) continue;

    const rev = bundle.meta?.serverRevision;
    if (revOnly?.has(bundle.entityId)) {
      if (typeof rev === 'number' && Number.isFinite(rev)) {
        await setServerRevisionForPatient(bundle.entityId, rev);
      }
      continue;
    }

    const data: PatientData = {
      ...(bundle.payloadJson as PatientData),
      ishiId: (bundle.payloadJson as PatientData).ishiId || bundle.entityId,
    };

    await persistChartSnapshot(data);

    if (typeof rev === 'number' && Number.isFinite(rev)) {
      await setServerRevisionForPatient(bundle.entityId, rev);
    }

    if (usePatientStore.getState().ishiId === bundle.entityId) {
      usePatientStore.getState().loadPatient(data);
    }
  }
}
