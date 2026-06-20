import {
  createWorkflowApi,
  deleteWorkflowApi,
  getWorkflowApi,
  listWorkflowsApi,
  replaceWorkflowsApi,
  updateWorkflowApi,
} from '../../../mocks/workflowsApi'
import {
  workflowDefinitionSchema,
  workflowDefinitionsSchema,
  workflowFormSchema,
  workflowTemplatesSchema,
  type WorkflowDefinition,
  type WorkflowFormValues,
  type WorkflowTemplate,
} from '../schemas/workflowSchemas'

export class WorkflowServiceError extends Error {
  readonly code:
    | 'duplicate-key'
    | 'immutable-version'
    | 'invalid-status'
    | 'not-found'

  constructor(message: string, code: WorkflowServiceError['code']) {
    super(message)
    this.name = 'WorkflowServiceError'
    this.code = code
  }
}

const templates: WorkflowTemplate[] = workflowTemplatesSchema.parse([
  {
    description:
      'A single review stage with approved and declined terminal outcomes.',
    id: 'template-approval',
    name: 'Approval workflow',
    states: [
      {
        description: 'The request is being prepared for submission.',
        id: 'template-state-draft',
        key: 'draft',
        name: 'Draft',
        type: 'initial',
      },
      {
        description: 'The request is waiting for a decision.',
        id: 'template-state-review',
        key: 'review',
        name: 'Review',
        type: 'standard',
      },
      {
        description: 'The request has received approval.',
        id: 'template-state-approved',
        key: 'approved',
        name: 'Approved',
        type: 'terminal',
      },
      {
        description: 'The request was declined.',
        id: 'template-state-declined',
        key: 'declined',
        name: 'Declined',
        type: 'terminal',
      },
    ],
    transitions: [
      {
        fromStateId: 'template-state-draft',
        id: 'template-transition-submit',
        name: 'Submit for review',
        toStateId: 'template-state-review',
      },
      {
        fromStateId: 'template-state-review',
        id: 'template-transition-approve',
        name: 'Approve',
        toStateId: 'template-state-approved',
      },
      {
        fromStateId: 'template-state-review',
        id: 'template-transition-decline',
        name: 'Decline',
        toStateId: 'template-state-declined',
      },
    ],
  },
  {
    description:
      'A triage and resolution process with a path back for additional work.',
    id: 'template-review',
    name: 'Review and remediation',
    states: [
      {
        description: 'The item has entered the workflow.',
        id: 'template-state-submitted',
        key: 'submitted',
        name: 'Submitted',
        type: 'initial',
      },
      {
        description: 'The item is being assessed and assigned.',
        id: 'template-state-triage',
        key: 'triage',
        name: 'Triage',
        type: 'standard',
      },
      {
        description: 'The assigned owner is completing required work.',
        id: 'template-state-remediation',
        key: 'remediation',
        name: 'Remediation',
        type: 'standard',
      },
      {
        description: 'The work has been completed and verified.',
        id: 'template-state-resolved',
        key: 'resolved',
        name: 'Resolved',
        type: 'terminal',
      },
    ],
    transitions: [
      {
        fromStateId: 'template-state-submitted',
        id: 'template-transition-triage',
        name: 'Begin triage',
        toStateId: 'template-state-triage',
      },
      {
        fromStateId: 'template-state-triage',
        id: 'template-transition-remediate',
        name: 'Assign remediation',
        toStateId: 'template-state-remediation',
      },
      {
        fromStateId: 'template-state-remediation',
        id: 'template-transition-resolve',
        name: 'Resolve',
        toStateId: 'template-state-resolved',
      },
      {
        fromStateId: 'template-state-remediation',
        id: 'template-transition-return',
        name: 'Return to triage',
        toStateId: 'template-state-triage',
      },
    ],
  },
])

function cloneGraph(values: WorkflowFormValues) {
  const stateIdMap = new Map<string, string>()
  const states = values.states.map((state) => {
    const id = crypto.randomUUID()
    stateIdMap.set(state.id, id)
    return { ...state, id }
  })
  const transitions = values.transitions.map((transition) => ({
    ...transition,
    fromStateId: stateIdMap.get(transition.fromStateId) ?? '',
    id: crypto.randomUUID(),
    toStateId: stateIdMap.get(transition.toStateId) ?? '',
  }))
  return { states, transitions }
}

async function list(): Promise<WorkflowDefinition[]> {
  return workflowDefinitionsSchema.parse(await listWorkflowsApi())
}

function assertUniqueKey(
  workflows: WorkflowDefinition[],
  workflowKey: string,
  currentId?: string,
) {
  const conflictingVersion = workflows.find(
    (workflow) =>
      workflow.id !== currentId &&
      workflow.workflowKey === workflowKey &&
      workflow.status === 'draft',
  )
  if (conflictingVersion) {
    throw new WorkflowServiceError(
      'This workflow already has an editable draft version.',
      'duplicate-key',
    )
  }
}

export const workflowService = {
  async activate(id: string): Promise<WorkflowDefinition> {
    const workflows = await list()
    const workflow = workflows.find((item) => item.id === id)
    if (!workflow) {
      throw new WorkflowServiceError('The workflow no longer exists.', 'not-found')
    }
    if (workflow.status !== 'draft') {
      throw new WorkflowServiceError(
        'Only draft workflow versions can be activated.',
        'invalid-status',
      )
    }
    const now = new Date().toISOString()
    const nextWorkflows = workflows.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'active' as const, updatedAt: now }
      }
      if (item.workflowKey === workflow.workflowKey && item.status === 'active') {
        return { ...item, status: 'retired' as const, updatedAt: now }
      }
      return item
    })
    const parsed = workflowDefinitionsSchema.parse(
      await replaceWorkflowsApi(nextWorkflows),
    )
    const activated = parsed.find((item) => item.id === id)
    if (!activated) {
      throw new WorkflowServiceError(
        'The activated workflow could not be reloaded.',
        'not-found',
      )
    }
    return activated
  },

  async create(values: WorkflowFormValues): Promise<WorkflowDefinition> {
    const parsed = workflowFormSchema.parse(values)
    const workflows = await list()
    assertUniqueKey(workflows, parsed.workflowKey)
    const graph = cloneGraph(parsed)
    const now = new Date().toISOString()
    const workflow: WorkflowDefinition = {
      ...parsed,
      ...graph,
      createdAt: now,
      id: crypto.randomUUID(),
      status: 'draft',
      templateId: parsed.templateId || null,
      updatedAt: now,
      version: 1,
    }
    return workflowDefinitionSchema.parse(await createWorkflowApi(workflow))
  },

  async createVersion(id: string): Promise<WorkflowDefinition> {
    const workflows = await list()
    const source = workflows.find((workflow) => workflow.id === id)
    if (!source) {
      throw new WorkflowServiceError('The workflow no longer exists.', 'not-found')
    }
    assertUniqueKey(workflows, source.workflowKey)
    const graph = cloneGraph({
      description: source.description,
      name: source.name,
      states: source.states,
      templateId: source.templateId ?? '',
      transitions: source.transitions,
      workflowKey: source.workflowKey,
    })
    const now = new Date().toISOString()
    const version: WorkflowDefinition = {
      ...source,
      ...graph,
      createdAt: now,
      id: crypto.randomUUID(),
      status: 'draft',
      updatedAt: now,
      version:
        Math.max(
          ...workflows
            .filter((workflow) => workflow.workflowKey === source.workflowKey)
            .map((workflow) => workflow.version),
        ) + 1,
    }
    return workflowDefinitionSchema.parse(await createWorkflowApi(version))
  },

  async delete(id: string): Promise<void> {
    const workflow = await workflowService.get(id)
    if (!workflow) {
      throw new WorkflowServiceError('The workflow no longer exists.', 'not-found')
    }
    if (workflow.status !== 'draft') {
      throw new WorkflowServiceError(
        'Only draft workflow versions can be deleted.',
        'immutable-version',
      )
    }
    await deleteWorkflowApi(id)
  },

  async get(id: string): Promise<WorkflowDefinition | null> {
    const response = await getWorkflowApi(id)
    return response === null ? null : workflowDefinitionSchema.parse(response)
  },

  list,

  async listTemplates(): Promise<WorkflowTemplate[]> {
    return templates
  },

  async update(
    id: string,
    values: WorkflowFormValues,
  ): Promise<WorkflowDefinition> {
    const parsed = workflowFormSchema.parse(values)
    const workflows = await list()
    const existing = workflows.find((workflow) => workflow.id === id)
    if (!existing) {
      throw new WorkflowServiceError('The workflow no longer exists.', 'not-found')
    }
    if (existing.status !== 'draft') {
      throw new WorkflowServiceError(
        'Active and retired versions are read-only. Create a new version to make changes.',
        'immutable-version',
      )
    }
    if (parsed.workflowKey !== existing.workflowKey) {
      assertUniqueKey(workflows, parsed.workflowKey, id)
    }
    const workflow: WorkflowDefinition = {
      ...existing,
      ...parsed,
      templateId: parsed.templateId || null,
      updatedAt: new Date().toISOString(),
    }
    return workflowDefinitionSchema.parse(await updateWorkflowApi(workflow))
  },
}
