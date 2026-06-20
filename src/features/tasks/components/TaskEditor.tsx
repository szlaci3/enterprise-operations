import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { approvalListOptions } from '../../approvals/queries/approvalQueries'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { userListOptions } from '../../users/queries/userQueries'
import {
  taskDetailOptions,
  useCreateTask,
  useUpdateTask,
} from '../queries/taskQueries'
import type { TaskFormValues } from '../schemas/taskSchemas'
import { TaskForm } from './TaskForm'

function futureDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function TaskEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const taskQuery = useQuery({
    ...taskDetailOptions(taskId),
    enabled: mode === 'edit',
  })
  const usersQuery = useQuery(userListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const approvalsQuery = useQuery(approvalListOptions())
  const createTask = useCreateTask(currentSessionUserId)
  const updateTask = useUpdateTask(taskId, currentSessionUserId)

  const isPending =
    usersQuery.isPending ||
    departmentsQuery.isPending ||
    approvalsQuery.isPending ||
    (mode === 'edit' && taskQuery.isPending)
  if (isPending) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading task form</span>
      </Card>
    )
  }

  const task = taskQuery.data
  const users = (usersQuery.data ?? []).filter(
    (user) => user.status === 'active',
  )
  const departments = (departmentsQuery.data ?? []).filter(
    (department) => department.status !== 'inactive',
  )
  if (
    usersQuery.isError ||
    departmentsQuery.isError ||
    approvalsQuery.isError ||
    (mode === 'edit' && (taskQuery.isError || !task)) ||
    users.length === 0 ||
    departments.length === 0
  ) {
    return (
      <Card className="p-8 text-center">
        <ClipboardCheck
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Task form unavailable</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/tasks">
          Back to tasks
        </Link>
      </Card>
    )
  }

  const initialValues: TaskFormValues = task
    ? {
        approvalRequestId: task.approvalRequestId ?? '',
        assigneeUserId: task.assigneeUserId,
        departmentId: task.departmentId,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        title: task.title,
      }
    : {
        approvalRequestId: '',
        assigneeUserId: currentSessionUserId,
        departmentId:
          users.find((user) => user.id === currentSessionUserId)?.departmentId ??
          departments[0].id,
        description: '',
        dueDate: futureDate(7),
        priority: 'normal',
        title: '',
      }
  const cancelTarget = task ? `/tasks/${task.id}` : '/tasks'

  const handleSubmit = async (values: TaskFormValues) => {
    const saved =
      mode === 'create'
        ? await createTask.mutateAsync(values)
        : await updateTask.mutateAsync(values)
    navigate(`/tasks/${saved.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to={cancelTarget}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {task ? 'Task details' : 'Tasks'}
      </Link>
      <PageHeader
        description={
          task
            ? 'Update task scope, accountable ownership, scheduling, and approval context.'
            : 'Create a durable operational work item with clear ownership and delivery expectations.'
        }
        eyebrow="Operational work"
        title={task ? `Edit ${task.title}` : 'Create task'}
      />
      <TaskForm
        approvals={approvalsQuery.data ?? []}
        departments={departments}
        initialValues={initialValues}
        isSubmitting={createTask.isPending || updateTask.isPending}
        onCancel={() => navigate(cancelTarget)}
        onSubmit={handleSubmit}
        submitLabel={task ? 'Save changes' : 'Create task'}
        users={users}
      />
    </div>
  )
}
