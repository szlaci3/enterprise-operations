import { queryOptions } from '@tanstack/react-query'
import type { AnalyticsFilters } from '../schemas/analyticsSchemas'

async function getAnalyticsService() {
  const { analyticsService } = await import('../services/analyticsService')
  return analyticsService
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  snapshot: (filters: AnalyticsFilters) =>
    [
      ...analyticsKeys.all,
      'snapshot',
      filters.period,
      filters.departmentId,
    ] as const,
}

export const analyticsSnapshotOptions = (filters: AnalyticsFilters) =>
  queryOptions({
    queryFn: async () => (await getAnalyticsService()).getSnapshot(filters),
    queryKey: analyticsKeys.snapshot(filters),
    staleTime: 15_000,
  })
