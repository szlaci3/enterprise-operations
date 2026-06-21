import { queryOptions } from '@tanstack/react-query'
import type { PermissionKey } from '../../access/schemas/accessSchemas'

export const commandKeys = {
  search: (query: string, permissionKeys: PermissionKey[]) =>
    ['commands', 'search', query, permissionKeys.join(',')] as const,
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
          filters: { entityTypes: [], status: '' },
          query,
        },
        permissionKeys,
      )
    },
    queryKey: commandKeys.search(query, permissionKeys),
    staleTime: 10_000,
  })
