import { useQuery } from '@tanstack/react-query'
import { ChevronRight, FileText, Plus } from 'lucide-react'
import { useMemo } from 'react'
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
import {
  CollectionEmpty,
  CollectionError,
  CollectionLoading,
  FilterBar,
  SearchField,
  SelectFilter,
} from '../../../shared/components/CollectionWorkspace'
import { SummaryGrid } from '../../../shared/components/SummaryGrid'
import { useUrlState } from '../../../shared/hooks/useUrlState'
import { SavedViewToolbar } from '../../views/components/SavedViewToolbar'
import { useSavedViewUrlState } from '../../views/hooks/useSavedViewUrlState'

type DocumentSort = 'updated' | 'title' | 'versions'
const documentViewDefaults = { q: '', sort: 'updated', status: 'all' }
const documentViewStateKeys = ['q', 'sort', 'status']

export function DocumentLibrary() {
  const documentsQuery = useQuery(documentListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const [search, setSearch] = useUrlState<string>({
    defaultValue: '',
    key: 'q',
  })
  const [status, setStatus] = useUrlState<DocumentStatus | 'all'>({
    defaultValue: 'all',
    key: 'status',
    values: ['all', 'draft', 'published', 'archived'],
  })
  const [sort, setSort] = useUrlState<DocumentSort>({
    defaultValue: 'updated',
    key: 'sort',
    values: ['updated', 'title', 'versions'],
  })
  const savedView = useSavedViewUrlState({
    defaults: documentViewDefaults,
    stateKeys: documentViewStateKeys,
  })
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
      .sort((left, right) => {
        if (sort === 'title') return left.title.localeCompare(right.title)
        if (sort === 'versions') {
          return right.versions.length - left.versions.length
        }
        return right.updatedAt.localeCompare(left.updatedAt)
      })
  }, [documents, search, sort, status])
  const departmentsById = new Map(
    (departmentsQuery.data ?? []).map((department) => [
      department.id,
      department,
    ]),
  )

  if (documentsQuery.isPending || departmentsQuery.isPending) {
    return <CollectionLoading label="Loading documents" />
  }

  if (documentsQuery.isError || departmentsQuery.isError) {
    return (
      <CollectionError
        onRetry={() => {
            documentsQuery.refetch()
            departmentsQuery.refetch()
        }}
        title="Documents could not be loaded"
      />
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

      <SummaryGrid
        ariaLabel="Document summary"
        metrics={[
          { label: 'Controlled documents', value: documents.length },
          {
            label: 'Published',
            value: documents.filter(
              (document) => document.status === 'published',
            ).length,
          },
          {
            label: 'Stored versions',
            value: documents.reduce(
              (total, document) => total + document.versions.length,
              0,
            ),
          },
        ]}
      />
      <SavedViewToolbar
        hasActiveState={savedView.hasActiveState}
        onApply={savedView.apply}
        onPresentationChange={savedView.setPresentation}
        presentation={savedView.presentation}
        resource="documents"
        state={{ q: search, sort, status }}
      />

      <Card className="overflow-hidden">
        <FilterBar
          primary={
            <SearchField
              label="Search documents"
              onChange={setSearch}
              placeholder="Search title or business context"
              value={search}
            />
          }
        >
          <SelectFilter
            label="Filter document status"
            onChange={(event) =>
              setStatus(event.target.value as DocumentStatus | 'all')
            }
            value={status}
          >
            <option value="all">All lifecycle states</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </SelectFilter>
          <SelectFilter
            label="Sort documents"
            onChange={(event) =>
              setSort(event.target.value as DocumentSort)
            }
            value={sort}
          >
            <option value="updated">Recently updated</option>
            <option value="title">Title</option>
            <option value="versions">Most versions</option>
          </SelectFilter>
        </FilterBar>

        {filtered.length === 0 ? (
          <CollectionEmpty
            icon={<FileText aria-hidden="true" className="size-9" />}
            title="No documents match"
          />
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
