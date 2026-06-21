import { useQuery } from '@tanstack/react-query'
import { ChevronRight, FileText, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { documentListOptions } from '../queries/documentQueries'
import type { DocumentStatus } from '../schemas/documentSchemas'
import {
  DocumentClassificationBadge,
  DocumentStatusBadge,
} from './DocumentBadges'

export function DocumentLibrary() {
  const documentsQuery = useQuery(documentListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DocumentStatus | 'all'>('all')
  const documents = useMemo(
    () => documentsQuery.data ?? [],
    [documentsQuery.data],
  )
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return documents
      .filter((document) => status === 'all' || document.status === status)
      .filter(
        (document) =>
          !normalizedSearch ||
          [document.title, document.description].some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          ),
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [documents, search, status])
  const departmentsById = new Map(
    (departmentsQuery.data ?? []).map((department) => [
      department.id,
      department,
    ]),
  )

  if (documentsQuery.isPending || departmentsQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading documents</span>
      </Card>
    )
  }

  if (documentsQuery.isError || departmentsQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Documents could not be loaded</h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            documentsQuery.refetch()
            departmentsQuery.refetch()
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
          <PermissionGate permission="documents.manage">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              to="/documents/new"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add document
            </Link>
          </PermissionGate>
        }
        description="Control operational files, preserve immutable versions, and connect evidence to the work it supports."
        eyebrow="Content governance"
        title="Documents"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Controlled documents
          </p>
          <p className="mt-2 text-2xl font-semibold">{documents.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Published
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {documents.filter((document) => document.status === 'published').length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stored versions
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {documents.reduce(
              (total, document) => total + document.versions.length,
              0,
            )}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search documents</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title or business context"
              type="search"
              value={search}
            />
          </label>
          <select
            aria-label="Filter document status"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) =>
              setStatus(event.target.value as DocumentStatus | 'all')
            }
            value={status}
          >
            <option value="all">All lifecycle states</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FileText
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No documents match</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((document) => {
              const latest =
                document.versions[document.versions.length - 1]
              return (
                <Link
                  className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  key={document.id}
                  to={`/documents/${document.id}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                    <FileText aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{document.title}</h2>
                      <DocumentStatusBadge status={document.status} />
                      <DocumentClassificationBadge
                        classification={document.classification}
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {document.description}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {departmentsById.get(document.departmentId)?.name ??
                        'Unknown department'}{' '}
                      · v{latest.number} · {document.links.length} links
                    </p>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-slate-400"
                  />
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
