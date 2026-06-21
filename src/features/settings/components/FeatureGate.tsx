import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { settingsSnapshotOptions } from '../queries/settingsQueries'
import type { FeatureKey } from '../schemas/settingsSchemas'

export function FeatureGate({
  children,
  feature,
}: {
  children: ReactNode
  feature: FeatureKey
}) {
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const configuration = settingsQuery.data?.features.find(
    (item) => item.key === feature,
  )
  if (settingsQuery.isError || configuration?.state === 'disabled') return null
  return children
}
