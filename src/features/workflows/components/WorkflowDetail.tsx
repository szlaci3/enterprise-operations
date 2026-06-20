import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  CopyPlus,
  GitBranch,
  Pencil,
  Play,
  Trash2,
  Waypoints,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PermissionGate } from '../../access/components/PermissionGate'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  useActivateWorkflow,
  useCreateWorkflowVersion,
  useDeleteWorkflow,
  workflowDetailOptions,
  workflowListOptions,
} from '../queries/workflowQueries'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'

export function WorkflowDetail() {
  const { workflowId = '' } = useParams()
  const navigate = useNavigate()
  const workflowQuery = useQuery(workflowDetailOptions(workflowId))
  const workflowsQuery = useQuery(workflowListOptions())
  const activateWorkflow = useActivateWorkflow()
  const createVersion = useCreateWorkflowVersion()
  const deleteWorkflow = useDeleteWorkflow()

  if (workflowQuery.isPending || workflowsQuery.isPending) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading workflow</span>
      </Card>
    )
  }

  const workflow = workflowQuery.data
  if (workflowQuery.isError || workflowsQuery.isError || !workflow) {
    return (
      <Card className="p-8 text-center">
        <Waypoints
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold">Workflow not available</h1>
        <Link className="mt-5 inline-flex text-brand-700" to="/workflows">
          Back to workflows
        </Link>
      </Card>
    )
  }

  const versions = (workflowsQuery.data ?? [])
    .filter((item) => item.workflowKey === workflow.workflowKey)
    .sort((left, right) => right.version - left.version)
  const stateById = new Map(workflow.states.map((state) => [state.id, state]))
  const mutationError =
    activateWorkflow.error ?? createVersion.error ?? deleteWorkflow.error

  const handleCreateVersion = async () => {
    const nextVersion = await createVersion.mutateAsync(workflow.id)
    navigate(`/workflows/${nextVersion.id}/edit`)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this draft workflow version?')) {
      return
    }
    await deleteWorkflow.mutateAsync(workflow.id)
    navigate('/workflows', { replace: true })
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/workflows"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Workflow definitions
      </Link>

      <PageHeader
        actions={
          <PermissionGate permission="workflows.manage">
            <div className="flex flex-wrap gap-2">
              {workflow.status === 'draft' ? (
                <>
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    to={`/workflows/${workflow.id}/edit`}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Edit draft
                  </Link>
                  <Button
                    disabled={activateWorkflow.isPending}
                    onClick={() => activateWorkflow.mutate(workflow.id)}
                  >
                    <Play aria-hidden="true" className="size-4" />
                    Activate
                  </Button>
                </>
              ) : (
                <Button
                  disabled={createVersion.isPending}
                  onClick={handleCreateVersion}
                >
                  <CopyPlus aria-hidden="true" className="size-4" />
                  Create new version
                </Button>
              )}
            </div>
          </PermissionGate>
        }
        description={workflow.description}
        eyebrow={`${workflow.workflowKey} · version ${workflow.version}`}
        title={workflow.name}
      />

      {mutationError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {mutationError.message}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
          <div className="mt-3">
            <WorkflowStatusBadge status={workflow.status} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">States</p>
          <p className="mt-2 text-2xl font-semibold">{workflow.states.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transitions
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {workflow.transitions.length}
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 font-semibold">
              <GitBranch aria-hidden="true" className="size-5 text-brand-600" />
              Process graph
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Validated states and the actions that move work between them.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {workflow.states.map((state) => {
              const outgoing = workflow.transitions.filter(
                (transition) => transition.fromStateId === state.id,
              )
              return (
                <article
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  key={state.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{state.name}</h3>
                    <Badge
                      tone={
                        state.type === 'initial'
                          ? 'blue'
                          : state.type === 'terminal'
                            ? 'green'
                            : 'slate'
                      }
                    >
                      {state.type}
                    </Badge>
                    <code className="text-xs text-slate-400">{state.key}</code>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {state.description}
                  </p>
                  {outgoing.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {outgoing.map((transition) => (
                        <li
                          className="flex items-center gap-2 text-sm"
                          key={transition.id}
                        >
                          <CheckCircle2
                            aria-hidden="true"
                            className="size-4 text-brand-500"
                          />
                          <span className="font-medium">{transition.name}</span>
                          <span className="text-slate-400">→</span>
                          <span>
                            {stateById.get(transition.toStateId)?.name ??
                              'Unknown state'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Terminal outcome
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Version history</h2>
            <div className="mt-4 space-y-2">
              {versions.map((version) => (
                <Link
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                    version.id === workflow.id
                      ? 'border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-950'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  key={version.id}
                  to={`/workflows/${version.id}`}
                >
                  <span className="font-semibold">Version {version.version}</span>
                  <WorkflowStatusBadge status={version.status} />
                </Link>
              ))}
            </div>
          </Card>

          {workflow.status === 'draft' ? (
            <PermissionGate permission="workflows.manage">
              <Card className="border-red-200 p-5 dark:border-red-900">
                <h2 className="font-semibold text-red-700 dark:text-red-300">
                  Draft controls
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Drafts can be removed before they are activated.
                </p>
                <Button
                  className="mt-4 w-full"
                  disabled={deleteWorkflow.isPending}
                  onClick={handleDelete}
                  variant="danger"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete draft
                </Button>
              </Card>
            </PermissionGate>
          ) : null}
        </div>
      </div>
    </div>
  )
}
