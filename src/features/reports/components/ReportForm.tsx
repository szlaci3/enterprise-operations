import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import type { Department } from '../../departments/schemas/departmentSchemas'
import {
  reportFormSchema,
  type ReportFormValues,
  type ReportTemplate,
} from '../schemas/reportSchemas'
import {
  reportColumnLabels,
  reportColumnsBySource,
} from '../services/reportCatalog'
import { ReportServiceError } from '../services/reportService'

interface ReportFormProps {
  departments: Department[]
  initialValues: ReportFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: ReportFormValues) => Promise<void>
  submitLabel: string
  templates: ReportTemplate[]
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

export function ReportForm({
  departments,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
  templates,
}: ReportFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ReportFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(reportFormSchema),
  })
  const source = useWatch({ control, name: 'source' })
  const selectedColumns = useWatch({ control, name: 'columns' })
  const templateId = useWatch({ control, name: 'templateId' })
  const priority = useWatch({ control, name: 'filters.priority' })

  useEffect(() => {
    const available = reportColumnsBySource[source]
    const validColumns = selectedColumns.filter((column) =>
      available.includes(column),
    )
    if (validColumns.length !== selectedColumns.length) {
      setValue('columns', validColumns.length > 0 ? validColumns : available.slice(0, 5))
    }
  }, [selectedColumns, setValue, source])

  useEffect(() => {
    if (source !== 'tasks') setValue('filters.departmentId', '')
    if (source === 'audit') setValue('filters.priority', '')
    if (source === 'approvals' && priority === 'critical') {
      setValue('filters.priority', '')
    }
    if (source === 'tasks' && priority === 'urgent') {
      setValue('filters.priority', '')
    }
  }, [priority, setValue, source])

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId)
    if (!template) {
      setValue('templateId', '')
      return
    }
    reset({
      ...template,
      description: template.description,
      name: template.name,
      templateId,
    })
  }

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ReportServiceError) {
        if (error.code === 'duplicate-name') {
          setError('name', { message: error.message })
          return
        }
        setError('root.server', { message: error.message })
        return
      }
      setError('root.server', { message: 'The report could not be saved.' })
    }
  })

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      {errors.root?.server ? (
        <div
          className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {errors.root.server.message}
        </div>
      ) : null}

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Report identity</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            Starting template
            <select
              className={inputClassName}
              onChange={(event) => applyTemplate(event.target.value)}
              value={templateId}
            >
              <option value="">Custom report</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <input type="hidden" {...register('templateId')} />
          </label>
          <label className={labelClassName}>
            Report name
            <input className={inputClassName} {...register('name')} />
            {errors.name ? (
              <span className={errorClassName}>{errors.name.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Data source
            <select className={inputClassName} {...register('source')}>
              <option value="tasks">Tasks</option>
              <option value="approvals">Approvals</option>
              <option value="audit">Audit</option>
            </select>
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Purpose
            <textarea
              className={`${inputClassName} h-28 resize-y py-2.5`}
              {...register('description')}
            />
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Columns</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose the fields included in the report output.
        </p>
        {typeof errors.columns?.message === 'string' ? (
          <p className={errorClassName}>{errors.columns.message}</p>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reportColumnsBySource[source].map((column) => (
            <label
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium dark:border-slate-700"
              key={column}
            >
              <input
                className="size-4 accent-brand-600"
                type="checkbox"
                value={column}
                {...register('columns')}
              />
              {reportColumnLabels[column]}
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">Execution filters</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Empty filters include all available values.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Status or action
            <input
              className={inputClassName}
              placeholder={
                source === 'tasks'
                  ? 'open, backlog, in-progress...'
                  : source === 'approvals'
                    ? 'pending, approved, rejected'
                    : 'created, approved, status-changed...'
              }
              {...register('filters.status')}
            />
          </label>
          {source !== 'audit' ? (
            <label className={labelClassName}>
              Priority
              <select
                className={inputClassName}
                {...register('filters.priority')}
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value={source === 'approvals' ? 'urgent' : 'critical'}>
                  {source === 'approvals' ? 'Urgent' : 'Critical'}
                </option>
              </select>
            </label>
          ) : (
            <input type="hidden" {...register('filters.priority')} />
          )}
          <label className={labelClassName}>
            Date from
            <input
              className={inputClassName}
              type="date"
              {...register('filters.dateFrom')}
            />
          </label>
          <label className={labelClassName}>
            Date to
            <input
              className={inputClassName}
              type="date"
              {...register('filters.dateTo')}
            />
          </label>
          {source === 'tasks' ? (
            <label className={`${labelClassName} sm:col-span-2`}>
              Department
              <select
                className={inputClassName}
                {...register('filters.departmentId')}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" {...register('filters.departmentId')} />
          )}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          <Save aria-hidden="true" className="size-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
