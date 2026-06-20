import type { PermissionKey } from '../../access/schemas/accessSchemas'
import { userService } from '../../users/services/userService'
import {
  getCollaborationStoreApi,
  replaceCollaborationStoreApi,
} from '../../../mocks/collaborationApi'
import {
  collaborationCommentFormSchema,
  collaborationCommentSchema,
  collaborationCommentsSchema,
  collaborationCommentUpdateSchema,
  collaborationStoreSchema,
  type CollaborationComment,
  type CollaborationCommentFormValues,
  type CollaborationCommentUpdate,
  type CollaborationEntityType,
  type CollaborationStore,
} from '../schemas/collaborationSchemas'

export class CollaborationServiceError extends Error {
  readonly code:
    | 'forbidden'
    | 'invalid-entity'
    | 'invalid-mention'
    | 'invalid-reply'
    | 'not-found'

  constructor(message: string, code: CollaborationServiceError['code']) {
    super(message)
    this.name = 'CollaborationServiceError'
    this.code = code
  }
}

function hasPermission(
  permissionKeys: PermissionKey[],
  permission: PermissionKey,
) {
  return permissionKeys.includes(permission)
}

function assertView(permissionKeys: PermissionKey[]) {
  if (!hasPermission(permissionKeys, 'collaboration.view')) {
    throw new CollaborationServiceError(
      'You do not have access to collaboration activity.',
      'forbidden',
    )
  }
}

function assertContribute(permissionKeys: PermissionKey[]) {
  if (!hasPermission(permissionKeys, 'collaboration.contribute')) {
    throw new CollaborationServiceError(
      'You do not have permission to contribute to discussions.',
      'forbidden',
    )
  }
}

async function getStore(): Promise<CollaborationStore> {
  return collaborationStoreSchema.parse(await getCollaborationStoreApi())
}

async function validateMentions(mentionUserIds: string[]) {
  const uniqueIds = [...new Set(mentionUserIds)]
  const users = await userService.list()
  const activeUserIds = new Set(
    users.filter((user) => user.status === 'active').map((user) => user.id),
  )
  if (uniqueIds.some((userId) => !activeUserIds.has(userId))) {
    throw new CollaborationServiceError(
      'A mentioned teammate is no longer active.',
      'invalid-mention',
    )
  }
  return uniqueIds
}

async function assertEntityExists(
  entityType: CollaborationEntityType,
  entityId: string,
) {
  try {
    if (entityType === 'approval') {
      const { approvalService } = await import(
        '../../approvals/services/approvalService'
      )
      await approvalService.get(entityId)
      return
    }
    const { taskService } = await import('../../tasks/services/taskService')
    await taskService.get(entityId)
  } catch {
    throw new CollaborationServiceError(
      'The discussion target no longer exists.',
      'invalid-entity',
    )
  }
}

function canManage(
  comment: CollaborationComment,
  actorUserId: string,
  permissionKeys: PermissionKey[],
) {
  return (
    comment.actorUserId === actorUserId ||
    hasPermission(permissionKeys, 'collaboration.moderate')
  )
}

export const collaborationService = {
  async listAll(): Promise<CollaborationComment[]> {
    const store = await getStore()
    return collaborationCommentsSchema.parse(store.comments)
  },

  async listEntity(
    entityType: CollaborationEntityType,
    entityId: string,
    permissionKeys: PermissionKey[],
  ): Promise<CollaborationComment[]> {
    assertView(permissionKeys)
    const store = await getStore()
    return collaborationCommentsSchema.parse(
      store.comments
        .filter(
          (comment) =>
            comment.entityType === entityType && comment.entityId === entityId,
        )
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    )
  },

  async create(
    entityType: CollaborationEntityType,
    entityId: string,
    actorUserId: string,
    permissionKeys: PermissionKey[],
    values: CollaborationCommentFormValues,
  ): Promise<CollaborationComment> {
    assertView(permissionKeys)
    assertContribute(permissionKeys)
    const parsed = collaborationCommentFormSchema.parse(values)
    const [store, mentionUserIds] = await Promise.all([
      getStore(),
      validateMentions(parsed.mentionUserIds),
      assertEntityExists(entityType, entityId),
    ])
    if (parsed.parentCommentId) {
      const parent = store.comments.find(
        (comment) =>
          comment.id === parsed.parentCommentId &&
          comment.entityType === entityType &&
          comment.entityId === entityId &&
          !comment.deletedAt,
      )
      if (!parent || parent.parentCommentId) {
        throw new CollaborationServiceError(
          'Replies can only attach to an active top-level comment.',
          'invalid-reply',
        )
      }
    }
    const comment = collaborationCommentSchema.parse({
      actorUserId,
      body: parsed.body,
      createdAt: new Date().toISOString(),
      deletedAt: null,
      editedAt: null,
      entityId,
      entityType,
      id: crypto.randomUUID(),
      mentionUserIds: mentionUserIds.filter(
        (userId) => userId !== actorUserId,
      ),
      parentCommentId: parsed.parentCommentId,
    })
    await replaceCollaborationStoreApi({
      comments: [...store.comments, comment],
    })
    return comment
  },

  async update(
    id: string,
    actorUserId: string,
    permissionKeys: PermissionKey[],
    values: CollaborationCommentUpdate,
  ): Promise<CollaborationComment> {
    assertView(permissionKeys)
    assertContribute(permissionKeys)
    const parsed = collaborationCommentUpdateSchema.parse(values)
    const [store, mentionUserIds] = await Promise.all([
      getStore(),
      validateMentions(parsed.mentionUserIds),
    ])
    const comment = store.comments.find((item) => item.id === id)
    if (!comment || comment.deletedAt) {
      throw new CollaborationServiceError(
        'The comment no longer exists.',
        'not-found',
      )
    }
    if (!canManage(comment, actorUserId, permissionKeys)) {
      throw new CollaborationServiceError(
        'Only the author or a moderator can edit this comment.',
        'forbidden',
      )
    }
    const updated = collaborationCommentSchema.parse({
      ...comment,
      body: parsed.body,
      editedAt: new Date().toISOString(),
      mentionUserIds: mentionUserIds.filter(
        (userId) => userId !== actorUserId,
      ),
    })
    await replaceCollaborationStoreApi({
      comments: store.comments.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    })
    return updated
  },

  async remove(
    id: string,
    actorUserId: string,
    permissionKeys: PermissionKey[],
  ): Promise<CollaborationComment> {
    assertView(permissionKeys)
    assertContribute(permissionKeys)
    const store = await getStore()
    const comment = store.comments.find((item) => item.id === id)
    if (!comment || comment.deletedAt) {
      throw new CollaborationServiceError(
        'The comment no longer exists.',
        'not-found',
      )
    }
    if (!canManage(comment, actorUserId, permissionKeys)) {
      throw new CollaborationServiceError(
        'Only the author or a moderator can remove this comment.',
        'forbidden',
      )
    }
    const removed = collaborationCommentSchema.parse({
      ...comment,
      body: '',
      deletedAt: new Date().toISOString(),
      mentionUserIds: [],
    })
    await replaceCollaborationStoreApi({
      comments: store.comments.map((item) =>
        item.id === removed.id ? removed : item,
      ),
    })
    return removed
  },
}
