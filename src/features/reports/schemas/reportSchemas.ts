import { z } from 'zod'

export const reportSourceSchema = z.enum(['tasks', 'approvals', 'audit'])

export const reportColumnSchema = z.enum([
  'id',
  'title',
  'status',
  'priority',
  'assignee',
  'department',
  'dueDate',
  'approval',
  'requester',
  'category',
  'workflow',
  'createdAt',
  'updatedAt',
  'entityType',
  'entityName',
  'action',
  'actor',
  'summary',
  'changes',
])

export const reportFiltersSchema = z.object({
  dateFrom: z.string(),
  dateTo: z.string(),
  departmentId: z.string(),
  priority: z.string(),
  status: z.string(),
})

export const reportDefinitionSchema = z.object({
  columns: z.array(reportColumnSchema),
  createdAt: z.string().datetime(),
  createdByUserId: z.string(),
  description: z.string(),
  filters: reportFiltersSchema,
  id: z.string(),
  name: z.string(),
  source: reportSourceSchema,
  templateId: z.string().nullable(),
  updatedAt: z.string().datetime(),
})

export const reportDefinitionsSchema = z.array(reportDefinitionSchema)

export const reportFormSchema = z.object({
  columns: z
    .array(reportColumnSchema)
    .min(1, 'Select at least one report column.')
    .max(12, 'Reports support up to 12 columns.'),
  description: z
    .string()
    .trim()
    .min(20, 'Provide at least 20 characters of reporting context.')
    .max(500, 'Use no more than 500 characters.'),
  filters: reportFiltersSchema,
  name: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(100, 'Use no more than 100 characters.'),
  source: reportSourceSchema,
  templateId: z.string(),
})

export const reportTemplateSchema = z.object({
  columns: z.array(reportColumnSchema),
  description: z.string(),
  filters: reportFiltersSchema,
  id: z.string(),
  name: z.string(),
  source: reportSourceSchema,
})

export const reportTemplatesSchema = z.array(reportTemplateSchema)

export const reportResultSchema = z.object({
  columns: z.array(
    z.object({
      key: reportColumnSchema,
      label: z.string(),
    }),
  ),
  executedAt: z.string().datetime(),
  reportId: z.string(),
  rows: z.array(z.record(z.string(), z.string())),
})

export type ReportColumn = z.infer<typeof reportColumnSchema>
export type ReportDefinition = z.infer<typeof reportDefinitionSchema>
export type ReportFilters = z.infer<typeof reportFiltersSchema>
export type ReportFormValues = z.infer<typeof reportFormSchema>
export type ReportResult = z.infer<typeof reportResultSchema>
export type ReportSource = z.infer<typeof reportSourceSchema>
export type ReportTemplate = z.infer<typeof reportTemplateSchema>
