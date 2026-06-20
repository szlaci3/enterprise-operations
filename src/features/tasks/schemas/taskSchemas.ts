import { z } from 'zod'

export const taskStatusSchema = z.enum([
  'backlog',
  'in-progress',
  'blocked',
  'completed',
  'cancelled',
])

export const taskPrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'critical',
])

const taskEventBaseSchema = z.object({
  actorUserId: z.string(),
  createdAt: z.string().datetime(),
  id: z.string(),
})

export const taskEventSchema = z.discriminatedUnion('type', [
  taskEventBaseSchema.extend({
    summary: z.string(),
    type: z.literal('created'),
  }),
  taskEventBaseSchema.extend({
    fromStatus: taskStatusSchema,
    note: z.string(),
    toStatus: taskStatusSchema,
    type: z.literal('status-changed'),
  }),
  taskEventBaseSchema.extend({
    fromUserId: z.string(),
    toUserId: z.string(),
    type: z.literal('reassigned'),
  }),
  taskEventBaseSchema.extend({
    summary: z.string(),
    type: z.literal('updated'),
  }),
])

export const taskSchema = z.object({
  approvalRequestId: z.string().nullable(),
  assigneeUserId: z.string(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  createdByUserId: z.string(),
  departmentId: z.string(),
  description: z.string(),
  dueDate: z.string().date(),
  events: z.array(taskEventSchema),
  id: z.string(),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  title: z.string(),
  updatedAt: z.string().datetime(),
})

export const tasksSchema = z.array(taskSchema)

export const taskFormSchema = z.object({
  approvalRequestId: z.string(),
  assigneeUserId: z.string().min(1, 'Select an assignee.'),
  departmentId: z.string().min(1, 'Select an accountable department.'),
  description: z
    .string()
    .trim()
    .min(20, 'Provide at least 20 characters of operational context.')
    .max(1000, 'Use no more than 1,000 characters.'),
  dueDate: z.string().date('Enter a valid due date.'),
  priority: taskPrioritySchema,
  title: z
    .string()
    .trim()
    .min(5, 'Use at least 5 characters.')
    .max(120, 'Use no more than 120 characters.'),
})

export const taskTransitionFormSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, 'Provide at least 5 characters of context.')
    .max(500, 'Use no more than 500 characters.'),
  status: taskStatusSchema,
})

export type Task = z.infer<typeof taskSchema>
export type TaskEvent = z.infer<typeof taskEventSchema>
export type TaskFormValues = z.infer<typeof taskFormSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskTransitionFormValues = z.infer<
  typeof taskTransitionFormSchema
>
