import {
  createDocumentApi,
  getDocumentApi,
  listDocumentsApi,
  updateDocumentApi,
} from '../../../mocks/documentsApi'
import { approvalService } from '../../approvals/services/approvalService'
import { departmentService } from '../../departments/services/departmentService'
import { taskService } from '../../tasks/services/taskService'
import { userService } from '../../users/services/userService'
import {
  documentFilePayloadSchema,
  documentFormSchema,
  documentSchema,
  documentsSchema,
  documentVersionFormSchema,
  type DocumentFilePayload,
  type DocumentFormValues,
  type DocumentLink,
  type DocumentRecord,
  type DocumentStatus,
  type DocumentVersionFormValues,
} from '../schemas/documentSchemas'

const maxFileBytes = 750_000
const maxDocumentBytes = 3_000_000
const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/csv',
  'text/plain',
])

export const documentStoragePolicy = {
  allowedMimeTypes: [...allowedMimeTypes],
  maxDocumentBytes,
  maxFileBytes,
}

export class DocumentServiceError extends Error {
  readonly code:
    | 'duplicate-title'
    | 'invalid-file'
    | 'invalid-link'
    | 'invalid-owner'
    | 'invalid-transition'
    | 'not-found'
    | 'storage-limit'

  constructor(message: string, code: DocumentServiceError['code']) {
    super(message)
    this.name = 'DocumentServiceError'
    this.code = code
  }
}

async function list(): Promise<DocumentRecord[]> {
  return documentsSchema.parse(await listDocumentsApi())
}

function assertFile(
  file: DocumentFilePayload,
  existingBytes = 0,
): DocumentFilePayload {
  const parsed = documentFilePayloadSchema.parse(file)
  if (!allowedMimeTypes.has(parsed.mimeType)) {
    throw new DocumentServiceError(
      'Use a PDF, PNG, JPEG, CSV, or plain-text attachment.',
      'invalid-file',
    )
  }
  if (parsed.sizeBytes > maxFileBytes) {
    throw new DocumentServiceError(
      'Each attachment version must be 750 KB or smaller.',
      'invalid-file',
    )
  }
  if (existingBytes + parsed.sizeBytes > maxDocumentBytes) {
    throw new DocumentServiceError(
      'This document has reached its 3 MB browser storage allowance.',
      'storage-limit',
    )
  }
  return parsed
}

async function contentHash(file: DocumentFilePayload) {
  const bytes = new TextEncoder().encode(file.contentDataUrl)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

async function assertActor(userId: string) {
  const user = await userService.get(userId)
  if (!user || user.status !== 'active') {
    throw new DocumentServiceError(
      'Only active managed users can change documents.',
      'invalid-owner',
    )
  }
}

async function assertRelationships(values: DocumentFormValues) {
  const [owner, department] = await Promise.all([
    userService.get(values.ownerUserId),
    departmentService.get(values.departmentId),
  ])
  if (!owner || owner.status !== 'active') {
    throw new DocumentServiceError(
      'Select an active document owner.',
      'invalid-owner',
    )
  }
  if (!department || department.status === 'inactive') {
    throw new DocumentServiceError(
      'Select an available department.',
      'invalid-owner',
    )
  }
}

async function assertLink(link: DocumentLink) {
  const entity =
    link.entityType === 'task'
      ? await taskService.get(link.entityId)
      : await approvalService.get(link.entityId)
  if (!entity) {
    throw new DocumentServiceError(
      'The selected operational record no longer exists.',
      'invalid-link',
    )
  }
}

function assertUniqueTitle(
  documents: DocumentRecord[],
  title: string,
  currentId?: string,
) {
  if (
    documents.some(
      (document) =>
        document.id !== currentId &&
        document.title.toLowerCase() === title.trim().toLowerCase(),
    )
  ) {
    throw new DocumentServiceError(
      'A document already uses this title.',
      'duplicate-title',
    )
  }
}

const allowedTransitions: Record<DocumentStatus, DocumentStatus[]> = {
  archived: ['draft'],
  draft: ['published'],
  published: ['archived'],
}

export const documentService = {
  async addLink(id: string, link: DocumentLink): Promise<DocumentRecord> {
    const document = await documentService.get(id)
    if (!document) {
      throw new DocumentServiceError('The document no longer exists.', 'not-found')
    }
    await assertLink(link)
    if (
      document.links.some(
        (item) =>
          item.entityId === link.entityId &&
          item.entityType === link.entityType,
      )
    ) {
      return document
    }
    return documentSchema.parse(
      await updateDocumentApi({
        ...document,
        links: [...document.links, link],
        updatedAt: new Date().toISOString(),
      }),
    )
  },

  async addVersion(
    id: string,
    actorUserId: string,
    values: DocumentVersionFormValues,
    filePayload: DocumentFilePayload,
  ): Promise<DocumentRecord> {
    const [document] = await Promise.all([
      documentService.get(id),
      assertActor(actorUserId),
    ])
    if (!document) {
      throw new DocumentServiceError('The document no longer exists.', 'not-found')
    }
    const parsed = documentVersionFormSchema.parse(values)
    const existingBytes = document.versions.reduce(
      (total, version) => total + version.sizeBytes,
      0,
    )
    const file = assertFile(filePayload, existingBytes)
    const now = new Date().toISOString()
    const updated: DocumentRecord = {
      ...document,
      status: document.status === 'archived' ? 'draft' : document.status,
      updatedAt: now,
      versions: [
        ...document.versions,
        {
          ...file,
          changeSummary: parsed.changeSummary,
          contentHash: await contentHash(file),
          createdAt: now,
          createdByUserId: actorUserId,
          id: crypto.randomUUID(),
          number: document.versions.length + 1,
        },
      ],
    }
    return documentSchema.parse(await updateDocumentApi(updated))
  },

  async create(
    actorUserId: string,
    values: DocumentFormValues,
    filePayload: DocumentFilePayload,
  ): Promise<DocumentRecord> {
    const parsed = documentFormSchema.parse(values)
    const documents = await list()
    assertUniqueTitle(documents, parsed.title)
    await Promise.all([assertActor(actorUserId), assertRelationships(parsed)])
    const file = assertFile(filePayload)
    const link =
      parsed.linkEntityType && parsed.linkEntityId
        ? {
            entityId: parsed.linkEntityId,
            entityType: parsed.linkEntityType,
          }
        : null
    if (link) await assertLink(link)
    const now = new Date().toISOString()
    const document: DocumentRecord = {
      classification: parsed.classification,
      createdAt: now,
      createdByUserId: actorUserId,
      departmentId: parsed.departmentId,
      description: parsed.description,
      id: crypto.randomUUID(),
      links: link ? [link] : [],
      ownerUserId: parsed.ownerUserId,
      retentionCategory: parsed.retentionCategory,
      status: 'draft',
      title: parsed.title,
      updatedAt: now,
      versions: [
        {
          ...file,
          changeSummary: 'Initial document version.',
          contentHash: await contentHash(file),
          createdAt: now,
          createdByUserId: actorUserId,
          id: crypto.randomUUID(),
          number: 1,
        },
      ],
    }
    return documentSchema.parse(await createDocumentApi(document))
  },

  async get(id: string): Promise<DocumentRecord | null> {
    const response = await getDocumentApi(id)
    return response === null ? null : documentSchema.parse(response)
  },

  list,

  async listForEntity(link: DocumentLink): Promise<DocumentRecord[]> {
    return (await list()).filter((document) =>
      document.links.some(
        (item) =>
          item.entityId === link.entityId &&
          item.entityType === link.entityType,
      ),
    )
  },

  async removeLink(id: string, link: DocumentLink): Promise<DocumentRecord> {
    const document = await documentService.get(id)
    if (!document) {
      throw new DocumentServiceError('The document no longer exists.', 'not-found')
    }
    return documentSchema.parse(
      await updateDocumentApi({
        ...document,
        links: document.links.filter(
          (item) =>
            item.entityId !== link.entityId ||
            item.entityType !== link.entityType,
        ),
        updatedAt: new Date().toISOString(),
      }),
    )
  },

  async transition(
    id: string,
    actorUserId: string,
    status: DocumentStatus,
  ): Promise<DocumentRecord> {
    const [document] = await Promise.all([
      documentService.get(id),
      assertActor(actorUserId),
    ])
    if (!document) {
      throw new DocumentServiceError('The document no longer exists.', 'not-found')
    }
    if (!allowedTransitions[document.status].includes(status)) {
      throw new DocumentServiceError(
        `A ${document.status} document cannot transition directly to ${status}.`,
        'invalid-transition',
      )
    }
    return documentSchema.parse(
      await updateDocumentApi({
        ...document,
        status,
        updatedAt: new Date().toISOString(),
      }),
    )
  },
}
