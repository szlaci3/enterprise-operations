import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  organizationSettingsFormSchema,
  type OrganizationSettings,
  type OrganizationSettingsFormValues,
} from '../schemas/settingsSchemas'

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

export function OrganizationSettingsForm({
  isSaving,
  onSubmit,
  settings,
}: {
  isSaving: boolean
  onSubmit: (values: OrganizationSettingsFormValues) => Promise<void>
  settings: OrganizationSettings
}) {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<OrganizationSettingsFormValues>({
    defaultValues: settings,
    resolver: zodResolver(organizationSettingsFormSchema),
  })

  useEffect(() => {
    reset(settings)
  }, [reset, settings])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={submit}>
        <h2 className="font-semibold">Organization policy</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Shared defaults and governance metadata for every workspace user.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Organization name
            <input className={inputClassName} {...register('name')} />
            {errors.name ? (
              <span className={errorClassName}>{errors.name.message}</span>
            ) : null}
          </label>
          <label className="text-sm font-semibold">
            Support contact
            <input
              className={inputClassName}
              type="email"
              {...register('supportEmail')}
            />
            {errors.supportEmail ? (
              <span className={errorClassName}>
                {errors.supportEmail.message}
              </span>
            ) : null}
          </label>
          <label className="text-sm font-semibold">
            Default time zone
            <select
              className={inputClassName}
              {...register('defaultTimezone')}
            >
              <option value="Europe/Brussels">Europe/Brussels</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="UTC">UTC</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Week starts on
            <select className={inputClassName} {...register('weekStartsOn')}>
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Fiscal year starts
            <select
              className={inputClassName}
              {...register('fiscalYearStartMonth', { valueAsNumber: true })}
            >
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Records retention
            <div className="relative">
              <input
                className={`${inputClassName} pr-16`}
                type="number"
                {...register('recordsRetentionDays', { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-3 top-4 text-xs text-slate-400">
                days
              </span>
            </div>
            {errors.recordsRetentionDays ? (
              <span className={errorClassName}>
                {errors.recordsRetentionDays.message}
              </span>
            ) : null}
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <Button disabled={!isDirty || isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save organization policy'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
