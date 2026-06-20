import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit3, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { UserAvatar } from '../../users/components/UserAvatar'
import { userListOptions } from '../../users/queries/userQueries'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  permissionListOptions,
  roleAssignmentListOptions,
  roleDetailOptions,
  useDeleteRole,
} from '../queries/accessQueries'
import { AccessServiceError } from '../services/accessService'

export function RoleDetail() {
  const { roleId = '' } = useParams()
  const navigate = useNavigate()
  const roleQuery = useQuery(roleDetailOptions(roleId))
  const permissionsQuery = useQuery(permissionListOptions())
  const assignmentsQuery = useQuery(roleAssignmentListOptions())
  const usersQuery = useQuery(userListOptions())
  const deleteRole = useDeleteRole()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

  if (
    roleQuery.isPending ||
    permissionsQuery.isPending ||
    assignmentsQuery.isPending ||
    usersQuery.isPending
  ) {
    return (
      <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading role</span>
      </Card>
    )
  }

  const role = roleQuery.data
  if (
    !role ||
    roleQuery.isError ||
    permissionsQuery.isError ||
    assignmentsQuery.isError ||
    usersQuery.isError
  ) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
          Role not found
        </h1>
        <Link
          className="mt-5 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/access"
        >
          Back to access center
        </Link>
      </Card>
    )
  }

  const assignedUserIds = assignmentsQuery.data
    .filter((assignment) => assignment.roleId === role.id)
    .map((assignment) => assignment.userId)
  const assignedUsers = usersQuery.data.filter((user) =>
    assignedUserIds.includes(user.id),
  )
  const grantedPermissions = permissionsQuery.data.filter((permission) =>
    role.permissionKeys.includes(permission.key),
  )
  const modules = [
    ...new Set(grantedPermissions.map((permission) => permission.module)),
  ]

  const remove = async () => {
    setDeleteError(null)
    try {
      await deleteRole.mutateAsync(role.id)
      navigate('/access', { replace: true })
    } catch (error) {
      setDeleteError(
        error instanceof AccessServiceError
          ? error.message
          : 'The role could not be deleted.',
      )
    }
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/access"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Access center
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={role.isSystem ? 'blue' : 'slate'}>
              {role.isSystem ? 'System role' : 'Custom role'}
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {role.name}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {role.description}
          </p>
        </div>
        {!role.isSystem ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            to={`/access/roles/${role.id}/edit`}
          >
            <Edit3 aria-hidden="true" className="size-4" />
            Edit role
          </Link>
        ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Permissions
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {role.permissionKeys.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assigned users
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {assignedUsers.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Covered modules
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {modules.length}
          </p>
        </Card>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Granted permissions
          </h2>
          <div className="mt-4 space-y-5">
            {modules.map((module) => (
              <div key={module}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {module}
                </h3>
                <ul className="mt-2 space-y-2">
                  {grantedPermissions
                    .filter((permission) => permission.module === module)
                    .map((permission) => (
                      <li
                        className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                        key={permission.key}
                      >
                        <ShieldCheck
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-emerald-500"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                            {permission.action}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {permission.description}
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Assigned users
            </h2>
          </div>
          {assignedUsers.length === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              This role is not assigned to any users.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignedUsers.map((user) => (
                <li key={user.id}>
                  <Link
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    to={`/users/${user.id}`}
                  >
                    <UserAvatar user={user} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {user.jobTitle}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {!role.isSystem ? (
        <Card className="border-red-200 p-5 dark:border-red-900">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Role administration
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A role can only be deleted after all user assignments are removed.
          </p>
          {deleteError ? (
            <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          ) : null}
          {!isDeleteConfirmationOpen ? (
            <Button
              className="mt-4"
              onClick={() => setDeleteConfirmationOpen(true)}
              variant="danger"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete role
            </Button>
          ) : (
            <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/50">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Delete {role.name}?
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                This cannot be undone. Assigned roles remain protected by the
                service and will not be deleted.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  disabled={deleteRole.isPending}
                  onClick={remove}
                  variant="danger"
                >
                  {deleteRole.isPending ? 'Deleting…' : 'Confirm delete'}
                </Button>
                <Button
                  onClick={() => setDeleteConfirmationOpen(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  )
}
