import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Plus, Search, UserRound, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { userListOptions } from '../queries/userQueries'
import type { UserStatus } from '../schemas/userSchemas'
import { UserAvatar } from './UserAvatar'
import { UserStatusBadge } from './UserStatusBadge'

type StatusFilter = UserStatus | 'all'

export function UserDirectory() {
  const usersQuery = useQuery(userListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [departmentId, setDepartmentId] = useState('all')

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  )
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return users
      .filter((user) => status === 'all' || user.status === status)
      .filter(
        (user) =>
          departmentId === 'all' || user.departmentId === departmentId,
      )
      .filter((user) => {
        if (!normalizedSearch) return true
        return [
          user.firstName,
          user.lastName,
          `${user.firstName} ${user.lastName}`,
          user.email,
          user.employeeId,
          user.jobTitle,
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
      })
      .sort((left, right) =>
        `${left.lastName}${left.firstName}`.localeCompare(
          `${right.lastName}${right.firstName}`,
        ),
      )
  }, [departmentId, search, status, users])

  if (usersQuery.isPending || departmentsQuery.isPending) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading user directory</span>
      </Card>
    )
  }

  if (usersQuery.isError || departmentsQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
          User directory unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The organization identity data could not be loaded.
        </p>
      </Card>
    )
  }

  const activeUsers = users.filter((user) => user.status === 'active').length
  const invitedUsers = users.filter((user) => user.status === 'invited').length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            to="/users/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add user
          </Link>
        }
        description="Manage workforce identities, lifecycle state, organizational assignment, and team membership."
        eyebrow="Identity management"
        title="User directory"
      />

      <section
        aria-label="User summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Managed identities
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {users.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active users
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {activeUsers}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pending invitations
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {invitedUsers}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">Search users</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, employee ID, or title"
              type="search"
              value={search}
            />
          </label>
          <select
            aria-label="Filter users by department"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            onChange={(event) => setDepartmentId(event.target.value)}
            value={departmentId}
          >
            <option value="all">All departments</option>
            {departments
              .slice()
              .sort((left, right) => left.name.localeCompare(right.name))
              .map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
          </select>
          <select
            aria-label="Filter users by lifecycle status"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            onChange={(event) => {
              const value = event.target.value
              if (
                value === 'all' ||
                value === 'active' ||
                value === 'invited' ||
                value === 'suspended' ||
                value === 'deactivated'
              ) {
                setStatus(value)
              }
            }}
            value={status}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <UserRound
              aria-hidden="true"
              className="mx-auto size-8 text-slate-300"
            />
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              No users match these filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-220 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold" scope="col">User</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Department</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Manager</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Teams</th>
                  <th className="px-5 py-3 font-semibold" scope="col">Status</th>
                  <th className="w-12 px-5 py-3" scope="col">
                    <span className="sr-only">Open profile</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((user) => {
                  const department = departments.find(
                    (item) => item.id === user.departmentId,
                  )
                  const manager = users.find((item) => item.id === user.managerId)
                  return (
                    <tr
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      key={user.id}
                    >
                      <th className="px-5 py-4" scope="row">
                        <Link
                          className="flex items-center gap-3"
                          to={`/users/${user.id}`}
                        >
                          <UserAvatar user={user} />
                          <span>
                            <span className="block font-semibold text-slate-900 hover:text-brand-700 dark:text-white">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-400">
                              {user.jobTitle} · {user.employeeId}
                            </span>
                          </span>
                        </Link>
                      </th>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {department?.name ?? 'Unassigned'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {manager
                          ? `${manager.firstName} ${manager.lastName}`
                          : 'No manager'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Users aria-hidden="true" className="size-4 text-slate-400" />
                          {user.teamIds.length}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <UserStatusBadge status={user.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          aria-label={`Open ${user.firstName} ${user.lastName}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          to={`/users/${user.id}`}
                        >
                          <ChevronRight aria-hidden="true" className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
