import { Badge } from '../../../shared/components/Badge'
import type { AuditAction } from '../schemas/auditSchemas'

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return (
    <Badge
      tone={
        action === 'approved' || action === 'created'
          ? 'green'
          : action === 'rejected' || action === 'escalated'
            ? 'red'
            : action === 'delegated' ||
                action === 'reassigned' ||
                action === 'status-changed'
              ? 'amber'
              : 'blue'
      }
    >
      {action.replace('-', ' ')}
    </Badge>
  )
}
