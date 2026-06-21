import { z } from 'zod'

export const documentClassificationSchema = z.enum([
  'internal',
  'confidential',
  'restricted',
])

export const documentStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
])

export const documentLinkSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['task', 'approval']),
})

export const documentVersionSchema = z.object({
  changeSummary: z.string(),
  contentDataUrl: z.string(),
  contentHash: z.string(),
  createdAt: z.string().datetime(),
  createdByUserId: z.string(),
  fileName: z.string(),
  id: z.string(),
  mimeType: z.string(),
  number: z.number().int().positive(),
  sizeBytes: z.number().int().nonnegative(),
})

export const documentSchema = z.object({
  classification: documentClassificationSchema,
  createdAt: z.string().datetime(),
  createdByUserId: z.string(),
  departmentId: z.string(),
  description: z.string(),
  id: z.string(),
  links: z.array(documentLinkSchema),
  ownerUserId: z.string(),
  retentionCategory: z.enum([
    'operational',
    'financial',
    'legal',
    'personnel',
  ]),
  status: documentStatusSchema,
  title: z.string(),
  updatedAt: z.string().datetime(),
  versions: z.array(documentVersionSchema).min(1),
})

export const documentsSchema = z.array(documentSchema)

export const documentFormSchema = z
  .object({
    classification: documentClassificationSchema,
    departmentId: z.string().min(1, 'Select a department.'),
    description: z
      .string()
      .trim()
      .min(20, 'Provide at least 20 characters of context.')
      .max(600, 'Use no more than 600 characters.'),
    linkEntityId: z.string(),
    linkEntityType: z.enum(['', 'task', 'approval']),
    ownerUserId: z.string().min(1, 'Select an owner.'),
    retentionCategory: z.enum([
      'operational',
      'financial',
      'legal',
      'personnel',
    ]),
    title: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(120, 'Use no more than 120 characters.'),
  })
  .superRefine((values, context) => {
    if (values.linkEntityType && !values.linkEntityId) {
      context.addIssue({
        code: 'custom',
        message: 'Select the operational record to link.',
        path: ['linkEntityId'],
      })
    }
  })

export const documentVersionFormSchema = z.object({
  changeSummary: z
    .string()
    .trim()
    .min(10, 'Describe what changed in at least 10 characters.')
    .max(300, 'Use no more than 300 characters.'),
})

export const documentFilePayloadSchema = z.object({
  contentDataUrl: z.string().startsWith('data:'),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
})

export type DocumentClassification = z.infer<
  typeof documentClassificationSchema
>
export type DocumentFilePayload = z.infer<typeof documentFilePayloadSchema>
export type DocumentFormValues = z.infer<typeof documentFormSchema>
export type DocumentLink = z.infer<typeof documentLinkSchema>
export type DocumentRecord = z.infer<typeof documentSchema>
export type DocumentStatus = z.infer<typeof documentStatusSchema>
export type DocumentVersionFormValues = z.infer<
  typeof documentVersionFormSchema
>
