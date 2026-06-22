import type { ReactNode } from 'react'
import { AuthorizationBoundary } from '../../features/access/components/AuthorizationBoundary'
import { FeatureAvailabilityBoundary } from '../../features/settings/components/FeatureAvailabilityBoundary'
import { getPlatformModule, type PlatformModuleKey } from './platformRegistry'

export function PlatformModuleBoundary({
  children,
  module,
  permission,
}: {
  children?: ReactNode
  module: PlatformModuleKey
  permission?: 'create' | 'view'
}) {
  const definition = getPlatformModule(module)
  const requiredPermission =
    permission === 'create'
      ? definition.create?.permission
      : definition.viewPermission

  const content = definition.feature ? (
    <FeatureAvailabilityBoundary feature={definition.feature}>
      {children}
    </FeatureAvailabilityBoundary>
  ) : (
    children
  )

  return requiredPermission ? (
    <AuthorizationBoundary permission={requiredPermission}>
      {content}
    </AuthorizationBoundary>
  ) : (
    content
  )
}
