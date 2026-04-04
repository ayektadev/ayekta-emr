import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../query/queryKeys';
import { listServerAttachmentsForPatient, syncApiConfigured } from '../../services/attachmentsApi';

export function useServerAttachmentsQuery(patientId: string | undefined) {
  const enabled = Boolean(patientId?.trim()) && syncApiConfigured();

  return useQuery({
    queryKey: queryKeys.serverAttachments(patientId ?? ''),
    queryFn: () => listServerAttachmentsForPatient(patientId!),
    enabled,
  });
}
