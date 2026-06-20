import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  notificationListOptions,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '../queries/notificationQueries'
import type {
  Notification,
  NotificationCategory,
} from '../schemas/notificationSchemas'

type ReadFilter = 'all' | 'unread'

function NotificationIcon({ notification }: { notification: Notification }) {
  const Icon =
    notification.category === 'approval'
      ? ShieldAlert
      : notification.category === 'collaboration'
        ? MessageCircle
      : notification.category === 'task'
        ? ClipboardCheck
        : Bell
  const color =
    notification.severity === 'critical'
      ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
      : notification.severity === 'success'
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
        : notification.severity === 'warning'
          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
          : 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'
  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${color}`}
    >
      <Icon aria-hidden="true" className="size-5" />
    </span>
  )
}

export function NotificationInbox() {
  const notificationsQuery = useQuery(
    notificationListOptions(currentSessionUserId),
  )
  const markRead = useMarkNotificationRead(currentSessionUserId)
  const markAllRead = useMarkAllNotificationsRead(currentSessionUserId)
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all')
  const notifications = useMemo(
    () => notificationsQuery.data ?? [],
    [notificationsQuery.data],
  )
  const filtered = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          (readFilter === 'all' || !notification.readAt) &&
          (category === 'all' || notification.category === category),
      ),
    [category, notifications, readFilter],
  )

  if (notificationsQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading notifications</span>
      </Card>
    )
  }

  if (notificationsQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">
          Notifications could not be loaded
        </h1>
        <Button
          className="mt-5"
          onClick={() => notificationsQuery.refetch()}
        >
          Retry
        </Button>
      </Card>
    )
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
            variant="secondary"
          >
            <CheckCheck aria-hidden="true" className="size-4" />
            Mark all read
          </Button>
        }
        description="Review actionable activity from approvals, operational work, and team mentions, with read state synchronized across the workspace."
        eyebrow="Communication"
        title="Notifications"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mentions
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {
              notifications.filter(
                (notification) => notification.category === 'collaboration',
              ).length
            }
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Unread</p>
          <p className="mt-2 text-2xl font-semibold">{unreadCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Approval updates
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {
              notifications.filter(
                (notification) => notification.category === 'approval',
              ).length
            }
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Task updates
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {
              notifications.filter(
                (notification) => notification.category === 'task',
              ).length
            }
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
          <div className="flex gap-2">
            {(['all', 'unread'] as const).map((value) => (
              <button
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  readFilter === value
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                key={value}
                onClick={() => setReadFilter(value)}
                type="button"
              >
                {value === 'all' ? 'All' : 'Unread'}
              </button>
            ))}
          </div>
          <select
            aria-label="Filter notification category"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm sm:ml-auto dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) => {
              const value = event.target.value
              if (
                value === 'all' ||
                value === 'approval' ||
                value === 'collaboration' ||
                value === 'task' ||
                value === 'system'
              ) {
                setCategory(value)
              }
            }}
            value={category}
          >
            <option value="all">All categories</option>
            <option value="approval">Approvals</option>
            <option value="collaboration">Collaboration</option>
            <option value="task">Tasks</option>
            <option value="system">System</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">You are all caught up</p>
            <p className="mt-1 text-sm text-slate-500">
              No notifications match this view.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((notification) => (
              <Link
                className={`flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                  notification.readAt
                    ? ''
                    : 'bg-brand-50/40 dark:bg-brand-950/20'
                }`}
                key={notification.id}
                onClick={() => {
                  if (!notification.readAt) {
                    markRead.mutate(notification.id)
                  }
                }}
                to={notification.actionUrl}
              >
                <NotificationIcon notification={notification} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{notification.title}</p>
                    {!notification.readAt ? <Badge tone="blue">New</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="mt-2 size-5 shrink-0 text-slate-400"
                />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
