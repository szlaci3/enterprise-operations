import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  ApprovalDecisionFormValues,
  ApprovalRequestFormValues,
} from '../schemas/approvalSchemas'
import { approvalService } from '../services/approvalService'

export const approvalKeys = {
  all: ['approvals'] as const,
  detail: (id: string) => [...approvalKeys.all, 'detail', id] as const,
  list: () => [...approvalKeys.all, 'list'] as const,
}

export const approvalListOptions = () =>
  queryOptions({
    queryFn: approvalService.list,
    queryKey: approvalKeys.list(),
  })

export const approvalDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => approvalService.get(id),
    queryKey: approvalKeys.detail(id),
  })

function useApprovalCache() {
  const queryClient = useQueryClient()
  return async (id: string, approval: Awaited<ReturnType<typeof approvalService.decide>>) => {
    queryClient.setQueryData(approvalKeys.detail(id), approval)
    await queryClient.invalidateQueries({ queryKey: approvalKeys.all })
  }
}

export function useCreateApproval(requesterUserId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ApprovalRequestFormValues) =>
      approvalService.create(requesterUserId, values),
    onSuccess: async (approval) => {
      queryClient.setQueryData(approvalKeys.detail(approval.id), approval)
      await queryClient.invalidateQueries({ queryKey: approvalKeys.all })
    },
  })
}

export function useDecideApproval(id: string, actorUserId: string) {
  const updateCache = useApprovalCache()
  return useMutation({
    mutationFn: (values: ApprovalDecisionFormValues) =>
      approvalService.decide(id, actorUserId, values),
    onSuccess: (approval) => updateCache(id, approval),
  })
}

export function useDelegateApproval(id: string, actorUserId: string) {
  const updateCache = useApprovalCache()
  return useMutation({
    mutationFn: (targetUserId: string) =>
      approvalService.delegate(id, actorUserId, targetUserId),
    onSuccess: (approval) => updateCache(id, approval),
  })
}

export function useEscalateApproval(id: string, actorUserId: string) {
  const updateCache = useApprovalCache()
  return useMutation({
    mutationFn: () => approvalService.escalate(id, actorUserId),
    onSuccess: (approval) => updateCache(id, approval),
  })
}
