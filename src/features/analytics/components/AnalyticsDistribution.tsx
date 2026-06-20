import { Card } from '../../../shared/components/Card'
import type { AnalyticsDistributionItem } from '../schemas/analyticsSchemas'

export function AnalyticsDistribution({
  description,
  items,
  title,
}: {
  description: string
  items: AnalyticsDistributionItem[]
  title: string
}) {
  const maximum = Math.max(1, ...items.map((item) => item.value))
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium capitalize">{item.label}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {item.value} ·{' '}
                {total === 0 ? '0.0' : ((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${(item.value / maximum) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No data in this segment.</p>
        ) : null}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Segment</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
