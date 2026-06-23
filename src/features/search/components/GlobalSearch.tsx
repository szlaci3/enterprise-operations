import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  CheckSquare2,
  ChevronRight,
  FileSpreadsheet,
  Search,
  UserRound,
  Waypoints,
  ClipboardCheck,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useAuthorization } from '../../access/hooks/useAuthorization'
import {
  searchPreferencesOptions,
  searchResultsOptions,
  useRecordRecentSearch,
} from '../queries/searchQueries'
import {
  type SearchEntityType,
  type SearchRequest,
  type SearchResult,
} from '../schemas/searchSchemas'
import { SavedViewToolbar } from '../../views/components/SavedViewToolbar'
import { useSavedViewUrlState } from '../../views/hooks/useSavedViewUrlState'

const entityConfig = {
  approval: { icon: CheckSquare2, label: 'Approvals' },
  department: { icon: Building2, label: 'Departments' },
  report: { icon: FileSpreadsheet, label: 'Reports' },
  task: { icon: ClipboardCheck, label: 'Tasks' },
  user: { icon: UserRound, label: 'Users' },
  workflow: { icon: Waypoints, label: 'Workflows' },
} satisfies Record<
  SearchEntityType,
  { icon: typeof Building2; label: string }
>

const entityTypes: SearchEntityType[] = [
  'approval',
  'department',
  'report',
  'task',
  'user',
  'workflow',
]
const searchViewDefaults = {
  q: '',
  sort: 'relevance',
  status: '',
  types: '',
  updated: 'all',
}
const searchViewStateKeys = ['q', 'sort', 'status', 'types', 'updated']

function isSearchEntityType(value: string | null): value is SearchEntityType {
  return value !== null && entityTypes.some((entityType) => entityType === value)
}

function SearchResultRow({ result }: { result: SearchResult }) {
  const config = entityConfig[result.entityType]
  const Icon = config.icon
  return (
    <Link
      className="flex items-center gap-4 p-4 hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800/40 dark:focus:bg-slate-800/40"
      to={result.url}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{result.title}</p>
          <Badge tone="slate">{result.status}</Badge>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          {result.description}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {result.metadata.join(' · ')}
        </p>
      </div>
      <ChevronRight aria-hidden="true" className="size-5 text-slate-400" />
    </Link>
  )
}

export function GlobalSearch() {
  const { accessQuery } = useAuthorization()
  const permissionKeys = useMemo(
    () => accessQuery.data?.permissionKeys ?? [],
    [accessQuery.data?.permissionKeys],
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const initialTypes = (searchParams.get('types') ?? '')
    .split(',')
    .filter(isSearchEntityType)
  const [draftQuery, setDraftQuery] = useState(initialQuery)
  const [request, setRequest] = useState<SearchRequest>({
    filters: {
      entityTypes: initialTypes,
      status: searchParams.get('status') ?? '',
      updatedWithin:
        searchParams.get('updated') === '7d' ||
        searchParams.get('updated') === '30d' ||
        searchParams.get('updated') === '90d'
          ? searchParams.get('updated') as '7d' | '30d' | '90d'
          : 'all',
    },
    query: initialQuery,
    sort: searchParams.get('sort') === 'recent' ? 'recent' : 'relevance',
  })
  const savedView = useSavedViewUrlState({
    defaults: searchViewDefaults,
    stateKeys: searchViewStateKeys,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsQuery = useQuery({
    ...searchResultsOptions(request, permissionKeys),
    enabled: !accessQuery.isPending,
  })
  const preferencesQuery = useQuery(
    searchPreferencesOptions(currentSessionUserId),
  )
  const recordRecent = useRecordRecentSearch(currentSessionUserId)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeSearch = (nextRequest: SearchRequest) => {
    setDraftQuery(nextRequest.query)
    setRequest(nextRequest)
    const params = new URLSearchParams()
    if (nextRequest.query) params.set('q', nextRequest.query)
    if (nextRequest.filters.entityTypes.length > 0) {
      params.set('types', nextRequest.filters.entityTypes.join(','))
    }
    if (nextRequest.filters.status) {
      params.set('status', nextRequest.filters.status)
    }
    if (nextRequest.filters.updatedWithin !== 'all') {
      params.set('updated', nextRequest.filters.updatedWithin)
    }
    if (nextRequest.sort !== 'relevance') params.set('sort', nextRequest.sort)
    setSearchParams(params, { replace: true })
    if (nextRequest.query.trim()) recordRecent.mutate(nextRequest.query)
  }

  const grouped = useMemo(() => {
    const groups = new Map<SearchEntityType, SearchResult[]>()
    for (const result of resultsQuery.data?.results ?? []) {
      const current = groups.get(result.entityType) ?? []
      current.push(result)
      groups.set(result.entityType, current)
    }
    return groups
  }, [resultsQuery.data?.results])

  if (accessQuery.isPending || preferencesQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading global search</span>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Find people, organization units, workflows, operational work, governed decisions, and saved reports from one ranked index."
        eyebrow="Enterprise discovery"
        title="Global search"
      />

      <Card className="p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            executeSearch({ ...request, query: draftQuery.trim() })
          }}
        >
          <label className="relative block">
            <span className="sr-only">Search the workspace</span>
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-13 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-28 text-base shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950"
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Search names, identifiers, descriptions, owners, statuses..."
              ref={inputRef}
              type="search"
              value={draftQuery}
            />
            <Button className="absolute right-1.5 top-1.5 h-10" type="submit">
              Search
            </Button>
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                request.filters.entityTypes.length === 0
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
              onClick={() =>
                executeSearch({
                  ...request,
                  filters: { ...request.filters, entityTypes: [] },
                })
              }
              type="button"
            >
              All types
            </button>
            {entityTypes.map((type) => (
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  request.filters.entityTypes.includes(type)
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
                key={type}
                onClick={() =>
                  executeSearch({
                    ...request,
                    filters: {
                      ...request.filters,
                      entityTypes: request.filters.entityTypes.includes(type)
                        ? request.filters.entityTypes.filter(
                            (item) => item !== type,
                          )
                        : [...request.filters.entityTypes, type],
                    },
                  })
                }
                type="button"
              >
                {entityConfig[type].label}
                {resultsQuery.data?.facets.entityTypes.find(
                  (facet) => facet.value === type,
                )?.count !== undefined
                  ? ` · ${resultsQuery.data.facets.entityTypes.find(
                      (facet) => facet.value === type,
                    )?.count}`
                  : ''}
              </button>
            ))}
            <select
              aria-label="Filter search status"
              className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) =>
                executeSearch({
                  ...request,
                  filters: {
                    ...request.filters,
                    status: event.target.value,
                  },
                })
              }
              value={request.filters.status}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>
            <select
              aria-label="Filter by update recency"
              className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) =>
                executeSearch({
                  ...request,
                  filters: {
                    ...request.filters,
                    updatedWithin: event.target.value as
                      | 'all'
                      | '7d'
                      | '30d'
                      | '90d',
                  },
                })
              }
              value={request.filters.updatedWithin}
            >
              <option value="all">Any update date</option>
              <option value="7d">Updated in 7 days</option>
              <option value="30d">Updated in 30 days</option>
              <option value="90d">Updated in 90 days</option>
            </select>
            <select
              aria-label="Sort search results"
              className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) =>
                executeSearch({
                  ...request,
                  sort: event.target.value as 'relevance' | 'recent',
                })
              }
              value={request.sort}
            >
              <option value="relevance">Most relevant</option>
              <option value="recent">Most recently updated</option>
            </select>
          </div>
        </form>
      </Card>
      <SavedViewToolbar
        hasActiveState={savedView.hasActiveState}
        onApply={(state) => {
          const types = state.types
            .split(',')
            .filter(isSearchEntityType)
          executeSearch({
            filters: {
              entityTypes: types,
              status: state.status,
              updatedWithin:
                state.updated === '7d' ||
                state.updated === '30d' ||
                state.updated === '90d'
                  ? state.updated
                  : 'all',
            },
            query: state.q,
            sort: state.sort === 'recent' ? 'recent' : 'relevance',
          })
        }}
        presentation={savedView.presentation}
        resource="search"
        state={{
          q: request.query,
          sort: request.sort,
          status: request.filters.status,
          types: request.filters.entityTypes.join(','),
          updated: request.filters.updatedWithin,
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm font-semibold">
              {resultsQuery.isFetching
                ? 'Searching...'
                : `${resultsQuery.data?.total ?? 0} results`}
            </p>
          </div>
          {resultsQuery.isError ? (
            <div className="p-8 text-center text-red-600">
              Search results could not be loaded.
            </div>
          ) : (resultsQuery.data?.results.length ?? 0) === 0 ? (
            <div className="p-10 text-center">
              <Search
                aria-hidden="true"
                className="mx-auto size-9 text-slate-300"
              />
              <p className="mt-3 font-semibold">No matching records</p>
              <p className="mt-1 text-sm text-slate-500">
                Try fewer terms or a broader entity filter.
              </p>
            </div>
          ) : (
            <div>
              {entityTypes.map((type) => {
                const items = grouped.get(type)
                if (!items?.length) return null
                return (
                  <section key={type}>
                    <h2 className="border-y border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 first:border-t-0 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                      {entityConfig[type].label} · {items.length}
                    </h2>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((result) => (
                        <SearchResultRow key={`${type}-${result.id}`} result={result} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Recent searches</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(preferencesQuery.data?.recentQueries ?? []).map((query) => (
                <button
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300"
                  key={query}
                  onClick={() =>
                    executeSearch({ ...request, query })
                  }
                  type="button"
                >
                  {query}
                </button>
              ))}
              {preferencesQuery.data?.recentQueries.length === 0 ? (
                <p className="text-sm text-slate-500">No recent searches.</p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
