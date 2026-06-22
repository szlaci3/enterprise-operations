import {
  auditStoreSchema,
  type AuditStore,
} from '../features/audit/schemas/auditSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const auditStoreKey = 'enterprise-operations-audit-store'

const emptyStore: AuditStore = {
  processedEventKeys: [],
  records: [],
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const auditStore = createVersionedStore({
  key: auditStoreKey,
  schema: auditStoreSchema,
  seed: () => emptyStore,
  version: 1,
})

export async function getAuditStoreApi(): Promise<unknown> {
  await delay(180)
  return auditStore.read()
}

export async function replaceAuditStoreApi(
  store: AuditStore,
): Promise<unknown> {
  await delay(280)
  return auditStore.write(store)
}
