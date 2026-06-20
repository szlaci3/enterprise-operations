import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { departmentListOptions } from '../../departments/queries/departmentQueries'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  teamListOptions,
  userDetailOptions,
  userListOptions,
  useCreateUser,
  useUpdateUser,
} from '../queries/userQueries'
import type { UserFormValues, UserStatus } from '../schemas/userSchemas'
import { UserForm } from './UserForm'

const statusTransitions: Record<UserStatus, UserStatus[]> = {
  active: ['active', 'suspended', 'deactivated'],
  deactivated: ['deactivated', 'active'],
  invited: ['invited', 'active', 'deactivated'],
  suspended: ['suspended', 'active', 'deactivated'],
}

export function UserEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const usersQuery = useQuery(userListOptions())
  const teamsQuery = useQuery(teamListOptions())
  const departmentsQuery = useQuery(departmentListOptions())
  const userQuery = useQuery({
    ...userDetailOptions(userId),
    enabled: mode === 'edit',
  })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser(userId)

  const isLoading =
    usersQuery.isPending ||
    teamsQuery.isPending ||
    departmentsQuery.isPending ||
    (mode === 'edit' && userQuery.isPending)

  if (isLoading) {
    return (
      <Card className="h-140 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading user form</span>
      </Card>
    )
  }

  const user = userQuery.data
  if (
    usersQuery.isError ||
    teamsQuery.isError ||
    departmentsQuery.isError ||
    (mode === 'edit' && (userQuery.isError || !user))
  ) {
    return (
      <Card className="p-8 text-center">
        <UserRound
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
          User form unavailable
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

  const initialValues: UserFormValues | undefined = user
    ? {
        departmentId: user.departmentId,
        email: user.email,
        employeeId: user.employeeId,
        employmentType: user.employmentType,
        firstName: user.firstName,
        jobTitle: user.jobTitle,
        lastName: user.lastName,
        location: user.location,
        managerId: user.managerId ?? '',
        startDate: user.startDate,
        status: user.status,
        teamIds: user.teamIds,
      }
    : undefined

  const handleSubmit = async (values: UserFormValues) => {
    const saved =
      mode === 'create'
        ? await createUser.mutateAsync(values)
        : await updateUser.mutateAsync(values)
    navigate(`/users/${saved.id}`, { replace: true })
  }
  const cancelTarget = mode === 'edit' ? `/users/${userId}` : '/users'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to={cancelTarget}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {mode === 'edit' ? 'User profile' : 'User directory'}
      </Link>
      <PageHeader
        description={
          mode === 'create'
            ? 'Create a managed identity and place it within the organization.'
            : 'Update identity, lifecycle, reporting, and team membership.'
        }
        eyebrow="Identity management"
        title={mode === 'create' ? 'Add user' : 'Edit user'}
      />
      <UserForm
        currentUserId={mode === 'edit' ? userId : undefined}
        departments={departmentsQuery.data ?? []}
        initialValues={initialValues}
        isSubmitting={createUser.isPending || updateUser.isPending}
        onCancel={() => navigate(cancelTarget)}
        onSubmit={handleSubmit}
        statusOptions={
          mode === 'edit' && user
            ? statusTransitions[user.status]
            : ['invited', 'active']
        }
        submitLabel={mode === 'create' ? 'Add user' : 'Save changes'}
        teams={teamsQuery.data ?? []}
        users={usersQuery.data ?? []}
      />
    </div>
  )
}
