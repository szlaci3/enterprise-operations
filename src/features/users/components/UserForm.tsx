import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Department } from '../../departments/schemas/departmentSchemas'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  userFormSchema,
  type Team,
  type User,
  type UserFormValues,
  type UserStatus,
} from '../schemas/userSchemas'
import { UserServiceError } from '../services/userService'

interface UserFormProps {
  currentUserId?: string
  departments: Department[]
  initialValues?: UserFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: UserFormValues) => Promise<void>
  statusOptions: UserStatus[]
  submitLabel: string
  teams: Team[]
  users: User[]
}

const defaults: UserFormValues = {
  departmentId: '',
  email: '',
  employeeId: '',
  employmentType: 'employee',
  firstName: '',
  jobTitle: '',
  lastName: '',
  location: '',
  managerId: '',
  startDate: new Date().toISOString().slice(0, 10),
  status: 'invited',
  teamIds: [],
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950'
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

const statusLabels: Record<UserStatus, string> = {
  active: 'Active',
  deactivated: 'Deactivated',
  invited: 'Invited',
  suspended: 'Suspended',
}

export function UserForm({
  currentUserId,
  departments,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  statusOptions,
  submitLabel,
  teams,
  users,
}: UserFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<UserFormValues>({
    defaultValues: initialValues ?? defaults,
    resolver: zodResolver(userFormSchema),
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof UserServiceError) {
        if (error.code === 'duplicate-email') {
          setError('email', { message: error.message })
          return
        }
        if (error.code === 'duplicate-employee-id') {
          setError('employeeId', { message: error.message })
          return
        }
        if (error.code === 'invalid-assignment') {
          if (
            error.message.toLowerCase().includes('manager') ||
            error.message.toLowerCase().includes('reporting line')
          ) {
            setError('managerId', { message: error.message })
            return
          }
          if (error.message.toLowerCase().includes('department')) {
            setError('departmentId', { message: error.message })
            return
          }
          setError('root.server', { message: error.message })
          return
        }
        if (error.code === 'invalid-transition') {
          setError('status', { message: error.message })
          return
        }
      }
      setError('root.server', {
        message: 'The user could not be saved. Please try again.',
      })
    }
  })

  const managerOptions = users
    .filter(
      (user) =>
        user.id !== currentUserId &&
        user.status !== 'deactivated' &&
        user.employmentType !== 'service-account',
    )
    .sort((left, right) =>
      `${left.lastName}${left.firstName}`.localeCompare(
        `${right.lastName}${right.firstName}`,
      ),
    )

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
          Identity
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Define the user’s workforce identity and contact record.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            First name
            <input className={inputClassName} {...register('firstName')} />
            {errors.firstName ? (
              <span className={errorClassName}>{errors.firstName.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Last name
            <input className={inputClassName} {...register('lastName')} />
            {errors.lastName ? (
              <span className={errorClassName}>{errors.lastName.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Business email
            <input
              className={inputClassName}
              type="email"
              {...register('email')}
            />
            {errors.email ? (
              <span className={errorClassName}>{errors.email.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Employee ID
            <input className={inputClassName} {...register('employeeId')} />
            {errors.employeeId ? (
              <span className={errorClassName}>
                {errors.employeeId.message}
              </span>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Organization assignment
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Place this identity within the organization and reporting structure.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Department
            <select className={inputClassName} {...register('departmentId')}>
              <option value="">Select a department</option>
              {departments
                .slice()
                .sort((left, right) => left.name.localeCompare(right.name))
                .map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
            </select>
            {errors.departmentId ? (
              <span className={errorClassName}>
                {errors.departmentId.message}
              </span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Manager
            <select className={inputClassName} {...register('managerId')}>
              <option value="">No manager</option>
              {managerOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} — {user.jobTitle}
                </option>
              ))}
            </select>
            {errors.managerId ? (
              <span className={errorClassName}>{errors.managerId.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Job title
            <input className={inputClassName} {...register('jobTitle')} />
            {errors.jobTitle ? (
              <span className={errorClassName}>{errors.jobTitle.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Location
            <input className={inputClassName} {...register('location')} />
            {errors.location ? (
              <span className={errorClassName}>{errors.location.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Employment type
            <select className={inputClassName} {...register('employmentType')}>
              <option value="employee">Employee</option>
              <option value="contractor">Contractor</option>
              <option value="service-account">Service account</option>
            </select>
          </label>
          <label className={labelClassName}>
            Start date
            <input
              className={inputClassName}
              type="date"
              {...register('startDate')}
            />
            {errors.startDate ? (
              <span className={errorClassName}>{errors.startDate.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Lifecycle status
            <select className={inputClassName} {...register('status')}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
            {errors.status ? (
              <span className={errorClassName}>{errors.status.message}</span>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <fieldset>
          <legend className="font-semibold text-slate-950 dark:text-white">
            Team membership
          </legend>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Assign cross-functional groups used for collaboration and future
            access policies.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {teams.map((team) => (
              <label
                className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-4 hover:border-brand-300 dark:border-slate-700"
                key={team.id}
              >
                <input
                  className="mt-1 size-4 accent-brand-600"
                  type="checkbox"
                  value={team.id}
                  {...register('teamIds')}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {team.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {team.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
