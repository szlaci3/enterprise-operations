import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'
import type {
  SavedViewInput,
  SavedViewResource,
} from '../schemas/savedViewSchemas'
import { savedViewService } from '../services/savedViewService'

export const savedViewKeys = {
  all: () => tenantQueryKey('saved-views'),
  list: (resource: SavedViewResource, userId: string) =>
    [...savedViewKeys.all(), resource, userId] as const,
}

export const savedViewListOptions = (
  resource: SavedViewResource,
  userId: string,
) =>
  queryOptions({
    queryFn: () => savedViewService.list(resource, userId),
    queryKey: savedViewKeys.list(resource, userId),
  })

export function useCreateSavedView(userId: string, canShare: boolean) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SavedViewInput) =>
      savedViewService.create(userId, canShare, input),
    onSuccess: async (view) => {
      await queryClient.invalidateQueries({
        queryKey: savedViewKeys.list(view.resource, userId),
      })
    },
  })
}

export function useRemoveSavedView(userId: string, canShare: boolean) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: {
      id: string
      resource: SavedViewResource
    }) => savedViewService.remove(variables.id, userId, canShare),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: savedViewKeys.list(variables.resource, userId),
      })
    },
  })
}

export function useSetDefaultSavedView(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: {
      id: string
      resource: SavedViewResource
    }) => savedViewService.setDefault(variables.id, userId),
    onSuccess: (views, variables) => {
      queryClient.setQueryData(
        savedViewKeys.list(variables.resource, userId),
        views,
      )
    },
  })
}
