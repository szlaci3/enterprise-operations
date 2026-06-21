import {
  appendRuntimeIncidentApi,
  clearRuntimeIncidentsApi,
  listRuntimeIncidentsApi,
} from '../../../mocks/diagnosticsApi'
import { browserStorage } from '../../../services/persistence/browserStorage'
import { offlineService } from '../../offline/services/offlineService'
import {
  diagnosticsSnapshotSchema,
  runtimeIncidentSchema,
  runtimeIncidentsSchema,
  type DiagnosticsSnapshot,
  type RuntimeIncident,
  type RuntimeIncidentSource,
} from '../schemas/diagnosticsSchemas'

function sanitizeStack(stack: string | undefined) {
  if (!stack) return null
  return stack.split('\n').slice(0, 12).join('\n').slice(0, 4000)
}

async function listIncidents(): Promise<RuntimeIncident[]> {
  return runtimeIncidentsSchema.parse(await listRuntimeIncidentsApi())
}

export const diagnosticsService = {
  async clearIncidents(): Promise<void> {
    await clearRuntimeIncidentsApi()
  },

  async getSnapshot(): Promise<DiagnosticsSnapshot> {
    const [incidents, offline] = await Promise.all([
      listIncidents(),
      offlineService.getSnapshot(),
    ])
    const storage = browserStorage.diagnose()
    const recentIncidents = incidents.filter(
      (incident) =>
        Date.now() - new Date(incident.createdAt).getTime() < 24 * 60 * 60_000,
    )
    const storageMegabytes = storage.totalBytes / 1024 / 1024
    return diagnosticsSnapshotSchema.parse({
      checks: [
        {
          description:
            'Validated browser persistence stores platform data and queued work.',
          id: 'storage',
          label: 'Browser persistence',
          status: storage.available ? 'healthy' : 'warning',
          value: storage.available
            ? `${storage.entries.length} stores · ${storageMegabytes.toFixed(2)} MB`
            : 'Using in-memory fallback',
        },
        {
          description:
            'Queued operational changes awaiting synchronization or resolution.',
          id: 'offline-queue',
          label: 'Synchronization queue',
          status:
            offline.conflictCount > 0
              ? 'critical'
              : offline.failedCount > 0 || offline.pendingCount > 0
                ? 'warning'
                : 'healthy',
          value: `${offline.pendingCount} pending · ${offline.failedCount} retry · ${offline.conflictCount} conflict`,
        },
        {
          description:
            'Captured render, route, and unhandled runtime failures in the last 24 hours.',
          id: 'runtime',
          label: 'Runtime stability',
          status:
            recentIncidents.length > 5
              ? 'critical'
              : recentIncidents.length > 0
                ? 'warning'
                : 'healthy',
          value: `${recentIncidents.length} recent incident${recentIncidents.length === 1 ? '' : 's'}`,
        },
        {
          description:
            'Browser-reported connectivity used by the offline synchronization layer.',
          id: 'connectivity',
          label: 'Browser connectivity',
          status: navigator.onLine ? 'healthy' : 'warning',
          value: navigator.onLine ? 'Online' : 'Offline',
        },
      ],
      generatedAt: new Date().toISOString(),
      incidents: [...incidents].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
      storage,
    })
  },

  listIncidents,

  async recordIncident({
    error,
    route = window.location.pathname,
    source,
  }: {
    error: unknown
    route?: string
    source: RuntimeIncidentSource
  }): Promise<RuntimeIncident> {
    const normalized =
      error instanceof Error ? error : new Error(String(error))
    const incident = runtimeIncidentSchema.parse({
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      message: normalized.message.slice(0, 1000),
      name: normalized.name.slice(0, 120),
      route: route.slice(0, 500),
      source,
      stack: sanitizeStack(normalized.stack),
    })
    return runtimeIncidentSchema.parse(
      await appendRuntimeIncidentApi(incident),
    )
  },
}
