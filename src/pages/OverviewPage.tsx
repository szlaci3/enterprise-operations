import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Layers3,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../shared/components/Badge'
import { Card } from '../shared/components/Card'
import { PageHeader } from '../shared/components/PageHeader'

const readinessItems = [
  {
    description: 'Provider composition and query defaults are configured.',
    label: 'Application runtime',
    status: 'Ready',
  },
  {
    description: 'Responsive navigation and route recovery are active.',
    label: 'Workspace shell',
    status: 'Ready',
  },
  {
    description: 'Shared visual primitives and design tokens are available.',
    label: 'Design foundation',
    status: 'Ready',
  },
]

const platformAreas = [
  {
    description:
      'Coordinate work queues, service delivery, ownership, and operational health.',
    href: '/operations',
    icon: Layers3,
    title: 'Operations',
  },
  {
    description:
      'Route decisions through controlled reviews, policies, and delegated authority.',
    href: '/approvals',
    icon: ShieldCheck,
    title: 'Approvals',
  },
  {
    description:
      'Manage organizational structures, users, roles, and platform configuration.',
    href: '/administration',
    icon: Users,
    title: 'Administration',
  },
]

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="A unified workspace for managing operational processes, governed decisions, and enterprise performance."
        eyebrow="Northstar Group"
        title="Good morning, Avery"
      />

      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-6 text-white sm:p-8">
            <Badge tone="blue">Foundation online</Badge>
            <h2 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Your operations workspace is ready to grow.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-100">
              Core navigation, application state, query infrastructure, error
              recovery, and design foundations are active across the platform.
            </p>
            <div className="mt-7 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-2xl font-semibold">6</p>
                <p className="text-brand-200">Workspace routes</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">100%</p>
                <p className="text-brand-200">Foundation readiness</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">M2</p>
                <p className="text-brand-200">Next delivery milestone</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-950 dark:text-white">
                Platform readiness
              </h2>
              <Badge tone="green">Operational</Badge>
            </div>
            <div className="mt-5 space-y-5">
              {readinessItems.map((item) => (
                <div className="flex gap-3" key={item.label}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-emerald-500"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.label}
                      </p>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Platform areas
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Explore the operating model this workspace will support.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {platformAreas.map(({ description, href, icon: Icon, title }) => (
            <Card
              className="group p-5 transition-shadow hover:shadow-md"
              key={title}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 min-h-15 text-sm leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                to={href}
              >
                View area
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Delivery sequence
            </h2>
            <Badge tone="amber">Phase 1</Badge>
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            <li className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
              <CheckCircle2
                aria-hidden="true"
                className="size-5 text-emerald-600 dark:text-emerald-400"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                M1 · Foundation
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Application infrastructure and shared workspace.
              </p>
            </li>
            <li className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/40">
              <CircleDot
                aria-hidden="true"
                className="size-5 text-brand-600 dark:text-brand-300"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                M2 · Dashboard
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Live KPIs, alerts, and operational summaries.
              </p>
            </li>
            <li className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <Clock3
                aria-hidden="true"
                className="size-5 text-slate-400"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                M3 · Departments
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                First complete entity management workflow.
              </p>
            </li>
          </ol>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Environment
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Workspace</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                Production simulation
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Region</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                Global
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Data layer</dt>
              <dd>
                <Badge tone="blue">Simulated</Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  )
}
