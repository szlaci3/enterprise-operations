import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  FeatureKey,
  FeatureAudience,
  FeatureState,
  OrganizationSettingsFormValues,
  PersonalSettingsFormValues,
  SettingsSnapshot,
} from '../schemas/settingsSchemas'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

async function getSettingsService() {
  const { settingsService } = await import('../services/settingsService')
  return settingsService
}

export const settingsKeys = {
  get all() {
    return tenantQueryKey('settings')
  },
  snapshot: (userId: string) =>
    [...settingsKeys.all, 'snapshot', userId] as const,
}

export const settingsSnapshotOptions = (userId: string) =>
  queryOptions({
    queryFn: async () => (await getSettingsService()).getSnapshot(userId),
    queryKey: settingsKeys.snapshot(userId),
    staleTime: 60_000,
  })

function useSettingsMutation<TVariables>(
  userId: string,
  mutationFn: (values: TVariables) => Promise<SettingsSnapshot>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (snapshot) => {
      queryClient.setQueryData(settingsKeys.snapshot(userId), snapshot)
    },
  })
}

export function useUpdatePersonalSettings(userId: string) {
  return useSettingsMutation(userId, async (values: PersonalSettingsFormValues) =>
    (await getSettingsService()).updatePersonal(userId, values),
  )
}

export function useUpdateOrganizationSettings(actorUserId: string) {
  return useSettingsMutation(
    actorUserId,
    async (values: OrganizationSettingsFormValues) =>
      (await getSettingsService()).updateOrganization(actorUserId, values),
  )
}

export function useUpdateFeatureConfiguration(actorUserId: string) {
  return useSettingsMutation(
    actorUserId,
    async ({
      audience,
      key,
      state,
    }: {
      audience: FeatureAudience
      key: FeatureKey
      state: FeatureState
    }) =>
      (await getSettingsService()).updateFeature(actorUserId, key, {
        audience,
        state,
      }),
  )
}
