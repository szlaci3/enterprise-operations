import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  GitBranch,
  Plus,
  Search,
  Waypoints,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../access/components/PermissionGate'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { workflowListOptions } from '../queries/workflowQueries'
import type { WorkflowStatus } from '../schemas/workflowSchemas'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'

type StatusFilter = WorkflowStatus | 'all'

export function WorkflowList() {
  const workflowsQuery = useQuery(workflowListOptions())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const workflows = useMemo(
    () => workflowsQuery.data ?? [],
    [workflowsQuery.data],
  )
  const filteredWorkflows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return workflows
      .filter((workflow) => status === 'all' || workflow.status === status)
      .filter(
        (workflow) =>
          !normalizedSearch ||
          [workflow.name, workflow.workflowKey, workflow.description].some(
            (value) => value.toLowerCase().includes(normalizedSearch),
          ),
      )
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name) || right.version - left.version,
      )
  }, [search, status, workflows])

  if (workflowsQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading workflows</span>
      </Card>
    )
  }

  if (workflowsQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
          Workflows could not be loaded
        </h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => workflowsQuery.refetch()}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  const activeCount = workflows.filter(
    (workflow) => workflow.status === 'active',
  ).length
  const draftCount = workflows.filter(
    (workflow) => workflow.status === 'draft',
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <PermissionGate permission="workflows.manage">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              to="/workflows/new"
            >
              <Plus aria-hidden="true" className="size-4" />
              New workflow
            </Link>
          </PermissionGate>
        }
        description="Design versioned business processes with explicit states, controlled transitions, and reusable starting templates."
        eyebrow="Process management"
        title="Workflow definitions"
      />

      <section
        aria-label="Workflow summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Definitions and versions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {workflows.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active processes
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {activeCount}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Draft versions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {draftCount}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search workflows</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by workflow name, key, or purpose"
              type="search"
              value={search}
            />
          </label>
          <select
            aria-label="Filter by workflow status"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) => {
              const value = event.target.value
              if (
                value === 'all' ||
                value === 'draft' ||
                value === 'active' ||
                value === 'retired'
              ) {
                setStatus(value)
              }
            }}
            value={status}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {filteredWorkflows.length === 0 ? (
          <div className="p-10 text-center">
            <Waypoints
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No workflows match these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Workflow
                  </th>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Version
                  </th>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Process graph
                  </th>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Status
                  </th>
                  <th className="w-12 px-5 py-3" scope="col">
                    <span className="sr-only">Open workflow</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredWorkflows.map((workflow) => (
                  <tr
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    key={workflow.id}
                  >
                    <th className="px-5 py-4" scope="row">
                      <Link
                        className="font-semibold text-slate-900 hover:text-brand-700 dark:text-white"
                        to={`/workflows/${workflow.id}`}
                      >
                        {workflow.name}
                      </Link>
                      <p className="mt-1 text-xs font-normal text-slate-400">
                        {workflow.workflowKey}
                      </p>
                    </th>
                    <td className="px-5 py-4 font-medium">v{workflow.version}</td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <GitBranch aria-hidden="true" className="size-4" />
                        {workflow.states.length} states ·{' '}
                        {workflow.transitions.length} transitions
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <WorkflowStatusBadge status={workflow.status} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        aria-label={`Open ${workflow.name} version ${workflow.version}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        to={`/workflows/${workflow.id}`}
                      >
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
