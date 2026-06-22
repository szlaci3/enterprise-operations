import { z } from 'zod'

export const themePreferenceSchema = z.enum(['light', 'dark', 'system'])
export const workspaceDensitySchema = z.enum(['comfortable', 'compact'])
export const dateFormatSchema = z.enum(['month-day-year', 'day-month-year'])
export const featureStateSchema = z.enum(['enabled', 'pilot', 'disabled'])
export const featureAudienceSchema = z.enum([
  'all-members',
  'administrators',
])
export const featureKeySchema = z.enum([
  'analytics',
  'collaboration',
  'documents',
])

export const personalSettingsSchema = z.object({
  dateFormat: dateFormatSchema,
  density: workspaceDensitySchema,
  reducedMotion: z.boolean(),
  theme: themePreferenceSchema,
  timezone: z.string(),
  updatedAt: z.string().datetime(),
  userId: z.string(),
})

export const personalSettingsFormSchema = personalSettingsSchema.pick({
  dateFormat: true,
  density: true,
  reducedMotion: true,
  theme: true,
  timezone: true,
})

export const organizationSettingsSchema = z.object({
  defaultTimezone: z.string(),
  fiscalYearStartMonth: z.number().int().min(1).max(12),
  id: z.string(),
  name: z.string(),
  recordsRetentionDays: z.number().int().min(30).max(3650),
  supportEmail: z.string().email(),
  updatedAt: z.string().datetime(),
  updatedByUserId: z.string(),
  weekStartsOn: z.enum(['monday', 'sunday']),
})

export const organizationSettingsFormSchema = organizationSettingsSchema
  .pick({
    defaultTimezone: true,
    fiscalYearStartMonth: true,
    name: true,
    recordsRetentionDays: true,
    supportEmail: true,
    weekStartsOn: true,
  })
  .extend({
    name: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(80, 'Use no more than 80 characters.'),
  })

export const featureConfigurationSchema = z.object({
  audience: featureAudienceSchema,
  key: featureKeySchema,
  prerequisiteKeys: z.array(featureKeySchema),
  state: featureStateSchema,
  updatedAt: z.string().datetime(),
  updatedByUserId: z.string(),
})

export const featureConfigurationsSchema = z.array(featureConfigurationSchema)

export const legacyFeatureConfigurationSchema =
  featureConfigurationSchema.omit({
    audience: true,
    prerequisiteKeys: true,
  })

export const settingsChangeSchema = z.object({
  actorUserId: z.string(),
  createdAt: z.string().datetime(),
  field: z.string(),
  from: z.string(),
  id: z.string(),
  scope: z.enum(['organization', 'feature']),
  summary: z.string(),
  to: z.string(),
})

export const settingsChangesSchema = z.array(settingsChangeSchema)

export const settingsStoreSchema = z.object({
  changes: settingsChangesSchema,
  features: featureConfigurationsSchema,
  organization: organizationSettingsSchema,
  personal: z.array(personalSettingsSchema),
})

export const settingsSnapshotSchema = z.object({
  changes: settingsChangesSchema,
  features: featureConfigurationsSchema,
  organization: organizationSettingsSchema,
  personal: personalSettingsSchema,
})

export type DateFormat = z.infer<typeof dateFormatSchema>
export type FeatureConfiguration = z.infer<typeof featureConfigurationSchema>
export type FeatureAudience = z.infer<typeof featureAudienceSchema>
export type FeatureKey = z.infer<typeof featureKeySchema>
export type FeatureState = z.infer<typeof featureStateSchema>
export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>
export type OrganizationSettingsFormValues = z.infer<
  typeof organizationSettingsFormSchema
>
export type PersonalSettings = z.infer<typeof personalSettingsSchema>
export type PersonalSettingsFormValues = z.infer<
  typeof personalSettingsFormSchema
>
export type SettingsChange = z.infer<typeof settingsChangeSchema>
export type SettingsSnapshot = z.infer<typeof settingsSnapshotSchema>
export type SettingsStore = z.infer<typeof settingsStoreSchema>
export type ThemePreference = z.infer<typeof themePreferenceSchema>
export type WorkspaceDensity = z.infer<typeof workspaceDensitySchema>
