import {
  savedViewsSchema,
  type SavedView,
} from '../features/views/schemas/savedViewSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const store = createVersionedStore({
  key: 'enterprise-operations-saved-views',
  schema: savedViewsSchema,
  seed: () => [],
  version: 1,
})

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function listSavedViewsApi(): Promise<unknown> {
  await delay(120)
  return store.read()
}

export async function replaceSavedViewsApi(
  views: SavedView[],
): Promise<unknown> {
  await delay(220)
  return store.write(views)
}
