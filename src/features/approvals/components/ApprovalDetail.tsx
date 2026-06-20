import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckSquare2,
  Clock3,
  Forward,
  GitBranch,
  History,
  Send,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { userListOptions } from '../../users/queries/userQueries'
import { UserAvatar } from '../../users/components/UserAvatar'
import { workflowDetailOptions } from '../../workflows/queries/workflowQueries'
import {
  approvalDecisionFormSchema,
  type ApprovalDecisionFormValues,
  type ApprovalEvent,
} from '../schemas/approvalSchemas'
import {
  approvalDetailOptions,
  useDecideApproval,
  useDelegateApproval,
  useEscalateApproval,
} from '../queries/approvalQueries'
import {
  ApprovalPriorityBadge,
  ApprovalStatusBadge,
  ApprovalStepBadge,
} from './ApprovalBadges'

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

function eventTitle(event: ApprovalEvent) {
  if (event.type === 'submitted') {
    return event.summary
  }
  if (event.type === 'decision') {
    return event.decision === 'approved'
      ? 'Approved review step'
      : 'Rejected request'
  }
  if (event.type === 'delegated') {
    return 'Delegated review step'
  }
  return 'Escalated overdue review step'
}

export function ApprovalDetail() {
  const { approvalId = '' } = useParams()
  const approvalQuery = useQuery(approvalDetailOptions(approvalId))
  const usersQuery = useQuery(userListOptions())
  const workflowQuery = useQuery({
    ...workflowDetailOptions(
      approvalQuery.data?.workflow.definitionId ?? '',
    ),
    enabled: Boolean(approvalQuery.data),
  })
  const decideApproval = useDecideApproval(approvalId, currentSessionUserId)
  const delegateApproval = useDelegateApproval(
    approvalId,
    currentSessionUserId,
  )
  const escalateApproval = useEscalateApproval(
    approvalId,
    currentSessionUserId,
  )
  const [delegateTarget, setDelegateTarget] = useState('')
  const [currentTime] = useState(() => Date.now())
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ApprovalDecisionFormValues>({
    defaultValues: { comment: '', decision: 'approved' },
    resolver: zodResolver(approvalDecisionFormSchema),
  })

  if (
    approvalQuery.isPending ||
    usersQuery.isPending ||
    workflowQuery.isPending
  ) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading approval request</span>
      </Card>
    )
  }

  const approval = approvalQuery.data
  if (
    approvalQuery.isError ||
    usersQuery.isError ||
    workflowQuery.isError ||
    !approval
  ) {
    return (
      <Card className="p-8 text-center">
        <CheckSquare2
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">
          Approval request unavailable
        </h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/approvals">
          Back to approvals
        </Link>
      </Card>
    )
  }

  const users = usersQuery.data ?? []
  const userById = new Map(users.map((user) => [user.id, user]))
  const requester = userById.get(approval.requesterUserId)
  const activeStep = approval.steps.find((step) => step.status === 'pending')
  const canAct =
    approval.status === 'pending' &&
    activeStep?.assignedUserId === currentSessionUserId
  const canEscalate =
    approval.status === 'pending' &&
    Boolean(activeStep?.escalationTargetUserId) &&
    new Date(activeStep?.dueAt ?? 0).getTime() < currentTime
  const currentState = workflowQuery.data?.states.find(
    (state) => state.id === approval.currentStateId,
  )
  const eligibleDelegates = users.filter(
    (user) =>
      user.status === 'active' &&
      user.id !== currentSessionUserId &&
      user.id !== approval.requesterUserId,
  )
  const mutationError =
    decideApproval.error ?? delegateApproval.error ?? escalateApproval.error

  const submitDecision = handleSubmit(async (values) => {
    try {
      await decideApproval.mutateAsync(values)
      reset()
    } catch {
      setError('root.server', {
        message: 'The decision could not be recorded.',
      })
    }
  })

  const handleDelegate = async () => {
    if (!delegateTarget) {
      return
    }
    await delegateApproval.mutateAsync(delegateTarget)
    setDelegateTarget('')
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/approvals"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Approvals
      </Link>

      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ApprovalStatusBadge status={approval.status} />
            <ApprovalPriorityBadge priority={approval.priority} />
          </div>
        }
        description={approval.description}
        eyebrow={`${approval.category.replaceAll('-', ' ')} · ${approval.id.slice(0, 12)}`}
        title={approval.title}
      />

      {mutationError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {mutationError.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Requester</p>
          <p className="mt-2 font-semibold">
            {requester
              ? `${requester.firstName} ${requester.lastName}`
              : 'Unknown user'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Due date</p>
          <p className="mt-2 flex items-center gap-2 font-semibold">
            <CalendarDays aria-hidden="true" className="size-4 text-slate-400" />
            {new Date(approval.dueDate).toLocaleDateString()}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Workflow version
          </p>
          <Link
            className="mt-2 inline-flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-300"
            to={`/workflows/${approval.workflow.definitionId}`}
          >
            {approval.workflow.name} v{approval.workflow.version}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process state
          </p>
          <p className="mt-2 flex items-center gap-2 font-semibold">
            <GitBranch aria-hidden="true" className="size-4 text-slate-400" />
            {currentState?.name ?? 'Historical state'}
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h2 className="font-semibold">Approval chain</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sequential decisions with original and delegated ownership.
              </p>
            </div>
            <ol className="divide-y divide-slate-100 dark:divide-slate-800">
              {approval.steps.map((step) => {
                const assignedUser = userById.get(step.assignedUserId)
                const originalUser = userById.get(step.originalAssignedUserId)
                const isOverdue =
                  step.status === 'pending' &&
                  new Date(step.dueAt).getTime() < currentTime
                return (
                  <li className="flex gap-4 p-5" key={step.id}>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {step.sequence}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {assignedUser
                            ? `${assignedUser.firstName} ${assignedUser.lastName}`
                            : 'Unknown reviewer'}
                        </p>
                        <ApprovalStepBadge status={step.status} />
                        {isOverdue ? (
                          <span className="text-xs font-semibold text-red-600">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {assignedUser?.jobTitle ?? 'Managed reviewer'} · due{' '}
                        {new Date(step.dueAt).toLocaleString()}
                      </p>
                      {step.delegatedByUserId && originalUser ? (
                        <p className="mt-2 text-xs text-slate-400">
                          Originally assigned to {originalUser.firstName}{' '}
                          {originalUser.lastName}
                        </p>
                      ) : null}
                      {step.comment ? (
                        <blockquote className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                          {step.comment}
                        </blockquote>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h2 className="flex items-center gap-2 font-semibold">
                <History aria-hidden="true" className="size-5 text-brand-600" />
                Approval history
              </h2>
            </div>
            <ol className="space-y-5 p-5">
              {[...approval.events].reverse().map((event) => {
                const actor = userById.get(event.actorUserId)
                return (
                  <li className="flex gap-3" key={event.id}>
                    {actor ? (
                      <UserAvatar className="size-9" user={actor} />
                    ) : (
                      <span className="size-9 rounded-full bg-slate-200" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{eventTitle(event)}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {actor
                          ? `${actor.firstName} ${actor.lastName}`
                          : 'Unknown actor'}{' '}
                        · {new Date(event.createdAt).toLocaleString()}
                      </p>
                      {event.type === 'decision' ? (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {event.comment}
                        </p>
                      ) : null}
                      {event.type === 'delegated' ||
                      event.type === 'escalated' ? (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {userById.get(event.fromUserId)?.firstName ??
                            'Previous reviewer'}{' '}
                          →{' '}
                          {userById.get(event.toUserId)?.firstName ??
                            'New reviewer'}
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          {canAct ? (
            <Card className="p-5">
              <h2 className="font-semibold">Record your decision</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your comment becomes part of the immutable approval history.
              </p>
              <form className="mt-4 space-y-4" onSubmit={submitDecision}>
                <label className="text-sm font-semibold">
                  Decision context
                  <textarea
                    className={`${inputClassName} h-28 resize-y py-2.5`}
                    {...register('comment')}
                  />
                  {errors.comment ? (
                    <span className={errorClassName}>
                      {errors.comment.message}
                    </span>
                  ) : null}
                </label>
                {errors.root?.server ? (
                  <p className={errorClassName}>{errors.root.server.message}</p>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={decideApproval.isPending}
                    onClick={() => setValue('decision', 'rejected')}
                    type="submit"
                    variant="danger"
                  >
                    <X aria-hidden="true" className="size-4" />
                    Reject
                  </Button>
                  <Button
                    disabled={decideApproval.isPending}
                    onClick={() => setValue('decision', 'approved')}
                    type="submit"
                  >
                    <Check aria-hidden="true" className="size-4" />
                    Approve
                  </Button>
                </div>
              </form>
            </Card>
          ) : null}

          {canAct ? (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Forward aria-hidden="true" className="size-4" />
                Delegate step
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Transfer this review while retaining original ownership.
              </p>
              <select
                className={`${inputClassName} mt-4`}
                onChange={(event) => setDelegateTarget(event.target.value)}
                value={delegateTarget}
              >
                <option value="">Select delegate</option>
                {eligibleDelegates.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              <Button
                className="mt-3 w-full"
                disabled={!delegateTarget || delegateApproval.isPending}
                onClick={handleDelegate}
                variant="secondary"
              >
                <Send aria-hidden="true" className="size-4" />
                Delegate review
              </Button>
            </Card>
          ) : null}

          {canEscalate ? (
            <Card className="border-amber-200 p-5 dark:border-amber-900">
              <h2 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                <Clock3 aria-hidden="true" className="size-4" />
                Step overdue
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Escalate this review to the configured management target.
              </p>
              <Button
                className="mt-4 w-full"
                disabled={escalateApproval.isPending}
                onClick={() => escalateApproval.mutate()}
                variant="secondary"
              >
                Escalate review
              </Button>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
