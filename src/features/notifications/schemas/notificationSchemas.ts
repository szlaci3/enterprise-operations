import { z } from 'zod'

export const notificationCategorySchema = z.enum([
  'approval',
  'task',
  'system',
])

export const notificationSeveritySchema = z.enum([
  'info',
  'success',
  'warning',
  'critical',
])

export const notificationSubscriptionSchema = z.enum([
  'approval-assigned',
  'approval-decision',
  'approval-delegated',
  'approval-escalated',
  'task-assigned',
  'task-status',
])

export const notificationSchema = z.object({
  actionUrl: z.string(),
  category: notificationCategorySchema,
  createdAt: z.string().datetime(),
  id: z.string(),
  message: z.string(),
  readAt: z.string().datetime().nullable(),
  recipientUserId: z.string(),
  severity: notificationSeveritySchema,
  sourceEntityId: z.string(),
  sourceEventKey: z.string(),
  subscription: notificationSubscriptionSchema,
  title: z.string(),
})

export const notificationsSchema = z.array(notificationSchema)

export const notificationPreferencesSchema = z.object({
  emailDigest: z.enum(['off', 'daily', 'weekly']),
  inAppEnabled: z.boolean(),
  subscriptions: z.record(notificationSubscriptionSchema, z.boolean()),
  updatedAt: z.string().datetime(),
  userId: z.string(),
})

export const notificationPreferencesListSchema = z.array(
  notificationPreferencesSchema,
)

export const notificationPreferencesFormSchema =
  notificationPreferencesSchema.pick({
    emailDigest: true,
    inAppEnabled: true,
    subscriptions: true,
  })

export const notificationStoreSchema = z.object({
  notifications: notificationsSchema,
  processedEventKeys: z.array(z.string()),
})

export type Notification = z.infer<typeof notificationSchema>
export type NotificationCategory = z.infer<typeof notificationCategorySchema>
export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>
export type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesFormSchema
>
export type NotificationSeverity = z.infer<typeof notificationSeveritySchema>
export type NotificationSubscription = z.infer<
  typeof notificationSubscriptionSchema
>
export type NotificationStore = z.infer<typeof notificationStoreSchema>
