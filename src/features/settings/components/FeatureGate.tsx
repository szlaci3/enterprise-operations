import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { settingsSnapshotOptions } from '../queries/settingsQueries'
import type { FeatureKey } from '../schemas/settingsSchemas'
import { workspaceSnapshotOptions } from '../../tenancy/queries/tenancyQueries'
import { featureIsAvailable } from '../utils/featureAvailability'

export function FeatureGate({
  children,
  feature,
}: {
  children: ReactNode
  feature: FeatureKey
}) {
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const workspaceQuery = useQuery(workspaceSnapshotOptions())
  if (
    settingsQuery.isError ||
    workspaceQuery.isError ||
    !settingsQuery.data ||
    !workspaceQuery.data ||
    !featureIsAvailable(
      settingsQuery.data.features,
      feature,
      workspaceQuery.data.membership.role,
    )
  ) {
    return null
  }
  return children
}
