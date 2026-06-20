import { useQuery } from '@tanstack/react-query'
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { userListOptions } from '../../users/queries/userQueries'
import { taskListOptions } from '../queries/taskQueries'
import type { Task, TaskStatus } from '../schemas/taskSchemas'
import { TaskPriorityBadge, TaskStatusBadge } from './TaskBadges'

type QueueFilter = 'mine' | 'department' | 'all'
type ViewMode = 'list' | 'board'
const boardStatuses: TaskStatus[] = [
  'backlog',
  'in-progress',
  'blocked',
  'completed',
  'cancelled',
]

function TaskRow({
  task,
  assigneeName,
  departmentName,
  currentTime,
}: {
  task: Task
  assigneeName: string
  departmentName: string
  currentTime: number
}) {
  const overdue =
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    new Date(task.dueDate).getTime() < currentTime
  return (
    <Link
      className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
      to={`/tasks/${task.id}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-semibold">{task.title}</h2>
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {assigneeName} · {departmentName}
        </p>
        <p
          className={`mt-2 text-xs ${
            overdue ? 'font-semibold text-red-600' : 'text-slate-400'
          }`}
        >
          Due {new Date(task.dueDate).toLocaleDateString()}
          {overdue ? ' · Overdue' : ''}
        </p>
      </div>
      <ChevronRight aria-hidden="true" className="size-5 text-slate-400" />
    </Link>
  )
}

export function TaskList() {
  const tasksQuery = useQuery(taskListOptions())
  const usersQuery = useQuery(userListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const [currentTime] = useState(() => Date.now())
  const [queue, setQueue] = useState<QueueFilter>('mine')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | 'all'>('all')
  const [view, setView] = useState<ViewMode>('list')
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data])
  const users = usersQuery.data ?? []
  const departments = departmentsQuery.data ?? []
  const currentUser = users.find((user) => user.id === currentSessionUserId)
  const userById = new Map(users.map((user) => [user.id, user]))
  const departmentById = new Map(
    departments.map((department) => [department.id, department]),
  )

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return tasks
      .filter((task) => {
        if (queue === 'mine') return task.assigneeUserId === currentSessionUserId
        if (queue === 'department') {
          return task.departmentId === currentUser?.departmentId
        }
        return true
      })
      .filter((task) => status === 'all' || task.status === status)
      .filter(
        (task) =>
          !normalizedSearch ||
          [task.title, task.description].some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          ),
      )
      .sort(
        (left, right) =>
          left.dueDate.localeCompare(right.dueDate) ||
          right.updatedAt.localeCompare(left.updatedAt),
      )
  }, [currentUser?.departmentId, queue, search, status, tasks])

  if (
    tasksQuery.isPending ||
    usersQuery.isPending ||
    departmentsQuery.isPending
  ) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading operational tasks</span>
      </Card>
    )
  }

  if (tasksQuery.isError || usersQuery.isError || departmentsQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Tasks could not be loaded</h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            tasksQuery.refetch()
            usersQuery.refetch()
            departmentsQuery.refetch()
          }}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  const myTasks = tasks.filter(
    (task) =>
      task.assigneeUserId === currentSessionUserId &&
      !['completed', 'cancelled'].includes(task.status),
  )
  const overdueCount = myTasks.filter(
    (task) => new Date(task.dueDate).getTime() < currentTime,
  ).length
  const completedCount = tasks.filter(
    (task) => task.status === 'completed',
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <PermissionGate permission="tasks.manage">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              to="/tasks/new"
            >
              <Plus aria-hidden="true" className="size-4" />
              New task
            </Link>
          </PermissionGate>
        }
        description="Prioritize assigned work, coordinate department delivery, and connect operational follow-through to governed decisions."
        eyebrow="Operations"
        title="Task management"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            My open work
          </p>
          <p className="mt-2 text-2xl font-semibold">{myTasks.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            My overdue work
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {overdueCount}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completed tasks
          </p>
          <p className="mt-2 text-2xl font-semibold">{completedCount}</p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(['mine', 'department', 'all'] as const).map((value) => (
                <button
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    queue === value
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  key={value}
                  onClick={() => setQueue(value)}
                  type="button"
                >
                  {value === 'mine'
                    ? 'My work'
                    : value === 'department'
                      ? 'My department'
                      : 'All tasks'}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-slate-200 p-1 dark:border-slate-700">
              <button
                aria-label="List view"
                className={`rounded-md p-2 ${view === 'list' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                onClick={() => setView('list')}
                type="button"
              >
                <List aria-hidden="true" className="size-4" />
              </button>
              <button
                aria-label="Board view"
                className={`rounded-md p-2 ${view === 'board' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                onClick={() => setView('board')}
                type="button"
              >
                <LayoutGrid aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search tasks</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task title or description"
                type="search"
                value={search}
              />
            </label>
            <select
              aria-label="Filter task status"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === 'all' ||
                  value === 'backlog' ||
                  value === 'in-progress' ||
                  value === 'blocked' ||
                  value === 'completed' ||
                  value === 'cancelled'
                ) {
                  setStatus(value)
                }
              }}
              value={status}
            >
              <option value="all">All statuses</option>
              <option value="backlog">Backlog</option>
              <option value="in-progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No tasks match this queue</p>
          </div>
        ) : view === 'list' ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => {
              const assignee = userById.get(task.assigneeUserId)
              return (
                <TaskRow
                  assigneeName={
                    assignee
                      ? `${assignee.firstName} ${assignee.lastName}`
                      : 'Unknown assignee'
                  }
                  currentTime={currentTime}
                  departmentName={
                    departmentById.get(task.departmentId)?.name ??
                    'Unknown department'
                  }
                  key={task.id}
                  task={task}
                />
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 overflow-x-auto p-4 xl:grid-cols-5">
            {boardStatuses.map((boardStatus) => {
              const columnTasks = filteredTasks.filter(
                (task) => task.status === boardStatus,
              )
              return (
                <section
                  className="min-w-64 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40"
                  key={boardStatus}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <TaskStatusBadge status={boardStatus} />
                    <span className="text-xs font-semibold text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <Link
                        className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
                        key={task.id}
                        to={`/tasks/${task.id}`}
                      >
                        <p className="text-sm font-semibold">{task.title}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority={task.priority} />
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarClock
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
