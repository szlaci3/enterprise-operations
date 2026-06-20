import { z } from 'zod'

export const collaborationEntityTypeSchema = z.enum(['approval', 'task'])

export const collaborationCommentSchema = z.object({
  actorUserId: z.string(),
  body: z.string(),
  createdAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  editedAt: z.string().datetime().nullable(),
  entityId: z.string(),
  entityType: collaborationEntityTypeSchema,
  id: z.string(),
  mentionUserIds: z.array(z.string()),
  parentCommentId: z.string().nullable(),
})

export const collaborationCommentsSchema = z.array(collaborationCommentSchema)

export const collaborationStoreSchema = z.object({
  comments: collaborationCommentsSchema,
})

export const collaborationCommentFormSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, 'Enter at least two characters.')
    .max(2000, 'Use no more than 2,000 characters.'),
  mentionUserIds: z.array(z.string()),
  parentCommentId: z.string().nullable(),
})

export const collaborationCommentUpdateSchema =
  collaborationCommentFormSchema.pick({
    body: true,
    mentionUserIds: true,
  })

export const collaborationBusinessEventSchema = z.object({
  actorUserId: z.string(),
  createdAt: z.string().datetime(),
  id: z.string(),
  summary: z.string(),
  title: z.string(),
})

export type CollaborationBusinessEvent = z.infer<
  typeof collaborationBusinessEventSchema
>
export type CollaborationComment = z.infer<
  typeof collaborationCommentSchema
>
export type CollaborationCommentFormValues = z.infer<
  typeof collaborationCommentFormSchema
>
export type CollaborationCommentUpdate = z.infer<
  typeof collaborationCommentUpdateSchema
>
export type CollaborationEntityType = z.infer<
  typeof collaborationEntityTypeSchema
>
export type CollaborationStore = z.infer<typeof collaborationStoreSchema>
