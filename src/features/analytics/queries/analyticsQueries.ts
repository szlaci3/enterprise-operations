import { queryOptions } from '@tanstack/react-query'
import type { AnalyticsFilters } from '../schemas/analyticsSchemas'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

async function getAnalyticsService() {
  const { analyticsService } = await import('../services/analyticsService')
  return analyticsService
}

export const analyticsKeys = {
  get all() {
    return tenantQueryKey('analytics')
  },
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
