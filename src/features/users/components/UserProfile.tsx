import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  teamListOptions,
  userDetailOptions,
  userListOptions,
  useSetUserStatus,
} from '../queries/userQueries'
import type { UserStatus } from '../schemas/userSchemas'
import { UserServiceError } from '../services/userService'
import { UserAvatar } from './UserAvatar'
import { UserStatusBadge } from './UserStatusBadge'
import { PermissionGate } from '../../access/components/PermissionGate'
import { UserRoleAssignments } from '../../access/components/UserRoleAssignments'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatLastSeen(value: string | null) {
  if (!value) return 'Never signed in'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function UserProfile() {
  const { userId = '' } = useParams()
  const userQuery = useQuery(userDetailOptions(userId))
  const usersQuery = useQuery(userListOptions())
  const teamsQuery = useQuery(teamListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const setStatus = useSetUserStatus(userId)
  const [actionError, setActionError] = useState<string | null>(null)

  if (
    userQuery.isPending ||
    usersQuery.isPending ||
    teamsQuery.isPending ||
    departmentsQuery.isPending
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading user profile</span>
      </Card>
    )
  }

  const user = userQuery.data
  if (
    !user ||
    userQuery.isError ||
    usersQuery.isError ||
    teamsQuery.isError ||
    departmentsQuery.isError
  ) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
          User not found
        </h1>
        <Link
          className="mt-5 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/users"
        >
          Back to users
        </Link>
      </Card>
    )
  }

  const users = usersQuery.data ?? []
  const teams = teamsQuery.data ?? []
  const departments = departmentsQuery.data ?? []
  const department = departments.find((item) => item.id === user.departmentId)
  const manager = users.find((item) => item.id === user.managerId)
  const directReports = users.filter(
    (item) => item.managerId === user.id && item.status !== 'deactivated',
  )
  const memberships = teams.filter((team) => user.teamIds.includes(team.id))
  const ownedDepartments = departments.filter(
    (item) => item.owner.email.toLowerCase() === user.email.toLowerCase(),
  )

  const changeStatus = async (status: UserStatus) => {
    setActionError(null)
    try {
      await setStatus.mutateAsync(status)
    } catch (error) {
      setActionError(
        error instanceof UserServiceError
          ? error.message
          : 'The lifecycle change could not be completed.',
      )
    }
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to="/users"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        User directory
      </Link>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <UserAvatar className="size-16 text-lg" user={user} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <UserStatusBadge status={user.status} />
              <Badge tone="slate">{user.employmentType}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user.jobTitle}
            </p>
          </div>
        </div>
        <PermissionGate permission="users.manage">
          <Link
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            to={`/users/${user.id}/edit`}
          >
            <Edit3 aria-hidden="true" className="size-4" />
            Edit user
          </Link>
        </PermissionGate>
      </div>

      <section
        aria-label="User assignment summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="p-5">
          <Building2 aria-hidden="true" className="size-5 text-slate-400" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Department
          </p>
          {department ? (
            <Link
              className="mt-1 block font-semibold text-brand-700 dark:text-brand-300"
              to={`/departments/${department.id}`}
            >
              {department.name}
            </Link>
          ) : (
            <p className="mt-1 font-semibold">Unassigned</p>
          )}
        </Card>
        <Card className="p-5">
          <Users aria-hidden="true" className="size-5 text-slate-400" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Manager
          </p>
          {manager ? (
            <Link
              className="mt-1 block font-semibold text-brand-700 dark:text-brand-300"
              to={`/users/${manager.id}`}
            >
              {manager.firstName} {manager.lastName}
            </Link>
          ) : (
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              No manager
            </p>
          )}
        </Card>
        <Card className="p-5">
          <BriefcaseBusiness
            aria-hidden="true"
            className="size-5 text-slate-400"
          />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Employee ID
          </p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">
            {user.employeeId}
          </p>
        </Card>
        <Card className="p-5">
          <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Start date
          </p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">
            {formatDate(user.startDate)}
          </p>
        </Card>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Contact and access
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail aria-hidden="true" className="mt-0.5 size-4 text-slate-400" />
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 text-slate-700 dark:text-slate-200">
                  {user.email}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 size-4 text-slate-400"
              />
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Location
                </dt>
                <dd className="mt-1 text-slate-700 dark:text-slate-200">
                  {user.location}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-4 text-slate-400"
              />
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-400">
                  Last seen
                </dt>
                <dd className="mt-1 text-slate-700 dark:text-slate-200">
                  {formatLastSeen(user.lastSeenAt)}
                </dd>
              </div>
            </div>
          </dl>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Team membership
          </h2>
          {memberships.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              This user has no team memberships.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {memberships.map((team) => (
                <li
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  key={team.id}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {team.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {team.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Direct reports
            </h2>
          </div>
          {directReports.length === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              No active users report to this person.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {directReports.map((report) => (
                <li key={report.id}>
                  <Link
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    to={`/users/${report.id}`}
                  >
                    <UserAvatar user={report} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {report.firstName} {report.lastName}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {report.jobTitle}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Department ownership
            </h2>
          </div>
          {ownedDepartments.length === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              This identity is not the accountable owner of a department.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {ownedDepartments.map((ownedDepartment) => (
                <li key={ownedDepartment.id}>
                  <Link
                    className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    to={`/departments/${ownedDepartment.id}`}
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {ownedDepartment.name}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {ownedDepartment.code} · {ownedDepartment.costCenter}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <PermissionGate permission="security.manage">
        <UserRoleAssignments userId={user.id} />
      </PermissionGate>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Lifecycle actions
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Lifecycle changes preserve the identity record and organizational
          history.
        </p>
        {actionError ? (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {actionError}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {user.status !== 'active' ? (
            <Button
              disabled={setStatus.isPending}
              onClick={() => changeStatus('active')}
            >
              <UserRoundCheck aria-hidden="true" className="size-4" />
              Activate
            </Button>
          ) : (
            <Button
              disabled={setStatus.isPending}
              onClick={() => changeStatus('suspended')}
              variant="secondary"
            >
              Suspend access
            </Button>
          )}
          {user.status !== 'deactivated' ? (
            <Button
              disabled={setStatus.isPending}
              onClick={() => changeStatus('deactivated')}
              variant="danger"
            >
              <UserRoundX aria-hidden="true" className="size-4" />
              Deactivate
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
