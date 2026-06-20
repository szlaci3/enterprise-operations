import { z } from 'zod'

export const approvalPrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent',
])

export const approvalCategorySchema = z.enum([
  'operational-change',
  'financial-control',
  'access-exception',
  'policy-exception',
  'service-exception',
])

export const approvalStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
])

export const approvalStepStatusSchema = z.enum([
  'waiting',
  'pending',
  'approved',
  'rejected',
])

export const approvalStepSchema = z.object({
  actedAt: z.string().datetime().nullable(),
  assignedUserId: z.string(),
  comment: z.string().nullable(),
  delegatedByUserId: z.string().nullable(),
  dueAt: z.string().datetime(),
  escalationTargetUserId: z.string().nullable(),
  id: z.string(),
  originalAssignedUserId: z.string(),
  sequence: z.number().int().positive(),
  status: approvalStepStatusSchema,
})

const approvalEventBaseSchema = z.object({
  actorUserId: z.string(),
  createdAt: z.string().datetime(),
  id: z.string(),
})

export const approvalEventSchema = z.discriminatedUnion('type', [
  approvalEventBaseSchema.extend({
    summary: z.string(),
    type: z.literal('submitted'),
  }),
  approvalEventBaseSchema.extend({
    comment: z.string(),
    decision: z.enum(['approved', 'rejected']),
    stepId: z.string(),
    type: z.literal('decision'),
  }),
  approvalEventBaseSchema.extend({
    fromUserId: z.string(),
    stepId: z.string(),
    toUserId: z.string(),
    type: z.literal('delegated'),
  }),
  approvalEventBaseSchema.extend({
    fromUserId: z.string(),
    stepId: z.string(),
    toUserId: z.string(),
    type: z.literal('escalated'),
  }),
])

export const approvalWorkflowSnapshotSchema = z.object({
  definitionId: z.string(),
  name: z.string(),
  version: z.number().int().positive(),
  workflowKey: z.string(),
})

export const approvalRequestSchema = z.object({
  category: approvalCategorySchema,
  createdAt: z.string().datetime(),
  currentStateId: z.string(),
  description: z.string(),
  dueDate: z.string().date(),
  events: z.array(approvalEventSchema),
  id: z.string(),
  priority: approvalPrioritySchema,
  requesterUserId: z.string(),
  status: approvalStatusSchema,
  steps: z.array(approvalStepSchema),
  title: z.string(),
  updatedAt: z.string().datetime(),
  workflow: approvalWorkflowSnapshotSchema,
})

export const approvalRequestsSchema = z.array(approvalRequestSchema)

export const approvalRequestFormSchema = z
  .object({
    category: approvalCategorySchema,
    description: z
      .string()
      .trim()
      .min(30, 'Provide at least 30 characters of business context.')
      .max(1000, 'Use no more than 1,000 characters.'),
    dueDate: z.string().date('Enter a valid due date.'),
    priority: approvalPrioritySchema,
    reviewerIds: z
      .array(z.string().min(1, 'Select a reviewer.'))
      .min(1, 'Select at least one reviewer.')
      .max(5, 'Approval chains support up to five reviewers.'),
    title: z
      .string()
      .trim()
      .min(5, 'Use at least 5 characters.')
      .max(120, 'Use no more than 120 characters.'),
    workflowDefinitionId: z.string().min(1, 'Select an active workflow.'),
  })
  .superRefine((values, context) => {
    if (new Set(values.reviewerIds).size !== values.reviewerIds.length) {
      context.addIssue({
        code: 'custom',
        message: 'Each reviewer may appear only once in the approval chain.',
        path: ['reviewerIds'],
      })
    }
  })

export const approvalDecisionFormSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(10, 'Provide at least 10 characters of decision context.')
    .max(500, 'Use no more than 500 characters.'),
  decision: z.enum(['approved', 'rejected']),
})

export type ApprovalCategory = z.infer<typeof approvalCategorySchema>
export type ApprovalDecisionFormValues = z.infer<
  typeof approvalDecisionFormSchema
>
export type ApprovalEvent = z.infer<typeof approvalEventSchema>
export type ApprovalPriority = z.infer<typeof approvalPrioritySchema>
export type ApprovalRequest = z.infer<typeof approvalRequestSchema>
export type ApprovalRequestFormValues = z.infer<
  typeof approvalRequestFormSchema
>
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>
export type ApprovalStep = z.infer<typeof approvalStepSchema>
