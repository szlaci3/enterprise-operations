import { Badge } from '../../../shared/components/Badge'
import type {
  DocumentClassification,
  DocumentStatus,
} from '../schemas/documentSchemas'

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const tone =
    status === 'published' ? 'green' : status === 'archived' ? 'slate' : 'amber'
  return <Badge tone={tone}>{status}</Badge>
}

export function DocumentClassificationBadge({
  classification,
}: {
  classification: DocumentClassification
}) {
  const tone =
    classification === 'restricted'
      ? 'red'
      : classification === 'confidential'
        ? 'amber'
        : 'blue'
  return <Badge tone={tone}>{classification}</Badge>
}
