/** Central TanStack Query keys (Chunk I). */
export const queryKeys = {
  missionMetrics: ['missionMetrics'] as const,
  serverAttachments: (patientId: string) => ['serverAttachments', patientId] as const,
  /** Invalidate all per-patient server attachment lists after sync upload. */
  serverAttachmentsAll: ['serverAttachments'] as const,
} as const;
