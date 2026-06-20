import { z } from 'zod'

export const dashboardPeriodSchema = z.enum(['7d', '30d', '90d'])

const trendSchema = z.object({
  change: z.number(),
  direction: z.enum(['up', 'down', 'flat']),
  favorable: z.boolean(),
  label: z.string(),
})

const kpiSchema = z.object({
  description: z.string(),
  format: z.enum(['number', 'percent', 'duration']),
  id: z.string(),
  label: z.string(),
  series: z.array(z.number()).min(2),
  trend: trendSchema,
  value: z.number(),
})

const workloadPointSchema = z.object({
  completed: z.number().nonnegative(),
  label: z.string(),
  received: z.number().nonnegative(),
})

const serviceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  openItems: z.number().int().nonnegative(),
  owner: z.string(),
  slaPerformance: z.number().min(0).max(100),
  status: z.enum(['healthy', 'watch', 'critical']),
  throughput: z.number().int().nonnegative(),
})

const dashboardAlertSchema = z.object({
  acknowledged: z.boolean(),
  createdAt: z.string().datetime(),
  description: z.string(),
  id: z.string(),
  severity: z.enum(['critical', 'warning', 'info']),
  source: z.string(),
  title: z.string(),
})

const dashboardActivitySchema = z.object({
  actor: z.string(),
  createdAt: z.string().datetime(),
  description: z.string(),
  id: z.string(),
  type: z.enum(['approval', 'task', 'report', 'system']),
})

export const dashboardSnapshotSchema = z.object({
  activities: z.array(dashboardActivitySchema),
  alerts: z.array(dashboardAlertSchema),
  generatedAt: z.string().datetime(),
  kpis: z.array(kpiSchema),
  period: dashboardPeriodSchema,
  services: z.array(serviceSummarySchema),
  workload: z.array(workloadPointSchema),
})

export const acknowledgedAlertIdsSchema = z.array(z.string())

export type DashboardActivity = z.infer<typeof dashboardActivitySchema>
export type DashboardAlert = z.infer<typeof dashboardAlertSchema>
export type DashboardKpi = z.infer<typeof kpiSchema>
export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>
export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>
export type ServiceSummary = z.infer<typeof serviceSummarySchema>
export type WorkloadPoint = z.infer<typeof workloadPointSchema>
