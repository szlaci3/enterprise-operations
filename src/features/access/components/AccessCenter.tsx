import { useQuery } from '@tanstack/react-query'
import { KeyRound, Plus, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { userListOptions } from '../../users/queries/userQueries'
import { Badge } from '../../../shared/components/Badge'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  permissionListOptions,
  roleAssignmentListOptions,
  roleListOptions,
} from '../queries/accessQueries'
import { PermissionMatrix } from './PermissionMatrix'

export function AccessCenter() {
  const rolesQuery = useQuery(roleListOptions())
  const permissionsQuery = useQuery(permissionListOptions())
  const assignmentsQuery = useQuery(roleAssignmentListOptions())
  const usersQuery = useQuery(userListOptions())

  if (
    rolesQuery.isPending ||
    permissionsQuery.isPending ||
    assignmentsQuery.isPending ||
    usersQuery.isPending
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading access policies</span>
      </Card>
    )
  }

  if (
    rolesQuery.isError ||
    permissionsQuery.isError ||
    assignmentsQuery.isError ||
    usersQuery.isError
  ) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
          Access policies unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Roles and permission assignments could not be loaded.
        </p>
      </Card>
    )
  }

  const roles = rolesQuery.data
  const assignments = assignmentsQuery.data
  const users = usersQuery.data
  const assignedUsers = new Set(assignments.map((item) => item.userId)).size

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            to="/access/roles/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Create role
          </Link>
        }
        description="Define permission bundles, inspect effective policy coverage, and govern access assignments."
        eyebrow="Security administration"
        title="Roles & permissions"
      />

      <section aria-label="Access summary" className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <ShieldCheck aria-hidden="true" className="size-5 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Defined roles
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
            {roles.length}
          </p>
        </Card>
        <Card className="p-5">
          <KeyRound aria-hidden="true" className="size-5 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Permissions
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
            {permissionsQuery.data.length}
          </p>
        </Card>
        <Card className="p-5">
          <Users aria-hidden="true" className="size-5 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Users with roles
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
            {assignedUsers} / {users.length}
          </p>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Role catalog
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reusable access bundles assigned to managed identities.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => {
            const assignmentCount = assignments.filter(
              (assignment) => assignment.roleId === role.id,
            ).length
            return (
              <Card className="p-5" key={role.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    <ShieldCheck aria-hidden="true" className="size-5" />
                  </div>
                  {role.isSystem ? <Badge tone="blue">System</Badge> : null}
                </div>
                <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">
                  {role.name}
                </h3>
                <p className="mt-2 min-h-15 text-sm leading-5 text-slate-500 dark:text-slate-400">
                  {role.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span>{role.permissionKeys.length} permissions</span>
                  <span>{assignmentCount} users</span>
                </div>
                <Link
                  className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300"
                  to={`/access/roles/${role.id}`}
                >
                  View role
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Permission matrix
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Compare effective capability grants across every defined role.
          </p>
        </div>
        <PermissionMatrix permissions={permissionsQuery.data} roles={roles} />
      </Card>
    </div>
  )
}
