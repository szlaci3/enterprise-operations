import { Badge } from '../../../shared/components/Badge'
import type { DepartmentStatus } from '../schemas/departmentSchemas'

const statusConfig = {
  active: { label: 'Active', tone: 'green' as const },
  inactive: { label: 'Inactive', tone: 'slate' as const },
  planned: { label: 'Planned', tone: 'blue' as const },
}

export function DepartmentStatusBadge({
  status,
}: {
  status: DepartmentStatus
}) {
  const config = statusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}
