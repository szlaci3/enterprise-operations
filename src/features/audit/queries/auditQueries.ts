import { queryOptions } from '@tanstack/react-query'
import type { AuditEntityType } from '../schemas/auditSchemas'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

async function getAuditService() {
  const { auditService } = await import('../services/auditService')
  return auditService
}

export const auditKeys = {
  get all() {
    return tenantQueryKey('audit')
  },
  entity: (entityType: AuditEntityType, entityId: string) =>
    [...auditKeys.all, 'entity', entityType, entityId] as const,
  list: () => [...auditKeys.all, 'list'] as const,
}

export const auditListOptions = () =>
  queryOptions({
    queryFn: async () => (await getAuditService()).list(),
    queryKey: auditKeys.list(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

export const auditEntityOptions = (
  entityType: AuditEntityType,
  entityId: string,
) =>
  queryOptions({
    queryFn: async () =>
      (await getAuditService()).listEntity(entityType, entityId),
    queryKey: auditKeys.entity(entityType, entityId),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
