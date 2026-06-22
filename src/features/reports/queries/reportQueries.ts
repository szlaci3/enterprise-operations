import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { ReportFormValues } from '../schemas/reportSchemas'
import { reportService } from '../services/reportService'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const reportKeys = {
  get all() {
    return tenantQueryKey('reports')
  },
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
  execution: (id: string) => [...reportKeys.all, 'execution', id] as const,
  list: () => [...reportKeys.all, 'list'] as const,
  templates: () => [...reportKeys.all, 'templates'] as const,
}

export const reportListOptions = () =>
  queryOptions({ queryFn: reportService.list, queryKey: reportKeys.list() })

export const reportDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => reportService.get(id),
    queryKey: reportKeys.detail(id),
  })

export const reportExecutionOptions = (id: string) =>
  queryOptions({
    gcTime: 15 * 60_000,
    placeholderData: keepPreviousData,
    queryFn: () => reportService.execute(id),
    queryKey: reportKeys.execution(id),
    staleTime: 60_000,
  })

export const reportTemplateOptions = () =>
  queryOptions({
    queryFn: reportService.listTemplates,
    queryKey: reportKeys.templates(),
    staleTime: Number.POSITIVE_INFINITY,
  })

export function useCreateReport(actorUserId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ReportFormValues) =>
      reportService.create(actorUserId, values),
    onSuccess: async (report) => {
      queryClient.setQueryData(reportKeys.detail(report.id), report)
      await queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}

export function useUpdateReport(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ReportFormValues) =>
      reportService.update(id, values),
    onSuccess: async (report) => {
      queryClient.setQueryData(reportKeys.detail(id), report)
      await queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reportService.delete,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: reportKeys.detail(id) })
      queryClient.removeQueries({ queryKey: reportKeys.execution(id) })
      await queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}
