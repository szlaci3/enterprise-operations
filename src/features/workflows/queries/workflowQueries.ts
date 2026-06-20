import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  WorkflowDefinition,
  WorkflowFormValues,
} from '../schemas/workflowSchemas'
import { workflowService } from '../services/workflowService'

export const workflowKeys = {
  all: ['workflows'] as const,
  detail: (id: string) => [...workflowKeys.all, 'detail', id] as const,
  list: () => [...workflowKeys.all, 'list'] as const,
  templates: () => [...workflowKeys.all, 'templates'] as const,
}

export const workflowListOptions = () =>
  queryOptions({
    queryFn: workflowService.list,
    queryKey: workflowKeys.list(),
  })

export const workflowDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => workflowService.get(id),
    queryKey: workflowKeys.detail(id),
  })

export const workflowTemplateOptions = () =>
  queryOptions({
    queryFn: workflowService.listTemplates,
    queryKey: workflowKeys.templates(),
    staleTime: Number.POSITIVE_INFINITY,
  })

function useWorkflowMutation(
  mutationFn: (id: string) => Promise<WorkflowDefinition>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })
}

export function useActivateWorkflow() {
  return useWorkflowMutation(workflowService.activate)
}

export function useCreateWorkflowVersion() {
  return useWorkflowMutation(workflowService.createVersion)
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: workflowService.delete,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: workflowKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: workflowService.create,
    onSuccess: async (workflow) => {
      queryClient.setQueryData(workflowKeys.detail(workflow.id), workflow)
      await queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })
}

export function useUpdateWorkflow(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: WorkflowFormValues) =>
      workflowService.update(id, values),
    onSuccess: async (workflow) => {
      queryClient.setQueryData(workflowKeys.detail(id), workflow)
      await queryClient.invalidateQueries({ queryKey: workflowKeys.all })
    },
  })
}
