import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { RoleFormValues } from '../schemas/accessSchemas'
import { accessService } from '../services/accessService'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const accessKeys = {
  access: (userId: string) => [...accessKeys.all, 'effective', userId] as const,
  get all() {
    return tenantQueryKey('access')
  },
  assignments: () => [...accessKeys.all, 'assignments'] as const,
  permissions: () => [...accessKeys.all, 'permissions'] as const,
  role: (id: string) => [...accessKeys.all, 'role', id] as const,
  roles: () => [...accessKeys.all, 'roles'] as const,
}

export const permissionListOptions = () =>
  queryOptions({
    queryFn: accessService.listPermissions,
    queryKey: accessKeys.permissions(),
    staleTime: Number.POSITIVE_INFINITY,
  })

export const roleListOptions = () =>
  queryOptions({
    queryFn: accessService.listRoles,
    queryKey: accessKeys.roles(),
  })

export const roleDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => accessService.getRole(id),
    queryKey: accessKeys.role(id),
  })

export const roleAssignmentListOptions = () =>
  queryOptions({
    queryFn: accessService.listAssignments,
    queryKey: accessKeys.assignments(),
  })

export const effectiveAccessOptions = (userId: string) =>
  queryOptions({
    queryFn: () => accessService.getAccess(userId),
    queryKey: accessKeys.access(userId),
  })

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accessService.createRole,
    onSuccess: async (role) => {
      queryClient.setQueryData(accessKeys.role(role.id), role)
      await queryClient.invalidateQueries({ queryKey: accessKeys.all })
    },
  })
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: RoleFormValues) => accessService.updateRole(id, values),
    onSuccess: async (role) => {
      queryClient.setQueryData(accessKeys.role(id), role)
      await queryClient.invalidateQueries({ queryKey: accessKeys.all })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accessService.deleteRole,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: accessKeys.role(id) })
      await queryClient.invalidateQueries({ queryKey: accessKeys.all })
    },
  })
}

export function useReplaceUserRoles(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleIds: string[]) =>
      accessService.replaceUserRoles(userId, roleIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accessKeys.all })
    },
  })
}
