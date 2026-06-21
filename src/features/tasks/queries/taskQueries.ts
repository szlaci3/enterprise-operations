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
import { offlineService } from '../../offline/services/offlineService'

export const taskKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  list: () => [...taskKeys.all, 'list'] as const,
}

export const taskListOptions = () =>
  queryOptions({
    networkMode: 'always',
    queryFn: async () => offlineService.projectTasks(await taskService.list()),
    queryKey: taskKeys.list(),
  })

export const taskDetailOptions = (id: string) =>
  queryOptions({
    networkMode: 'always',
    queryFn: async () => {
      const task = await taskService.get(id)
      return task ? offlineService.projectTask(task) : null
    },
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
  const queryClient = useQueryClient()
  const updateCache = useTaskCache()
  return useMutation({
    networkMode: 'always',
    mutationFn: (values: TaskTransitionFormValues) =>
      taskService.transition(id, actorUserId, values),
    onSuccess: (task) => updateCache(id, task),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['offline'] })
    },
  })
}
