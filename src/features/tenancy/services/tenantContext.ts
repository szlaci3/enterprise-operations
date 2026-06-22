import { tenantIdSchema, type TenantId } from '../schemas/tenancySchemas'

const activeTenantStorageKey = 'enterprise-operations-active-tenant'
const defaultTenantId: TenantId = 'northstar'
let memoryTenantId: TenantId = defaultTenantId

function parseStoredTenant(value: string | null): TenantId | null {
  if (value === null) return null
  const legacy = tenantIdSchema.safeParse(value)
  if (legacy.success) return legacy.data
  try {
    const envelope = JSON.parse(value) as {
      data?: unknown
      schemaVersion?: unknown
    }
    const parsed = tenantIdSchema.safeParse(envelope.data)
    return envelope.schemaVersion === 1 && parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function getActiveTenantId(): TenantId {
  try {
    const raw = window.localStorage.getItem(activeTenantStorageKey)
    const stored = parseStoredTenant(raw)
    if (stored) {
      memoryTenantId = stored
      if (raw === stored) setActiveTenantId(stored)
    }
  } catch {
    // Restricted browser contexts retain the in-memory workspace.
  }
  return memoryTenantId
}

export function setActiveTenantId(tenantId: TenantId) {
  memoryTenantId = tenantIdSchema.parse(tenantId)
  try {
    window.localStorage.setItem(
      activeTenantStorageKey,
      JSON.stringify({
        data: memoryTenantId,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
      }),
    )
  } catch {
    // Restricted browser contexts retain the in-memory workspace.
  }
}

export function tenantStorageKey(key: string, tenantId = getActiveTenantId()) {
  const suffix = key.startsWith('enterprise-operations-')
    ? key.slice('enterprise-operations-'.length)
    : key
  return `enterprise-operations-tenant-${tenantId}-${suffix}`
}
