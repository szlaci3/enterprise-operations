import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, FilePlus2, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { approvalListOptions } from '../../approvals/queries/approvalQueries'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { taskListOptions } from '../../tasks/queries/taskQueries'
import { userListOptions } from '../../users/queries/userQueries'
import { useCreateDocument } from '../queries/documentQueries'
import {
  documentFormSchema,
  type DocumentFilePayload,
  type DocumentFormValues,
} from '../schemas/documentSchemas'
import {
  documentStoragePolicy,
  DocumentServiceError,
} from '../services/documentService'

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

function readFile(file: File): Promise<DocumentFilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The attachment could not be read.'))
    reader.onload = () =>
      resolve({
        contentDataUrl: String(reader.result),
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      })
    reader.readAsDataURL(file)
  })
}

export function DocumentEditor() {
  const navigate = useNavigate()
  const usersQuery = useQuery(userListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const tasksQuery = useQuery(taskListOptions())
  const approvalsQuery = useQuery(approvalListOptions())
  const createDocument = useCreateDocument(currentSessionUserId)
  const [file, setFile] = useState<File | null>(null)
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<DocumentFormValues>({
    defaultValues: {
      classification: 'internal',
      departmentId: '',
      description: '',
      linkEntityId: '',
      linkEntityType: '',
      ownerUserId: currentSessionUserId,
      retentionCategory: 'operational',
      title: '',
    },
    resolver: zodResolver(documentFormSchema),
  })
  const linkEntityType = useWatch({ control, name: 'linkEntityType' })

  if (
    usersQuery.isPending ||
    departmentsQuery.isPending ||
    tasksQuery.isPending ||
    approvalsQuery.isPending
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading document editor</span>
      </Card>
    )
  }

  if (
    usersQuery.isError ||
    departmentsQuery.isError ||
    tasksQuery.isError ||
    approvalsQuery.isError
  ) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Document editor unavailable</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/documents">
          Back to documents
        </Link>
      </Card>
    )
  }

  const submit = handleSubmit(async (values) => {
    if (!file) {
      setError('root.file', { message: 'Select an attachment to continue.' })
      return
    }
    try {
      const document = await createDocument.mutateAsync({
        file: await readFile(file),
        values,
      })
      navigate(`/documents/${document.id}`, { replace: true })
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        if (error.code === 'duplicate-title') {
          setError('title', { message: error.message })
          return
        }
        setError('root.server', { message: error.message })
        return
      }
      setError('root.server', { message: 'The document could not be created.' })
    }
  })

  const activeUsers = (usersQuery.data ?? []).filter(
    (user) => user.status === 'active',
  )
  const activeDepartments = (departmentsQuery.data ?? []).filter(
    (department) => department.status === 'active',
  )
  const linkedRecords =
    linkEntityType === 'task'
      ? tasksQuery.data ?? []
      : linkEntityType === 'approval'
        ? approvalsQuery.data ?? []
        : []

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/documents"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Documents
      </Link>
      <PageHeader
        description="Register governed metadata and the first immutable content version."
        eyebrow="Document intake"
        title="Add document"
      />

      <form className="space-y-5" noValidate onSubmit={submit}>
        {errors.root?.server || errors.root?.file ? (
          <div
            className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {errors.root.server?.message ?? errors.root.file?.message}
          </div>
        ) : null}

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold">Governance metadata</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={`${labelClassName} sm:col-span-2`}>
              Document title
              <input className={inputClassName} {...register('title')} />
              {errors.title ? (
                <span className={errorClassName}>{errors.title.message}</span>
              ) : null}
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Business context
              <textarea
                className={`${inputClassName} h-28 resize-y py-2.5`}
                {...register('description')}
              />
              {errors.description ? (
                <span className={errorClassName}>
                  {errors.description.message}
                </span>
              ) : null}
            </label>
            <label className={labelClassName}>
              Owner
              <select className={inputClassName} {...register('ownerUserId')}>
                {activeUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClassName}>
              Department
              <select className={inputClassName} {...register('departmentId')}>
                <option value="">Select department</option>
                {activeDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.departmentId ? (
                <span className={errorClassName}>
                  {errors.departmentId.message}
                </span>
              ) : null}
            </label>
            <label className={labelClassName}>
              Classification
              <select
                className={inputClassName}
                {...register('classification')}
              >
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </label>
            <label className={labelClassName}>
              Retention category
              <select
                className={inputClassName}
                {...register('retentionCategory')}
              >
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="legal">Legal</option>
                <option value="personnel">Personnel</option>
              </select>
            </label>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <FilePlus2 aria-hidden="true" className="size-5" />
            Initial attachment
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            PDF, PNG, JPEG, CSV, or text. Maximum 750 KB per version and 3 MB
            per document.
          </p>
          <input
            accept={documentStoragePolicy.allowedMimeTypes.join(',')}
            className={`${inputClassName} mt-4 py-2`}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold">Operational link</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Optionally connect the document to a governed work record.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Record type
              <select
                className={inputClassName}
                {...register('linkEntityType')}
              >
                <option value="">No initial link</option>
                <option value="task">Task</option>
                <option value="approval">Approval</option>
              </select>
            </label>
            <label className={labelClassName}>
              Record
              <select
                className={inputClassName}
                disabled={!linkEntityType}
                {...register('linkEntityId')}
              >
                <option value="">Select record</option>
                {linkedRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.title}
                  </option>
                ))}
              </select>
              {errors.linkEntityId ? (
                <span className={errorClassName}>
                  {errors.linkEntityId.message}
                </span>
              ) : null}
            </label>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => navigate('/documents')} variant="secondary">
            Cancel
          </Button>
          <Button disabled={createDocument.isPending} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {createDocument.isPending ? 'Creating...' : 'Create document'}
          </Button>
        </div>
      </form>
    </div>
  )
}
