import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import type { ApprovalRequest } from '../../approvals/schemas/approvalSchemas'
import type { Department } from '../../departments/schemas/departmentSchemas'
import type { User } from '../../users/schemas/userSchemas'
import {
  taskFormSchema,
  type TaskFormValues,
} from '../schemas/taskSchemas'
import { TaskServiceError } from '../services/taskService'

interface TaskFormProps {
  approvals: ApprovalRequest[]
  departments: Department[]
  initialValues: TaskFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: TaskFormValues) => Promise<void>
  submitLabel: string
  users: User[]
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

export function TaskForm({
  approvals,
  departments,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
  users,
}: TaskFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<TaskFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(taskFormSchema),
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof TaskServiceError) {
        setError('root.server', { message: error.message })
        return
      }
      setError('root.server', { message: 'The task could not be saved.' })
    }
  })

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      {errors.root?.server ? (
        <div
          className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {errors.root.server.message}
        </div>
      ) : null}

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Work definition</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Describe a concrete operational outcome with enough context to hand
          off safely.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            Task title
            <input className={inputClassName} {...register('title')} />
            {errors.title ? (
              <span className={errorClassName}>{errors.title.message}</span>
            ) : null}
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Description
            <textarea
              className={`${inputClassName} h-32 resize-y py-2.5`}
              {...register('description')}
            />
            {errors.description ? (
              <span className={errorClassName}>
                {errors.description.message}
              </span>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Ownership and schedule</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Assignee
            <select className={inputClassName} {...register('assigneeUserId')}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} — {user.jobTitle}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClassName}>
            Accountable department
            <select className={inputClassName} {...register('departmentId')}>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClassName}>
            Priority
            <select className={inputClassName} {...register('priority')}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label className={labelClassName}>
            Due date
            <input
              className={inputClassName}
              type="date"
              {...register('dueDate')}
            />
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Governance relationship</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Optionally connect delivery work to the approval that authorized it.
        </p>
        <label className={`${labelClassName} mt-5 block`}>
          Linked approval request
          <select
            className={inputClassName}
            {...register('approvalRequestId')}
          >
            <option value="">No linked approval</option>
            {approvals.map((approval) => (
              <option key={approval.id} value={approval.id}>
                {approval.title} — {approval.status}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          <Save aria-hidden="true" className="size-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
