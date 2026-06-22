import {
  tasksSchema,
  type Task,
} from '../features/tasks/schemas/taskSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const tasksStorageKey = 'enterprise-operations-tasks'

const seedTasks: Task[] = [
  {
    approvalRequestId: 'approval-service-exception-1042',
    assigneeUserId: 'user-avery-morgan',
    completedAt: null,
    createdAt: '2026-06-16T15:15:00.000Z',
    createdByUserId: 'user-maya-chen',
    departmentId: 'dept-operations',
    description:
      'Confirm the executive exception conditions, document the weekly control review, and communicate the approved operating guardrails.',
    dueDate: '2026-06-22',
    events: [
      {
        actorUserId: 'user-maya-chen',
        createdAt: '2026-06-16T15:15:00.000Z',
        id: 'event-task-sla-created',
        summary: 'Created from an active service exception approval.',
        type: 'created',
      },
      {
        actorUserId: 'user-avery-morgan',
        createdAt: '2026-06-18T08:30:00.000Z',
        fromStatus: 'backlog',
        id: 'event-task-sla-started',
        note: 'Executive review and control-owner alignment started.',
        toStatus: 'in-progress',
        type: 'status-changed',
      },
    ],
    id: 'task-sla-exception-controls',
    priority: 'high',
    status: 'in-progress',
    title: 'Finalize SLA exception operating controls',
    updatedAt: '2026-06-18T08:30:00.000Z',
  },
  {
    approvalRequestId: null,
    assigneeUserId: 'user-priya-shah',
    completedAt: null,
    createdAt: '2026-06-17T10:00:00.000Z',
    createdByUserId: 'user-avery-morgan',
    departmentId: 'dept-technology-operations',
    description:
      'Validate the production support coverage model, identify unresolved ownership gaps, and publish the updated escalation roster.',
    dueDate: '2026-06-20',
    events: [
      {
        actorUserId: 'user-avery-morgan',
        createdAt: '2026-06-17T10:00:00.000Z',
        id: 'event-task-roster-created',
        summary: 'Created for the technology operations readiness review.',
        type: 'created',
      },
      {
        actorUserId: 'user-priya-shah',
        createdAt: '2026-06-19T14:20:00.000Z',
        fromStatus: 'backlog',
        id: 'event-task-roster-blocked',
        note: 'Waiting for the regional support vendor to confirm weekend coverage.',
        toStatus: 'blocked',
        type: 'status-changed',
      },
    ],
    id: 'task-support-roster',
    priority: 'critical',
    status: 'blocked',
    title: 'Publish production escalation roster',
    updatedAt: '2026-06-19T14:20:00.000Z',
  },
  {
    approvalRequestId: 'approval-retention-exception-1038',
    assigneeUserId: 'user-elena-rossi',
    completedAt: '2026-06-18T16:40:00.000Z',
    createdAt: '2026-06-11T10:10:00.000Z',
    createdByUserId: 'user-priya-shah',
    departmentId: 'dept-finance-operations',
    description:
      'Record the approved retention exception, attach compensating-control evidence, and update the finance archive runbook.',
    dueDate: '2026-06-19',
    events: [
      {
        actorUserId: 'user-priya-shah',
        createdAt: '2026-06-11T10:10:00.000Z',
        id: 'event-task-retention-created',
        summary: 'Created from the approved retention exception.',
        type: 'created',
      },
      {
        actorUserId: 'user-elena-rossi',
        createdAt: '2026-06-12T09:00:00.000Z',
        fromStatus: 'backlog',
        id: 'event-task-retention-started',
        note: 'Evidence collection and runbook updates started.',
        toStatus: 'in-progress',
        type: 'status-changed',
      },
      {
        actorUserId: 'user-elena-rossi',
        createdAt: '2026-06-18T16:40:00.000Z',
        fromStatus: 'in-progress',
        id: 'event-task-retention-completed',
        note: 'Controls, evidence links, and the runbook update are complete.',
        toStatus: 'completed',
        type: 'status-changed',
      },
    ],
    id: 'task-retention-runbook',
    priority: 'normal',
    status: 'completed',
    title: 'Document retention exception controls',
    updatedAt: '2026-06-18T16:40:00.000Z',
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const tasksStore = createVersionedStore({
  key: tasksStorageKey,
  schema: tasksSchema,
  seed: () => seedTasks,
  version: 1,
})

function writeTasks(tasks: Task[]) {
  tasksStore.write(tasks)
}

export async function listTasksApi(): Promise<unknown> {
  await delay(300)
  return tasksStore.read()
}

export async function getTaskApi(id: string): Promise<unknown> {
  await delay(220)
  return tasksStore.read().find((task) => task.id === id) ?? null
}

export async function createTaskApi(task: Task): Promise<unknown> {
  await delay(400)
  writeTasks([...tasksStore.read(), task])
  return task
}

export async function updateTaskApi(task: Task): Promise<unknown> {
  await delay(400)
  writeTasks(
    tasksStore.read().map((item) => (item.id === task.id ? task : item)),
  )
  return task
}
