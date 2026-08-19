import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import type { AnalyticsRange } from '@/types';

export const analyticsKeys = {
  data: (range: AnalyticsRange) => ['analytics', range] as const,
};

export function useAnalytics(range: AnalyticsRange) {
  return useQuery({
    queryKey: analyticsKeys.data(range),
    queryFn: () => analyticsService.getAnalytics(range),
    staleTime: 60_000,
  });
}
