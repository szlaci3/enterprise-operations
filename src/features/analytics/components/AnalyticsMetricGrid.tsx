import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react'
import { Card } from '../../../shared/components/Card'
import type { AnalyticsMetric } from '../schemas/analyticsSchemas'

function formatMetric(metric: AnalyticsMetric) {
  if (metric.format === 'percent') return `${metric.value.toFixed(1)}%`
  if (metric.format === 'duration') return `${metric.value.toFixed(1)}h`
  return metric.value.toLocaleString()
}

const trendIcons = {
  down: ArrowDownRight,
  flat: ArrowRight,
  up: ArrowUpRight,
}

export function AnalyticsMetricGrid({
  metrics,
}: {
  metrics: AnalyticsMetric[]
}) {
  return (
    <section
      aria-label="Analytics metrics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map((metric) => {
        const TrendIcon = trendIcons[metric.trendDirection]
        return (
          <Card className="p-5" key={metric.id}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatMetric(metric)}
            </p>
            <p
              className={`mt-3 flex items-center gap-1 text-xs font-semibold ${
                metric.trendFavorable
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              <TrendIcon aria-hidden="true" className="size-3.5" />
              {Math.abs(metric.trendChange).toFixed(1)}
              {metric.format === 'duration' ? 'h' : '%'} vs previous period
            </p>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {metric.description}
            </p>
          </Card>
        )
      })}
    </section>
  )
}
