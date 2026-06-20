import {
  BarChart3,
  Building2,
  CheckSquare2,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '../shared/components/Badge'
import { Card } from '../shared/components/Card'
import { PageHeader } from '../shared/components/PageHeader'

type ModuleKey = 'administration' | 'approvals' | 'operations' | 'reports'

interface ModuleDefinition {
  capabilities: string[]
  description: string
  governance: string
  icon: LucideIcon
  roadmap: string
  title: string
}

const modules: Record<ModuleKey, ModuleDefinition> = {
  operations: {
    capabilities: [
      'Department ownership and service boundaries',
      'Operational task queues and assignments',
      'Workflow state and SLA visibility',
      'Cross-team workload coordination',
    ],
    description:
      'The operating center for coordinated work, accountable ownership, and service delivery across the organization.',
    governance: 'Operations leadership',
    icon: ClipboardList,
    roadmap: 'M3, M6, M8',
    title: 'Operations',
  },
  approvals: {
    capabilities: [
      'Policy-based approval chains',
      'Delegation and escalation paths',
      'Decision history and rationale',
      'Pending-review workload management',
    ],
    description:
      'A governed decision workspace for reviews, approvals, escalation, and auditable accountability.',
    governance: 'Risk and compliance',
    icon: CheckSquare2,
    roadmap: 'M5, M7, M10',
    title: 'Approvals',
  },
  reports: {
    capabilities: [
      'Executive operational dashboards',
      'Reusable report definitions',
      'Trend and variance analysis',
      'Controlled exports and distribution',
    ],
    description:
      'A trusted view of enterprise performance, trends, and the operational signals that require attention.',
    governance: 'Business intelligence',
    icon: BarChart3,
    roadmap: 'M2, M11, M12',
    title: 'Reports & analytics',
  },
  administration: {
    capabilities: [
      'User and team lifecycle management',
      'Roles, permissions, and access policies',
      'Organization and department structure',
      'Platform configuration and audit controls',
    ],
    description:
      'The administrative control plane for organizational structure, identity, access, and platform policy.',
    governance: 'Platform administration',
    icon: Building2,
    roadmap: 'M3, M4, M5, M16',
    title: 'Administration',
  },
}

export function ModuleOverviewPage({ module }: { module: ModuleKey }) {
  const definition = modules[module]
  const Icon = definition.icon

  return (
    <div className="space-y-6">
      <PageHeader
        description={definition.description}
        eyebrow="Platform area"
        title={definition.title}
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Icon aria-hidden="true" className="size-6" />
            </div>
            <div>
              <Badge tone="blue">Capability map</Badge>
              <h2 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
                Planned operating capabilities
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                This area defines the product boundary and delivery sequence for
                upcoming domain milestones.
              </p>
            </div>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {definition.capabilities.map((capability) => (
              <li
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                key={capability}
              >
                {capability}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Area governance
          </h2>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Accountable function
              </dt>
              <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                {definition.governance}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Roadmap alignment
              </dt>
              <dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                {definition.roadmap}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current state
              </dt>
              <dd className="mt-2">
                <Badge tone="amber">Foundation defined</Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  )
}
