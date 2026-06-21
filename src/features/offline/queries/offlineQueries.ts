import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { taskKeys } from '../../tasks/queries/taskQueries'
import { offlineService } from '../services/offlineService'

export const offlineKeys = {
  all: ['offline'] as const,
  snapshot: () => [...offlineKeys.all, 'snapshot'] as const,
}

export const offlineSnapshotOptions = () =>
  queryOptions({
    networkMode: 'always',
    queryFn: offlineService.getSnapshot,
    queryKey: offlineKeys.snapshot(),
    refetchInterval: 15_000,
  })

function useOfflineMutation<TVariables>(
  mutationFn: (variables: TVariables) => ReturnType<typeof offlineService.discard>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    networkMode: 'always',
    mutationFn,
    onSuccess: async (snapshot) => {
      queryClient.setQueryData(offlineKeys.snapshot(), snapshot)
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useSynchronizeOfflineQueue() {
  return useOfflineMutation<void>(() => offlineService.synchronize())
}

export function useDiscardOfflineOperation() {
  return useOfflineMutation((operationId: string) =>
    offlineService.discard(operationId),
  )
}

export function useResolveOfflineWithLocal() {
  return useOfflineMutation((operationId: string) =>
    offlineService.resolveWithLocal(operationId),
  )
}
