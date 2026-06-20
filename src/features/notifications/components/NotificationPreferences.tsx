import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { BellRing, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  notificationPreferencesOptions,
  useUpdateNotificationPreferences,
} from '../queries/notificationQueries'
import {
  notificationPreferencesFormSchema,
  type NotificationPreferencesFormValues,
  type NotificationSubscription,
} from '../schemas/notificationSchemas'

const subscriptionOptions: {
  description: string
  label: string
  value: NotificationSubscription
}[] = [
  {
    description: 'A request reaches your review step.',
    label: 'Approval assignments',
    value: 'approval-assigned',
  },
  {
    description: 'A request you submitted is approved or rejected.',
    label: 'Approval decisions',
    value: 'approval-decision',
  },
  {
    description: 'A reviewer transfers a decision step to you.',
    label: 'Approval delegations',
    value: 'approval-delegated',
  },
  {
    description: 'An overdue approval is escalated to you.',
    label: 'Approval escalations',
    value: 'approval-escalated',
  },
  {
    description: 'A teammate mentions you in an entity discussion.',
    label: 'Collaboration mentions',
    value: 'collaboration-mention',
  },
  {
    description: 'Operational work is assigned or reassigned to you.',
    label: 'Task assignments',
    value: 'task-assigned',
  },
  {
    description: 'Work you created changes lifecycle state.',
    label: 'Task status changes',
    value: 'task-status',
  },
]

export function NotificationPreferences() {
  const preferencesQuery = useQuery(
    notificationPreferencesOptions(currentSessionUserId),
  )
  const updatePreferences = useUpdateNotificationPreferences(
    currentSessionUserId,
  )
  const {
    formState: { isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<NotificationPreferencesFormValues>({
    defaultValues: {
      emailDigest: 'daily',
      inAppEnabled: true,
      subscriptions: {
        'approval-assigned': true,
        'approval-decision': true,
        'approval-delegated': true,
        'approval-escalated': true,
        'collaboration-mention': true,
        'task-assigned': true,
        'task-status': true,
      },
    },
    resolver: zodResolver(notificationPreferencesFormSchema),
  })

  useEffect(() => {
    if (preferencesQuery.data) {
      reset({
        emailDigest: preferencesQuery.data.emailDigest,
        inAppEnabled: preferencesQuery.data.inAppEnabled,
        subscriptions: preferencesQuery.data.subscriptions,
      })
    }
  }, [preferencesQuery.data, reset])

  if (preferencesQuery.isPending) {
    return (
      <Card className="h-64 max-w-3xl animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading notification preferences</span>
      </Card>
    )
  }

  if (preferencesQuery.isError) {
    return (
      <Card className="max-w-3xl p-6">
        <p className="font-semibold">Notification preferences unavailable</p>
        <Button
          className="mt-4"
          onClick={() => preferencesQuery.refetch()}
          variant="secondary"
        >
          Retry
        </Button>
      </Card>
    )
  }

  const submit = handleSubmit(async (values) => {
    const saved = await updatePreferences.mutateAsync(values)
    reset({
      emailDigest: saved.emailDigest,
      inAppEnabled: saved.inAppEnabled,
      subscriptions: saved.subscriptions,
    })
  })

  return (
    <Card className="max-w-3xl p-6">
      <form onSubmit={submit}>
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <BellRing aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Notification subscriptions
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose which future domain events create inbox messages.
            </p>
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <input
            className="mt-1 size-4 accent-brand-600"
            type="checkbox"
            {...register('inAppEnabled')}
          />
          <span>
            <span className="block text-sm font-semibold">
              Enable in-app notifications
            </span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              New subscribed activity appears in the notification center and
              header indicator.
            </span>
          </span>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Event subscriptions</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {subscriptionOptions.map((option) => (
              <label
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                key={option.value}
              >
                <input
                  className="mt-1 size-4 accent-brand-600"
                  type="checkbox"
                  {...register(`subscriptions.${option.value}`)}
                />
                <span>
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 block text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Mail aria-hidden="true" className="size-4 text-slate-400" />
            Simulated email digest
          </span>
          <select
            className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:max-w-xs dark:border-slate-700 dark:bg-slate-900"
            {...register('emailDigest')}
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>

        <div className="mt-6 flex justify-end">
          <Button
            disabled={!isDirty || updatePreferences.isPending}
            type="submit"
          >
            {updatePreferences.isPending ? 'Saving...' : 'Save preferences'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
