import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckSquare2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { userListOptions } from '../../users/queries/userQueries'
import { workflowListOptions } from '../../workflows/queries/workflowQueries'
import { useCreateApproval } from '../queries/approvalQueries'
import type { ApprovalRequestFormValues } from '../schemas/approvalSchemas'
import { ApprovalRequestForm } from './ApprovalRequestForm'

export function ApprovalRequestEditor() {
  const navigate = useNavigate()
  const usersQuery = useQuery(userListOptions())
  const workflowsQuery = useQuery(workflowListOptions())
  const createApproval = useCreateApproval(currentSessionUserId)

  if (usersQuery.isPending || workflowsQuery.isPending) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading approval request form</span>
      </Card>
    )
  }

  const users = (usersQuery.data ?? []).filter(
    (user) => user.status === 'active' && user.id !== currentSessionUserId,
  )
  const workflows = (workflowsQuery.data ?? []).filter(
    (workflow) => workflow.status === 'active',
  )
  if (
    usersQuery.isError ||
    workflowsQuery.isError ||
    users.length === 0 ||
    workflows.length === 0
  ) {
    return (
      <Card className="p-8 text-center">
        <CheckSquare2
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">
          Approval request form unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          An active workflow and at least one eligible reviewer are required.
        </p>
        <Link className="mt-5 inline-flex text-brand-700" to="/approvals">
          Back to approvals
        </Link>
      </Card>
    )
  }

  const handleSubmit = async (values: ApprovalRequestFormValues) => {
    const approval = await createApproval.mutateAsync(values)
    navigate(`/approvals/${approval.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/approvals"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Approvals
      </Link>
      <PageHeader
        description="Submit a governed decision request against an active process version and define its accountable reviewer chain."
        eyebrow="Approval intake"
        title="New approval request"
      />
      <ApprovalRequestForm
        isSubmitting={createApproval.isPending}
        onCancel={() => navigate('/approvals')}
        onSubmit={handleSubmit}
        users={users}
        workflows={workflows}
      />
    </div>
  )
}
