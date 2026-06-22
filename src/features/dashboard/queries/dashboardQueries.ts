import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { DashboardPeriod } from '../schemas/dashboardSchemas'
import { dashboardService } from '../services/dashboardService'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const dashboardKeys = {
  get all() {
    return tenantQueryKey('dashboard')
  },
  snapshot: (period: DashboardPeriod) =>
    [...dashboardKeys.all, 'snapshot', period] as const,
}

export const dashboardSnapshotOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryFn: () => dashboardService.getSnapshot(period),
    queryKey: dashboardKeys.snapshot(period),
  })

export function useAcknowledgeDashboardAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dashboardService.acknowledgeAlert,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}
