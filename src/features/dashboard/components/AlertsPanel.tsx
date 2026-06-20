import {
  AlertCircle,
  AlertTriangle,
  Check,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import type { DashboardAlert } from '../schemas/dashboardSchemas'
import { formatRelativeTime } from '../utils/dashboardFormatters'

const severityConfig: Record<
  DashboardAlert['severity'],
  { icon: LucideIcon; tone: 'blue' | 'amber' | 'red' }
> = {
  critical: { icon: AlertCircle, tone: 'red' },
  info: { icon: Info, tone: 'blue' },
  warning: { icon: AlertTriangle, tone: 'amber' },
}

interface AlertsPanelProps {
  alerts: DashboardAlert[]
  generatedAt: string
  isAcknowledging: boolean
  onAcknowledge: (alertId: string) => void
}

export function AlertsPanel({
  alerts,
  generatedAt,
  isAcknowledging,
  onAcknowledge,
}: AlertsPanelProps) {
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Operational alerts
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Conditions requiring review or awareness.
          </p>
        </div>
        <Badge tone={activeAlerts.length > 0 ? 'red' : 'green'}>
          {activeAlerts.length} active
        </Badge>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check aria-hidden="true" className="size-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            All alerts acknowledged
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            No current items require review.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {activeAlerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon

            return (
              <li className="p-5" key={alert.id}>
                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'
                        : alert.severity === 'warning'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {alert.title}
                      </p>
                      <Badge tone={config.tone}>{alert.severity}</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {alert.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-400">
                        {alert.source} ·{' '}
                        {formatRelativeTime(alert.createdAt, generatedAt)}
                      </p>
                      <Button
                        className="min-h-8 px-2.5 py-1 text-xs"
                        disabled={isAcknowledging}
                        onClick={() => onAcknowledge(alert.id)}
                        variant="ghost"
                      >
                        <Check aria-hidden="true" className="size-3.5" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
