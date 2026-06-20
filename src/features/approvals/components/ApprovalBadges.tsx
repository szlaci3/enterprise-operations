import { Badge } from '../../../shared/components/Badge'
import type {
  ApprovalPriority,
  ApprovalStatus,
  ApprovalStep,
} from '../schemas/approvalSchemas'

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <Badge
      tone={
        status === 'approved'
          ? 'green'
          : status === 'rejected'
            ? 'red'
            : 'amber'
      }
    >
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function ApprovalPriorityBadge({
  priority,
}: {
  priority: ApprovalPriority
}) {
  return (
    <Badge
      tone={
        priority === 'urgent'
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

export function ApprovalStepBadge({
  status,
}: {
  status: ApprovalStep['status']
}) {
  return (
    <Badge
      tone={
        status === 'approved'
          ? 'green'
          : status === 'rejected'
            ? 'red'
            : status === 'pending'
              ? 'amber'
              : 'slate'
      }
    >
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  )
}
