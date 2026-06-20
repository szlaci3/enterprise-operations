import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Card } from '../../../shared/components/Card'
import type { DashboardKpi } from '../schemas/dashboardSchemas'
import { formatKpiValue } from '../utils/dashboardFormatters'

function Sparkline({
  favorable,
  series,
}: Pick<DashboardKpi, 'series'> & { favorable: boolean }) {
  const width = 120
  const height = 36
  const minimum = Math.min(...series)
  const maximum = Math.max(...series)
  const range = maximum - minimum || 1
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width
      const y = height - ((value - minimum) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      aria-hidden="true"
      className={`h-9 w-30 ${favorable ? 'text-emerald-500' : 'text-red-500'}`}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  )
}

const trendIcons = {
  down: ArrowDownRight,
  flat: ArrowRight,
  up: ArrowUpRight,
}

export function KpiGrid({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section
      aria-label="Key performance indicators"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {kpis.map((kpi) => {
        const TrendIcon = trendIcons[kpi.trend.direction]

        return (
          <Card className="p-5" key={kpi.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {formatKpiValue(kpi)}
                </p>
              </div>
              <Sparkline
                favorable={kpi.trend.favorable}
                series={kpi.series}
              />
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  kpi.trend.favorable
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <TrendIcon aria-hidden="true" className="size-3.5" />
                {kpi.trend.change.toFixed(1)}%
              </span>
              <span className="text-slate-400">{kpi.trend.label}</span>
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {kpi.description}
            </p>
          </Card>
        )
      })}
    </section>
  )
}
