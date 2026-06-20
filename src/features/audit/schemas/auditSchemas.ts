import { z } from 'zod'

export const auditEntityTypeSchema = z.enum(['approval', 'task'])

export const auditActionSchema = z.enum([
  'created',
  'submitted',
  'approved',
  'rejected',
  'delegated',
  'escalated',
  'reassigned',
  'status-changed',
  'updated',
])

export const auditChangeSchema = z.object({
  field: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable(),
})

export const auditRecordSchema = z.object({
  action: auditActionSchema,
  actorUserId: z.string(),
  changes: z.array(auditChangeSchema),
  createdAt: z.string().datetime(),
  entityId: z.string(),
  entityName: z.string(),
  entityType: auditEntityTypeSchema,
  id: z.string(),
  sourceEventKey: z.string(),
  summary: z.string(),
})

export const auditRecordsSchema = z.array(auditRecordSchema)

export const auditStoreSchema = z.object({
  processedEventKeys: z.array(z.string()),
  records: auditRecordsSchema,
})

export type AuditAction = z.infer<typeof auditActionSchema>
export type AuditChange = z.infer<typeof auditChangeSchema>
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>
export type AuditRecord = z.infer<typeof auditRecordSchema>
export type AuditStore = z.infer<typeof auditStoreSchema>
