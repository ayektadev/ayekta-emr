import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../query/queryKeys';
import { gatherMissionMetrics } from '../../services/missionMetrics';

export function useMissionMetricsQuery() {
  return useQuery({
    queryKey: queryKeys.missionMetrics,
    queryFn: gatherMissionMetrics,
    staleTime: 15_000,
  });
}
