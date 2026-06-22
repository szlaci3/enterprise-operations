import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { DepartmentFormValues } from '../schemas/departmentSchemas'
import { departmentService } from '../services/departmentService'
import { tenantQueryKey } from '../../tenancy/utils/tenantQueryKey'

export const departmentKeys = {
  get all() {
    return tenantQueryKey('departments')
  },
  detail: (id: string) => [...departmentKeys.all, 'detail', id] as const,
  list: () => [...departmentKeys.all, 'list'] as const,
}

export const departmentListOptions = () =>
  queryOptions({
    queryFn: departmentService.list,
    queryKey: departmentKeys.list(),
  })

export const departmentDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => departmentService.get(id),
    queryKey: departmentKeys.detail(id),
  })

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: departmentService.create,
    onSuccess: async (department) => {
      queryClient.setQueryData(departmentKeys.detail(department.id), department)
      await queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: departmentService.delete,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: DepartmentFormValues) =>
      departmentService.update(id, values),
    onSuccess: async (department) => {
      queryClient.setQueryData(departmentKeys.detail(id), department)
      await queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}
