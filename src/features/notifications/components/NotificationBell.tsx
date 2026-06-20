import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { notificationListOptions } from '../queries/notificationQueries'

export function NotificationBell() {
  const notificationsQuery = useQuery(
    notificationListOptions(currentSessionUserId),
  )
  const unreadCount =
    notificationsQuery.data?.filter((notification) => !notification.readAt)
      .length ?? 0

  return (
    <Link
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
      className="relative inline-flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      to="/notifications"
    >
      <Bell aria-hidden="true" className="size-5" />
      {unreadCount > 0 ? (
        <span className="absolute right-1 top-1 flex min-w-4.5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
