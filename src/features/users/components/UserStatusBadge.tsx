import { Badge } from '../../../shared/components/Badge'
import type { UserStatus } from '../schemas/userSchemas'

const config = {
  active: { label: 'Active', tone: 'green' as const },
  deactivated: { label: 'Deactivated', tone: 'slate' as const },
  invited: { label: 'Invited', tone: 'blue' as const },
  suspended: { label: 'Suspended', tone: 'amber' as const },
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const statusConfig = config[status]
  return <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
}
