import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { DashboardPeriod } from '../schemas/dashboardSchemas'
import { dashboardService } from '../services/dashboardService'

export const dashboardKeys = {
  all: ['dashboard'] as const,
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
