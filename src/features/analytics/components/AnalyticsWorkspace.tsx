import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { analyticsSnapshotOptions } from '../queries/analyticsQueries'
import {
  analyticsPeriodSchema,
  type AnalyticsFilters,
} from '../schemas/analyticsSchemas'
import { AnalyticsDistribution } from './AnalyticsDistribution'
import { AnalyticsMetricGrid } from './AnalyticsMetricGrid'
import { AnalyticsTrendChart } from './AnalyticsTrendChart'

export function AnalyticsWorkspace() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    departmentId: '',
    period: '90d',
  })
  const snapshotQuery = useQuery(analyticsSnapshotOptions(filters))
  const departmentsQuery = useQuery(departmentListOptions())

  if (snapshotQuery.isPending || departmentsQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="h-20 max-w-2xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card
              className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800"
              key={index}
            >
              <span className="sr-only">Loading analytics metric</span>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (snapshotQuery.isError || departmentsQuery.isError) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <AlertTriangle
          aria-hidden="true"
          className="mx-auto size-10 text-red-500"
        />
        <h1 className="mt-4 text-xl font-semibold">Analytics unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">
          Current operational data could not be aggregated.
        </p>
        <Button
          className="mt-5"
          onClick={() => {
            snapshotQuery.refetch()
            departmentsQuery.refetch()
          }}
          variant="secondary"
        >
          Retry
        </Button>
      </Card>
    )
  }

  const snapshot = snapshotQuery.data

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Analytics department segment"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  departmentId: event.target.value,
                }))
              }
              value={filters.departmentId}
            >
              <option value="">All departments</option>
              {(departmentsQuery.data ?? []).map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Analytics reporting period"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  period: analyticsPeriodSchema.parse(event.target.value),
                }))
              }
              value={filters.period}
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="180d">Last 180 days</option>
            </select>
            <button
              aria-label="Refresh analytics"
              className="rounded-md p-2"
              disabled={snapshotQuery.isFetching}
              onClick={() => snapshotQuery.refetch()}
              type="button"
            >
              <RefreshCw
                aria-hidden="true"
                className={`size-4 ${snapshotQuery.isFetching ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        }
        description="Analyze work delivery, approval responsiveness, operational risk, and workload concentration across the enterprise."
        eyebrow="Executive intelligence"
        title="Operational analytics"
      />

      <AnalyticsMetricGrid metrics={snapshot.metrics} />
      <AnalyticsTrendChart points={snapshot.trend} />

      <div className="grid gap-4 xl:grid-cols-3">
        <AnalyticsDistribution
          description="Current tasks grouped by lifecycle state."
          items={snapshot.taskStatusDistribution}
          title="Task lifecycle"
        />
        <AnalyticsDistribution
          description="Governance requests grouped by final outcome."
          items={snapshot.approvalOutcomes}
          title="Approval outcomes"
        />
        <AnalyticsDistribution
          description="Open operational work across accountable departments."
          items={snapshot.departmentWorkload}
          title="Department workload"
        />
      </div>

      <p className="text-right text-xs text-slate-400">
        Analytics generated {new Date(snapshot.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}
