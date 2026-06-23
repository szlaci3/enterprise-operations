import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Plus, UserRound, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { userListOptions } from '../queries/userQueries'
import type { UserStatus } from '../schemas/userSchemas'
import { UserAvatar } from './UserAvatar'
import { UserStatusBadge } from './UserStatusBadge'
import { useVirtualRows } from '../../../shared/hooks/useVirtualRows'
import {
  CollectionEmpty,
  CollectionError,
  CollectionLoading,
  FilterBar,
  SearchField,
  SelectFilter,
} from '../../../shared/components/CollectionWorkspace'
import { SummaryGrid } from '../../../shared/components/SummaryGrid'
import { useUrlState } from '../../../shared/hooks/useUrlState'
import { PermissionGate } from '../../access/components/PermissionGate'
import { SavedViewToolbar } from '../../views/components/SavedViewToolbar'
import { useSavedViewUrlState } from '../../views/hooks/useSavedViewUrlState'

type StatusFilter = UserStatus | 'all'
type UserSort = 'name' | 'updated' | 'status'
const userViewDefaults = {
  department: 'all',
  q: '',
  sort: 'name',
  status: 'all',
}
const userViewStateKeys = ['department', 'q', 'sort', 'status']
const userColumns = [
  { key: 'department', label: 'Department' },
  { key: 'manager', label: 'Manager' },
  { key: 'teams', label: 'Teams' },
  { key: 'status', label: 'Status' },
]

export function UserDirectory() {
  const usersQuery = useQuery(userListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const [search, setSearch] = useUrlState<string>({
    defaultValue: '',
    key: 'q',
  })
  const [status, setStatus] = useUrlState<StatusFilter>({
    defaultValue: 'all',
    key: 'status',
    values: ['all', 'active', 'invited', 'suspended', 'deactivated'],
  })
  const [departmentId, setDepartmentId] = useUrlState<string>({
    defaultValue: 'all',
    key: 'department',
  })
  const [sort, setSort] = useUrlState<UserSort>({
    defaultValue: 'name',
    key: 'sort',
    values: ['name', 'updated', 'status'],
  })
  const savedView = useSavedViewUrlState({
    defaults: userViewDefaults,
    stateKeys: userViewStateKeys,
  })
  const visibleColumns =
    savedView.presentation.columns.length > 0
      ? savedView.presentation.columns
      : userColumns.map((column) => column.key)
  const tableColumnCount = visibleColumns.length + 2

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
      .sort((left, right) => {
        if (sort === 'updated') {
          return right.updatedAt.localeCompare(left.updatedAt)
        }
        if (sort === 'status') {
          return (
            left.status.localeCompare(right.status) ||
            left.lastName.localeCompare(right.lastName)
          )
        }
        return `${left.lastName}${left.firstName}`.localeCompare(
          `${right.lastName}${right.firstName}`,
        )
      })
  }, [departmentId, search, sort, status, users])
  const virtualRows = useVirtualRows({
    count: filtered.length,
    rowHeight: 73,
    viewportHeight: 584,
  })
  const visibleUsers = filtered.slice(
    virtualRows.startIndex,
    virtualRows.endIndex,
  )

  if (usersQuery.isPending || departmentsQuery.isPending) {
    return <CollectionLoading height="h-120" label="Loading user directory" />
  }

  if (usersQuery.isError || departmentsQuery.isError) {
    return (
      <CollectionError
        description="The organization identity data could not be loaded."
        onRetry={() => {
          usersQuery.refetch()
          departmentsQuery.refetch()
        }}
        title="User directory unavailable"
      />
    )
  }

  const activeUsers = users.filter((user) => user.status === 'active').length
  const invitedUsers = users.filter((user) => user.status === 'invited').length

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <PermissionGate permission="users.manage">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              to="/users/new"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add user
            </Link>
          </PermissionGate>
        }
        description="Manage workforce identities, lifecycle state, organizational assignment, and team membership."
        eyebrow="Identity management"
        title="User directory"
      />

      <SummaryGrid
        ariaLabel="User summary"
        metrics={[
          { label: 'Managed identities', value: users.length },
          { label: 'Active users', value: activeUsers },
          { label: 'Pending invitations', value: invitedUsers },
        ]}
      />
      <SavedViewToolbar
        availableColumns={userColumns}
        hasActiveState={savedView.hasActiveState}
        onApply={savedView.apply}
        onPresentationChange={savedView.setPresentation}
        presentation={savedView.presentation}
        resource="users"
        state={{ department: departmentId, q: search, sort, status }}
      />

      <Card className="overflow-hidden">
        <FilterBar
          primary={
            <SearchField
              label="Search users"
              onChange={setSearch}
              placeholder="Search name, email, employee ID, or title"
              value={search}
            />
          }
        >
          <SelectFilter
            label="Filter users by department"
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
          </SelectFilter>
          <SelectFilter
            label="Filter users by lifecycle status"
            onChange={(event) =>
              setStatus(event.target.value as StatusFilter)
            }
            value={status}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </SelectFilter>
          <SelectFilter
            label="Sort users"
            onChange={(event) => setSort(event.target.value as UserSort)}
            value={sort}
          >
            <option value="name">Name</option>
            <option value="updated">Recently updated</option>
            <option value="status">Lifecycle status</option>
          </SelectFilter>
        </FilterBar>

        {filtered.length === 0 ? (
          <CollectionEmpty
            icon={<UserRound aria-hidden="true" className="size-8" />}
            title="No users match these filters"
          />
        ) : (
          <div
            className="max-h-146 overflow-auto"
            onScroll={(event) =>
              virtualRows.setScrollTop(event.currentTarget.scrollTop)
            }
          >
            <table
              aria-rowcount={filtered.length}
              className="w-full min-w-220 text-left text-sm"
            >
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_var(--color-slate-200)] dark:bg-slate-800 dark:text-slate-400 dark:shadow-[0_1px_0_0_var(--color-slate-700)]">
                <tr>
                  <th className="px-5 py-3 font-semibold" scope="col">User</th>
                  {visibleColumns.includes('department') ? (
                    <th className="px-5 py-3 font-semibold" scope="col">Department</th>
                  ) : null}
                  {visibleColumns.includes('manager') ? (
                    <th className="px-5 py-3 font-semibold" scope="col">Manager</th>
                  ) : null}
                  {visibleColumns.includes('teams') ? (
                    <th className="px-5 py-3 font-semibold" scope="col">Teams</th>
                  ) : null}
                  {visibleColumns.includes('status') ? (
                    <th className="px-5 py-3 font-semibold" scope="col">Status</th>
                  ) : null}
                  <th className="w-12 px-5 py-3" scope="col">
                    <span className="sr-only">Open profile</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {virtualRows.paddingTop > 0 ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={tableColumnCount}
                      style={{ height: virtualRows.paddingTop }}
                    />
                  </tr>
                ) : null}
                {visibleUsers.map((user, index) => {
                  const department = departments.find(
                    (item) => item.id === user.departmentId,
                  )
                  const manager = users.find((item) => item.id === user.managerId)
                  return (
                    <tr
                      aria-rowindex={virtualRows.startIndex + index + 2}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      key={user.id}
                    >
                      <th
                        className={
                          savedView.presentation.density === 'compact'
                            ? 'px-5 py-2.5'
                            : 'px-5 py-4'
                        }
                        scope="row"
                      >
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
                      {visibleColumns.includes('department') ? (
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {department?.name ?? 'Unassigned'}
                        </td>
                      ) : null}
                      {visibleColumns.includes('manager') ? (
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {manager
                            ? `${manager.firstName} ${manager.lastName}`
                            : 'No manager'}
                        </td>
                      ) : null}
                      {visibleColumns.includes('teams') ? (
                        <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Users aria-hidden="true" className="size-4 text-slate-400" />
                          {user.teamIds.length}
                        </span>
                        </td>
                      ) : null}
                      {visibleColumns.includes('status') ? (
                        <td className="px-5 py-4">
                          <UserStatusBadge status={user.status} />
                        </td>
                      ) : null}
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
                {virtualRows.paddingBottom > 0 ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={tableColumnCount}
                      style={{ height: virtualRows.paddingBottom }}
                    />
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
