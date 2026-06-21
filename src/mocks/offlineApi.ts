import {
  offlineQueueSchema,
  type OfflineTaskTransition,
} from '../features/offline/schemas/offlineSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const offlineQueueStorageKey = 'enterprise-operations-offline-queue'

function readQueue(): OfflineTaskTransition[] {
  const persisted = offlineQueueSchema.safeParse(
    browserStorage.read(offlineQueueStorageKey),
  )
  return persisted.success ? persisted.data : []
}

export async function getOfflineQueueApi(): Promise<unknown> {
  return readQueue()
}

export async function replaceOfflineQueueApi(
  queue: OfflineTaskTransition[],
): Promise<unknown> {
  browserStorage.write(offlineQueueStorageKey, queue)
  return queue
}
