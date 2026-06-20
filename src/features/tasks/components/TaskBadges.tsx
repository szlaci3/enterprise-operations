import { Badge } from '../../../shared/components/Badge'
import type { TaskPriority, TaskStatus } from '../schemas/taskSchemas'

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
  completed: 'Completed',
  'in-progress': 'In progress',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      tone={
        status === 'completed'
          ? 'green'
          : status === 'blocked'
            ? 'red'
            : status === 'in-progress'
              ? 'blue'
              : status === 'cancelled'
                ? 'slate'
                : 'amber'
      }
    >
      {statusLabels[status]}
    </Badge>
  )
}

export function TaskPriorityBadge({
  priority,
}: {
  priority: TaskPriority
}) {
  return (
    <Badge
      tone={
        priority === 'critical'
          ? 'red'
          : priority === 'high'
            ? 'amber'
            : priority === 'normal'
              ? 'blue'
              : 'slate'
      }
    >
      {priority[0].toUpperCase() + priority.slice(1)}
    </Badge>
  )
}
