import {
  getAuditStoreApi,
  replaceAuditStoreApi,
} from '../../../mocks/auditApi'
import {
  auditRecordSchema,
  auditRecordsSchema,
  auditStoreSchema,
  type AuditAction,
  type AuditChange,
  type AuditEntityType,
  type AuditRecord,
  type AuditStore,
} from '../schemas/auditSchemas'

interface AuditEmission {
  action: AuditAction
  actorUserId: string
  changes: AuditChange[]
  createdAt: string
  entityId: string
  entityName: string
  entityType: AuditEntityType
  sourceEventKey: string
  summary: string
}

async function deriveEmissions(): Promise<AuditEmission[]> {
  const [{ approvalService }, { taskService }] = await Promise.all([
    import('../../approvals/services/approvalService'),
    import('../../tasks/services/taskService'),
  ])
  const [approvals, tasks] = await Promise.all([
    approvalService.list(),
    taskService.list(),
  ])
  const emissions: AuditEmission[] = []

  for (const approval of approvals) {
    for (const event of approval.events) {
      if (event.type === 'submitted') {
        emissions.push({
          action: 'submitted',
          actorUserId: event.actorUserId,
          changes: [
            { field: 'status', from: null, to: 'pending' },
            {
              field: 'workflowVersion',
              from: null,
              to: `${approval.workflow.name} v${approval.workflow.version}`,
            },
          ],
          createdAt: event.createdAt,
          entityId: approval.id,
          entityName: approval.title,
          entityType: 'approval',
          sourceEventKey: `approval:${event.id}`,
          summary: event.summary,
        })
      } else if (event.type === 'decision') {
        emissions.push({
          action: event.decision,
          actorUserId: event.actorUserId,
          changes: [
            {
              field: 'decision',
              from: 'pending',
              to: event.decision,
            },
          ],
          createdAt: event.createdAt,
          entityId: approval.id,
          entityName: approval.title,
          entityType: 'approval',
          sourceEventKey: `approval:${event.id}`,
          summary: event.comment,
        })
      } else {
        emissions.push({
          action: event.type,
          actorUserId: event.actorUserId,
          changes: [
            {
              field: 'assignedReviewer',
              from: event.fromUserId,
              to: event.toUserId,
            },
          ],
          createdAt: event.createdAt,
          entityId: approval.id,
          entityName: approval.title,
          entityType: 'approval',
          sourceEventKey: `approval:${event.id}`,
          summary:
            event.type === 'delegated'
              ? 'Approval review responsibility was delegated.'
              : 'An overdue approval review was escalated.',
        })
      }
    }
  }

  for (const task of tasks) {
    for (const event of task.events) {
      if (event.type === 'created' || event.type === 'updated') {
        emissions.push({
          action: event.type,
          actorUserId: event.actorUserId,
          changes:
            event.type === 'created'
              ? [
                  { field: 'status', from: null, to: 'backlog' },
                  {
                    field: 'assigneeUserId',
                    from: null,
                    to: task.assigneeUserId,
                  },
                ]
              : [],
          createdAt: event.createdAt,
          entityId: task.id,
          entityName: task.title,
          entityType: 'task',
          sourceEventKey: `task:${event.id}`,
          summary: event.summary,
        })
      } else if (event.type === 'reassigned') {
        emissions.push({
          action: 'reassigned',
          actorUserId: event.actorUserId,
          changes: [
            {
              field: 'assigneeUserId',
              from: event.fromUserId,
              to: event.toUserId,
            },
          ],
          createdAt: event.createdAt,
          entityId: task.id,
          entityName: task.title,
          entityType: 'task',
          sourceEventKey: `task:${event.id}`,
          summary: 'Task ownership was reassigned.',
        })
      } else {
        emissions.push({
          action: 'status-changed',
          actorUserId: event.actorUserId,
          changes: [
            {
              field: 'status',
              from: event.fromStatus,
              to: event.toStatus,
            },
          ],
          createdAt: event.createdAt,
          entityId: task.id,
          entityName: task.title,
          entityType: 'task',
          sourceEventKey: `task:${event.id}`,
          summary: event.note,
        })
      }
    }
  }

  return emissions
}

async function getStore(): Promise<AuditStore> {
  return auditStoreSchema.parse(await getAuditStoreApi())
}

async function synchronize(): Promise<AuditStore> {
  const [store, emissions] = await Promise.all([
    getStore(),
    deriveEmissions(),
  ])
  const processed = new Set(store.processedEventKeys)
  const pending = emissions.filter(
    (emission) => !processed.has(emission.sourceEventKey),
  )
  if (pending.length === 0) {
    return store
  }

  const records = pending.map((emission) =>
    auditRecordSchema.parse({
      ...emission,
      id: crypto.randomUUID(),
    }),
  )
  const updated = auditStoreSchema.parse({
    processedEventKeys: [
      ...store.processedEventKeys,
      ...pending.map((emission) => emission.sourceEventKey),
    ],
    records: [...store.records, ...records],
  })
  return auditStoreSchema.parse(await replaceAuditStoreApi(updated))
}

export const auditService = {
  async list(): Promise<AuditRecord[]> {
    const store = await synchronize()
    return auditRecordsSchema.parse(
      [...store.records].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    )
  },

  async listEntity(
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<AuditRecord[]> {
    const records = await auditService.list()
    return records.filter(
      (record) =>
        record.entityType === entityType && record.entityId === entityId,
    )
  },
}
