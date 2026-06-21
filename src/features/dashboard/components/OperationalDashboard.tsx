import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../../../shared/components/Badge'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  dashboardSnapshotOptions,
  useAcknowledgeDashboardAlert,
} from '../queries/dashboardQueries'
import {
  dashboardPeriodSchema,
  type DashboardPeriod,
} from '../schemas/dashboardSchemas'
import { ActivityPanel } from './ActivityPanel'
import { AlertsPanel } from './AlertsPanel'
import { KpiGrid } from './KpiGrid'
import { ServiceHealthTable } from './ServiceHealthTable'
import { WorkloadChart } from './WorkloadChart'

const periodOptions: { label: string; value: DashboardPeriod }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
]

function DashboardLoading() {
  return (
    <div aria-label="Loading operational dashboard" className="space-y-6">
      <div className="h-19 max-w-xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card className="h-43 animate-pulse bg-slate-100 dark:bg-slate-800" key={index}>
            <span className="sr-only">Loading KPI</span>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading workload chart</span>
        </Card>
        <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading alerts</span>
        </Card>
      </div>
    </div>
  )
}

export function OperationalDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d')
  const snapshotQuery = useQuery(dashboardSnapshotOptions(period))
  const acknowledgeAlert = useAcknowledgeDashboardAlert()

  if (snapshotQuery.isPending) {
    return <DashboardLoading />
  }

  if (snapshotQuery.isError) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
          Dashboard data is unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          The operational snapshot could not be validated or retrieved. Try
          loading the latest data again.
        </p>
        <button
          aria-label="Refresh dashboard"
          className="rounded-md p-2"
          disabled={snapshotQuery.isFetching}
          onClick={() => snapshotQuery.refetch()}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Retry
        </button>
      </Card>
    )
  }

  const snapshot = snapshotQuery.data
  const activeAlerts = snapshot.alerts.filter(
    (alert) => !alert.acknowledged,
  ).length
  const healthyServices = snapshot.services.filter(
    (service) => service.status === 'healthy',
  ).length
  const criticalServices = snapshot.services.filter(
    (service) => service.status === 'critical',
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="dashboard-period">
              Dashboard reporting period
            </label>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-brand-950"
              id="dashboard-period"
              onChange={(event) =>
                setPeriod(dashboardPeriodSchema.parse(event.target.value))
              }
              value={period}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              aria-label="Refresh dashboard"
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
        description="Monitor service delivery, workload movement, operating risk, and the actions shaping today's performance."
        eyebrow="Northstar Group · Operations command center"
        title="Operational overview"
      />

      <Card className="flex flex-col gap-4 border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900 dark:bg-brand-950/30 lg:flex-row lg:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
          {criticalServices > 0 ? (
            <ShieldAlert aria-hidden="true" className="size-5" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="size-5" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            {criticalServices > 0
              ? 'Performance is stable with one service requiring intervention.'
              : 'All operating services are within expected thresholds.'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {healthyServices} of {snapshot.services.length} services are healthy,
            with {activeAlerts} active alert{activeAlerts === 1 ? '' : 's'} across
            the organization.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">{healthyServices} healthy</Badge>
          <Badge tone={criticalServices > 0 ? 'red' : 'slate'}>
            {criticalServices} critical
          </Badge>
        </div>
      </Card>

      <KpiGrid kpis={snapshot.kpis} />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
        <WorkloadChart workload={snapshot.workload} />
        <AlertsPanel
          alerts={snapshot.alerts}
          generatedAt={snapshot.generatedAt}
          isAcknowledging={acknowledgeAlert.isPending}
          onAcknowledge={(alertId) => acknowledgeAlert.mutate(alertId)}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
        <ServiceHealthTable services={snapshot.services} />
        <ActivityPanel
          activities={snapshot.activities}
          generatedAt={snapshot.generatedAt}
        />
      </div>

      <p className="text-right text-xs text-slate-400">
        Snapshot generated{' '}
        {new Date(snapshot.generatedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  )
}
