import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  ChevronRight,
  FileSpreadsheet,
  Plus,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import {
  reportListOptions,
  reportTemplateOptions,
} from '../queries/reportQueries'
import type { ReportSource } from '../schemas/reportSchemas'

export function ReportLibrary() {
  const reportsQuery = useQuery(reportListOptions())
  const templatesQuery = useQuery(reportTemplateOptions())
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<ReportSource | 'all'>('all')
  const reports = useMemo(
    () => reportsQuery.data ?? [],
    [reportsQuery.data],
  )
  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return reports
      .filter((report) => source === 'all' || report.source === source)
      .filter(
        (report) =>
          !normalizedSearch ||
          [report.name, report.description].some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          ),
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [reports, search, source])

  if (reportsQuery.isPending || templatesQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading reports</span>
      </Card>
    )
  }

  if (reportsQuery.isError || templatesQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Reports could not be loaded</h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            reportsQuery.refetch()
            templatesQuery.refetch()
          }}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <PermissionGate permission="reports.manage">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              to="/reports/new"
            >
              <Plus aria-hidden="true" className="size-4" />
              New report
            </Link>
          </PermissionGate>
        }
        description="Build repeatable operational reports, retain trusted configurations, and execute them against current platform data."
        eyebrow="Business intelligence"
        title="Reports"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Saved reports
          </p>
          <p className="mt-2 text-2xl font-semibold">{reports.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Templates
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {templatesQuery.data?.length ?? 0}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Data sources
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {new Set(reports.map((report) => report.source)).size}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search reports</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search report name or purpose"
              type="search"
              value={search}
            />
          </label>
          <select
            aria-label="Filter report source"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) => {
              const value = event.target.value
              if (
                value === 'all' ||
                value === 'tasks' ||
                value === 'approvals' ||
                value === 'audit'
              ) {
                setSource(value)
              }
            }}
            value={source}
          >
            <option value="all">All data sources</option>
            <option value="tasks">Tasks</option>
            <option value="approvals">Approvals</option>
            <option value="audit">Audit</option>
          </select>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No reports match</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReports.map((report) => (
              <Link
                className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                key={report.id}
                to={`/reports/${report.id}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                  <BarChart3 aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{report.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {report.description}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {report.source} · {report.columns.length} columns · updated{' '}
                    {new Date(report.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-slate-400"
                />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
