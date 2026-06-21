import { z } from 'zod'
import {
  taskSchema,
  taskStatusSchema,
  taskTransitionFormSchema,
} from '../../tasks/schemas/taskSchemas'

const taskStatusEventSchema = z.object({
  actorUserId: z.string(),
  createdAt: z.string().datetime(),
  fromStatus: taskStatusSchema,
  id: z.string(),
  note: z.string(),
  toStatus: taskStatusSchema,
  type: z.literal('status-changed'),
})

export const offlineTaskTransitionSchema = z.object({
  actorUserId: z.string(),
  baseUpdatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  errorMessage: z.string().nullable(),
  id: z.string(),
  lastAttemptAt: z.string().datetime().nullable(),
  optimisticTask: taskSchema,
  remoteTask: taskSchema.nullable(),
  state: z.enum(['pending', 'conflict', 'failed']),
  taskId: z.string(),
  transitionEvents: z.array(taskStatusEventSchema).min(1),
  type: z.literal('task-transition'),
  values: taskTransitionFormSchema,
})

export const offlineQueueSchema = z.array(offlineTaskTransitionSchema)

export const offlineSnapshotSchema = z.object({
  conflictCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  operations: offlineQueueSchema,
  pendingCount: z.number().int().nonnegative(),
})

export type OfflineSnapshot = z.infer<typeof offlineSnapshotSchema>
export type OfflineTaskTransition = z.infer<
  typeof offlineTaskTransitionSchema
>
