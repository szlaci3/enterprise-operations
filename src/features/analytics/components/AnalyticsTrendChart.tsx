import { Card } from '../../../shared/components/Card'
import type { AnalyticsTrendPoint } from '../schemas/analyticsSchemas'

const series = [
  {
    color: '#3388ff',
    key: 'tasksCreated',
    label: 'Tasks created',
  },
  {
    color: '#10b981',
    key: 'tasksCompleted',
    label: 'Tasks completed',
  },
  {
    color: '#f59e0b',
    key: 'approvalsDecided',
    label: 'Approvals decided',
  },
] as const

function linePoints(
  points: AnalyticsTrendPoint[],
  key: (typeof series)[number]['key'],
  maximum: number,
) {
  const width = 720
  const height = 240
  return points
    .map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : 8 + (index / (points.length - 1)) * (width - 16)
      const y = height - 12 - (point[key] / maximum) * (height - 28)
      return `${x},${y}`
    })
    .join(' ')
}

export function AnalyticsTrendChart({
  points,
}: {
  points: AnalyticsTrendPoint[]
}) {
  const maximum = Math.max(
    1,
    ...points.flatMap((point) => [
      point.tasksCreated,
      point.tasksCompleted,
      point.approvalsDecided,
    ]),
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row">
        <div>
          <h2 className="font-semibold">Operational movement</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Weekly intake, completion, and approval decision activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          {series.map((item) => (
            <span
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400"
              key={item.key}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="overflow-x-auto">
          <div className="min-w-140">
            <svg
              aria-label="Trend chart for tasks and approvals"
              className="h-60 w-full"
              role="img"
              viewBox="0 0 720 240"
            >
              {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  className="text-slate-200 dark:text-slate-700"
                  key={ratio}
                  stroke="currentColor"
                  strokeDasharray="4 5"
                  x1="8"
                  x2="712"
                  y1={228 - ratio * 212}
                  y2={228 - ratio * 212}
                />
              ))}
              {series.map((item) => (
                <polyline
                  fill="none"
                  key={item.key}
                  points={linePoints(points, item.key, maximum)}
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              ))}
            </svg>
            <div
              className="grid text-center text-xs text-slate-400"
              style={{
                gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
              }}
            >
              {points.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </div>
        <table className="sr-only">
          <caption>Operational movement by period</caption>
          <thead>
            <tr>
              <th>Period</th>
              <th>Tasks created</th>
              <th>Tasks completed</th>
              <th>Approvals decided</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <td>{point.label}</td>
                <td>{point.tasksCreated}</td>
                <td>{point.tasksCompleted}</td>
                <td>{point.approvalsDecided}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
