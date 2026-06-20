import {
  auditStoreSchema,
  type AuditStore,
} from '../features/audit/schemas/auditSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const auditStoreKey = 'enterprise-operations-audit-store'

const emptyStore: AuditStore = {
  processedEventKeys: [],
  records: [],
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function readStore(): AuditStore {
  const persisted = auditStoreSchema.safeParse(
    browserStorage.read(auditStoreKey),
  )
  if (persisted.success) {
    return persisted.data
  }
  browserStorage.write(auditStoreKey, emptyStore)
  return emptyStore
}

export async function getAuditStoreApi(): Promise<unknown> {
  await delay(180)
  return readStore()
}

export async function replaceAuditStoreApi(
  store: AuditStore,
): Promise<unknown> {
  await delay(280)
  browserStorage.write(auditStoreKey, store)
  return store
}
