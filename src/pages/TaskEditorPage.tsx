import { TaskEditor } from '../features/tasks/components/TaskEditor'

export function CreateTaskPage() {
  return <TaskEditor mode="create" />
}

export function EditTaskPage() {
  return <TaskEditor mode="edit" />
}
