import { queryOptions } from '@tanstack/react-query'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { getActiveTenantId } from '../services/tenantContext'
import { tenancyService } from '../services/tenancyService'

export const tenancyKeys = {
  snapshot: () =>
    ['tenant', getActiveTenantId(), 'workspace', currentSessionUserId] as const,
}

export const workspaceSnapshotOptions = () =>
  queryOptions({
    queryFn: () => tenancyService.getSnapshot(currentSessionUserId),
    queryKey: tenancyKeys.snapshot(),
    staleTime: Number.POSITIVE_INFINITY,
  })
