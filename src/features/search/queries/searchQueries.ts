import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { PermissionKey } from '../../access/schemas/accessSchemas'
import type { SearchRequest } from '../schemas/searchSchemas'
import { searchService } from '../services/searchService'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const searchKeys = {
  get all() {
    return tenantQueryKey('search')
  },
  preferences: (userId: string) =>
    [...searchKeys.all, 'preferences', userId] as const,
  results: (request: SearchRequest, permissionKeys: PermissionKey[]) =>
    [
      ...searchKeys.all,
      'results',
      request.query,
      request.filters.status,
      request.filters.entityTypes.join(','),
      permissionKeys.join(','),
    ] as const,
}

export const searchResultsOptions = (
  request: SearchRequest,
  permissionKeys: PermissionKey[],
) =>
  queryOptions({
    queryFn: () => searchService.search(request, permissionKeys),
    queryKey: searchKeys.results(request, permissionKeys),
    staleTime: 10_000,
  })

export const searchPreferencesOptions = (userId: string) =>
  queryOptions({
    queryFn: () => searchService.getPreferences(userId),
    queryKey: searchKeys.preferences(userId),
  })

export function useRecordRecentSearch(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (query: string) => searchService.recordRecent(userId, query),
    onSuccess: (preferences) => {
      queryClient.setQueryData(searchKeys.preferences(userId), preferences)
    },
  })
}

export function useSaveSearch(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      name,
      request,
    }: {
      name: string
      request: SearchRequest
    }) => searchService.save(userId, name, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: searchKeys.preferences(userId),
      })
    },
  })
}

export function useRemoveSavedSearch(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (savedSearchId: string) =>
      searchService.removeSaved(userId, savedSearchId),
    onSuccess: (preferences) => {
      queryClient.setQueryData(searchKeys.preferences(userId), preferences)
    },
  })
}
