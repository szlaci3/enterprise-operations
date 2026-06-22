import {
  featureConfigurationSchema,
  legacyFeatureConfigurationSchema,
  settingsStoreSchema,
  themePreferenceSchema,
  type SettingsStore,
} from '../features/settings/schemas/settingsSchemas'
import { z } from 'zod'
import { browserStorage } from '../services/persistence/browserStorage'
import { createVersionedStore } from '../services/persistence/versionedStore'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

const settingsStorageKey = 'enterprise-operations-settings'
const legacyUiStorageKey = 'enterprise-operations-ui'
const legacyUiSchema = z.object({
  state: z.object({ theme: themePreferenceSchema }).passthrough(),
}).passthrough()

const northstarSeedStore: SettingsStore = {
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
      audience: 'all-members',
      key: 'analytics',
      prerequisiteKeys: [],
      state: 'enabled',
      updatedAt: '2026-06-20T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
    {
      audience: 'all-members',
      key: 'collaboration',
      prerequisiteKeys: [],
      state: 'enabled',
      updatedAt: '2026-06-20T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
    {
      audience: 'all-members',
      key: 'documents',
      prerequisiteKeys: ['collaboration'],
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

const atlasSeedStore: SettingsStore = {
  changes: [],
  features: [
    {
      audience: 'administrators',
      key: 'analytics',
      prerequisiteKeys: [],
      state: 'pilot',
      updatedAt: '2026-06-22T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
    {
      audience: 'all-members',
      key: 'collaboration',
      prerequisiteKeys: [],
      state: 'enabled',
      updatedAt: '2026-06-22T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
    {
      audience: 'administrators',
      key: 'documents',
      prerequisiteKeys: ['collaboration'],
      state: 'disabled',
      updatedAt: '2026-06-22T09:00:00.000Z',
      updatedByUserId: 'user-avery-morgan',
    },
  ],
  organization: {
    defaultTimezone: 'America/Chicago',
    fiscalYearStartMonth: 7,
    id: 'organization-atlas',
    name: 'Atlas Services',
    recordsRetentionDays: 1825,
    supportEmail: 'operations-support@atlas.example',
    updatedAt: '2026-06-22T09:00:00.000Z',
    updatedByUserId: 'user-avery-morgan',
    weekStartsOn: 'monday',
  },
  personal: [],
}

const settingsStoreV1Schema = settingsStoreSchema.extend({
  features: z.array(legacyFeatureConfigurationSchema),
})

function migrateSettingsStore(data: unknown): SettingsStore | undefined {
  const legacy = settingsStoreV1Schema.safeParse(data)
  if (!legacy.success) return undefined
  return settingsStoreSchema.parse({
    ...legacy.data,
    features: legacy.data.features.map((feature) =>
      featureConfigurationSchema.parse({
        ...feature,
        audience: 'all-members',
        prerequisiteKeys:
          feature.key === 'documents' ? ['collaboration'] : [],
      }),
    ),
  })
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function seedSettingsStore(): SettingsStore {
  const legacyUi = legacyUiSchema.safeParse(
    browserStorage.read(legacyUiStorageKey),
  )
  const seedStore =
    getActiveTenantId() === 'atlas' ? atlasSeedStore : northstarSeedStore
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
  migrateLegacy: migrateSettingsStore,
  migrations: {
    1: (data) => migrateSettingsStore(data) ?? data,
  },
  obsoleteKeys: [legacyUiStorageKey],
  schema: settingsStoreSchema,
  seed: seedSettingsStore,
  version: 2,
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
