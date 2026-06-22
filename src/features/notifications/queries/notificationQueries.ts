import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { NotificationPreferencesFormValues } from '../schemas/notificationSchemas'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

async function getNotificationService() {
  const { notificationService } = await import(
    '../services/notificationService'
  )
  return notificationService
}

export const notificationKeys = {
  get all() {
    return tenantQueryKey('notifications')
  },
  list: (userId: string) => [...notificationKeys.all, 'list', userId] as const,
  preferences: (userId: string) =>
    [...notificationKeys.all, 'preferences', userId] as const,
}

export const notificationListOptions = (userId: string) =>
  queryOptions({
    queryFn: async () => (await getNotificationService()).list(userId),
    queryKey: notificationKeys.list(userId),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

export const notificationPreferencesOptions = (userId: string) =>
  queryOptions({
    queryFn: async () =>
      (await getNotificationService()).getPreferences(userId),
    queryKey: notificationKeys.preferences(userId),
  })

export function useMarkNotificationRead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
      (await getNotificationService()).markRead(id, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      })
    },
  })
}

export function useMarkAllNotificationsRead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () =>
      (await getNotificationService()).markAllRead(userId),
    onSuccess: (notifications) => {
      queryClient.setQueryData(
        notificationKeys.list(userId),
        notifications,
      )
    },
  })
}

export function useUpdateNotificationPreferences(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: NotificationPreferencesFormValues) =>
      (await getNotificationService()).updatePreferences(userId, values),
    onSuccess: (preferences) => {
      queryClient.setQueryData(
        notificationKeys.preferences(userId),
        preferences,
      )
    },
  })
}
