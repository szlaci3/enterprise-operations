import {
  offlineQueueSchema,
  type OfflineTaskTransition,
} from '../features/offline/schemas/offlineSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const offlineQueueStorageKey = 'enterprise-operations-offline-queue'

const offlineQueueStore = createVersionedStore({
  key: offlineQueueStorageKey,
  schema: offlineQueueSchema,
  seed: () => [],
  version: 1,
})

export async function getOfflineQueueApi(): Promise<unknown> {
  return offlineQueueStore.read()
}

export async function replaceOfflineQueueApi(
  queue: OfflineTaskTransition[],
): Promise<unknown> {
  return offlineQueueStore.write(queue)
}
