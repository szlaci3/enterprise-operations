import { z } from 'zod'

export const searchEntityTypeSchema = z.enum([
  'department',
  'user',
  'workflow',
  'task',
  'approval',
  'report',
])

export const searchFiltersSchema = z.object({
  entityTypes: z.array(searchEntityTypeSchema),
  status: z.string(),
  updatedWithin: z.enum(['all', '7d', '30d', '90d']).default('all'),
})

export const searchRequestSchema = z.object({
  filters: searchFiltersSchema,
  query: z.string().trim().max(200),
  sort: z.enum(['relevance', 'recent']).default('relevance'),
})

export const searchResultSchema = z.object({
  description: z.string(),
  entityType: searchEntityTypeSchema,
  id: z.string(),
  metadata: z.array(z.string()),
  score: z.number(),
  status: z.string(),
  title: z.string(),
  updatedAt: z.string().datetime(),
  url: z.string(),
})

export const searchResponseSchema = z.object({
  executedAt: z.string().datetime(),
  facets: z.object({
    entityTypes: z.array(
      z.object({
        count: z.number().int().nonnegative(),
        value: searchEntityTypeSchema,
      }),
    ),
    statuses: z.array(
      z.object({
        count: z.number().int().nonnegative(),
        value: z.string(),
      }),
    ),
  }),
  results: z.array(searchResultSchema),
  total: z.number().int().nonnegative(),
})

export const savedSearchSchema = z.object({
  createdAt: z.string().datetime(),
  filters: searchFiltersSchema,
  id: z.string(),
  name: z.string(),
  query: z.string(),
})

export const searchPreferencesSchema = z.object({
  recentQueries: z.array(z.string()).max(10),
  savedSearches: z.array(savedSearchSchema),
  userId: z.string(),
})

export const searchPreferencesListSchema = z.array(searchPreferencesSchema)

export const saveSearchFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(60, 'Use no more than 60 characters.'),
})

export type SavedSearch = z.infer<typeof savedSearchSchema>
export type SearchEntityType = z.infer<typeof searchEntityTypeSchema>
export type SearchFilters = z.infer<typeof searchFiltersSchema>
export type SearchPreferences = z.infer<typeof searchPreferencesSchema>
export type SearchRequest = z.infer<typeof searchRequestSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>
export type SearchResult = z.infer<typeof searchResultSchema>
