import {
  workflowDefinitionsSchema,
  type WorkflowDefinition,
} from '../features/workflows/schemas/workflowSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

const workflowsStorageKey = 'enterprise-operations-workflows'

const seedWorkflows: WorkflowDefinition[] = [
  {
    createdAt: '2026-04-08T09:00:00.000Z',
    description:
      'Coordinates review, approval, remediation, and closure for customer-impacting service exceptions.',
    id: 'workflow-service-exception-v2',
    name: 'Service Exception Management',
    states: [
      {
        description: 'A service exception has been submitted for triage.',
        id: 'state-submitted',
        key: 'submitted',
        name: 'Submitted',
        type: 'initial',
      },
      {
        description: 'Operations is validating impact and ownership.',
        id: 'state-triage',
        key: 'triage',
        name: 'In triage',
        type: 'standard',
      },
      {
        description: 'The accountable team is completing remediation.',
        id: 'state-remediation',
        key: 'remediation',
        name: 'Remediation',
        type: 'standard',
      },
      {
        description: 'The exception has been resolved and verified.',
        id: 'state-resolved',
        key: 'resolved',
        name: 'Resolved',
        type: 'terminal',
      },
      {
        description: 'The exception was rejected during review.',
        id: 'state-rejected',
        key: 'rejected',
        name: 'Rejected',
        type: 'terminal',
      },
    ],
    status: 'active',
    templateId: 'template-review',
    transitions: [
      {
        fromStateId: 'state-submitted',
        id: 'transition-submit-triage',
        name: 'Begin triage',
        toStateId: 'state-triage',
      },
      {
        fromStateId: 'state-triage',
        id: 'transition-triage-remediation',
        name: 'Assign remediation',
        toStateId: 'state-remediation',
      },
      {
        fromStateId: 'state-triage',
        id: 'transition-triage-rejected',
        name: 'Reject request',
        toStateId: 'state-rejected',
      },
      {
        fromStateId: 'state-remediation',
        id: 'transition-remediation-resolved',
        name: 'Verify resolution',
        toStateId: 'state-resolved',
      },
      {
        fromStateId: 'state-remediation',
        id: 'transition-remediation-triage',
        name: 'Return for triage',
        toStateId: 'state-triage',
      },
    ],
    updatedAt: '2026-06-18T14:30:00.000Z',
    version: 2,
    workflowKey: 'service-exception',
  },
  {
    createdAt: '2026-06-14T10:15:00.000Z',
    description:
      'Controls intake and approval of operational changes that affect shared enterprise services.',
    id: 'workflow-operational-change-v1',
    name: 'Operational Change Request',
    states: [
      {
        description: 'A change request is being prepared by its owner.',
        id: 'state-change-draft',
        key: 'draft',
        name: 'Draft',
        type: 'initial',
      },
      {
        description: 'The change is awaiting impact and risk review.',
        id: 'state-change-review',
        key: 'review',
        name: 'Review',
        type: 'standard',
      },
      {
        description: 'The change has been approved for implementation.',
        id: 'state-change-approved',
        key: 'approved',
        name: 'Approved',
        type: 'terminal',
      },
      {
        description: 'The change was declined by reviewers.',
        id: 'state-change-declined',
        key: 'declined',
        name: 'Declined',
        type: 'terminal',
      },
    ],
    status: 'draft',
    templateId: 'template-approval',
    transitions: [
      {
        fromStateId: 'state-change-draft',
        id: 'transition-change-submit',
        name: 'Submit for review',
        toStateId: 'state-change-review',
      },
      {
        fromStateId: 'state-change-review',
        id: 'transition-change-approve',
        name: 'Approve change',
        toStateId: 'state-change-approved',
      },
      {
        fromStateId: 'state-change-review',
        id: 'transition-change-decline',
        name: 'Decline change',
        toStateId: 'state-change-declined',
      },
    ],
    updatedAt: '2026-06-20T11:40:00.000Z',
    version: 1,
    workflowKey: 'operational-change',
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const workflowsStore = createVersionedStore({
  key: workflowsStorageKey,
  schema: workflowDefinitionsSchema,
  seed: () => (getActiveTenantId() === 'atlas' ? [] : seedWorkflows),
  version: 1,
})

function writeWorkflows(workflows: WorkflowDefinition[]) {
  workflowsStore.write(workflows)
}

export async function listWorkflowsApi(): Promise<unknown> {
  await delay(300)
  return workflowsStore.read()
}

export async function getWorkflowApi(id: string): Promise<unknown> {
  await delay(220)
  return workflowsStore.read().find((workflow) => workflow.id === id) ?? null
}

export async function createWorkflowApi(
  workflow: WorkflowDefinition,
): Promise<unknown> {
  await delay(400)
  writeWorkflows([...workflowsStore.read(), workflow])
  return workflow
}

export async function updateWorkflowApi(
  workflow: WorkflowDefinition,
): Promise<unknown> {
  await delay(400)
  writeWorkflows(
    workflowsStore
      .read()
      .map((item) => (item.id === workflow.id ? workflow : item)),
  )
  return workflow
}

export async function replaceWorkflowsApi(
  workflows: WorkflowDefinition[],
): Promise<unknown> {
  await delay(420)
  writeWorkflows(workflows)
  return workflows
}

export async function deleteWorkflowApi(id: string): Promise<void> {
  await delay(340)
  writeWorkflows(
    workflowsStore.read().filter((workflow) => workflow.id !== id),
  )
}
