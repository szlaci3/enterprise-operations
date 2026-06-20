import type { ReactNode } from 'react'
import type { PermissionKey } from '../schemas/accessSchemas'
import { useAuthorization } from '../hooks/useAuthorization'

export function PermissionGate({
  children,
  fallback = null,
  permission,
}: {
  children: ReactNode
  fallback?: ReactNode
  permission: PermissionKey
}) {
  const { accessQuery, can } = useAuthorization()
  if (accessQuery.isPending || accessQuery.isError || !can(permission)) {
    return fallback
  }
  return children
}
