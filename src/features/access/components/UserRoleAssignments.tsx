import { useQuery } from '@tanstack/react-query'
import { Save, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  roleAssignmentListOptions,
  roleListOptions,
  useReplaceUserRoles,
} from '../queries/accessQueries'
import { AccessServiceError } from '../services/accessService'

export function UserRoleAssignments({ userId }: { userId: string }) {
  const rolesQuery = useQuery(roleListOptions())
  const assignmentsQuery = useQuery(roleAssignmentListOptions())
  const replaceRoles = useReplaceUserRoles(userId)
  const [draftRoleIds, setDraftRoleIds] = useState<string[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (rolesQuery.isPending || assignmentsQuery.isPending) {
    return (
      <Card className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading role assignments</span>
      </Card>
    )
  }

  if (rolesQuery.isError || assignmentsQuery.isError) {
    return null
  }

  const assignedRoleIds = assignmentsQuery.data
    .filter((assignment) => assignment.userId === userId)
    .map((assignment) => assignment.roleId)
  const selectedRoleIds = draftRoleIds ?? assignedRoleIds

  const save = async () => {
    setMessage(null)
    try {
      await replaceRoles.mutateAsync(selectedRoleIds)
      setDraftRoleIds(null)
      setMessage('Role assignments saved.')
    } catch (error) {
      setMessage(
        error instanceof AccessServiceError
          ? error.message
          : 'Role assignments could not be saved.',
      )
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          <ShieldCheck aria-hidden="true" className="size-4" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Role assignments
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Effective access is the union of every assigned role.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rolesQuery.data.map((role) => (
          <label
            className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            key={role.id}
          >
            <input
              checked={selectedRoleIds.includes(role.id)}
              className="mt-1 size-4 accent-brand-600"
              onChange={(event) =>
                setDraftRoleIds(
                  event.target.checked
                    ? [...selectedRoleIds, role.id]
                    : selectedRoleIds.filter((id) => id !== role.id),
                )
              }
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                {role.name}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                {role.permissionKeys.length} permissions
              </span>
            </span>
          </label>
        ))}
      </div>
      {message ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {message}
        </p>
      ) : null}
      <Button
        className="mt-4"
        disabled={replaceRoles.isPending}
        onClick={save}
      >
        <Save aria-hidden="true" className="size-4" />
        {replaceRoles.isPending ? 'Saving…' : 'Save role assignments'}
      </Button>
    </Card>
  )
}
