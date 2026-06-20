import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { UserFormValues, UserStatus } from '../schemas/userSchemas'
import { userService } from '../services/userService'

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  list: () => [...userKeys.all, 'list'] as const,
  teams: () => [...userKeys.all, 'teams'] as const,
}

export const userListOptions = () =>
  queryOptions({ queryFn: userService.list, queryKey: userKeys.list() })

export const userDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => userService.get(id),
    queryKey: userKeys.detail(id),
  })

export const teamListOptions = () =>
  queryOptions({ queryFn: userService.listTeams, queryKey: userKeys.teams() })

function useUserMutationCache() {
  const queryClient = useQueryClient()
  return async (id: string, user: Awaited<ReturnType<typeof userService.update>>) => {
    queryClient.setQueryData(userKeys.detail(id), user)
    await queryClient.invalidateQueries({ queryKey: userKeys.all })
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.create,
    onSuccess: async (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateUser(id: string) {
  const updateCache = useUserMutationCache()
  return useMutation({
    mutationFn: (values: UserFormValues) => userService.update(id, values),
    onSuccess: (user) => updateCache(id, user),
  })
}

export function useSetUserStatus(id: string) {
  const updateCache = useUserMutationCache()
  return useMutation({
    mutationFn: (status: UserStatus) => userService.setStatus(id, status),
    onSuccess: (user) => updateCache(id, user),
  })
}
