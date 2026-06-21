import {
  getSettingsStoreApi,
  replaceSettingsStoreApi,
} from '../../../mocks/settingsApi'
import { userService } from '../../users/services/userService'
import {
  featureKeySchema,
  featureStateSchema,
  organizationSettingsFormSchema,
  personalSettingsFormSchema,
  settingsSnapshotSchema,
  settingsStoreSchema,
  type FeatureKey,
  type FeatureState,
  type OrganizationSettingsFormValues,
  type PersonalSettings,
  type PersonalSettingsFormValues,
  type SettingsChange,
  type SettingsSnapshot,
  type SettingsStore,
} from '../schemas/settingsSchemas'

export class SettingsServiceError extends Error {
  readonly code: 'invalid-actor' | 'invalid-configuration'

  constructor(message: string, code: SettingsServiceError['code']) {
    super(message)
    this.name = 'SettingsServiceError'
    this.code = code
  }
}

const defaultPersonalSettings = (
  userId: string,
  timezone: string,
): PersonalSettings => ({
  dateFormat: 'day-month-year',
  density: 'comfortable',
  reducedMotion: false,
  theme: 'system',
  timezone,
  updatedAt: '2026-06-20T09:00:00.000Z',
  userId,
})

async function getStore(): Promise<SettingsStore> {
  return settingsStoreSchema.parse(await getSettingsStoreApi())
}

async function assertActiveActor(userId: string) {
  const actor = await userService.get(userId)
  if (!actor || actor.status !== 'active') {
    throw new SettingsServiceError(
      'Only active managed users can change platform settings.',
      'invalid-actor',
    )
  }
}

function changeRecords(
  actorUserId: string,
  scope: SettingsChange['scope'],
  changes: { field: string; from: string; to: string }[],
): SettingsChange[] {
  const createdAt = new Date().toISOString()
  return changes.map((change) => ({
    actorUserId,
    createdAt,
    field: change.field,
    from: change.from,
    id: crypto.randomUUID(),
    scope,
    summary: `Changed ${change.field} from ${change.from} to ${change.to}.`,
    to: change.to,
  }))
}

function snapshot(store: SettingsStore, userId: string): SettingsSnapshot {
  return settingsSnapshotSchema.parse({
    changes: [...store.changes].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
    features: store.features,
    organization: store.organization,
    personal:
      store.personal.find((settings) => settings.userId === userId) ??
      defaultPersonalSettings(userId, store.organization.defaultTimezone),
  })
}

export const settingsService = {
  async getSnapshot(userId: string): Promise<SettingsSnapshot> {
    return snapshot(await getStore(), userId)
  },

  async updateFeature(
    actorUserId: string,
    key: FeatureKey,
    state: FeatureState,
  ): Promise<SettingsSnapshot> {
    const parsedKey = featureKeySchema.parse(key)
    const parsedState = featureStateSchema.parse(state)
    await assertActiveActor(actorUserId)
    const store = await getStore()
    const current = store.features.find((feature) => feature.key === parsedKey)
    if (!current) {
      throw new SettingsServiceError(
        'The feature configuration is unavailable.',
        'invalid-configuration',
      )
    }
    if (current.state === parsedState) return snapshot(store, actorUserId)
    const now = new Date().toISOString()
    const updated = settingsStoreSchema.parse({
      ...store,
      changes: [
        ...store.changes,
        ...changeRecords(actorUserId, 'feature', [
          { field: parsedKey, from: current.state, to: parsedState },
        ]),
      ],
      features: store.features.map((feature) =>
        feature.key === parsedKey
          ? {
              ...feature,
              state: parsedState,
              updatedAt: now,
              updatedByUserId: actorUserId,
            }
          : feature,
      ),
    })
    return snapshot(
      settingsStoreSchema.parse(await replaceSettingsStoreApi(updated)),
      actorUserId,
    )
  },

  async updateOrganization(
    actorUserId: string,
    values: OrganizationSettingsFormValues,
  ): Promise<SettingsSnapshot> {
    const parsed = organizationSettingsFormSchema.parse(values)
    await assertActiveActor(actorUserId)
    const store = await getStore()
    const entries = Object.entries(parsed) as [
      keyof OrganizationSettingsFormValues,
      OrganizationSettingsFormValues[keyof OrganizationSettingsFormValues],
    ][]
    const changes = entries
      .filter(([field, value]) => store.organization[field] !== value)
      .map(([field, value]) => ({
        field,
        from: String(store.organization[field]),
        to: String(value),
      }))
    if (changes.length === 0) return snapshot(store, actorUserId)
    const updated = settingsStoreSchema.parse({
      ...store,
      changes: [
        ...store.changes,
        ...changeRecords(actorUserId, 'organization', changes),
      ],
      organization: {
        ...store.organization,
        ...parsed,
        updatedAt: new Date().toISOString(),
        updatedByUserId: actorUserId,
      },
    })
    return snapshot(
      settingsStoreSchema.parse(await replaceSettingsStoreApi(updated)),
      actorUserId,
    )
  },

  async updatePersonal(
    userId: string,
    values: PersonalSettingsFormValues,
  ): Promise<SettingsSnapshot> {
    const parsed = personalSettingsFormSchema.parse(values)
    await assertActiveActor(userId)
    const store = await getStore()
    const personal: PersonalSettings = {
      ...parsed,
      updatedAt: new Date().toISOString(),
      userId,
    }
    const updated = settingsStoreSchema.parse({
      ...store,
      personal: [
        ...store.personal.filter((settings) => settings.userId !== userId),
        personal,
      ],
    })
    return snapshot(
      settingsStoreSchema.parse(await replaceSettingsStoreApi(updated)),
      userId,
    )
  },
}
