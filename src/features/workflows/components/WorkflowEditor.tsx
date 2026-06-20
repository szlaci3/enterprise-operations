import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Waypoints } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  useCreateWorkflow,
  useUpdateWorkflow,
  workflowDetailOptions,
  workflowTemplateOptions,
} from '../queries/workflowQueries'
import type { WorkflowFormValues } from '../schemas/workflowSchemas'
import { WorkflowForm } from './WorkflowForm'

const starterValues: WorkflowFormValues = {
  description: '',
  name: '',
  states: [
    {
      description: 'The item has entered the workflow.',
      id: crypto.randomUUID(),
      key: 'submitted',
      name: 'Submitted',
      type: 'initial',
    },
    {
      description: 'The item is being processed by its owner.',
      id: crypto.randomUUID(),
      key: 'in_progress',
      name: 'In progress',
      type: 'standard',
    },
    {
      description: 'The workflow has completed successfully.',
      id: crypto.randomUUID(),
      key: 'completed',
      name: 'Completed',
      type: 'terminal',
    },
  ],
  templateId: '',
  transitions: [],
  workflowKey: '',
}

starterValues.transitions = [
  {
    fromStateId: starterValues.states[0].id,
    id: crypto.randomUUID(),
    name: 'Start work',
    toStateId: starterValues.states[1].id,
  },
  {
    fromStateId: starterValues.states[1].id,
    id: crypto.randomUUID(),
    name: 'Complete',
    toStateId: starterValues.states[2].id,
  },
]

export function WorkflowEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { workflowId = '' } = useParams()
  const navigate = useNavigate()
  const workflowQuery = useQuery({
    ...workflowDetailOptions(workflowId),
    enabled: mode === 'edit',
  })
  const templatesQuery = useQuery(workflowTemplateOptions())
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow(workflowId)

  if (
    templatesQuery.isPending ||
    (mode === 'edit' && workflowQuery.isPending)
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading workflow editor</span>
      </Card>
    )
  }

  const workflow = workflowQuery.data
  if (
    templatesQuery.isError ||
    (mode === 'edit' &&
      (workflowQuery.isError || !workflow || workflow.status !== 'draft'))
  ) {
    return (
      <Card className="p-8 text-center">
        <Waypoints
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Workflow editor unavailable</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Only available draft versions can be edited.
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/workflows"
        >
          Back to workflows
        </Link>
      </Card>
    )
  }

  const initialValues: WorkflowFormValues = workflow
    ? {
        description: workflow.description,
        name: workflow.name,
        states: workflow.states,
        templateId: workflow.templateId ?? '',
        transitions: workflow.transitions,
        workflowKey: workflow.workflowKey,
      }
    : starterValues

  const cancelTarget = workflow ? `/workflows/${workflow.id}` : '/workflows'

  const handleSubmit = async (values: WorkflowFormValues) => {
    const saved =
      mode === 'create'
        ? await createWorkflow.mutateAsync(values)
        : await updateWorkflow.mutateAsync(values)
    navigate(`/workflows/${saved.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to={cancelTarget}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {workflow ? 'Workflow details' : 'Workflow definitions'}
      </Link>
      <PageHeader
        description={
          workflow
            ? `Update draft version ${workflow.version}. Graph integrity will be checked before the definition is saved.`
            : 'Create a validated process graph from a reusable template or a custom starting point.'
        }
        eyebrow="Process designer"
        title={workflow ? `Edit ${workflow.name}` : 'Create workflow'}
      />
      <WorkflowForm
        initialValues={initialValues}
        isSubmitting={createWorkflow.isPending || updateWorkflow.isPending}
        lockKey={Boolean(workflow)}
        onCancel={() => navigate(cancelTarget)}
        onSubmit={handleSubmit}
        submitLabel={workflow ? 'Save draft' : 'Create draft'}
        templates={templatesQuery.data ?? []}
      />
    </div>
  )
}
