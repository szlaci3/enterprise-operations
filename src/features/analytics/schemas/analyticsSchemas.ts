import { z } from 'zod'

export const analyticsPeriodSchema = z.enum(['30d', '90d', '180d'])

export const analyticsFiltersSchema = z.object({
  departmentId: z.string(),
  period: analyticsPeriodSchema,
})

export const analyticsMetricSchema = z.object({
  description: z.string(),
  format: z.enum(['number', 'percent', 'duration']),
  id: z.string(),
  label: z.string(),
  trendChange: z.number(),
  trendDirection: z.enum(['up', 'down', 'flat']),
  trendFavorable: z.boolean(),
  value: z.number(),
})

export const analyticsTrendPointSchema = z.object({
  approvalsDecided: z.number().int().nonnegative(),
  label: z.string(),
  tasksCompleted: z.number().int().nonnegative(),
  tasksCreated: z.number().int().nonnegative(),
})

export const analyticsDistributionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().nonnegative(),
})

export const analyticsSnapshotSchema = z.object({
  approvalOutcomes: z.array(analyticsDistributionItemSchema),
  departmentWorkload: z.array(analyticsDistributionItemSchema),
  filters: analyticsFiltersSchema,
  generatedAt: z.string().datetime(),
  metrics: z.array(analyticsMetricSchema),
  taskStatusDistribution: z.array(analyticsDistributionItemSchema),
  trend: z.array(analyticsTrendPointSchema),
})

export type AnalyticsDistributionItem = z.infer<
  typeof analyticsDistributionItemSchema
>
export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>
export type AnalyticsMetric = z.infer<typeof analyticsMetricSchema>
export type AnalyticsPeriod = z.infer<typeof analyticsPeriodSchema>
export type AnalyticsSnapshot = z.infer<typeof analyticsSnapshotSchema>
export type AnalyticsTrendPoint = z.infer<typeof analyticsTrendPointSchema>
