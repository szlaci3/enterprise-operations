import {
  approvalRequestsSchema,
  type ApprovalRequest,
} from '../features/approvals/schemas/approvalSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

const approvalsStorageKey = 'enterprise-operations-approvals'

const seedApprovals: ApprovalRequest[] = [
  {
    category: 'service-exception',
    createdAt: '2026-06-16T09:20:00.000Z',
    currentStateId: 'state-triage',
    description:
      'Approve a temporary service-level exception while the customer operations backlog is remediated and additional weekend coverage is established.',
    dueDate: '2026-06-24',
    events: [
      {
        actorUserId: 'user-elena-rossi',
        createdAt: '2026-06-16T09:20:00.000Z',
        id: 'event-exception-submitted',
        summary: 'Submitted for sequential approval.',
        type: 'submitted',
      },
      {
        actorUserId: 'user-maya-chen',
        comment:
          'Customer impact is understood and the remediation owner is confirmed.',
        createdAt: '2026-06-16T15:10:00.000Z',
        decision: 'approved',
        id: 'event-exception-step-one',
        stepId: 'step-exception-one',
        type: 'decision',
      },
    ],
    id: 'approval-service-exception-1042',
    priority: 'high',
    requesterUserId: 'user-elena-rossi',
    status: 'pending',
    steps: [
      {
        actedAt: '2026-06-16T15:10:00.000Z',
        assignedUserId: 'user-maya-chen',
        comment:
          'Customer impact is understood and the remediation owner is confirmed.',
        delegatedByUserId: null,
        dueAt: '2026-06-18T17:00:00.000Z',
        escalationTargetUserId: 'user-avery-morgan',
        id: 'step-exception-one',
        originalAssignedUserId: 'user-maya-chen',
        sequence: 1,
        status: 'approved',
      },
      {
        actedAt: null,
        assignedUserId: 'user-avery-morgan',
        comment: null,
        delegatedByUserId: null,
        dueAt: '2026-06-19T17:00:00.000Z',
        escalationTargetUserId: 'user-priya-shah',
        id: 'step-exception-two',
        originalAssignedUserId: 'user-avery-morgan',
        sequence: 2,
        status: 'pending',
      },
    ],
    title: 'Temporary customer response SLA exception',
    updatedAt: '2026-06-16T15:10:00.000Z',
    workflow: {
      definitionId: 'workflow-service-exception-v2',
      name: 'Service Exception Management',
      version: 2,
      workflowKey: 'service-exception',
    },
  },
  {
    category: 'policy-exception',
    createdAt: '2026-06-10T08:45:00.000Z',
    currentStateId: 'state-resolved',
    description:
      'Authorize a time-limited retention-policy exception for regulated finance operations records during the archive platform migration.',
    dueDate: '2026-06-18',
    events: [
      {
        actorUserId: 'user-jon-bell',
        createdAt: '2026-06-10T08:45:00.000Z',
        id: 'event-retention-submitted',
        summary: 'Submitted for sequential approval.',
        type: 'submitted',
      },
      {
        actorUserId: 'user-elena-rossi',
        comment:
          'The financial-control scope and compensating controls are acceptable.',
        createdAt: '2026-06-10T13:30:00.000Z',
        decision: 'approved',
        id: 'event-retention-finance',
        stepId: 'step-retention-one',
        type: 'decision',
      },
      {
        actorUserId: 'user-priya-shah',
        comment:
          'The migration plan has monitoring, rollback, and a fixed expiry date.',
        createdAt: '2026-06-11T10:05:00.000Z',
        decision: 'approved',
        id: 'event-retention-technology',
        stepId: 'step-retention-two',
        type: 'decision',
      },
    ],
    id: 'approval-retention-exception-1038',
    priority: 'normal',
    requesterUserId: 'user-jon-bell',
    status: 'approved',
    steps: [
      {
        actedAt: '2026-06-10T13:30:00.000Z',
        assignedUserId: 'user-elena-rossi',
        comment:
          'The financial-control scope and compensating controls are acceptable.',
        delegatedByUserId: null,
        dueAt: '2026-06-12T17:00:00.000Z',
        escalationTargetUserId: 'user-avery-morgan',
        id: 'step-retention-one',
        originalAssignedUserId: 'user-elena-rossi',
        sequence: 1,
        status: 'approved',
      },
      {
        actedAt: '2026-06-11T10:05:00.000Z',
        assignedUserId: 'user-priya-shah',
        comment:
          'The migration plan has monitoring, rollback, and a fixed expiry date.',
        delegatedByUserId: null,
        dueAt: '2026-06-14T17:00:00.000Z',
        escalationTargetUserId: 'user-avery-morgan',
        id: 'step-retention-two',
        originalAssignedUserId: 'user-priya-shah',
        sequence: 2,
        status: 'approved',
      },
    ],
    title: 'Records retention migration exception',
    updatedAt: '2026-06-11T10:05:00.000Z',
    workflow: {
      definitionId: 'workflow-service-exception-v2',
      name: 'Service Exception Management',
      version: 2,
      workflowKey: 'service-exception',
    },
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const approvalsStore = createVersionedStore({
  key: approvalsStorageKey,
  schema: approvalRequestsSchema,
  seed: () => (getActiveTenantId() === 'atlas' ? [] : seedApprovals),
  version: 1,
})

function writeApprovals(approvals: ApprovalRequest[]) {
  approvalsStore.write(approvals)
}

export async function listApprovalsApi(): Promise<unknown> {
  await delay(300)
  return approvalsStore.read()
}

export async function getApprovalApi(id: string): Promise<unknown> {
  await delay(220)
  return approvalsStore.read().find((approval) => approval.id === id) ?? null
}

export async function createApprovalApi(
  approval: ApprovalRequest,
): Promise<unknown> {
  await delay(420)
  writeApprovals([...approvalsStore.read(), approval])
  return approval
}

export async function updateApprovalApi(
  approval: ApprovalRequest,
): Promise<unknown> {
  await delay(400)
  writeApprovals(
    approvalsStore
      .read()
      .map((item) => (item.id === approval.id ? approval : item)),
  )
  return approval
}
