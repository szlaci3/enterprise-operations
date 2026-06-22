import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

async function getDiagnosticsService() {
  const { diagnosticsService } = await import(
    '../services/diagnosticsService'
  )
  return diagnosticsService
}

export const diagnosticsKeys = {
  get all() {
    return tenantQueryKey('diagnostics')
  },
  snapshot: () => [...diagnosticsKeys.all, 'snapshot'] as const,
}

export const diagnosticsSnapshotOptions = () =>
  queryOptions({
    networkMode: 'always',
    queryFn: async () => (await getDiagnosticsService()).getSnapshot(),
    queryKey: diagnosticsKeys.snapshot(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

export function useClearRuntimeIncidents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => (await getDiagnosticsService()).clearIncidents(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: diagnosticsKeys.all })
    },
  })
}
