import { QueryClient } from '@tanstack/react-query';

/**
 * Default client: moderate stale time, limited retries (offline-first app; server reads fail quietly).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
