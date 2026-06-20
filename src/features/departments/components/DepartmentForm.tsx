import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  departmentFormSchema,
  type Department,
  type DepartmentFormValues,
} from '../schemas/departmentSchemas'
import { DepartmentServiceError } from '../services/departmentService'

interface DepartmentFormProps {
  departments: Department[]
  initialValues?: DepartmentFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: DepartmentFormValues) => Promise<void>
  submitLabel: string
  departmentId?: string
}

const defaultValues: DepartmentFormValues = {
  code: '',
  costCenter: '',
  description: '',
  headcount: 0,
  name: '',
  ownerEmail: '',
  ownerName: '',
  ownerTitle: '',
  parentDepartmentId: '',
  status: 'active',
}

function getDescendantIds(departments: Department[], departmentId: string) {
  const descendants = new Set<string>()
  const pending = [departmentId]

  while (pending.length > 0) {
    const parentId = pending.shift()
    for (const department of departments) {
      if (
        department.parentDepartmentId === parentId &&
        !descendants.has(department.id)
      ) {
        descendants.add(department.id)
        pending.push(department.id)
      }
    }
  }

  return descendants
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950'
const textAreaClassName = `${inputClassName} h-28 resize-y py-2.5`
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

export function DepartmentForm({
  departmentId,
  departments,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
}: DepartmentFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<DepartmentFormValues>({
    defaultValues: initialValues ?? defaultValues,
    resolver: zodResolver(departmentFormSchema),
  })

  const unavailableParentIds = useMemo(() => {
    if (!departmentId) {
      return new Set<string>()
    }
    const ids = getDescendantIds(departments, departmentId)
    ids.add(departmentId)
    return ids
  }, [departmentId, departments])

  const parentOptions = departments
    .filter((department) => !unavailableParentIds.has(department.id))
    .sort((left, right) => left.name.localeCompare(right.name))

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof DepartmentServiceError) {
        if (error.code === 'duplicate-code') {
          setError('code', { message: error.message })
          return
        }
        if (error.code === 'duplicate-name') {
          setError('name', { message: error.message })
          return
        }
        if (error.code === 'hierarchy-conflict') {
          setError('parentDepartmentId', { message: error.message })
          return
        }
      }

      setError('root.server', {
        message: 'The department could not be saved. Please try again.',
      })
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
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Department identity
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Define how this department appears across the organization.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Department name
            <input
              aria-invalid={Boolean(errors.name)}
              className={inputClassName}
              {...register('name')}
            />
            {errors.name ? (
              <span className={errorClassName}>{errors.name.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Department code
            <input
              aria-invalid={Boolean(errors.code)}
              autoCapitalize="characters"
              className={inputClassName}
              {...register('code')}
            />
            {errors.code ? (
              <span className={errorClassName}>{errors.code.message}</span>
            ) : null}
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Description
            <textarea
              aria-invalid={Boolean(errors.description)}
              className={textAreaClassName}
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
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Organization structure
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Establish reporting alignment and operating metadata.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Parent department
            <select
              aria-invalid={Boolean(errors.parentDepartmentId)}
              className={inputClassName}
              {...register('parentDepartmentId')}
            >
              <option value="">No parent department</option>
              {parentOptions.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.parentDepartmentId ? (
              <span className={errorClassName}>
                {errors.parentDepartmentId.message}
              </span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Lifecycle status
            <select className={inputClassName} {...register('status')}>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className={labelClassName}>
            Cost center
            <input
              aria-invalid={Boolean(errors.costCenter)}
              className={inputClassName}
              {...register('costCenter')}
            />
            {errors.costCenter ? (
              <span className={errorClassName}>
                {errors.costCenter.message}
              </span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Headcount
            <input
              aria-invalid={Boolean(errors.headcount)}
              className={inputClassName}
              min="0"
              type="number"
              {...register('headcount', { valueAsNumber: true })}
            />
            {errors.headcount ? (
              <span className={errorClassName}>
                {errors.headcount.message}
              </span>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Accountable owner
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Identify the leader accountable for this department’s outcomes.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Owner name
            <input
              aria-invalid={Boolean(errors.ownerName)}
              className={inputClassName}
              {...register('ownerName')}
            />
            {errors.ownerName ? (
              <span className={errorClassName}>
                {errors.ownerName.message}
              </span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Owner role
            <input
              aria-invalid={Boolean(errors.ownerTitle)}
              className={inputClassName}
              {...register('ownerTitle')}
            />
            {errors.ownerTitle ? (
              <span className={errorClassName}>
                {errors.ownerTitle.message}
              </span>
            ) : null}
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Owner email
            <input
              aria-invalid={Boolean(errors.ownerEmail)}
              className={inputClassName}
              type="email"
              {...register('ownerEmail')}
            />
            {errors.ownerEmail ? (
              <span className={errorClassName}>
                {errors.ownerEmail.message}
              </span>
            ) : null}
          </label>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} type="button" variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          <Save aria-hidden="true" className="size-4" />
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
