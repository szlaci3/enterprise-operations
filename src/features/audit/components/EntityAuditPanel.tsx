import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { useAuthorization } from '../../access/hooks/useAuthorization'
import { auditEntityOptions } from '../queries/auditQueries'
import type { AuditEntityType } from '../schemas/auditSchemas'
import { AuditActionBadge } from './AuditActionBadge'

export function EntityAuditPanel({
  entityId,
  entityType,
}: {
  entityId: string
  entityType: AuditEntityType
}) {
  const { accessQuery, can } = useAuthorization()
  const hasAccess = can('audit.view')
  const auditQuery = useQuery({
    ...auditEntityOptions(entityType, entityId),
    enabled: !accessQuery.isPending && hasAccess,
  })

  if (accessQuery.isPending || !hasAccess) {
    return null
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <History aria-hidden="true" className="size-4 text-brand-600" />
            Audit history
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Normalized immutable records for this entity.
          </p>
        </div>
        <Link
          aria-label="Open full audit history"
          className="text-brand-700 dark:text-brand-300"
          to={`/audit?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`}
        >
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {auditQuery.isPending ? (
        <div className="mt-4 h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      ) : auditQuery.isError ? (
        <p className="mt-4 text-sm text-red-600">
          Audit history could not be loaded.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {(auditQuery.data ?? []).slice(0, 4).map((record) => (
            <div
              className="border-l-2 border-slate-200 pl-3 dark:border-slate-700"
              key={record.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <AuditActionBadge action={record.action} />
                <span className="text-xs text-slate-400">
                  {new Date(record.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {record.summary}
              </p>
            </div>
          ))}
          {auditQuery.data?.length === 0 ? (
            <p className="text-sm text-slate-500">
              No projected audit records yet.
            </p>
          ) : null}
        </div>
      )}
    </Card>
  )
}
