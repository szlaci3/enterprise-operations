import { useQuery } from '@tanstack/react-query'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { effectiveAccessOptions } from '../queries/accessQueries'
import type { PermissionKey } from '../schemas/accessSchemas'

export function useAuthorization() {
  const accessQuery = useQuery(effectiveAccessOptions(currentSessionUserId))

  return {
    accessQuery,
    can: (permission: PermissionKey) =>
      accessQuery.data?.permissionKeys.includes(permission) ?? false,
  }
}
