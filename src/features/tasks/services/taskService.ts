import {
  createTaskApi,
  getTaskApi,
  listTasksApi,
  updateTaskApi,
} from '../../../mocks/tasksApi'
import { approvalService } from '../../approvals/services/approvalService'
import { departmentService } from '../../departments/services/departmentService'
import { userService } from '../../users/services/userService'
import { offlineService } from '../../offline/services/offlineService'
import { connectionIsOnline } from '../../offline/store/connectivityStore'
import {
  taskFormSchema,
  taskSchema,
  tasksSchema,
  taskTransitionFormSchema,
  type Task,
  type TaskFormValues,
  type TaskStatus,
  type TaskTransitionFormValues,
} from '../schemas/taskSchemas'

export class TaskServiceError extends Error {
  readonly code:
    | 'invalid-approval'
    | 'invalid-assignment'
    | 'offline-conflict'
    | 'invalid-transition'
    | 'not-found'

  constructor(message: string, code: TaskServiceError['code']) {
    super(message)
    this.name = 'TaskServiceError'
    this.code = code
  }
}

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  backlog: ['backlog', 'in-progress', 'cancelled'],
  blocked: ['blocked', 'in-progress', 'cancelled'],
  cancelled: ['cancelled', 'backlog'],
  completed: ['completed', 'in-progress'],
  'in-progress': ['in-progress', 'blocked', 'completed', 'cancelled'],
}

async function list(): Promise<Task[]> {
  return tasksSchema.parse(await listTasksApi())
}

async function assertRelationships(values: TaskFormValues) {
  const [assignee, department, approval] = await Promise.all([
    userService.get(values.assigneeUserId),
    departmentService.get(values.departmentId),
    values.approvalRequestId
      ? approvalService.get(values.approvalRequestId)
      : Promise.resolve(null),
  ])
  if (!assignee || assignee.status !== 'active') {
    throw new TaskServiceError(
      'Select an active assignee.',
      'invalid-assignment',
    )
  }
  if (!department || department.status === 'inactive') {
    throw new TaskServiceError(
      'Select an available department.',
      'invalid-assignment',
    )
  }
  if (values.approvalRequestId && !approval) {
    throw new TaskServiceError(
      'The linked approval request no longer exists.',
      'invalid-approval',
    )
  }
}

export const taskService = {
  async create(
    actorUserId: string,
    values: TaskFormValues,
  ): Promise<Task> {
    const parsed = taskFormSchema.parse(values)
    await Promise.all([
      assertRelationships(parsed),
      userService.get(actorUserId).then((actor) => {
        if (!actor || actor.status !== 'active') {
          throw new TaskServiceError(
            'Only active users can create tasks.',
            'invalid-assignment',
          )
        }
      }),
    ])
    const now = new Date().toISOString()
    const task: Task = {
      ...parsed,
      approvalRequestId: parsed.approvalRequestId || null,
      completedAt: null,
      createdAt: now,
      createdByUserId: actorUserId,
      events: [
        {
          actorUserId,
          createdAt: now,
          id: crypto.randomUUID(),
          summary: parsed.approvalRequestId
            ? 'Created with a governed approval relationship.'
            : 'Created as operational work.',
          type: 'created',
        },
      ],
      id: crypto.randomUUID(),
      status: 'backlog',
      updatedAt: now,
    }
    return taskSchema.parse(await createTaskApi(task))
  },

  async get(id: string): Promise<Task | null> {
    const response = await getTaskApi(id)
    return response === null ? null : taskSchema.parse(response)
  },

  list,

  async transition(
    id: string,
    actorUserId: string,
    values: TaskTransitionFormValues,
  ): Promise<Task> {
    const parsed = taskTransitionFormSchema.parse(values)
    const [authoritativeTask, actor] = await Promise.all([
      taskService.get(id),
      userService.get(actorUserId),
    ])
    if (!authoritativeTask) {
      throw new TaskServiceError('The task no longer exists.', 'not-found')
    }
    const existingOperation = await offlineService.operationForTask(id)
    if (existingOperation?.state === 'conflict') {
      throw new TaskServiceError(
        'Resolve the offline conflict before adding another status update.',
        'offline-conflict',
      )
    }
    const task =
      existingOperation?.optimisticTask ?? authoritativeTask
    if (!actor || actor.status !== 'active') {
      throw new TaskServiceError(
        'Only active users can update task status.',
        'invalid-assignment',
      )
    }
    if (!allowedTransitions[task.status].includes(parsed.status)) {
      throw new TaskServiceError(
        `A ${task.status} task cannot transition directly to ${parsed.status}.`,
        'invalid-transition',
      )
    }
    if (parsed.status === task.status) {
      return task
    }
    const now = new Date().toISOString()
    const updated: Task = {
      ...task,
      completedAt: parsed.status === 'completed' ? now : null,
      events: [
        ...task.events,
        {
          actorUserId,
          createdAt: now,
          fromStatus: task.status,
          id: crypto.randomUUID(),
          note: parsed.note,
          toStatus: parsed.status,
          type: 'status-changed',
        },
      ],
      status: parsed.status,
      updatedAt: now,
    }
    if (!connectionIsOnline() || existingOperation) {
      const operation = await offlineService.enqueueTaskTransition(
        authoritativeTask,
        actorUserId,
        updated,
      )
      if (connectionIsOnline()) {
        const synchronized =
          await offlineService.synchronizeOperation(operation)
        return synchronized ?? updated
      }
      return updated
    }
    return taskSchema.parse(await updateTaskApi(updated))
  },

  async update(
    id: string,
    actorUserId: string,
    values: TaskFormValues,
  ): Promise<Task> {
    const parsed = taskFormSchema.parse(values)
    const [task] = await Promise.all([
      taskService.get(id),
      assertRelationships(parsed),
    ])
    if (!task) {
      throw new TaskServiceError('The task no longer exists.', 'not-found')
    }
    const actor = await userService.get(actorUserId)
    if (!actor || actor.status !== 'active') {
      throw new TaskServiceError(
        'Only active users can update tasks.',
        'invalid-assignment',
      )
    }
    const now = new Date().toISOString()
    const events = [...task.events]
    if (task.assigneeUserId !== parsed.assigneeUserId) {
      events.push({
        actorUserId,
        createdAt: now,
        fromUserId: task.assigneeUserId,
        id: crypto.randomUUID(),
        toUserId: parsed.assigneeUserId,
        type: 'reassigned',
      })
    }
    events.push({
      actorUserId,
      createdAt: now,
      id: crypto.randomUUID(),
      summary: 'Updated task scope, ownership, or scheduling details.',
      type: 'updated',
    })
    const updated: Task = {
      ...task,
      ...parsed,
      approvalRequestId: parsed.approvalRequestId || null,
      events,
      updatedAt: now,
    }
    return taskSchema.parse(await updateTaskApi(updated))
  },
}
