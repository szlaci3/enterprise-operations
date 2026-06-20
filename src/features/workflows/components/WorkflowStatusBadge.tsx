import { Badge } from '../../../shared/components/Badge'
import type { WorkflowStatus } from '../schemas/workflowSchemas'

const labels: Record<WorkflowStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  retired: 'Retired',
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return (
    <Badge
      tone={
        status === 'active' ? 'green' : status === 'draft' ? 'amber' : 'slate'
      }
    >
      {labels[status]}
    </Badge>
  )
}
