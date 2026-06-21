import { z } from 'zod'

export const runtimeIncidentSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string(),
  message: z.string(),
  name: z.string(),
  route: z.string(),
  source: z.enum(['global-boundary', 'route', 'unhandled-error', 'unhandled-rejection']),
  stack: z.string().nullable(),
})

export const runtimeIncidentsSchema = z.array(runtimeIncidentSchema)

export const healthCheckSchema = z.object({
  description: z.string(),
  id: z.string(),
  label: z.string(),
  status: z.enum(['healthy', 'warning', 'critical']),
  value: z.string(),
})

export const diagnosticsSnapshotSchema = z.object({
  checks: z.array(healthCheckSchema),
  generatedAt: z.string().datetime(),
  incidents: runtimeIncidentsSchema,
  storage: z.object({
    available: z.boolean(),
    entries: z.array(
      z.object({
        bytes: z.number().int().nonnegative(),
        key: z.string(),
      }),
    ),
    totalBytes: z.number().int().nonnegative(),
  }),
})

export type DiagnosticsSnapshot = z.infer<typeof diagnosticsSnapshotSchema>
export type RuntimeIncident = z.infer<typeof runtimeIncidentSchema>
export type RuntimeIncidentSource = RuntimeIncident['source']
