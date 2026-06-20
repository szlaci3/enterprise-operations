import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  TaskFormValues,
  TaskTransitionFormValues,
} from '../schemas/taskSchemas'
import { taskService } from '../services/taskService'

export const taskKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  list: () => [...taskKeys.all, 'list'] as const,
}

export const taskListOptions = () =>
  queryOptions({ queryFn: taskService.list, queryKey: taskKeys.list() })

export const taskDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => taskService.get(id),
    queryKey: taskKeys.detail(id),
  })

function useTaskCache() {
  const queryClient = useQueryClient()
  return async (id: string, task: Awaited<ReturnType<typeof taskService.update>>) => {
    queryClient.setQueryData(taskKeys.detail(id), task)
    await queryClient.invalidateQueries({ queryKey: taskKeys.all })
  }
}

export function useCreateTask(actorUserId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: TaskFormValues) =>
      taskService.create(actorUserId, values),
    onSuccess: async (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task)
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useUpdateTask(id: string, actorUserId: string) {
  const updateCache = useTaskCache()
  return useMutation({
    mutationFn: (values: TaskFormValues) =>
      taskService.update(id, actorUserId, values),
    onSuccess: (task) => updateCache(id, task),
  })
}

export function useTransitionTask(id: string, actorUserId: string) {
  const updateCache = useTaskCache()
  return useMutation({
    mutationFn: (values: TaskTransitionFormValues) =>
      taskService.transition(id, actorUserId, values),
    onSuccess: (task) => updateCache(id, task),
  })
}
