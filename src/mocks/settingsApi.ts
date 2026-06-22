import {
  settingsStoreSchema,
  themePreferenceSchema,
  type SettingsStore,
} from '../features/settings/schemas/settingsSchemas'
import { z } from 'zod'
import { browserStorage } from '../services/persistence/browserStorage'
import { createVersionedStore } from '../services/persistence/versionedStore'

const settingsStorageKey = 'enterprise-operations-settings'
const legacyUiStorageKey = 'enterprise-operations-ui'
const legacyUiSchema = z.object({
  state: z.object({ theme: themePreferenceSchema }).passthrough(),
}).passthrough()

const seedStore: SettingsStore = {
  changes: [
    {
      actorUserId: 'user-avery-morgan',
      createdAt: '2026-06-20T09:00:00.000Z',
      field: 'documents',
      from: 'pilot',
      id: 'settings-change-documents-enabled',
      scope: 'feature',
      summary: 'Enabled document management for the organization.',
      to: 'enabled',
    },
  ],
  features: [
    {
      key: 'analytics',
      state: 'enabled',
      updatedAt: '2026-06-20T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
    {
      key: 'collaboration',
      state: 'enabled',
      updatedAt: '2026-06-20T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
    {
      key: 'documents',
      state: 'enabled',
      updatedAt: '2026-06-20T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
  ],
  organization: {
    defaultTimezone: 'Europe/Brussels',
    fiscalYearStartMonth: 1,
    id: 'organization-northstar',
    name: 'Northstar Group',
    recordsRetentionDays: 2555,
    supportEmail: 'operations-support@northstar.example',
    updatedAt: '2026-06-20T09:00:00.000Z',
    updatedByUserId: 'user-avery-morgan',
    weekStartsOn: 'monday',
  },
  personal: [],
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function seedSettingsStore(): SettingsStore {
  const legacyUi = legacyUiSchema.safeParse(
    browserStorage.read(legacyUiStorageKey),
  )
  return legacyUi.success
    ? {
        ...seedStore,
        personal: [
          {
            dateFormat: 'day-month-year',
            density: 'comfortable',
            reducedMotion: false,
            theme: legacyUi.data.state.theme,
            timezone: seedStore.organization.defaultTimezone,
            updatedAt: new Date().toISOString(),
            userId: 'user-avery-morgan',
          },
        ],
      }
    : seedStore
}

const settingsStore = createVersionedStore({
  key: settingsStorageKey,
  obsoleteKeys: [legacyUiStorageKey],
  schema: settingsStoreSchema,
  seed: seedSettingsStore,
  version: 1,
})

export async function getSettingsStoreApi(): Promise<unknown> {
  await delay(180)
  return settingsStore.read()
}

export async function replaceSettingsStoreApi(
  store: SettingsStore,
): Promise<unknown> {
  await delay(320)
  return settingsStore.write(store)
}
