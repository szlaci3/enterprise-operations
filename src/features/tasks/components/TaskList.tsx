import { useQuery } from '@tanstack/react-query'
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  CollectionEmpty,
  CollectionError,
  CollectionLoading,
  FilterBar,
  SearchField,
  SegmentedControl,
  SelectFilter,
} from '../../../shared/components/CollectionWorkspace'
import { SummaryGrid } from '../../../shared/components/SummaryGrid'
import { useUrlState } from '../../../shared/hooks/useUrlState'
import { PermissionGate } from '../../access/components/PermissionGate'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { userListOptions } from '../../users/queries/userQueries'
import { taskListOptions } from '../queries/taskQueries'
import type { Task, TaskStatus } from '../schemas/taskSchemas'
import { TaskPriorityBadge, TaskStatusBadge } from './TaskBadges'
import { SavedViewToolbar } from '../../views/components/SavedViewToolbar'
import { useSavedViewUrlState } from '../../views/hooks/useSavedViewUrlState'

type QueueFilter = 'mine' | 'department' | 'all'
type ViewMode = 'list' | 'board'
type TaskSort = 'due' | 'updated' | 'priority'
const queueOptions = [
  { label: 'My work', value: 'mine' },
  { label: 'My department', value: 'department' },
  { label: 'All tasks', value: 'all' },
] as const
const taskStatuses = [
  'all',
  'backlog',
  'in-progress',
  'blocked',
  'completed',
  'cancelled',
] as const
const boardStatuses: TaskStatus[] = [
  'backlog',
  'in-progress',
  'blocked',
  'completed',
  'cancelled',
]
const taskViewDefaults = {
  q: '',
  queue: 'mine',
  sort: 'due',
  status: 'all',
  view: 'list',
}
const taskViewStateKeys = ['q', 'queue', 'sort', 'status', 'view']

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
  const [queue, setQueue] = useUrlState<QueueFilter>({
    defaultValue: 'mine',
    key: 'queue',
    values: ['mine', 'department', 'all'],
  })
  const [search, setSearch] = useUrlState<string>({
    defaultValue: '',
    key: 'q',
  })
  const [status, setStatus] = useUrlState<TaskStatus | 'all'>({
    defaultValue: 'all',
    key: 'status',
    values: taskStatuses,
  })
  const [view, setView] = useUrlState<ViewMode>({
    defaultValue: 'list',
    key: 'view',
    values: ['list', 'board'],
  })
  const [sort, setSort] = useUrlState<TaskSort>({
    defaultValue: 'due',
    key: 'sort',
    values: ['due', 'updated', 'priority'],
  })
  const savedView = useSavedViewUrlState({
    defaults: taskViewDefaults,
    stateKeys: taskViewStateKeys,
  })
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
      .sort((left, right) => {
        if (sort === 'updated') {
          return right.updatedAt.localeCompare(left.updatedAt)
        }
        if (sort === 'priority') {
          const rank = { critical: 3, high: 2, normal: 1, low: 0 }
          return (
            rank[right.priority] - rank[left.priority] ||
            left.dueDate.localeCompare(right.dueDate)
          )
        }
        return (
          left.dueDate.localeCompare(right.dueDate) ||
          right.updatedAt.localeCompare(left.updatedAt)
        )
      })
  }, [currentUser?.departmentId, queue, search, sort, status, tasks])

  if (
    tasksQuery.isPending ||
    usersQuery.isPending ||
    departmentsQuery.isPending
  ) {
    return <CollectionLoading label="Loading operational tasks" />
  }

  if (tasksQuery.isError || usersQuery.isError || departmentsQuery.isError) {
    return (
      <CollectionError
        onRetry={() => {
            tasksQuery.refetch()
            usersQuery.refetch()
            departmentsQuery.refetch()
        }}
        title="Tasks could not be loaded"
      />
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

      <SummaryGrid
        ariaLabel="Task summary"
        metrics={[
          { label: 'My open work', value: myTasks.length },
          { label: 'My overdue work', tone: 'danger', value: overdueCount },
          { label: 'Completed tasks', value: completedCount },
        ]}
      />
      <SavedViewToolbar
        hasActiveState={savedView.hasActiveState}
        onApply={savedView.apply}
        onPresentationChange={savedView.setPresentation}
        presentation={savedView.presentation}
        resource="tasks"
        state={{ q: search, queue, sort, status, view }}
      />

      <Card
        className={`overflow-hidden ${
          savedView.presentation.density === 'compact' ? 'text-sm' : ''
        }`}
      >
        <FilterBar
          primary={
            <SearchField
              label="Search tasks"
              onChange={setSearch}
              placeholder="Search task title or description"
              value={search}
            />
          }
          secondary={
            <>
              <SegmentedControl
                ariaLabel="Task queue"
                onChange={setQueue}
                options={queueOptions}
                value={queue}
              />
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
            </>
          }
        >
          <SelectFilter
            label="Filter task status"
            onChange={(event) =>
              setStatus(event.target.value as TaskStatus | 'all')
            }
            value={status}
          >
              <option value="all">All statuses</option>
              <option value="backlog">Backlog</option>
              <option value="in-progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
          </SelectFilter>
          <SelectFilter
            label="Sort tasks"
            onChange={(event) => setSort(event.target.value as TaskSort)}
            value={sort}
          >
            <option value="due">Due date</option>
            <option value="updated">Recently updated</option>
            <option value="priority">Priority</option>
          </SelectFilter>
        </FilterBar>

        {filteredTasks.length === 0 ? (
          <CollectionEmpty
            icon={<CheckCircle2 aria-hidden="true" className="size-9" />}
            title="No tasks match this queue"
          />
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
