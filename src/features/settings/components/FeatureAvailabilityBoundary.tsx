import { useQuery } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { settingsSnapshotOptions } from '../queries/settingsQueries'
import type { FeatureKey } from '../schemas/settingsSchemas'
import { workspaceSnapshotOptions } from '../../tenancy/queries/tenancyQueries'
import { featureIsAvailable } from '../utils/featureAvailability'

export function FeatureAvailabilityBoundary({
  children,
  feature,
}: {
  children?: ReactNode
  feature: FeatureKey
}) {
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const workspaceQuery = useQuery(workspaceSnapshotOptions())

  if (settingsQuery.isPending || workspaceQuery.isPending) {
    return (
      <Card className="h-72 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Checking feature availability</span>
      </Card>
    )
  }

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
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
          <Wrench aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Feature unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          This capability is currently disabled by organization policy.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/overview"
        >
          Return to overview
        </Link>
      </Card>
    )
  }

  return children ?? <Outlet />
}
