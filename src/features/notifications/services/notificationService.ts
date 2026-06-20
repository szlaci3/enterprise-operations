import {
  getNotificationPreferencesApi,
  getNotificationStoreApi,
  listNotificationPreferencesApi,
  replaceNotificationStoreApi,
  updateNotificationPreferencesApi,
} from '../../../mocks/notificationsApi'
import {
  notificationPreferencesFormSchema,
  notificationPreferencesListSchema,
  notificationPreferencesSchema,
  notificationSchema,
  notificationsSchema,
  notificationStoreSchema,
  type Notification,
  type NotificationPreferences,
  type NotificationPreferencesFormValues,
  type NotificationSeverity,
  type NotificationStore,
  type NotificationSubscription,
} from '../schemas/notificationSchemas'

interface NotificationEmission {
  actionUrl: string
  createdAt: string
  message: string
  recipientUserId: string
  severity: NotificationSeverity
  sourceEntityId: string
  sourceEventKey: string
  subscription: NotificationSubscription
  title: string
  category: 'approval' | 'task'
}

function preferenceFor(
  userId: string,
  preferences: NotificationPreferences[],
) {
  return preferences.find((preference) => preference.userId === userId)
}

function shouldDeliver(
  emission: NotificationEmission,
  preferences: NotificationPreferences[],
) {
  const preference = preferenceFor(emission.recipientUserId, preferences)
  return (
    !preference ||
    (preference.inAppEnabled &&
      preference.subscriptions[emission.subscription])
  )
}

async function deriveEmissions(): Promise<NotificationEmission[]> {
  const [{ approvalService }, { taskService }] = await Promise.all([
    import('../../approvals/services/approvalService'),
    import('../../tasks/services/taskService'),
  ])
  const [approvals, tasks] = await Promise.all([
    approvalService.list(),
    taskService.list(),
  ])
  const emissions: NotificationEmission[] = []

  for (const approval of approvals) {
    for (const event of approval.events) {
      if (event.type === 'submitted') {
        const firstReviewer = approval.steps.find(
          (step) => step.sequence === 1,
        )
        if (firstReviewer) {
          emissions.push({
            actionUrl: `/approvals/${approval.id}`,
            category: 'approval',
            createdAt: event.createdAt,
            message: `${approval.title} is ready for your review.`,
            recipientUserId: firstReviewer.originalAssignedUserId,
            severity: approval.priority === 'urgent' ? 'critical' : 'warning',
            sourceEntityId: approval.id,
            sourceEventKey: `approval:${event.id}:assigned`,
            subscription: 'approval-assigned',
            title: 'Approval assigned',
          })
        }
      }

      if (event.type === 'decision') {
        emissions.push({
          actionUrl: `/approvals/${approval.id}`,
          category: 'approval',
          createdAt: event.createdAt,
          message: `${approval.title} was ${event.decision}.`,
          recipientUserId: approval.requesterUserId,
          severity: event.decision === 'approved' ? 'success' : 'critical',
          sourceEntityId: approval.id,
          sourceEventKey: `approval:${event.id}:decision`,
          subscription: 'approval-decision',
          title: `Approval ${event.decision}`,
        })
        const decidedStep = approval.steps.find(
          (step) => step.id === event.stepId,
        )
        const nextStep = approval.steps.find(
          (step) => step.sequence === (decidedStep?.sequence ?? 0) + 1,
        )
        if (event.decision === 'approved' && nextStep) {
          emissions.push({
            actionUrl: `/approvals/${approval.id}`,
            category: 'approval',
            createdAt: event.createdAt,
            message: `${approval.title} has reached your review step.`,
            recipientUserId: nextStep.originalAssignedUserId,
            severity: 'warning',
            sourceEntityId: approval.id,
            sourceEventKey: `approval:${event.id}:next-assigned`,
            subscription: 'approval-assigned',
            title: 'Approval assigned',
          })
        }
      }

      if (event.type === 'delegated' || event.type === 'escalated') {
        emissions.push({
          actionUrl: `/approvals/${approval.id}`,
          category: 'approval',
          createdAt: event.createdAt,
          message:
            event.type === 'delegated'
              ? `${approval.title} was delegated to you.`
              : `${approval.title} was escalated to you.`,
          recipientUserId: event.toUserId,
          severity: event.type === 'escalated' ? 'critical' : 'warning',
          sourceEntityId: approval.id,
          sourceEventKey: `approval:${event.id}:${event.type}`,
          subscription:
            event.type === 'delegated'
              ? 'approval-delegated'
              : 'approval-escalated',
          title:
            event.type === 'delegated'
              ? 'Approval delegated'
              : 'Approval escalated',
        })
      }
    }
  }

  for (const task of tasks) {
    const firstReassignment = task.events.find(
      (event) => event.type === 'reassigned',
    )
    const initialAssigneeId =
      firstReassignment?.type === 'reassigned'
        ? firstReassignment.fromUserId
        : task.assigneeUserId
    for (const event of task.events) {
      if (event.type === 'created') {
        emissions.push({
          actionUrl: `/tasks/${task.id}`,
          category: 'task',
          createdAt: event.createdAt,
          message: `${task.title} was assigned to you.`,
          recipientUserId: initialAssigneeId,
          severity: task.priority === 'critical' ? 'critical' : 'info',
          sourceEntityId: task.id,
          sourceEventKey: `task:${event.id}:assigned`,
          subscription: 'task-assigned',
          title: 'Task assigned',
        })
      }
      if (event.type === 'reassigned') {
        emissions.push({
          actionUrl: `/tasks/${task.id}`,
          category: 'task',
          createdAt: event.createdAt,
          message: `${task.title} was reassigned to you.`,
          recipientUserId: event.toUserId,
          severity: task.priority === 'critical' ? 'critical' : 'warning',
          sourceEntityId: task.id,
          sourceEventKey: `task:${event.id}:reassigned`,
          subscription: 'task-assigned',
          title: 'Task reassigned',
        })
      }
      if (
        event.type === 'status-changed' &&
        task.createdByUserId !== event.actorUserId
      ) {
        emissions.push({
          actionUrl: `/tasks/${task.id}`,
          category: 'task',
          createdAt: event.createdAt,
          message: `${task.title} moved to ${event.toStatus.replace('-', ' ')}.`,
          recipientUserId: task.createdByUserId,
          severity:
            event.toStatus === 'blocked'
              ? 'critical'
              : event.toStatus === 'completed'
                ? 'success'
                : 'info',
          sourceEntityId: task.id,
          sourceEventKey: `task:${event.id}:status`,
          subscription: 'task-status',
          title: 'Task status changed',
        })
      }
    }
  }

  return emissions
}

async function getStore(): Promise<NotificationStore> {
  return notificationStoreSchema.parse(await getNotificationStoreApi())
}

async function synchronize(): Promise<NotificationStore> {
  const { userService } = await import('../../users/services/userService')
  const [store, emissions, preferences, users] = await Promise.all([
    getStore(),
    deriveEmissions(),
    notificationPreferencesListSchema.parse(
      await listNotificationPreferencesApi(),
    ),
    userService.list(),
  ])
  const activeUserIds = new Set(
    users.filter((user) => user.status === 'active').map((user) => user.id),
  )
  const processed = new Set(store.processedEventKeys)
  const pending = emissions.filter(
    (emission) => !processed.has(emission.sourceEventKey),
  )
  if (pending.length === 0) {
    return store
  }

  const notifications: Notification[] = pending
    .filter(
      (emission) =>
        activeUserIds.has(emission.recipientUserId) &&
        shouldDeliver(emission, preferences),
    )
    .map((emission) =>
      notificationSchema.parse({
        ...emission,
        id: crypto.randomUUID(),
        readAt: null,
      }),
    )
  const synchronized = notificationStoreSchema.parse({
    notifications: [...store.notifications, ...notifications],
    processedEventKeys: [
      ...store.processedEventKeys,
      ...pending.map((emission) => emission.sourceEventKey),
    ],
  })
  return notificationStoreSchema.parse(
    await replaceNotificationStoreApi(synchronized),
  )
}

export const notificationService = {
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return notificationPreferencesSchema.parse(
      await getNotificationPreferencesApi(userId),
    )
  },

  async list(userId: string): Promise<Notification[]> {
    const store = await synchronize()
    return notificationsSchema.parse(
      store.notifications
        .filter((notification) => notification.recipientUserId === userId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    )
  },

  async markAllRead(userId: string): Promise<Notification[]> {
    const store = await synchronize()
    const now = new Date().toISOString()
    const updated = {
      ...store,
      notifications: store.notifications.map((notification) =>
        notification.recipientUserId === userId && !notification.readAt
          ? { ...notification, readAt: now }
          : notification,
      ),
    }
    await replaceNotificationStoreApi(updated)
    return notificationService.list(userId)
  },

  async markRead(id: string, userId: string): Promise<Notification> {
    const store = await synchronize()
    const notification = store.notifications.find(
      (item) => item.id === id && item.recipientUserId === userId,
    )
    if (!notification) {
      throw new Error('The notification no longer exists.')
    }
    const updatedNotification = {
      ...notification,
      readAt: notification.readAt ?? new Date().toISOString(),
    }
    await replaceNotificationStoreApi({
      ...store,
      notifications: store.notifications.map((item) =>
        item.id === id ? updatedNotification : item,
      ),
    })
    return notificationSchema.parse(updatedNotification)
  },

  async updatePreferences(
    userId: string,
    values: NotificationPreferencesFormValues,
  ): Promise<NotificationPreferences> {
    const parsed = notificationPreferencesFormSchema.parse(values)
    return notificationPreferencesSchema.parse(
      await updateNotificationPreferencesApi({
        ...parsed,
        updatedAt: new Date().toISOString(),
        userId,
      }),
    )
  },
}
