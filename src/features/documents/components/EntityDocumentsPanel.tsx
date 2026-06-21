import { useQuery } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PermissionGate } from '../../access/components/PermissionGate'
import { entityDocumentsOptions } from '../queries/documentQueries'
import type { DocumentLink } from '../schemas/documentSchemas'
import { DocumentStatusBadge } from './DocumentBadges'

export function EntityDocumentsPanel({
  entityId,
  entityType,
}: DocumentLink) {
  const link = { entityId, entityType }
  const documentsQuery = useQuery(entityDocumentsOptions(link))

  if (documentsQuery.isPending) {
    return (
      <Card className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading linked documents</span>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <FileText aria-hidden="true" className="size-5" />
            Documents
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Controlled evidence and working files linked to this record.
          </p>
        </div>
        <PermissionGate permission="documents.manage">
          <Link
            aria-label="Add a document"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"
            to="/documents/new"
          >
            <Plus aria-hidden="true" className="size-4" />
          </Link>
        </PermissionGate>
      </div>

      {documentsQuery.isError || !documentsQuery.data?.length ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          No linked documents.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {documentsQuery.data.map((document) => (
            <Link
              className="block rounded-lg border border-slate-200 p-3 hover:border-brand-300 dark:border-slate-700"
              key={document.id}
              to={`/documents/${document.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{document.title}</span>
                <DocumentStatusBadge status={document.status} />
              </div>
              <span className="mt-1 block text-xs text-slate-400">
                {document.versions.length} version
                {document.versions.length === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
