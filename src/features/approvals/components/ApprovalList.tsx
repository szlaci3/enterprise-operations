import { useQuery } from '@tanstack/react-query'
import {
  CheckSquare2,
  ChevronRight,
  Clock3,
  Plus,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { userListOptions } from '../../users/queries/userQueries'
import { approvalListOptions } from '../queries/approvalQueries'
import type { ApprovalStatus } from '../schemas/approvalSchemas'
import {
  ApprovalPriorityBadge,
  ApprovalStatusBadge,
} from './ApprovalBadges'

type QueueFilter = 'assigned' | 'submitted' | 'all'
type StatusFilter = ApprovalStatus | 'all'

export function ApprovalList() {
  const approvalsQuery = useQuery(approvalListOptions())
  const usersQuery = useQuery(userListOptions())
  const [queue, setQueue] = useState<QueueFilter>('assigned')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [currentTime] = useState(() => Date.now())
  const approvals = useMemo(
    () => approvalsQuery.data ?? [],
    [approvalsQuery.data],
  )
  const users = usersQuery.data ?? []
  const userById = new Map(users.map((user) => [user.id, user]))

  const filteredApprovals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return approvals
      .filter((approval) => {
        if (queue === 'submitted') {
          return approval.requesterUserId === currentSessionUserId
        }
        if (queue === 'assigned') {
          return approval.steps.some(
            (step) =>
              step.status === 'pending' &&
              step.assignedUserId === currentSessionUserId,
          )
        }
        return true
      })
      .filter((approval) => status === 'all' || approval.status === status)
      .filter(
        (approval) =>
          !normalizedSearch ||
          [approval.title, approval.description, approval.workflow.name].some(
            (value) => value.toLowerCase().includes(normalizedSearch),
          ),
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [approvals, queue, search, status])

  if (approvalsQuery.isPending || usersQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading approvals</span>
      </Card>
    )
  }

  if (approvalsQuery.isError || usersQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Approvals could not be loaded</h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            approvalsQuery.refetch()
            usersQuery.refetch()
          }}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  const assignedCount = approvals.filter((approval) =>
    approval.steps.some(
      (step) =>
        step.status === 'pending' &&
        step.assignedUserId === currentSessionUserId,
    ),
  ).length
  const overdueCount = approvals.filter((approval) =>
    approval.steps.some(
      (step) =>
        step.status === 'pending' &&
        step.assignedUserId === currentSessionUserId &&
        new Date(step.dueAt).getTime() < currentTime,
    ),
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            to="/approvals/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            New request
          </Link>
        }
        description="Review assigned decisions, track submitted requests, and preserve the full chain of approval accountability."
        eyebrow="Governance"
        title="Approvals"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assigned to you
          </p>
          <p className="mt-2 text-2xl font-semibold">{assignedCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Overdue</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {overdueCount}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Open requests
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {approvals.filter((approval) => approval.status === 'pending').length}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {(['assigned', 'submitted', 'all'] as const).map((value) => (
              <button
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  queue === value
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                key={value}
                onClick={() => setQueue(value)}
                type="button"
              >
                {value === 'assigned'
                  ? 'Assigned to me'
                  : value === 'submitted'
                    ? 'Submitted by me'
                    : 'All requests'}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search approval requests</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, purpose, or workflow"
                type="search"
                value={search}
              />
            </label>
            <select
              aria-label="Filter approval status"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === 'all' ||
                  value === 'pending' ||
                  value === 'approved' ||
                  value === 'rejected'
                ) {
                  setStatus(value)
                }
              }}
              value={status}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredApprovals.length === 0 ? (
          <div className="p-10 text-center">
            <CheckSquare2
              aria-hidden="true"
              className="mx-auto size-9 text-slate-300"
            />
            <p className="mt-3 font-semibold">No approval requests found</p>
            <p className="mt-1 text-sm text-slate-500">
              Change the queue or filters to see more requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredApprovals.map((approval) => {
              const requester = userById.get(approval.requesterUserId)
              const activeStep = approval.steps.find(
                (step) => step.status === 'pending',
              )
              const isOverdue =
                activeStep &&
                new Date(activeStep.dueAt).getTime() < currentTime
              return (
                <Link
                  className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  key={approval.id}
                  to={`/approvals/${approval.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold">{approval.title}</h2>
                      <ApprovalStatusBadge status={approval.status} />
                      <ApprovalPriorityBadge priority={approval.priority} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {requester
                        ? `${requester.firstName} ${requester.lastName}`
                        : 'Unknown requester'}{' '}
                      · {approval.workflow.name} v{approval.workflow.version}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock3 aria-hidden="true" className="size-3.5" />
                      Due {new Date(approval.dueDate).toLocaleDateString()}
                      {isOverdue ? (
                        <span className="font-semibold text-red-600">
                          · Current step overdue
                        </span>
                      ) : null}
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
