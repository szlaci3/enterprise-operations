import {
  collaborationStoreSchema,
  type CollaborationStore,
} from '../features/collaboration/schemas/collaborationSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'

const collaborationStorageKey = 'enterprise-operations-collaboration'

const seedStore: CollaborationStore = {
  comments: [
    {
      actorUserId: 'user-maya-chen',
      body: 'The control owners are aligned. @Avery, please confirm the executive review cadence before we close the exception.',
      createdAt: '2026-06-19T09:20:00.000Z',
      deletedAt: null,
      editedAt: null,
      entityId: 'task-sla-exception-controls',
      entityType: 'task',
      id: 'comment-sla-review-cadence',
      mentionUserIds: ['user-avery-morgan'],
      parentCommentId: null,
    },
    {
      actorUserId: 'user-avery-morgan',
      body: 'Confirmed. I will include the weekly review and the escalation threshold in the final operating note.',
      createdAt: '2026-06-19T10:05:00.000Z',
      deletedAt: null,
      editedAt: null,
      entityId: 'task-sla-exception-controls',
      entityType: 'task',
      id: 'comment-sla-review-reply',
      mentionUserIds: [],
      parentCommentId: 'comment-sla-review-cadence',
    },
    {
      actorUserId: 'user-elena-rossi',
      body: 'The compensating controls are sufficient for this review. @Avery, keep the expiry checkpoint visible in the approval record.',
      createdAt: '2026-06-18T13:35:00.000Z',
      deletedAt: null,
      editedAt: null,
      entityId: 'approval-service-exception-1042',
      entityType: 'approval',
      id: 'comment-approval-expiry-checkpoint',
      mentionUserIds: ['user-avery-morgan'],
      parentCommentId: null,
    },
  ],
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const collaborationStore = createVersionedStore({
  key: collaborationStorageKey,
  schema: collaborationStoreSchema,
  seed: () => seedStore,
  version: 1,
})

export async function getCollaborationStoreApi(): Promise<unknown> {
  await delay(160)
  return collaborationStore.read()
}

export async function replaceCollaborationStoreApi(
  store: CollaborationStore,
): Promise<unknown> {
  await delay(260)
  return collaborationStore.write(store)
}
