import {
  createApprovalApi,
  getApprovalApi,
  listApprovalsApi,
  updateApprovalApi,
} from '../../../mocks/approvalsApi'
import { userService } from '../../users/services/userService'
import { workflowService } from '../../workflows/services/workflowService'
import {
  approvalDecisionFormSchema,
  approvalRequestFormSchema,
  approvalRequestSchema,
  approvalRequestsSchema,
  type ApprovalDecisionFormValues,
  type ApprovalRequest,
  type ApprovalRequestFormValues,
} from '../schemas/approvalSchemas'

export class ApprovalServiceError extends Error {
  readonly code:
    | 'invalid-assignment'
    | 'invalid-decision'
    | 'invalid-escalation'
    | 'invalid-workflow'
    | 'not-found'

  constructor(message: string, code: ApprovalServiceError['code']) {
    super(message)
    this.name = 'ApprovalServiceError'
    this.code = code
  }
}

function addDays(isoDate: string, days: number) {
  const date = new Date(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

async function getWorkflowTerminalStateId(
  definitionId: string,
  decision: 'approved' | 'rejected',
) {
  const workflow = await workflowService.get(definitionId)
  if (!workflow) {
    throw new ApprovalServiceError(
      'The referenced workflow version no longer exists.',
      'invalid-workflow',
    )
  }
  const terminalStates = workflow.states.filter(
    (state) => state.type === 'terminal',
  )
  const negativePattern = /(reject|declin|cancel|denied)/i
  const preferred = terminalStates.find((state) =>
    decision === 'rejected'
      ? negativePattern.test(`${state.key} ${state.name}`)
      : !negativePattern.test(`${state.key} ${state.name}`),
  )
  return preferred?.id ?? terminalStates[0]?.id ?? workflow.states[0].id
}

async function list(): Promise<ApprovalRequest[]> {
  return approvalRequestsSchema.parse(await listApprovalsApi())
}

async function assertActiveUsers(userIds: string[]) {
  const users = await userService.list()
  const uniqueIds = [...new Set(userIds)]
  if (
    uniqueIds.some(
      (id) => !users.some((user) => user.id === id && user.status === 'active'),
    )
  ) {
    throw new ApprovalServiceError(
      'Every reviewer must be an active managed user.',
      'invalid-assignment',
    )
  }
  return users
}

export const approvalService = {
  async create(
    requesterUserId: string,
    values: ApprovalRequestFormValues,
  ): Promise<ApprovalRequest> {
    const parsed = approvalRequestFormSchema.parse(values)
    const now = new Date().toISOString()
    const [requester, workflow, users] = await Promise.all([
      userService.get(requesterUserId),
      workflowService.get(parsed.workflowDefinitionId),
      assertActiveUsers(parsed.reviewerIds),
    ])
    if (!requester || requester.status !== 'active') {
      throw new ApprovalServiceError(
        'Only active users can submit approval requests.',
        'invalid-assignment',
      )
    }
    if (!workflow || workflow.status !== 'active') {
      throw new ApprovalServiceError(
        'Approval requests must use an active workflow version.',
        'invalid-workflow',
      )
    }
    if (parsed.reviewerIds.includes(requesterUserId)) {
      throw new ApprovalServiceError(
        'The requester cannot approve their own request.',
        'invalid-assignment',
      )
    }
    if (parsed.dueDate < now.slice(0, 10)) {
      throw new ApprovalServiceError(
        'The request due date cannot be in the past.',
        'invalid-assignment',
      )
    }
    const initialState = workflow.states.find(
      (state) => state.type === 'initial',
    )
    if (!initialState) {
      throw new ApprovalServiceError(
        'The workflow does not have an initial state.',
        'invalid-workflow',
      )
    }
    const submissionTransition = workflow.transitions.find(
      (transition) => transition.fromStateId === initialState.id,
    )
    if (!submissionTransition) {
      throw new ApprovalServiceError(
        'The workflow does not define a submission transition.',
        'invalid-workflow',
      )
    }
    const approval: ApprovalRequest = {
      category: parsed.category,
      createdAt: now,
      currentStateId: submissionTransition.toStateId,
      description: parsed.description,
      dueDate: parsed.dueDate,
      events: [
        {
          actorUserId: requesterUserId,
          createdAt: now,
          id: crypto.randomUUID(),
          summary: 'Submitted for sequential approval.',
          type: 'submitted',
        },
      ],
      id: crypto.randomUUID(),
      priority: parsed.priority,
      requesterUserId,
      status: 'pending',
      steps: parsed.reviewerIds.map((reviewerId, index) => {
        const reviewer = users.find((user) => user.id === reviewerId)
        return {
          actedAt: null,
          assignedUserId: reviewerId,
          comment: null,
          delegatedByUserId: null,
          dueAt: addDays(now, (index + 1) * 2),
          escalationTargetUserId:
            reviewer?.managerId && reviewer.managerId !== requesterUserId
              ? reviewer.managerId
              : null,
          id: crypto.randomUUID(),
          originalAssignedUserId: reviewerId,
          sequence: index + 1,
          status: index === 0 ? ('pending' as const) : ('waiting' as const),
        }
      }),
      title: parsed.title,
      updatedAt: now,
      workflow: {
        definitionId: workflow.id,
        name: workflow.name,
        version: workflow.version,
        workflowKey: workflow.workflowKey,
      },
    }
    return approvalRequestSchema.parse(await createApprovalApi(approval))
  },

  async decide(
    id: string,
    actorUserId: string,
    values: ApprovalDecisionFormValues,
  ): Promise<ApprovalRequest> {
    const parsed = approvalDecisionFormSchema.parse(values)
    const approval = await approvalService.get(id)
    if (!approval) {
      throw new ApprovalServiceError(
        'The approval request no longer exists.',
        'not-found',
      )
    }
    if (approval.status !== 'pending') {
      throw new ApprovalServiceError(
        'This approval request is already complete.',
        'invalid-decision',
      )
    }
    const activeStep = approval.steps.find((step) => step.status === 'pending')
    if (!activeStep || activeStep.assignedUserId !== actorUserId) {
      throw new ApprovalServiceError(
        'Only the currently assigned reviewer can decide this request.',
        'invalid-decision',
      )
    }
    await assertActiveUsers([actorUserId])
    const now = new Date().toISOString()
    const hasNextStep =
      parsed.decision === 'approved' &&
      approval.steps.some((step) => step.status === 'waiting')
    const nextWaitingStep = approval.steps.find(
      (step) => step.status === 'waiting',
    )
    const nextStatus = hasNextStep ? 'pending' : parsed.decision
    const currentStateId = hasNextStep
      ? approval.currentStateId
      : await getWorkflowTerminalStateId(
          approval.workflow.definitionId,
          parsed.decision,
        )
    const updated: ApprovalRequest = {
      ...approval,
      currentStateId,
      events: [
        ...approval.events,
        {
          actorUserId,
          comment: parsed.comment,
          createdAt: now,
          decision: parsed.decision,
          id: crypto.randomUUID(),
          stepId: activeStep.id,
          type: 'decision',
        },
      ],
      status: nextStatus,
      steps: approval.steps.map((step) => {
        if (step.id === activeStep.id) {
          return {
            ...step,
            actedAt: now,
            comment: parsed.comment,
            status: parsed.decision,
          }
        }
        if (hasNextStep && step.id === nextWaitingStep?.id) {
          return { ...step, status: 'pending' as const }
        }
        return step
      }),
      updatedAt: now,
    }
    return approvalRequestSchema.parse(await updateApprovalApi(updated))
  },

  async delegate(
    id: string,
    actorUserId: string,
    targetUserId: string,
  ): Promise<ApprovalRequest> {
    const approval = await approvalService.get(id)
    if (!approval) {
      throw new ApprovalServiceError(
        'The approval request no longer exists.',
        'not-found',
      )
    }
    const activeStep = approval.steps.find((step) => step.status === 'pending')
    if (!activeStep || activeStep.assignedUserId !== actorUserId) {
      throw new ApprovalServiceError(
        'Only the assigned reviewer can delegate this step.',
        'invalid-assignment',
      )
    }
    if (targetUserId === actorUserId || targetUserId === approval.requesterUserId) {
      throw new ApprovalServiceError(
        'Select another active reviewer who is not the requester.',
        'invalid-assignment',
      )
    }
    if (
      approval.steps.some(
        (step) =>
          step.id !== activeStep.id &&
          (step.assignedUserId === targetUserId ||
            step.originalAssignedUserId === targetUserId),
      )
    ) {
      throw new ApprovalServiceError(
        'The delegate already participates in this approval chain.',
        'invalid-assignment',
      )
    }
    await assertActiveUsers([actorUserId, targetUserId])
    const now = new Date().toISOString()
    const updated: ApprovalRequest = {
      ...approval,
      events: [
        ...approval.events,
        {
          actorUserId,
          createdAt: now,
          fromUserId: actorUserId,
          id: crypto.randomUUID(),
          stepId: activeStep.id,
          toUserId: targetUserId,
          type: 'delegated',
        },
      ],
      steps: approval.steps.map((step) =>
        step.id === activeStep.id
          ? {
              ...step,
              assignedUserId: targetUserId,
              delegatedByUserId: actorUserId,
            }
          : step,
      ),
      updatedAt: now,
    }
    return approvalRequestSchema.parse(await updateApprovalApi(updated))
  },

  async escalate(id: string, actorUserId: string): Promise<ApprovalRequest> {
    const approval = await approvalService.get(id)
    if (!approval) {
      throw new ApprovalServiceError(
        'The approval request no longer exists.',
        'not-found',
      )
    }
    const activeStep = approval.steps.find((step) => step.status === 'pending')
    if (
      !activeStep ||
      !activeStep.escalationTargetUserId ||
      new Date(activeStep.dueAt).getTime() > Date.now()
    ) {
      throw new ApprovalServiceError(
        'This approval step is not eligible for escalation.',
        'invalid-escalation',
      )
    }
    if (activeStep.escalationTargetUserId === approval.requesterUserId) {
      throw new ApprovalServiceError(
        'The requester cannot become the escalated reviewer.',
        'invalid-escalation',
      )
    }
    await assertActiveUsers([
      actorUserId,
      activeStep.escalationTargetUserId,
    ])
    const now = new Date().toISOString()
    const targetUserId = activeStep.escalationTargetUserId
    const updated: ApprovalRequest = {
      ...approval,
      events: [
        ...approval.events,
        {
          actorUserId,
          createdAt: now,
          fromUserId: activeStep.assignedUserId,
          id: crypto.randomUUID(),
          stepId: activeStep.id,
          toUserId: targetUserId,
          type: 'escalated',
        },
      ],
      steps: approval.steps.map((step) =>
        step.id === activeStep.id
          ? {
              ...step,
              assignedUserId: targetUserId,
              escalationTargetUserId: null,
            }
          : step,
      ),
      updatedAt: now,
    }
    return approvalRequestSchema.parse(await updateApprovalApi(updated))
  },

  async get(id: string): Promise<ApprovalRequest | null> {
    const response = await getApprovalApi(id)
    return response === null ? null : approvalRequestSchema.parse(response)
  },

  list,
}
