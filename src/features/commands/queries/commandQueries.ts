import { queryOptions } from '@tanstack/react-query'
import type { PermissionKey } from '../../access/schemas/accessSchemas'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const commandKeys = {
  search: (query: string, permissionKeys: PermissionKey[]) =>
    tenantQueryKey('commands', 'search', query, permissionKeys.join(',')),
}

export const commandSearchOptions = (
  query: string,
  permissionKeys: PermissionKey[],
) =>
  queryOptions({
    queryFn: async () => {
      const { searchService } = await import(
        '../../search/services/searchService'
      )
      return searchService.search(
        {
          filters: {
            entityTypes: [],
            status: '',
            updatedWithin: 'all',
          },
          query,
          sort: 'relevance',
        },
        permissionKeys,
      )
    },
    queryKey: commandKeys.search(query, permissionKeys),
    staleTime: 10_000,
  })
