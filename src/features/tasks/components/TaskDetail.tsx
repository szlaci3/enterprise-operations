import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Pencil,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import { approvalDetailOptions } from '../../approvals/queries/approvalQueries'
import { EntityAuditPanel } from '../../audit/components/EntityAuditPanel'
import { EntityCollaborationPanel } from '../../collaboration/components/EntityCollaborationPanel'
import type { CollaborationBusinessEvent } from '../../collaboration/schemas/collaborationSchemas'
import { departmentDetailOptions } from '../../departments/queries/departmentQueries'
import { userListOptions } from '../../users/queries/userQueries'
import {
  taskDetailOptions,
  useTransitionTask,
} from '../queries/taskQueries'
import {
  taskTransitionFormSchema,
  type TaskEvent,
  type TaskStatus,
  type TaskTransitionFormValues,
} from '../schemas/taskSchemas'
import { TaskPriorityBadge, TaskStatusBadge } from './TaskBadges'

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

const transitionOptions: Record<TaskStatus, TaskStatus[]> = {
  backlog: ['in-progress', 'cancelled'],
  blocked: ['in-progress', 'cancelled'],
  cancelled: ['backlog'],
  completed: ['in-progress'],
  'in-progress': ['blocked', 'completed', 'cancelled'],
}

function eventTitle(event: TaskEvent) {
  if (event.type === 'created') return event.summary
  if (event.type === 'updated') return event.summary
  if (event.type === 'reassigned') return 'Task reassigned'
  return `Status changed to ${event.toStatus.replace('-', ' ')}`
}

export function TaskDetail() {
  const { taskId = '' } = useParams()
  const taskQuery = useQuery(taskDetailOptions(taskId))
  const usersQuery = useQuery(userListOptions())
  const departmentQuery = useQuery({
    ...departmentDetailOptions(taskQuery.data?.departmentId ?? ''),
    enabled: Boolean(taskQuery.data),
  })
  const approvalQuery = useQuery({
    ...approvalDetailOptions(taskQuery.data?.approvalRequestId ?? ''),
    enabled: Boolean(taskQuery.data?.approvalRequestId),
  })
  const transitionTask = useTransitionTask(taskId, currentSessionUserId)
  const [currentTime] = useState(() => Date.now())
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<TaskTransitionFormValues>({
    defaultValues: { note: '', status: 'in-progress' },
    resolver: zodResolver(taskTransitionFormSchema),
  })

  useEffect(() => {
    const task = taskQuery.data
    if (!task) {
      return
    }
    reset({
      note: '',
      status: transitionOptions[task.status][0] ?? task.status,
    })
  }, [reset, taskQuery.data])

  if (
    taskQuery.isPending ||
    usersQuery.isPending ||
    departmentQuery.isPending ||
    (Boolean(taskQuery.data?.approvalRequestId) && approvalQuery.isPending)
  ) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading task</span>
      </Card>
    )
  }

  const task = taskQuery.data
  if (
    taskQuery.isError ||
    usersQuery.isError ||
    departmentQuery.isError ||
    (Boolean(taskQuery.data?.approvalRequestId) && approvalQuery.isError) ||
    !task
  ) {
    return (
      <Card className="p-8 text-center">
        <ClipboardCheck
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Task unavailable</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/tasks">
          Back to tasks
        </Link>
      </Card>
    )
  }

  const users = usersQuery.data ?? []
  const userById = new Map(users.map((user) => [user.id, user]))
  const assignee = userById.get(task.assigneeUserId)
  const creator = userById.get(task.createdByUserId)
  const overdue =
    !['completed', 'cancelled'].includes(task.status) &&
    new Date(task.dueDate).getTime() < currentTime
  const options = transitionOptions[task.status]
  const businessEvents: CollaborationBusinessEvent[] = task.events.map(
    (event) => ({
      actorUserId: event.actorUserId,
      createdAt: event.createdAt,
      id: event.id,
      summary:
        event.type === 'status-changed'
          ? event.note
          : event.type === 'reassigned'
            ? `${
                userById.get(event.fromUserId)?.firstName ??
                'Previous assignee'
              } → ${
                userById.get(event.toUserId)?.firstName ?? 'New assignee'
              }`
            : event.summary,
      title: eventTitle(event),
    }),
  )

  const submitTransition = handleSubmit(async (values) => {
    try {
      await transitionTask.mutateAsync(values)
      reset({ note: '', status: values.status })
    } catch {
      setError('root.server', {
        message: 'The task status could not be updated.',
      })
    }
  })

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/tasks"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Tasks
      </Link>
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            <PermissionGate permission="tasks.manage">
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                to={`/tasks/${task.id}/edit`}
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit task
              </Link>
            </PermissionGate>
          </div>
        }
        description={task.description}
        eyebrow={`Operational task · ${task.id.slice(0, 12)}`}
        title={task.title}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Assignee</p>
          <p className="mt-2 flex items-center gap-2 font-semibold">
            <UserRound aria-hidden="true" className="size-4 text-slate-400" />
            {assignee
              ? `${assignee.firstName} ${assignee.lastName}`
              : 'Unknown user'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Department
          </p>
          <p className="mt-2 font-semibold">
            {departmentQuery.data?.name ?? 'Unknown department'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Due date</p>
          <p
            className={`mt-2 flex items-center gap-2 font-semibold ${
              overdue ? 'text-red-600' : ''
            }`}
          >
            <CalendarDays aria-hidden="true" className="size-4" />
            {new Date(task.dueDate).toLocaleDateString()}
            {overdue ? ' · Overdue' : ''}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Created by
          </p>
          <p className="mt-2 font-semibold">
            {creator
              ? `${creator.firstName} ${creator.lastName}`
              : 'Unknown user'}
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <EntityCollaborationPanel
          businessEvents={businessEvents}
          entityId={task.id}
          entityType="task"
        />

        <div className="space-y-6">
          <EntityAuditPanel entityId={task.id} entityType="task" />

          {options.length > 0 ? (
            <PermissionGate permission="tasks.manage">
              <Card className="p-5">
                <h2 className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                  Update status
                </h2>
                <form className="mt-4 space-y-4" onSubmit={submitTransition}>
                  <label className="text-sm font-semibold">
                    Next status
                    <select
                      className={inputClassName}
                      {...register('status')}
                    >
                      {options.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Update note
                    <textarea
                      className={`${inputClassName} h-28 resize-y py-2.5`}
                      {...register('note')}
                    />
                    {errors.note ? (
                      <span className={errorClassName}>
                        {errors.note.message}
                      </span>
                    ) : null}
                  </label>
                  {errors.root?.server ? (
                    <p className={errorClassName}>
                      {errors.root.server.message}
                    </p>
                  ) : null}
                  <Button
                    className="w-full"
                    disabled={transitionTask.isPending}
                    type="submit"
                  >
                    Save status update
                  </Button>
                </form>
              </Card>
            </PermissionGate>
          ) : null}

          {task.approvalRequestId ? (
            <Card className="p-5">
              <h2 className="font-semibold">Linked approval</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {approvalQuery.data?.title ?? 'Approval relationship'}
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300"
                to={`/approvals/${task.approvalRequestId}`}
              >
                Open approval
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
