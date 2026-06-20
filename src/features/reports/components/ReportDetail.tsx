import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import { useAuthorization } from '../../access/hooks/useAuthorization'
import {
  reportDetailOptions,
  reportExecutionOptions,
  useDeleteReport,
} from '../queries/reportQueries'
import { reportResultToCsv } from '../services/reportService'

function downloadCsv(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ReportDetail() {
  const { reportId = '' } = useParams()
  const navigate = useNavigate()
  const reportQuery = useQuery(reportDetailOptions(reportId))
  const executionQuery = useQuery(reportExecutionOptions(reportId))
  const deleteReport = useDeleteReport()
  const { can } = useAuthorization()

  if (reportQuery.isPending || executionQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Executing report</span>
      </Card>
    )
  }

  const report = reportQuery.data
  const result = executionQuery.data
  if (
    reportQuery.isError ||
    executionQuery.isError ||
    !report ||
    !result
  ) {
    return (
      <Card className="p-8 text-center">
        <FileSpreadsheet
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Report unavailable</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/reports">
          Back to reports
        </Link>
      </Card>
    )
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this saved report?')) return
    await deleteReport.mutateAsync(report.id)
    navigate('/reports', { replace: true })
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/reports"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Reports
      </Link>
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={executionQuery.isFetching}
              onClick={() => executionQuery.refetch()}
              variant="secondary"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Refresh data
            </Button>
            {can('reports.export') ? (
              <Button
                onClick={() =>
                  downloadCsv(report.name, reportResultToCsv(result))
                }
                variant="secondary"
              >
                <Download aria-hidden="true" className="size-4" />
                Export CSV
              </Button>
            ) : null}
            <PermissionGate permission="reports.manage">
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                to={`/reports/${report.id}/edit`}
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit report
              </Link>
            </PermissionGate>
          </div>
        }
        description={report.description}
        eyebrow={`${report.source} report · ${result.rows.length} rows`}
        title={report.name}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Rows</p>
          <p className="mt-2 text-2xl font-semibold">{result.rows.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Columns</p>
          <p className="mt-2 text-2xl font-semibold">{result.columns.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Executed
          </p>
          <p className="mt-2 font-semibold">
            {new Date(result.executedAt).toLocaleString()}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        {result.rows.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No rows match these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  {result.columns.map((column) => (
                    <th className="px-4 py-3 font-semibold" key={column.key}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.rows.map((row, index) => (
                  <tr key={`${report.id}-${index}`}>
                    {result.columns.map((column) => (
                      <td
                        className="max-w-80 px-4 py-3 align-top text-slate-600 dark:text-slate-300"
                        key={column.key}
                      >
                        <span className="line-clamp-3">
                          {row[column.key] || '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PermissionGate permission="reports.manage">
        <Card className="border-red-200 p-5 dark:border-red-900">
          <h2 className="font-semibold text-red-700 dark:text-red-300">
            Report controls
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Deleting removes the saved configuration, not source data.
          </p>
          <Button
            className="mt-4"
            disabled={deleteReport.isPending}
            onClick={handleDelete}
            variant="danger"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete report
          </Button>
        </Card>
      </PermissionGate>
    </div>
  )
}
