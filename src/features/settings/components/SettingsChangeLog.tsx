import { History } from 'lucide-react'
import { Card } from '../../../shared/components/Card'
import type { SettingsChange } from '../schemas/settingsSchemas'

export function SettingsChangeLog({
  changes,
  userNameById,
}: {
  changes: SettingsChange[]
  userNameById: Map<string, string>
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <History aria-hidden="true" className="size-5" />
          Administrative change history
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Append-only changes to organization policy and feature rollout.
        </p>
      </div>
      {changes.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">No changes recorded.</p>
      ) : (
        <ol className="divide-y divide-slate-100 dark:divide-slate-800">
          {changes.slice(0, 30).map((change) => (
            <li className="p-5 sm:p-6" key={change.id}>
              <p className="text-sm font-semibold">{change.summary}</p>
              <p className="mt-1 text-xs text-slate-400">
                {userNameById.get(change.actorUserId) ?? change.actorUserId} ·{' '}
                {new Date(change.createdAt).toLocaleString()} · {change.scope}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
