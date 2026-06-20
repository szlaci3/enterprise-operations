import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  roleFormSchema,
  type Permission,
  type RoleFormValues,
} from '../schemas/accessSchemas'
import { AccessServiceError } from '../services/accessService'

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950'

export function RoleForm({
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  permissions,
  submitLabel,
}: {
  initialValues?: RoleFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: RoleFormValues) => Promise<void>
  permissions: Permission[]
  submitLabel: string
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RoleFormValues>({
    defaultValues: initialValues ?? {
      description: '',
      name: '',
      permissionKeys: [],
    },
    resolver: zodResolver(roleFormSchema),
  })

  const modules = [...new Set(permissions.map((permission) => permission.module))]
  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (
        error instanceof AccessServiceError &&
        error.code === 'duplicate-name'
      ) {
        setError('name', { message: error.message })
        return
      }
      setError('root.server', {
        message:
          error instanceof AccessServiceError
            ? error.message
            : 'The role could not be saved. Please try again.',
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
          Role identity
        </h2>
        <div className="mt-5 grid gap-5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Role name
            <input className={`${inputClassName} h-10`} {...register('name')} />
            {errors.name ? (
              <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
                {errors.name.message}
              </span>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Description
            <textarea
              className={`${inputClassName} h-24 resize-y py-2.5`}
              {...register('description')}
            />
            {errors.description ? (
              <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
                {errors.description.message}
              </span>
            ) : null}
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <fieldset>
          <legend className="font-semibold text-slate-950 dark:text-white">
            Permissions
          </legend>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Permissions are additive across every role assigned to a user.
          </p>
          <div className="mt-5 space-y-6">
            {modules.map((module) => (
              <div key={module}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {module}
                </h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {permissions
                    .filter((permission) => permission.module === module)
                    .map((permission) => (
                      <label
                        className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-4 hover:border-brand-300 dark:border-slate-700"
                        key={permission.key}
                      >
                        <input
                          className="mt-1 size-4 accent-brand-600"
                          type="checkbox"
                          value={permission.key}
                          {...register('permissionKeys')}
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                            {permission.action}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {permission.description}
                          </span>
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
          {errors.permissionKeys ? (
            <span className="mt-3 block text-xs text-red-600 dark:text-red-400">
              {errors.permissionKeys.message}
            </span>
          ) : null}
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
