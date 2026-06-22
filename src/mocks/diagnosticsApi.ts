import {
  runtimeIncidentsSchema,
  type RuntimeIncident,
} from '../features/diagnostics/schemas/diagnosticsSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const incidentsStorageKey = 'enterprise-operations-runtime-incidents'

const runtimeIncidentsStore = createVersionedStore({
  key: incidentsStorageKey,
  schema: runtimeIncidentsSchema,
  seed: () => [],
  version: 1,
})

export async function listRuntimeIncidentsApi(): Promise<unknown> {
  return runtimeIncidentsStore.read()
}

export async function appendRuntimeIncidentApi(
  incident: RuntimeIncident,
): Promise<unknown> {
  const incidents = [...runtimeIncidentsStore.read(), incident].slice(-100)
  runtimeIncidentsStore.write(incidents)
  return incident
}

export async function clearRuntimeIncidentsApi(): Promise<void> {
  runtimeIncidentsStore.remove()
}
