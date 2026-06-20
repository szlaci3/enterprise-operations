import {
  CheckSquare2,
  FileBarChart,
  ListChecks,
  Settings2,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '../../../shared/components/Card'
import type { DashboardActivity } from '../schemas/dashboardSchemas'
import { formatRelativeTime } from '../utils/dashboardFormatters'

const activityIcons: Record<DashboardActivity['type'], LucideIcon> = {
  approval: CheckSquare2,
  report: FileBarChart,
  system: Settings2,
  task: ListChecks,
}

export function ActivityPanel({
  activities,
  generatedAt,
}: {
  activities: DashboardActivity[]
  generatedAt: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Recent activity
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Material actions across the operating environment.
        </p>
      </div>
      <ol className="divide-y divide-slate-100 dark:divide-slate-800">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type]
          return (
            <li className="flex gap-3 p-4" key={activity.id}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Icon aria-hidden="true" className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activity.actor}
                  </span>{' '}
                  {activity.description}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatRelativeTime(activity.createdAt, generatedAt)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
