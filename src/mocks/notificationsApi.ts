import { z } from 'zod'
import {
  notificationPreferencesListSchema,
  notificationPreferencesSchema,
  notificationStoreSchema,
  type NotificationPreferences,
  type NotificationStore,
} from '../features/notifications/schemas/notificationSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const notificationStoreKey = 'enterprise-operations-notification-store'
const notificationPreferencesKey =
  'enterprise-operations-notification-preferences'

const emptyStore: NotificationStore = {
  notifications: [],
  processedEventKeys: [],
}

const defaultSubscriptions: NotificationPreferences['subscriptions'] = {
  'approval-assigned': true,
  'approval-decision': true,
  'approval-delegated': true,
  'approval-escalated': true,
  'collaboration-mention': true,
  'task-assigned': true,
  'task-status': true,
}

const migratablePreferencesSchema = z.array(
  z.object({
    emailDigest: z.enum(['off', 'daily', 'weekly']),
    inAppEnabled: z.boolean(),
    subscriptions: z.object({
      'approval-assigned': z.boolean(),
      'approval-decision': z.boolean(),
      'approval-delegated': z.boolean(),
      'approval-escalated': z.boolean(),
      'collaboration-mention': z.boolean().optional(),
      'task-assigned': z.boolean(),
      'task-status': z.boolean(),
    }),
    updatedAt: z.string().datetime(),
    userId: z.string(),
  }),
)

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const notificationStore = createVersionedStore({
  key: notificationStoreKey,
  schema: notificationStoreSchema,
  seed: () => emptyStore,
  version: 1,
})

function writeStore(store: NotificationStore) {
  notificationStore.write(store)
}

const notificationPreferencesStore = createVersionedStore({
  key: notificationPreferencesKey,
  migrateLegacy: (stored) => {
    const migratable = migratablePreferencesSchema.safeParse(stored)
    if (!migratable.success) return undefined
    return notificationPreferencesListSchema.parse(
      migratable.data.map((preference) => ({
        ...preference,
        subscriptions: {
          ...defaultSubscriptions,
          ...preference.subscriptions,
        },
      })),
    )
  },
  schema: notificationPreferencesListSchema,
  seed: () => [],
  version: 1,
})

function writePreferences(preferences: NotificationPreferences[]) {
  notificationPreferencesStore.write(preferences)
}

export async function getNotificationStoreApi(): Promise<unknown> {
  await delay(180)
  return notificationStore.read()
}

export async function replaceNotificationStoreApi(
  store: NotificationStore,
): Promise<unknown> {
  await delay(260)
  writeStore(store)
  return store
}

export async function listNotificationPreferencesApi(): Promise<unknown> {
  await delay(140)
  return notificationPreferencesStore.read()
}

export async function getNotificationPreferencesApi(
  userId: string,
): Promise<unknown> {
  await delay(140)
  const existing = notificationPreferencesStore.read().find(
    (preference) => preference.userId === userId,
  )
  if (existing) {
    return existing
  }
  const preferences = notificationPreferencesSchema.parse({
    emailDigest: 'daily',
    inAppEnabled: true,
    subscriptions: defaultSubscriptions,
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId,
  })
  writePreferences([...notificationPreferencesStore.read(), preferences])
  return preferences
}

export async function updateNotificationPreferencesApi(
  preferences: NotificationPreferences,
): Promise<unknown> {
  await delay(260)
  const current = notificationPreferencesStore.read()
  writePreferences([
    ...current.filter((item) => item.userId !== preferences.userId),
    preferences,
  ])
  return preferences
}
