import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight,
  ClipboardCheck,
  History,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { userListOptions } from '../../users/queries/userQueries'
import { auditListOptions } from '../queries/auditQueries'
import type {
  AuditAction,
  AuditEntityType,
} from '../schemas/auditSchemas'
import { AuditActionBadge } from './AuditActionBadge'
import { useUrlState } from '../../../shared/hooks/useUrlState'
import { SavedViewToolbar } from '../../views/components/SavedViewToolbar'
import { useSavedViewUrlState } from '../../views/hooks/useSavedViewUrlState'

const auditViewDefaults = {
  action: 'all',
  actor: 'all',
  dateFrom: '',
  dateTo: '',
  entityId: '',
  entityType: 'all',
  q: '',
  sort: 'recent',
}
const auditViewStateKeys = [
  'action',
  'actor',
  'dateFrom',
  'dateTo',
  'entityId',
  'entityType',
  'q',
  'sort',
]

export function AuditViewer() {
  const auditQuery = useQuery(auditListOptions())
  const usersQuery = useQuery(userListOptions())
  const [search, setSearch] = useUrlState<string>({
    defaultValue: '',
    key: 'q',
  })
  const [entityType, setEntityType] = useUrlState<AuditEntityType | 'all'>({
    defaultValue: 'all',
    key: 'entityType',
    values: ['all', 'approval', 'task'],
  })
  const [entityId, setEntityId] = useUrlState<string>({
    defaultValue: '',
    key: 'entityId',
  })
  const [action, setAction] = useUrlState<AuditAction | 'all'>({
    defaultValue: 'all',
    key: 'action',
    values: [
      'all',
      'created',
      'submitted',
      'approved',
      'rejected',
      'delegated',
      'escalated',
      'reassigned',
      'status-changed',
      'updated',
    ],
  })
  const [actorUserId, setActorUserId] = useUrlState<string>({
    defaultValue: 'all',
    key: 'actor',
  })
  const [dateFrom, setDateFrom] = useUrlState<string>({
    defaultValue: '',
    key: 'dateFrom',
  })
  const [dateTo, setDateTo] = useUrlState<string>({
    defaultValue: '',
    key: 'dateTo',
  })
  const [sort, setSort] = useUrlState<'recent' | 'oldest'>({
    defaultValue: 'recent',
    key: 'sort',
    values: ['recent', 'oldest'],
  })
  const savedView = useSavedViewUrlState({
    defaults: auditViewDefaults,
    stateKeys: auditViewStateKeys,
  })
  const [visibleCount, setVisibleCount] = useState(50)
  const records = useMemo(() => auditQuery.data ?? [], [auditQuery.data])
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])
  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  )

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return records.filter((record) => {
      const actor = userById.get(record.actorUserId)
      const actorName = actor
        ? `${actor.firstName} ${actor.lastName}`.toLowerCase()
        : ''
      return (
        (entityType === 'all' || record.entityType === entityType) &&
        (!entityId || record.entityId === entityId) &&
        (action === 'all' || record.action === action) &&
        (actorUserId === 'all' || record.actorUserId === actorUserId) &&
        (!dateFrom || record.createdAt.slice(0, 10) >= dateFrom) &&
        (!dateTo || record.createdAt.slice(0, 10) <= dateTo) &&
        (!normalizedSearch ||
          [
            record.entityName,
            record.entityId,
            record.summary,
            record.action,
            actorName,
          ].some((value) => value.toLowerCase().includes(normalizedSearch)))
      )
    }).sort((left, right) =>
      sort === 'oldest'
        ? left.createdAt.localeCompare(right.createdAt)
        : right.createdAt.localeCompare(left.createdAt),
    )
  }, [
    action,
    actorUserId,
    dateFrom,
    dateTo,
    entityId,
    entityType,
    records,
    search,
    sort,
    userById,
  ])
  const visibleRecords = filteredRecords.slice(0, visibleCount)

  if (auditQuery.isPending || usersQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading audit records</span>
      </Card>
    )
  }

  if (auditQuery.isError || usersQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Audit records unavailable</h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            auditQuery.refetch()
            usersQuery.refetch()
          }}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  const actorCount = new Set(records.map((record) => record.actorUserId)).size
  const recentCount = records.filter(
    (record) =>
      new Date(record.createdAt).getTime() >=
      new Date('2026-06-14T00:00:00.000Z').getTime(),
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        description="Search immutable, actor-attributed activity across governed approvals and operational tasks."
        eyebrow="Administration"
        title="Audit trail"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Records</p>
          <p className="mt-2 text-2xl font-semibold">{records.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Attributed actors
          </p>
          <p className="mt-2 text-2xl font-semibold">{actorCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recent activity
          </p>
          <p className="mt-2 text-2xl font-semibold">{recentCount}</p>
        </Card>
      </section>
      <SavedViewToolbar
        hasActiveState={savedView.hasActiveState}
        onApply={savedView.apply}
        onPresentationChange={savedView.setPresentation}
        presentation={savedView.presentation}
        resource="audit"
        state={{
          action,
          actor: actorUserId,
          dateFrom,
          dateTo,
          entityId,
          entityType,
          q: search,
          sort,
        }}
      />

      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <label className="relative block">
            <span className="sr-only">Search audit records</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search entity, actor, action, identifier, or summary"
              type="search"
              value={search}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <select
              aria-label="Filter entity type"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === 'all' ||
                  value === 'approval' ||
                  value === 'task'
                ) {
                  setEntityType(value)
                  if (value === 'all') setEntityId('')
                }
              }}
              value={entityType}
            >
              <option value="all">All entities</option>
              <option value="approval">Approvals</option>
              <option value="task">Tasks</option>
            </select>
            <select
              aria-label="Filter action"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === 'all' ||
                  value === 'created' ||
                  value === 'submitted' ||
                  value === 'approved' ||
                  value === 'rejected' ||
                  value === 'delegated' ||
                  value === 'escalated' ||
                  value === 'reassigned' ||
                  value === 'status-changed' ||
                  value === 'updated'
                ) {
                  setAction(value)
                }
              }}
              value={action}
            >
              <option value="all">All actions</option>
              <option value="created">Created</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="delegated">Delegated</option>
              <option value="escalated">Escalated</option>
              <option value="reassigned">Reassigned</option>
              <option value="status-changed">Status changed</option>
              <option value="updated">Updated</option>
            </select>
            <select
              aria-label="Filter actor"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => setActorUserId(event.target.value)}
              value={actorUserId}
            >
              <option value="all">All actors</option>
              {users
                .slice()
                .sort((left, right) =>
                  left.lastName.localeCompare(right.lastName),
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
            </select>
            <input
              aria-label="Audit date from"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => setDateFrom(event.target.value)}
              type="date"
              value={dateFrom}
            />
            <input
              aria-label="Audit date to"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => setDateTo(event.target.value)}
              type="date"
              value={dateTo}
            />
            <select
              aria-label="Sort audit records"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) =>
                setSort(event.target.value as 'recent' | 'oldest')
              }
              value={sort}
            >
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <History
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No audit records match</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleRecords.map((record) => {
              const actor = userById.get(record.actorUserId)
              const EntityIcon =
                record.entityType === 'approval'
                  ? ShieldCheck
                  : ClipboardCheck
              const entityUrl =
                record.entityType === 'approval'
                  ? `/approvals/${record.entityId}`
                  : `/tasks/${record.entityId}`
              return (
                <article className="p-5" key={record.id}>
                  <div className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      <EntityIcon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <AuditActionBadge action={record.action} />
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {record.entityType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(record.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Link
                          className="font-semibold hover:text-brand-700 dark:hover:text-brand-300"
                          to={entityUrl}
                        >
                          {record.entityName}
                        </Link>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-3.5 text-slate-400"
                        />
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {record.summary}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <UserRound aria-hidden="true" className="size-3.5" />
                        {actor
                          ? `${actor.firstName} ${actor.lastName}`
                          : record.actorUserId}
                      </p>
                      {record.changes.length > 0 ? (
                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                          {record.changes.map((change) => (
                            <div
                              className="rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60"
                              key={`${record.id}-${change.field}`}
                            >
                              <dt className="font-semibold text-slate-500 dark:text-slate-400">
                                {change.field}
                              </dt>
                              <dd className="mt-1 text-slate-700 dark:text-slate-200">
                                {change.from ?? '—'} → {change.to ?? '—'}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
            {visibleRecords.length < filteredRecords.length ? (
              <div className="p-4 text-center">
                <button
                  className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setVisibleCount((count) => count + 50)}
                  type="button"
                >
                  Show 50 more ({filteredRecords.length - visibleRecords.length}{' '}
                  remaining)
                </button>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  )
}
