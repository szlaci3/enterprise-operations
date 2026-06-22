import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { PermissionKey } from '../../access/schemas/accessSchemas'
import { notificationKeys } from '../../notifications/queries/notificationQueries'
import { collaborationService } from '../services/collaborationService'
import type {
  CollaborationCommentFormValues,
  CollaborationCommentUpdate,
  CollaborationEntityType,
} from '../schemas/collaborationSchemas'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const collaborationKeys = {
  get all() {
    return tenantQueryKey('collaboration')
  },
  entity: (entityType: CollaborationEntityType, entityId: string) =>
    [...collaborationKeys.all, 'entity', entityType, entityId] as const,
}

export const collaborationEntityOptions = (
  entityType: CollaborationEntityType,
  entityId: string,
  permissionKeys: PermissionKey[],
) =>
  queryOptions({
    queryFn: () =>
      collaborationService.listEntity(entityType, entityId, permissionKeys),
    queryKey: collaborationKeys.entity(entityType, entityId),
  })

function useCollaborationMutation(
  entityType: CollaborationEntityType,
  entityId: string,
) {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: collaborationKeys.entity(entityType, entityId),
      }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    ])
  }
}

export function useCreateComment(
  entityType: CollaborationEntityType,
  entityId: string,
  actorUserId: string,
  permissionKeys: PermissionKey[],
) {
  const invalidate = useCollaborationMutation(entityType, entityId)
  return useMutation({
    mutationFn: (values: CollaborationCommentFormValues) =>
      collaborationService.create(
        entityType,
        entityId,
        actorUserId,
        permissionKeys,
        values,
      ),
    onSuccess: invalidate,
  })
}

export function useUpdateComment(
  entityType: CollaborationEntityType,
  entityId: string,
  actorUserId: string,
  permissionKeys: PermissionKey[],
) {
  const invalidate = useCollaborationMutation(entityType, entityId)
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: CollaborationCommentUpdate
    }) =>
      collaborationService.update(id, actorUserId, permissionKeys, values),
    onSuccess: invalidate,
  })
}

export function useRemoveComment(
  entityType: CollaborationEntityType,
  entityId: string,
  actorUserId: string,
  permissionKeys: PermissionKey[],
) {
  const invalidate = useCollaborationMutation(entityType, entityId)
  return useMutation({
    mutationFn: (id: string) =>
      collaborationService.remove(id, actorUserId, permissionKeys),
    onSuccess: invalidate,
  })
}
