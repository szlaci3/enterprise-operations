import { Card } from '../../../shared/components/Card'
import type { WorkloadPoint } from '../schemas/dashboardSchemas'

function createLinePoints(
  workload: WorkloadPoint[],
  key: 'completed' | 'received',
  width: number,
  height: number,
  maximum: number,
) {
  return workload
    .map((point, index) => {
      const x = 8 + (index / (workload.length - 1)) * (width - 16)
      const y = height - 12 - (point[key] / maximum) * (height - 28)
      return `${x},${y}`
    })
    .join(' ')
}

export function WorkloadChart({ workload }: { workload: WorkloadPoint[] }) {
  const width = 720
  const height = 240
  const maximum = Math.max(
    ...workload.flatMap((point) => [point.completed, point.received]),
  )
  const receivedPoints = createLinePoints(
    workload,
    'received',
    width,
    height,
    maximum,
  )
  const completedPoints = createLinePoints(
    workload,
    'completed',
    width,
    height,
    maximum,
  )
  const totalReceived = workload.reduce(
    (total, point) => total + point.received,
    0,
  )
  const totalCompleted = workload.reduce(
    (total, point) => total + point.completed,
    0,
  )
  const completionRate = (totalCompleted / totalReceived) * 100

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Workload flow
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Intake volume compared with completed operational work.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="size-2.5 rounded-full bg-brand-500" />
            Received
          </span>
          <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <p>
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalReceived.toLocaleString()}
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">received</span>
          </p>
          <p>
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalCompleted.toLocaleString()}
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">completed</span>
          </p>
          <p>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {completionRate.toFixed(1)}%
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">
              completion ratio
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-140">
            <svg
              aria-label="Line chart comparing received and completed work"
              className="h-60 w-full overflow-visible"
              role="img"
              viewBox={`0 0 ${width} ${height}`}
            >
              {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  className="text-slate-200 dark:text-slate-700"
                  key={ratio}
                  stroke="currentColor"
                  strokeDasharray="4 5"
                  x1="8"
                  x2={width - 8}
                  y1={height - 12 - ratio * (height - 28)}
                  y2={height - 12 - ratio * (height - 28)}
                />
              ))}
              <polyline
                fill="none"
                points={receivedPoints}
                stroke="#3388ff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <polyline
                fill="none"
                points={completedPoints}
                stroke="#10b981"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              {workload.map((point, index) => {
                const x =
                  8 + (index / (workload.length - 1)) * (width - 16)
                return (
                  <g key={point.label}>
                    <circle
                      cx={x}
                      cy={
                        height -
                        12 -
                        (point.received / maximum) * (height - 28)
                      }
                      fill="#3388ff"
                      r="4"
                    />
                    <circle
                      cx={x}
                      cy={
                        height -
                        12 -
                        (point.completed / maximum) * (height - 28)
                      }
                      fill="#10b981"
                      r="4"
                    />
                  </g>
                )
              })}
            </svg>
            <div
              className="grid text-center text-xs text-slate-400"
              style={{
                gridTemplateColumns: `repeat(${workload.length}, minmax(0, 1fr))`,
              }}
            >
              {workload.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </div>

        <table className="sr-only">
          <caption>Workload received and completed by period</caption>
          <thead>
            <tr>
              <th>Period</th>
              <th>Received</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {workload.map((point) => (
              <tr key={point.label}>
                <td>{point.label}</td>
                <td>{point.received}</td>
                <td>{point.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
