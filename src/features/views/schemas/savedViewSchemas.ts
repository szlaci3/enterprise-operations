import { z } from 'zod'

export const savedViewResourceSchema = z.enum([
  'tasks',
  'approvals',
  'users',
  'documents',
  'audit',
  'search',
])
export const savedViewVisibilitySchema = z.enum(['personal', 'shared'])
export const savedViewDensitySchema = z.enum(['comfortable', 'compact'])

export const savedViewSchema = z.object({
  columns: z.array(z.string()),
  createdAt: z.string().datetime(),
  density: savedViewDensitySchema,
  id: z.string(),
  isDefault: z.boolean(),
  name: z.string().trim().min(3).max(60),
  ownerUserId: z.string(),
  resource: savedViewResourceSchema,
  state: z.record(z.string(), z.string()),
  updatedAt: z.string().datetime(),
  visibility: savedViewVisibilitySchema,
})

export const savedViewsSchema = z.array(savedViewSchema)

export const savedViewInputSchema = savedViewSchema.pick({
  columns: true,
  density: true,
  isDefault: true,
  name: true,
  resource: true,
  state: true,
  visibility: true,
})

export type SavedView = z.infer<typeof savedViewSchema>
export type SavedViewDensity = z.infer<typeof savedViewDensitySchema>
export type SavedViewInput = z.infer<typeof savedViewInputSchema>
export type SavedViewResource = z.infer<typeof savedViewResourceSchema>
export type SavedViewVisibility = z.infer<typeof savedViewVisibilitySchema>
