import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  Archive,
  ArrowLeft,
  Download,
  FileClock,
  FileText,
  Link2,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import { approvalListOptions } from '../../approvals/queries/approvalQueries'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { taskListOptions } from '../../tasks/queries/taskQueries'
import { userListOptions } from '../../users/queries/userQueries'
import {
  documentDetailOptions,
  useAddDocumentLink,
  useAddDocumentVersion,
  useRemoveDocumentLink,
  useTransitionDocument,
} from '../queries/documentQueries'
import {
  documentVersionFormSchema,
  type DocumentFilePayload,
  type DocumentVersionFormValues,
} from '../schemas/documentSchemas'
import {
  documentStoragePolicy,
  DocumentServiceError,
} from '../services/documentService'
import {
  DocumentClassificationBadge,
  DocumentStatusBadge,
} from './DocumentBadges'

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
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

function formatBytes(value: number) {
  return value < 1024
    ? `${value} B`
    : value < 1024 * 1024
      ? `${(value / 1024).toFixed(1)} KB`
      : `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentDetail() {
  const { documentId = '' } = useParams()
  const documentQuery = useQuery(documentDetailOptions(documentId))
  const usersQuery = useQuery(userListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const tasksQuery = useQuery(taskListOptions())
  const approvalsQuery = useQuery(approvalListOptions())
  const addVersion = useAddDocumentVersion(documentId, currentSessionUserId)
  const transitionDocument = useTransitionDocument(
    documentId,
    currentSessionUserId,
  )
  const addLink = useAddDocumentLink(documentId)
  const removeLink = useRemoveDocumentLink(documentId)
  const [file, setFile] = useState<File | null>(null)
  const [linkType, setLinkType] = useState<'task' | 'approval'>('task')
  const [linkId, setLinkId] = useState('')
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<DocumentVersionFormValues>({
    defaultValues: { changeSummary: '' },
    resolver: zodResolver(documentVersionFormSchema),
  })

  if (
    documentQuery.isPending ||
    usersQuery.isPending ||
    departmentsQuery.isPending ||
    tasksQuery.isPending ||
    approvalsQuery.isPending
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading document</span>
      </Card>
    )
  }

  const document = documentQuery.data
  if (
    documentQuery.isError ||
    usersQuery.isError ||
    departmentsQuery.isError ||
    tasksQuery.isError ||
    approvalsQuery.isError ||
    !document
  ) {
    return (
      <Card className="p-8 text-center">
        <FileText
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Document unavailable</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/documents">
          Back to documents
        </Link>
      </Card>
    )
  }

  const usersById = new Map(
    (usersQuery.data ?? []).map((user) => [user.id, user]),
  )
  const departmentsById = new Map(
    (departmentsQuery.data ?? []).map((department) => [
      department.id,
      department,
    ]),
  )
  const tasksById = new Map(
    (tasksQuery.data ?? []).map((task) => [task.id, task]),
  )
  const approvalsById = new Map(
    (approvalsQuery.data ?? []).map((approval) => [approval.id, approval]),
  )
  const linkRecords =
    linkType === 'task' ? tasksQuery.data ?? [] : approvalsQuery.data ?? []
  const usedBytes = document.versions.reduce(
    (total, version) => total + version.sizeBytes,
    0,
  )
  const owner = usersById.get(document.ownerUserId)

  const submitVersion = handleSubmit(async (values) => {
    if (!file) {
      setError('root.file', { message: 'Select a file for the new version.' })
      return
    }
    try {
      await addVersion.mutateAsync({ file: await readFile(file), values })
      setFile(null)
      reset()
    } catch (error) {
      setError('root.server', {
        message:
          error instanceof DocumentServiceError
            ? error.message
            : 'The version could not be stored.',
      })
    }
  })

  const handleAddLink = async () => {
    if (!linkId) return
    await addLink.mutateAsync({ entityId: linkId, entityType: linkType })
    setLinkId('')
  }

  const lifecycleAction =
    document.status === 'draft'
      ? { icon: Send, label: 'Publish', status: 'published' as const }
      : document.status === 'published'
        ? { icon: Archive, label: 'Archive', status: 'archived' as const }
        : { icon: RotateCcw, label: 'Restore to draft', status: 'draft' as const }
  const LifecycleIcon = lifecycleAction.icon

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/documents"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Documents
      </Link>
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DocumentStatusBadge status={document.status} />
            <DocumentClassificationBadge
              classification={document.classification}
            />
            <PermissionGate permission="documents.manage">
              <Button
                disabled={transitionDocument.isPending}
                onClick={() =>
                  transitionDocument.mutate(lifecycleAction.status)
                }
                variant="secondary"
              >
                <LifecycleIcon aria-hidden="true" className="size-4" />
                {lifecycleAction.label}
              </Button>
            </PermissionGate>
          </div>
        }
        description={document.description}
        eyebrow={`${document.retentionCategory} record · ${document.id.slice(0, 12)}`}
        title={document.title}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Owner</p>
          <p className="mt-2 font-semibold">
            {owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown owner'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Department
          </p>
          <p className="mt-2 font-semibold">
            {departmentsById.get(document.departmentId)?.name ??
              'Unknown department'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Versions</p>
          <p className="mt-2 text-2xl font-semibold">
            {document.versions.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browser storage
          </p>
          <p className="mt-2 font-semibold">
            {formatBytes(usedBytes)} / {formatBytes(documentStoragePolicy.maxDocumentBytes)}
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileClock aria-hidden="true" className="size-5" />
              Immutable version history
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Prior content remains available after each replacement.
            </p>
          </div>
          <ol className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...document.versions].reverse().map((version) => {
              const creator = usersById.get(version.createdByUserId)
              return (
                <li className="p-5" key={version.id}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold">
                        Version {version.number} · {version.fileName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {version.changeSummary}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {creator
                          ? `${creator.firstName} ${creator.lastName}`
                          : 'Unknown contributor'}{' '}
                        · {new Date(version.createdAt).toLocaleString()} ·{' '}
                        {formatBytes(version.sizeBytes)}
                      </p>
                      <p className="mt-1 max-w-lg truncate font-mono text-[10px] text-slate-400">
                        SHA-256 {version.contentHash}
                      </p>
                    </div>
                    <PermissionGate permission="documents.download">
                      <a
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
                        download={version.fileName}
                        href={version.contentDataUrl}
                      >
                        <Download aria-hidden="true" className="size-4" />
                        Download
                      </a>
                    </PermissionGate>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Link2 aria-hidden="true" className="size-5" />
              Operational links
            </h2>
            {document.links.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No linked records.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {document.links.map((link) => {
                  const record =
                    link.entityType === 'task'
                      ? tasksById.get(link.entityId)
                      : approvalsById.get(link.entityId)
                  return (
                    <div
                      className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                      key={`${link.entityType}-${link.entityId}`}
                    >
                      <Link
                        className="min-w-0 flex-1 text-sm font-semibold text-brand-700 dark:text-brand-300"
                        to={`/${link.entityType === 'task' ? 'tasks' : 'approvals'}/${link.entityId}`}
                      >
                        <span className="block truncate">
                          {record?.title ?? link.entityId}
                        </span>
                        <span className="text-xs font-normal text-slate-400">
                          {link.entityType}
                        </span>
                      </Link>
                      <PermissionGate permission="documents.manage">
                        <button
                          aria-label="Remove document link"
                          className="rounded p-1 text-slate-400 hover:text-red-600"
                          onClick={() => removeLink.mutate(link)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </PermissionGate>
                    </div>
                  )
                })}
              </div>
            )}
            <PermissionGate permission="documents.manage">
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <select
                  aria-label="Linked record type"
                  className={inputClassName}
                  onChange={(event) => {
                    setLinkType(event.target.value as 'task' | 'approval')
                    setLinkId('')
                  }}
                  value={linkType}
                >
                  <option value="task">Task</option>
                  <option value="approval">Approval</option>
                </select>
                <select
                  aria-label="Linked record"
                  className={inputClassName}
                  onChange={(event) => setLinkId(event.target.value)}
                  value={linkId}
                >
                  <option value="">Select record</option>
                  {linkRecords.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.title}
                    </option>
                  ))}
                </select>
                <Button
                  className="mt-3 w-full"
                  disabled={!linkId || addLink.isPending}
                  onClick={handleAddLink}
                  variant="secondary"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Add link
                </Button>
              </div>
            </PermissionGate>
          </Card>

          <PermissionGate permission="documents.manage">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Upload aria-hidden="true" className="size-5" />
                Add version
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Uploading creates a new immutable version.
              </p>
              <form className="mt-4 space-y-4" onSubmit={submitVersion}>
                <input
                  accept={documentStoragePolicy.allowedMimeTypes.join(',')}
                  className={`${inputClassName} py-2`}
                  onChange={(event) =>
                    setFile(event.target.files?.[0] ?? null)
                  }
                  type="file"
                />
                <label className="text-sm font-semibold">
                  Change summary
                  <textarea
                    className={`${inputClassName} h-24 resize-y py-2.5`}
                    {...register('changeSummary')}
                  />
                  {errors.changeSummary ? (
                    <span className={errorClassName}>
                      {errors.changeSummary.message}
                    </span>
                  ) : null}
                </label>
                {errors.root?.server || errors.root?.file ? (
                  <p className={errorClassName}>
                    {errors.root.server?.message ?? errors.root.file?.message}
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  disabled={addVersion.isPending}
                  type="submit"
                >
                  Store new version
                </Button>
              </form>
            </Card>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
