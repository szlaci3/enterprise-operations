import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import type { User } from '../../users/schemas/userSchemas'
import type { WorkflowDefinition } from '../../workflows/schemas/workflowSchemas'
import {
  approvalRequestFormSchema,
  type ApprovalRequestFormValues,
} from '../schemas/approvalSchemas'
import { ApprovalServiceError } from '../services/approvalService'

interface ApprovalRequestFormProps {
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: ApprovalRequestFormValues) => Promise<void>
  users: User[]
  workflows: WorkflowDefinition[]
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950'
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

function futureDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function ApprovalRequestForm({
  isSubmitting,
  onCancel,
  onSubmit,
  users,
  workflows,
}: ApprovalRequestFormProps) {
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<ApprovalRequestFormValues>({
    defaultValues: {
      category: 'operational-change',
      description: '',
      dueDate: futureDate(7),
      priority: 'normal',
      reviewerIds: [''],
      title: '',
      workflowDefinitionId: workflows[0]?.id ?? '',
    },
    resolver: zodResolver(approvalRequestFormSchema),
  })
  const reviewerIds = useWatch({ control, name: 'reviewerIds' })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApprovalServiceError) {
        setError('root.server', { message: error.message })
        return
      }
      setError('root.server', {
        message: 'The approval request could not be submitted.',
      })
    }
  })

  const moveReviewer = (index: number, direction: -1 | 1) => {
    const next = [...getValues('reviewerIds')]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= next.length) {
      return
    }
    const currentReviewer = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = currentReviewer
    setValue('reviewerIds', next, { shouldValidate: true })
  }

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
        <h2 className="font-semibold">Request details</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Explain the decision needed and its operational impact.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            Request title
            <input className={inputClassName} {...register('title')} />
            {errors.title ? (
              <span className={errorClassName}>{errors.title.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Category
            <select className={inputClassName} {...register('category')}>
              <option value="operational-change">Operational change</option>
              <option value="financial-control">Financial control</option>
              <option value="access-exception">Access exception</option>
              <option value="policy-exception">Policy exception</option>
              <option value="service-exception">Service exception</option>
            </select>
          </label>
          <label className={labelClassName}>
            Priority
            <select className={inputClassName} {...register('priority')}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Business justification
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
        <h2 className="font-semibold">Process and deadline</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          The selected active version is snapshotted when submitted.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Workflow
            <select
              className={inputClassName}
              {...register('workflowDefinitionId')}
            >
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name} — version {workflow.version}
                </option>
              ))}
            </select>
            {errors.workflowDefinitionId ? (
              <span className={errorClassName}>
                {errors.workflowDefinitionId.message}
              </span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Request due date
            <input
              className={inputClassName}
              min={futureDate(0)}
              type="date"
              {...register('dueDate')}
            />
            {errors.dueDate ? (
              <span className={errorClassName}>{errors.dueDate.message}</span>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Sequential reviewer chain</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Reviewers act in order. Later steps remain locked until the
              previous reviewer approves.
            </p>
          </div>
          <Button
            disabled={reviewerIds.length >= 5}
            onClick={() =>
              setValue('reviewerIds', [...reviewerIds, ''], {
                shouldValidate: true,
              })
            }
            variant="secondary"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add reviewer
          </Button>
        </div>
        {typeof errors.reviewerIds?.message === 'string' ? (
          <p className={errorClassName}>{errors.reviewerIds.message}</p>
        ) : null}
        <div className="mt-5 space-y-3">
          {reviewerIds.map((_, index) => (
            <div
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-end"
              key={`reviewer-slot-${index}`}
            >
              <label className={`${labelClassName} flex-1`}>
                Reviewer {index + 1}
                <select
                  className={inputClassName}
                  {...register(`reviewerIds.${index}`)}
                >
                  <option value="">Select reviewer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} — {user.jobTitle}
                    </option>
                  ))}
                </select>
                {errors.reviewerIds?.[index] ? (
                  <span className={errorClassName}>
                    {errors.reviewerIds[index]?.message}
                  </span>
                ) : null}
              </label>
              <div className="flex gap-1">
                <button
                  aria-label={`Move reviewer ${index + 1} up`}
                  className="rounded-md p-2"
                  disabled={index === 0}
                  onClick={() => moveReviewer(index, -1)}
                  type="button"
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                </button>
                <button
                  aria-label={`Move reviewer ${index + 1} down`}
                  className="rounded-md p-2"
                  disabled={index === reviewerIds.length - 1}
                  onClick={() => moveReviewer(index, 1)}
                  type="button"
                >
                  <ArrowDown aria-hidden="true" className="size-4" />
                </button>
                <button
                  aria-label={`Remove reviewer ${index + 1}`}
                  className="rounded-md p-2"
                  disabled={reviewerIds.length === 1}
                  onClick={() =>
                    setValue(
                      'reviewerIds',
                      reviewerIds.filter((_, itemIndex) => itemIndex !== index),
                      { shouldValidate: true },
                    )
                  }
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          <Save aria-hidden="true" className="size-4" />
          {isSubmitting ? 'Submitting...' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
