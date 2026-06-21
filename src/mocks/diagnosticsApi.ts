import {
  runtimeIncidentsSchema,
  type RuntimeIncident,
} from '../features/diagnostics/schemas/diagnosticsSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const incidentsStorageKey = 'enterprise-operations-runtime-incidents'

function readIncidents(): RuntimeIncident[] {
  const persisted = runtimeIncidentsSchema.safeParse(
    browserStorage.read(incidentsStorageKey),
  )
  return persisted.success ? persisted.data : []
}

export async function listRuntimeIncidentsApi(): Promise<unknown> {
  return readIncidents()
}

export async function appendRuntimeIncidentApi(
  incident: RuntimeIncident,
): Promise<unknown> {
  const incidents = [...readIncidents(), incident].slice(-100)
  browserStorage.write(incidentsStorageKey, incidents)
  return incident
}

export async function clearRuntimeIncidentsApi(): Promise<void> {
  browserStorage.remove(incidentsStorageKey)
}
