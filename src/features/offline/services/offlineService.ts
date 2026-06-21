import {
  getOfflineQueueApi,
  replaceOfflineQueueApi,
} from '../../../mocks/offlineApi'
import { getTaskApi, updateTaskApi } from '../../../mocks/tasksApi'
import { taskSchema, tasksSchema, type Task } from '../../tasks/schemas/taskSchemas'
import {
  offlineQueueSchema,
  offlineSnapshotSchema,
  offlineTaskTransitionSchema,
  type OfflineSnapshot,
  type OfflineTaskTransition,
} from '../schemas/offlineSchemas'
import { connectionIsOnline } from '../store/connectivityStore'

async function getQueue(): Promise<OfflineTaskTransition[]> {
  return offlineQueueSchema.parse(await getOfflineQueueApi())
}

async function replaceQueue(queue: OfflineTaskTransition[]) {
  return offlineQueueSchema.parse(await replaceOfflineQueueApi(queue))
}

function snapshot(queue: OfflineTaskTransition[]): OfflineSnapshot {
  return offlineSnapshotSchema.parse({
    conflictCount: queue.filter((item) => item.state === 'conflict').length,
    failedCount: queue.filter((item) => item.state === 'failed').length,
    operations: queue,
    pendingCount: queue.filter((item) => item.state === 'pending').length,
  })
}

async function synchronizeOperation(
  operation: OfflineTaskTransition,
): Promise<Task | null> {
  const queue = await getQueue()
  const current = queue.find((item) => item.id === operation.id)
  if (!current || !connectionIsOnline()) return null
  const attemptedAt = new Date().toISOString()
  try {
    const response = await getTaskApi(current.taskId)
    if (response === null) {
      await replaceQueue(
        queue.map((item) =>
          item.id === current.id
            ? {
                ...item,
                errorMessage: 'The task was removed before this update synchronized.',
                lastAttemptAt: attemptedAt,
                remoteTask: null,
                state: 'conflict' as const,
              }
            : item,
        ),
      )
      return null
    }
    const remoteTask = taskSchema.parse(response)
    if (remoteTask.updatedAt !== current.baseUpdatedAt) {
      await replaceQueue(
        queue.map((item) =>
          item.id === current.id
            ? {
                ...item,
                errorMessage:
                  'The task changed elsewhere while this update was offline.',
                lastAttemptAt: attemptedAt,
                remoteTask,
                state: 'conflict' as const,
              }
            : item,
        ),
      )
      return null
    }
    const synchronized = taskSchema.parse(
      await updateTaskApi(current.optimisticTask),
    )
    await replaceQueue(queue.filter((item) => item.id !== current.id))
    return synchronized
  } catch {
    await replaceQueue(
      queue.map((item) =>
        item.id === current.id
          ? {
              ...item,
              errorMessage: 'Synchronization failed and will be retried.',
              lastAttemptAt: attemptedAt,
              state: 'failed' as const,
            }
          : item,
      ),
    )
    return null
  }
}

export const offlineService = {
  async discard(operationId: string): Promise<OfflineSnapshot> {
    return snapshot(
      await replaceQueue(
        (await getQueue()).filter((item) => item.id !== operationId),
      ),
    )
  },

  async enqueueTaskTransition(
    task: Task,
    actorUserId: string,
    optimisticTask: Task,
  ): Promise<OfflineTaskTransition> {
    const queue = await getQueue()
    const existing = queue.find(
      (item) =>
        item.type === 'task-transition' && item.taskId === task.id,
    )
    const latestEvent = optimisticTask.events.at(-1)
    if (!latestEvent || latestEvent.type !== 'status-changed') {
      throw new Error('Offline task transitions require a status event.')
    }
    const operation = offlineTaskTransitionSchema.parse(
      existing
        ? {
            ...existing,
            actorUserId,
            errorMessage: null,
            optimisticTask,
            remoteTask: null,
            state: 'pending',
            transitionEvents: [...existing.transitionEvents, latestEvent],
            values: {
              note: latestEvent.note,
              status: latestEvent.toStatus,
            },
          }
        : {
            actorUserId,
            baseUpdatedAt: task.updatedAt,
            createdAt: new Date().toISOString(),
            errorMessage: null,
            id: crypto.randomUUID(),
            lastAttemptAt: null,
            optimisticTask,
            remoteTask: null,
            state: 'pending',
            taskId: task.id,
            transitionEvents: [latestEvent],
            type: 'task-transition',
            values: {
              note: latestEvent.note,
              status: latestEvent.toStatus,
            },
          },
    )
    await replaceQueue([
      ...queue.filter((item) => item.id !== operation.id),
      operation,
    ])
    return operation
  },

  async getSnapshot(): Promise<OfflineSnapshot> {
    return snapshot(await getQueue())
  },

  async operationForTask(
    taskId: string,
  ): Promise<OfflineTaskTransition | null> {
    return (
      (await getQueue()).find(
        (item) => item.type === 'task-transition' && item.taskId === taskId,
      ) ?? null
    )
  },

  async projectTask(task: Task): Promise<Task> {
    const operation = await offlineService.operationForTask(task.id)
    return operation?.optimisticTask ?? task
  },

  async projectTasks(tasks: Task[]): Promise<Task[]> {
    const queue = await getQueue()
    const projections = new Map(
      queue.map((operation) => [
        operation.taskId,
        operation.optimisticTask,
      ]),
    )
    return tasksSchema.parse(
      tasks.map((task) => projections.get(task.id) ?? task),
    )
  },

  async resolveWithLocal(operationId: string): Promise<OfflineSnapshot> {
    const queue = await getQueue()
    const operation = queue.find((item) => item.id === operationId)
    if (!operation?.remoteTask) return snapshot(queue)
    const remote = operation.remoteTask
    const transitionEvents = operation.transitionEvents.map((event) => ({
      ...event,
      id: crypto.randomUUID(),
    }))
    const latestEvent = transitionEvents.at(-1)
    if (!latestEvent) return snapshot(queue)
    const optimisticTask = taskSchema.parse({
      ...remote,
      completedAt:
        latestEvent.toStatus === 'completed'
          ? latestEvent.createdAt
          : null,
      events: [...remote.events, ...transitionEvents],
      status: latestEvent.toStatus,
      updatedAt: latestEvent.createdAt,
    })
    const rebased = offlineTaskTransitionSchema.parse({
      ...operation,
      baseUpdatedAt: remote.updatedAt,
      errorMessage: null,
      optimisticTask,
      remoteTask: null,
      state: 'pending',
    })
    await replaceQueue(
      queue.map((item) => (item.id === operationId ? rebased : item)),
    )
    if (connectionIsOnline()) await synchronizeOperation(rebased)
    return offlineService.getSnapshot()
  },

  async synchronize(): Promise<OfflineSnapshot> {
    if (!connectionIsOnline()) return offlineService.getSnapshot()
    const queue = await getQueue()
    for (const operation of queue) {
      if (operation.state !== 'conflict') {
        await synchronizeOperation(operation)
      }
    }
    return offlineService.getSnapshot()
  },

  synchronizeOperation,
}
