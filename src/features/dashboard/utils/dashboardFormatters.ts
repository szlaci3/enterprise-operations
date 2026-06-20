import type { DashboardKpi } from '../schemas/dashboardSchemas'

export function formatKpiValue(kpi: DashboardKpi): string {
  switch (kpi.format) {
    case 'duration':
      return `${kpi.value.toFixed(1)}h`
    case 'percent':
      return `${kpi.value.toFixed(1)}%`
    case 'number':
      return new Intl.NumberFormat('en-US').format(kpi.value)
  }
}

export function formatRelativeTime(value: string, reference: string): string {
  const elapsedMinutes = Math.max(
    1,
    Math.round(
      (new Date(reference).getTime() - new Date(value).getTime()) / 60_000,
    ),
  )

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }

  const elapsedHours = Math.round(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  return `${Math.round(elapsedHours / 24)}d ago`
}
