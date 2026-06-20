import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import {
  reportDetailOptions,
  reportTemplateOptions,
  useCreateReport,
  useUpdateReport,
} from '../queries/reportQueries'
import type { ReportFormValues } from '../schemas/reportSchemas'
import { ReportForm } from './ReportForm'

const starterValues: ReportFormValues = {
  columns: ['title', 'status', 'priority', 'assignee', 'dueDate'],
  description: '',
  filters: {
    dateFrom: '',
    dateTo: '',
    departmentId: '',
    priority: '',
    status: '',
  },
  name: '',
  source: 'tasks',
  templateId: '',
}

export function ReportEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { reportId = '' } = useParams()
  const navigate = useNavigate()
  const reportQuery = useQuery({
    ...reportDetailOptions(reportId),
    enabled: mode === 'edit',
  })
  const templatesQuery = useQuery(reportTemplateOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const createReport = useCreateReport(currentSessionUserId)
  const updateReport = useUpdateReport(reportId)

  if (
    templatesQuery.isPending ||
    departmentsQuery.isPending ||
    (mode === 'edit' && reportQuery.isPending)
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading report editor</span>
      </Card>
    )
  }

  const report = reportQuery.data
  if (
    templatesQuery.isError ||
    departmentsQuery.isError ||
    (mode === 'edit' && (reportQuery.isError || !report))
  ) {
    return (
      <Card className="p-8 text-center">
        <FileSpreadsheet
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Report editor unavailable</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/reports">
          Back to reports
        </Link>
      </Card>
    )
  }

  const initialValues: ReportFormValues = report
    ? {
        columns: report.columns,
        description: report.description,
        filters: report.filters,
        name: report.name,
        source: report.source,
        templateId: report.templateId ?? '',
      }
    : starterValues
  const cancelTarget = report ? `/reports/${report.id}` : '/reports'

  const handleSubmit = async (values: ReportFormValues) => {
    const saved =
      mode === 'create'
        ? await createReport.mutateAsync(values)
        : await updateReport.mutateAsync(values)
    navigate(`/reports/${saved.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to={cancelTarget}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {report ? 'Report results' : 'Reports'}
      </Link>
      <PageHeader
        description="Configure a reusable, validated tabular report over current operational data."
        eyebrow="Report builder"
        title={report ? `Edit ${report.name}` : 'Create report'}
      />
      <ReportForm
        departments={departmentsQuery.data ?? []}
        initialValues={initialValues}
        isSubmitting={createReport.isPending || updateReport.isPending}
        onCancel={() => navigate(cancelTarget)}
        onSubmit={handleSubmit}
        submitLabel={report ? 'Save report' : 'Create report'}
        templates={templatesQuery.data ?? []}
      />
    </div>
  )
}
