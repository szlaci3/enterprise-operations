import { useQuery } from '@tanstack/react-query'
import {
  CheckSquare2,
  ChevronRight,
  Clock3,
  Plus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  CollectionEmpty,
  CollectionError,
  CollectionLoading,
  FilterBar,
  SearchField,
  SegmentedControl,
  SelectFilter,
} from '../../../shared/components/CollectionWorkspace'
import { SummaryGrid } from '../../../shared/components/SummaryGrid'
import { useUrlState } from '../../../shared/hooks/useUrlState'
import { userListOptions } from '../../users/queries/userQueries'
import { approvalListOptions } from '../queries/approvalQueries'
import type { ApprovalStatus } from '../schemas/approvalSchemas'
import {
  ApprovalPriorityBadge,
  ApprovalStatusBadge,
} from './ApprovalBadges'
import { SavedViewToolbar } from '../../views/components/SavedViewToolbar'
import { useSavedViewUrlState } from '../../views/hooks/useSavedViewUrlState'

type QueueFilter = 'assigned' | 'submitted' | 'all'
type StatusFilter = ApprovalStatus | 'all'
type ApprovalSort = 'updated' | 'due' | 'priority'
const queueOptions = [
  { label: 'Assigned to me', value: 'assigned' },
  { label: 'Submitted by me', value: 'submitted' },
  { label: 'All requests', value: 'all' },
] as const
const approvalViewDefaults = {
  q: '',
  queue: 'assigned',
  sort: 'updated',
  status: 'all',
}
const approvalViewStateKeys = ['q', 'queue', 'sort', 'status']

export function ApprovalList() {
  const approvalsQuery = useQuery(approvalListOptions())
  const usersQuery = useQuery(userListOptions())
  const [queue, setQueue] = useUrlState<QueueFilter>({
    defaultValue: 'assigned',
    key: 'queue',
    values: ['assigned', 'submitted', 'all'],
  })
  const [search, setSearch] = useUrlState<string>({
    defaultValue: '',
    key: 'q',
  })
  const [status, setStatus] = useUrlState<StatusFilter>({
    defaultValue: 'all',
    key: 'status',
    values: ['all', 'pending', 'approved', 'rejected'],
  })
  const [sort, setSort] = useUrlState<ApprovalSort>({
    defaultValue: 'updated',
    key: 'sort',
    values: ['updated', 'due', 'priority'],
  })
  const [currentTime] = useState(() => Date.now())
  const savedView = useSavedViewUrlState({
    defaults: approvalViewDefaults,
    stateKeys: approvalViewStateKeys,
  })
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
      .sort((left, right) => {
        if (sort === 'due') return left.dueDate.localeCompare(right.dueDate)
        if (sort === 'priority') {
          const rank = { urgent: 3, high: 2, normal: 1, low: 0 }
          return rank[right.priority] - rank[left.priority]
        }
        return right.updatedAt.localeCompare(left.updatedAt)
      })
  }, [approvals, queue, search, sort, status])

  if (approvalsQuery.isPending || usersQuery.isPending) {
    return <CollectionLoading label="Loading approvals" />
  }

  if (approvalsQuery.isError || usersQuery.isError) {
    return (
      <CollectionError
        onRetry={() => {
            approvalsQuery.refetch()
            usersQuery.refetch()
        }}
        title="Approvals could not be loaded"
      />
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

      <SummaryGrid
        ariaLabel="Approval summary"
        metrics={[
          { label: 'Assigned to you', value: assignedCount },
          { label: 'Overdue', tone: 'danger', value: overdueCount },
          {
            label: 'Open requests',
            value: approvals.filter((approval) => approval.status === 'pending')
              .length,
          },
        ]}
      />
      <SavedViewToolbar
        hasActiveState={savedView.hasActiveState}
        onApply={savedView.apply}
        onPresentationChange={savedView.setPresentation}
        presentation={savedView.presentation}
        resource="approvals"
        state={{ q: search, queue, sort, status }}
      />

      <Card className="overflow-hidden">
        <FilterBar
          primary={
            <SearchField
              label="Search approval requests"
              onChange={setSearch}
              placeholder="Search title, purpose, or workflow"
              value={search}
            />
          }
          secondary={
            <SegmentedControl
              ariaLabel="Approval queue"
              onChange={setQueue}
              options={queueOptions}
              value={queue}
            />
          }
        >
          <SelectFilter
            label="Filter approval status"
            onChange={(event) =>
              setStatus(event.target.value as StatusFilter)
            }
            value={status}
          >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
          </SelectFilter>
          <SelectFilter
            label="Sort approvals"
            onChange={(event) =>
              setSort(event.target.value as ApprovalSort)
            }
            value={sort}
          >
            <option value="updated">Recently updated</option>
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
          </SelectFilter>
        </FilterBar>

        {filteredApprovals.length === 0 ? (
          <CollectionEmpty
            description="Change the queue or filters to see more requests."
            icon={<CheckSquare2 aria-hidden="true" className="size-9" />}
            title="No approval requests found"
          />
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
