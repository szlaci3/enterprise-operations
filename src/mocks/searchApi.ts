import {
  searchPreferencesListSchema,
  searchPreferencesSchema,
  type SearchPreferences,
} from '../features/search/schemas/searchSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const searchPreferencesKey = 'enterprise-operations-search-preferences'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const searchPreferencesStore = createVersionedStore({
  key: searchPreferencesKey,
  schema: searchPreferencesListSchema,
  seed: () => [],
  version: 1,
})

function writePreferences(preferences: SearchPreferences[]) {
  searchPreferencesStore.write(preferences)
}

export async function getSearchPreferencesApi(
  userId: string,
): Promise<unknown> {
  await delay(120)
  const existing = searchPreferencesStore.read().find(
    (preference) => preference.userId === userId,
  )
  if (existing) return existing
  const preferences = searchPreferencesSchema.parse({
    recentQueries: [],
    savedSearches: [],
    userId,
  })
  writePreferences([...searchPreferencesStore.read(), preferences])
  return preferences
}

export async function updateSearchPreferencesApi(
  preferences: SearchPreferences,
): Promise<unknown> {
  await delay(220)
  writePreferences([
    ...searchPreferencesStore
      .read()
      .filter((item) => item.userId !== preferences.userId),
    preferences,
  ])
  return preferences
}
