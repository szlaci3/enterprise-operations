import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  personalSettingsFormSchema,
  type PersonalSettings,
  type PersonalSettingsFormValues,
} from '../schemas/settingsSchemas'

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'

export function PersonalSettingsForm({
  isSaving,
  onSubmit,
  settings,
}: {
  isSaving: boolean
  onSubmit: (values: PersonalSettingsFormValues) => Promise<void>
  settings: PersonalSettings
}) {
  const {
    formState: { isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<PersonalSettingsFormValues>({
    defaultValues: settings,
    resolver: zodResolver(personalSettingsFormSchema),
  })

  useEffect(() => {
    reset(settings)
  }, [reset, settings])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
    reset(values)
  })

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={submit}>
        <div>
          <h2 className="font-semibold">Workspace preferences</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            These settings follow your managed identity on this platform.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Theme
            <select className={inputClassName} {...register('theme')}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Information density
            <select className={inputClassName} {...register('density')}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Time zone
            <select className={inputClassName} {...register('timezone')}>
              <option value="Europe/Brussels">Europe/Brussels</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="UTC">UTC</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Date format
            <select className={inputClassName} {...register('dateFormat')}>
              <option value="day-month-year">Day / month / year</option>
              <option value="month-day-year">Month / day / year</option>
            </select>
          </label>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <input
            className="mt-1 size-4 accent-brand-600"
            type="checkbox"
            {...register('reducedMotion')}
          />
          <span>
            <span className="block text-sm font-semibold">Reduce motion</span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              Minimize non-essential transitions and loading animation.
            </span>
          </span>
        </label>

        <div className="mt-6 flex justify-end">
          <Button disabled={!isDirty || isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save workspace preferences'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
