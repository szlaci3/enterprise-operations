import {
  useIsFetching,
  useIsMutating,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  Activity,
  CheckCircle2,
  Database,
  Download,
  RefreshCw,
  RotateCcw,
  Trash2,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  offlineSnapshotOptions,
  useSynchronizeOfflineQueue,
} from '../../offline/queries/offlineQueries'
import {
  diagnosticsSnapshotOptions,
  useClearRuntimeIncidents,
} from '../queries/diagnosticsQueries'
import type { DiagnosticsSnapshot } from '../schemas/diagnosticsSchemas'
import { PermissionGate } from '../../access/components/PermissionGate'

function formatBytes(bytes: number) {
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function downloadDiagnostics(
  snapshot: DiagnosticsSnapshot,
  querySummary: object,
) {
  const content = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      querySummary,
      runtime: {
        language: navigator.language,
        online: navigator.onLine,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
      },
      snapshot,
    },
    null,
    2,
  )
  const url = URL.createObjectURL(
    new Blob([content], { type: 'application/json' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `enterprise-operations-diagnostics-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function DiagnosticsWorkspace() {
  const queryClient = useQueryClient()
  const diagnosticsQuery = useQuery(diagnosticsSnapshotOptions())
  const offlineQuery = useQuery(offlineSnapshotOptions())
  const fetchingCount = useIsFetching()
  const mutatingCount = useIsMutating()
  const clearIncidents = useClearRuntimeIncidents()
  const synchronize = useSynchronizeOfflineQueue()
  const cachedQueries = queryClient.getQueryCache().getAll()
  const querySummary = {
    active: cachedQueries.filter((query) => query.getObserversCount() > 0)
      .length,
    cached: cachedQueries.length,
    errors: cachedQueries.filter((query) => query.state.status === 'error')
      .length,
    fetching: fetchingCount,
    mutating: mutatingCount,
    stale: cachedQueries.filter((query) => query.isStale()).length,
  }

  if (diagnosticsQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Running system diagnostics</span>
      </Card>
    )
  }

  if (diagnosticsQuery.isError || !diagnosticsQuery.data) {
    return (
      <Card className="p-8 text-center">
        <XCircle
          aria-hidden="true"
          className="mx-auto size-10 text-red-400"
        />
        <h1 className="mt-4 text-xl font-semibold">
          Diagnostics are unavailable
        </h1>
        <Button
          className="mt-5"
          onClick={() => diagnosticsQuery.refetch()}
          variant="secondary"
        >
          Retry diagnostics
        </Button>
      </Card>
    )
  }

  const snapshot = diagnosticsQuery.data
  const criticalCount = snapshot.checks.filter(
    (check) => check.status === 'critical',
  ).length
  const warningCount = snapshot.checks.filter(
    (check) => check.status === 'warning',
  ).length

  const clearCache = () => {
    if (
      !window.confirm(
        'Clear the in-memory query cache and reload? Persisted business data will not be removed.',
      )
    ) {
      return
    }
    queryClient.clear()
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={diagnosticsQuery.isFetching}
              onClick={() => diagnosticsQuery.refetch()}
              variant="secondary"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Run checks
            </Button>
            <Button
              onClick={() => downloadDiagnostics(snapshot, querySummary)}
              variant="secondary"
            >
              <Download aria-hidden="true" className="size-4" />
              Export diagnostics
            </Button>
          </div>
        }
        description="Inspect runtime stability, browser persistence, synchronization, and query health without exposing business payloads."
        eyebrow="Administration"
        title="System diagnostics"
      />

      <section className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Critical checks</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {criticalCount}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Warnings</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {warningCount}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Cached queries</p>
          <p className="mt-2 text-2xl font-semibold">{querySummary.cached}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Storage footprint</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatBytes(snapshot.storage.totalBytes)}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="flex items-center gap-2 font-semibold">
            <Activity aria-hidden="true" className="size-5" />
            Health checks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Generated {new Date(snapshot.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="grid gap-px bg-slate-200 dark:bg-slate-800 md:grid-cols-2">
          {snapshot.checks.map((check) => (
            <div className="bg-white p-5 dark:bg-slate-900" key={check.id}>
              <div className="flex items-start gap-3">
                {check.status === 'healthy' ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-emerald-500"
                  />
                ) : (
                  <TriangleAlert
                    aria-hidden="true"
                    className={`mt-0.5 size-5 shrink-0 ${
                      check.status === 'critical'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                  />
                )}
                <div>
                  <h3 className="font-semibold">{check.label}</h3>
                  <p className="mt-1 text-sm font-medium">{check.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {check.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold">Runtime incidents</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sanitized client failures retained locally, up to 100 records.
            </p>
          </div>
          {snapshot.incidents.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No runtime incidents recorded.
            </p>
          ) : (
            <div className="max-h-120 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {snapshot.incidents.map((incident) => (
                <article className="p-5" key={incident.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                      {incident.source}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(incident.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold">
                    {incident.name}: {incident.message}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Route: {incident.route}
                  </p>
                  {incident.stack ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-brand-700">
                        Technical stack
                      </summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-5 text-slate-200">
                        {incident.stack}
                      </pre>
                    </details>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Query runtime</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {Object.entries(querySummary).map(([label, value]) => (
                <div
                  className="flex items-center justify-between gap-3"
                  key={label}
                >
                  <dt className="capitalize text-slate-500">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Database aria-hidden="true" className="size-4" />
              Largest stores
            </h2>
            <div className="mt-4 space-y-3">
              {snapshot.storage.entries.slice(0, 8).map((entry) => (
                <div key={entry.key}>
                  <p className="truncate text-xs font-semibold">{entry.key}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatBytes(entry.bytes)} ·{' '}
                    {entry.format === 'versioned'
                      ? `schema v${entry.schemaVersion}`
                      : 'legacy format'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <PermissionGate permission="diagnostics.manage">
            <Card className="p-5">
              <h2 className="font-semibold">Recovery controls</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                These actions preserve persisted business records.
              </p>
              <div className="mt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => queryClient.invalidateQueries()}
                  variant="secondary"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Refresh all data
                </Button>
                <Button
                  className="w-full"
                  disabled={
                    synchronize.isPending ||
                    (offlineQuery.data?.operations.length ?? 0) === 0
                  }
                  onClick={() => synchronize.mutate()}
                  variant="secondary"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Retry queued changes
                </Button>
                <Button
                  className="w-full"
                  disabled={
                    clearIncidents.isPending ||
                    snapshot.incidents.length === 0
                  }
                  onClick={() => clearIncidents.mutate()}
                  variant="secondary"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Clear incident history
                </Button>
                <Button
                  className="w-full"
                  onClick={clearCache}
                  variant="danger"
                >
                  Clear cache and reload
                </Button>
              </div>
            </Card>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
