import { Card } from './Card'

export interface SummaryMetric {
  label: string
  tone?: 'default' | 'danger'
  value: number | string
}

export function SummaryGrid({
  ariaLabel,
  metrics,
}: {
  ariaLabel: string
  metrics: SummaryMetric[]
}) {
  return (
    <section aria-label={ariaLabel} className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Card className="p-5" key={metric.label}>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              metric.tone === 'danger'
                ? 'text-red-600'
                : 'text-slate-950 dark:text-white'
            }`}
          >
            {metric.value}
          </p>
        </Card>
      ))}
    </section>
  )
}
