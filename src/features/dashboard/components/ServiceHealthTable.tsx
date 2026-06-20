import { Badge } from '../../../shared/components/Badge'
import { Card } from '../../../shared/components/Card'
import type { ServiceSummary } from '../schemas/dashboardSchemas'

const statusConfig = {
  critical: { label: 'Critical', tone: 'red' as const },
  healthy: { label: 'Healthy', tone: 'green' as const },
  watch: { label: 'Watch', tone: 'amber' as const },
}

export function ServiceHealthTable({
  services,
}: {
  services: ServiceSummary[]
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Service performance
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Throughput, outstanding work, and SLA health by operating service.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-semibold" scope="col">
                Service
              </th>
              <th className="px-5 py-3 font-semibold" scope="col">
                Owner
              </th>
              <th className="px-5 py-3 text-right font-semibold" scope="col">
                Throughput
              </th>
              <th className="px-5 py-3 text-right font-semibold" scope="col">
                Open
              </th>
              <th className="px-5 py-3 text-right font-semibold" scope="col">
                SLA
              </th>
              <th className="px-5 py-3 font-semibold" scope="col">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {services.map((service) => {
              const status = statusConfig[service.status]
              return (
                <tr key={service.id}>
                  <th
                    className="px-5 py-4 font-semibold text-slate-900 dark:text-white"
                    scope="row"
                  >
                    {service.name}
                  </th>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                    {service.owner}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-700 dark:text-slate-200">
                    {service.throughput.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-700 dark:text-slate-200">
                    {service.openItems}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-700 dark:text-slate-200">
                    {service.slaPerformance.toFixed(1)}%
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
