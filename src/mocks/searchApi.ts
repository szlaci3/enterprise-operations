import {
  searchPreferencesListSchema,
  searchPreferencesSchema,
  type SearchPreferences,
} from '../features/search/schemas/searchSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const searchPreferencesKey = 'enterprise-operations-search-preferences'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function readPreferences(): SearchPreferences[] {
  const persisted = searchPreferencesListSchema.safeParse(
    browserStorage.read(searchPreferencesKey),
  )
  if (persisted.success) return persisted.data
  browserStorage.write(searchPreferencesKey, [])
  return []
}

function writePreferences(preferences: SearchPreferences[]) {
  browserStorage.write(searchPreferencesKey, preferences)
}

export async function getSearchPreferencesApi(
  userId: string,
): Promise<unknown> {
  await delay(120)
  const existing = readPreferences().find(
    (preference) => preference.userId === userId,
  )
  if (existing) return existing
  const preferences = searchPreferencesSchema.parse({
    recentQueries: [],
    savedSearches: [],
    userId,
  })
  writePreferences([...readPreferences(), preferences])
  return preferences
}

export async function updateSearchPreferencesApi(
  preferences: SearchPreferences,
): Promise<unknown> {
  await delay(220)
  writePreferences([
    ...readPreferences().filter((item) => item.userId !== preferences.userId),
    preferences,
  ])
  return preferences
}
