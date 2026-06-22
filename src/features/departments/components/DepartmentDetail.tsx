import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  Edit3,
  Mail,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  departmentDetailOptions,
  departmentListOptions,
  useDeleteDepartment,
} from '../queries/departmentQueries'
import { userListOptions } from '../../users/queries/userQueries'
import { DepartmentServiceError } from '../services/departmentService'
import { DepartmentStatusBadge } from './DepartmentStatusBadge'
import { PermissionGate } from '../../access/components/PermissionGate'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function DepartmentDetail() {
  const { departmentId = '' } = useParams()
  const navigate = useNavigate()
  const departmentQuery = useQuery(departmentDetailOptions(departmentId))
  const departmentsQuery = useQuery(departmentListOptions())
  const usersQuery = useQuery(userListOptions())
  const deleteDepartment = useDeleteDepartment()
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (departmentQuery.isPending || departmentsQuery.isPending) {
    return (
      <div className="space-y-5">
        <div className="h-20 max-w-2xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading department</span>
        </Card>
      </div>
    )
  }

  const department = departmentQuery.data
  const departments = departmentsQuery.data ?? []

  if (departmentQuery.isError || departmentsQuery.isError || !department) {
    return (
      <Card className="p-8 text-center">
        <Building2
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
          Department not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          This department may have been removed or the address is incorrect.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/departments"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to departments
        </Link>
      </Card>
    )
  }

  const parent = departments.find(
    (item) => item.id === department.parentDepartmentId,
  )
  const children = departments
    .filter((item) => item.parentDepartmentId === department.id)
    .sort((left, right) => left.name.localeCompare(right.name))
  const ownerUser = usersQuery.data?.find(
    (user) => user.email.toLowerCase() === department.owner.email.toLowerCase(),
  )

  const handleDelete = async () => {
    setDeleteError(null)
    try {
      await deleteDepartment.mutateAsync(department.id)
      navigate('/departments', { replace: true })
    } catch (error) {
      setDeleteError(
        error instanceof DepartmentServiceError
          ? error.message
          : 'The department could not be deleted. Please try again.',
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          to="/departments"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Departments
        </Link>
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{department.code}</Badge>
              <DepartmentStatusBadge status={department.status} />
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {department.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {department.description}
            </p>
          </div>
          <PermissionGate permission="departments.manage">
            <Link
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              to={`/departments/${department.id}/edit`}
            >
              <Edit3 aria-hidden="true" className="size-4" />
              Edit department
            </Link>
          </PermissionGate>
        </div>
      </div>

      <section
        aria-label="Department summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Headcount
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-950 dark:text-white">
            <Users aria-hidden="true" className="size-5 text-slate-400" />
            {department.headcount.toLocaleString()}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cost center
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {department.costCenter}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Parent department
          </p>
          {parent ? (
            <Link
              className="mt-2 block text-base font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300"
              to={`/departments/${parent.id}`}
            >
              {parent.name}
            </Link>
          ) : (
            <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
              Top level
            </p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Child departments
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {children.length}
          </p>
        </Card>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Accountable owner
          </h2>
          <div className="mt-5 flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
              {department.owner.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {department.owner.name}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {department.owner.title}
              </p>
              {ownerUser ? (
                <Link
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300"
                  to={`/users/${ownerUser.id}`}
                >
                  View managed identity
                </Link>
              ) : null}
              <a
                className={`${ownerUser ? 'mt-2' : 'mt-3'} inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300`}
                href={`mailto:${department.owner.email}`}
              >
                <Mail aria-hidden="true" className="size-4" />
                {department.owner.email}
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Department record
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">Created</dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(department.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">
                Last updated
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(department.updatedAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">
                Record identifier
              </dt>
              <dd className="max-w-52 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                {department.id}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Reporting departments
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Departments directly aligned beneath this organizational unit.
          </p>
        </div>
        {children.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No departments currently report to this department.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {children.map((child) => (
              <li key={child.id}>
                <Link
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  to={`/departments/${child.id}`}
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <Building2 aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900 dark:text-white">
                      {child.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {child.code} · {child.owner.name}
                    </span>
                  </span>
                  <DepartmentStatusBadge status={child.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border-red-200 p-5 dark:border-red-900">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Record administration
        </h2>
        {!isDeleteConfirmationOpen ? (
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Deleting a department is permanent and only allowed when it has
              no reporting departments.
            </p>
            <Button
              className="shrink-0 text-red-600 hover:text-red-700 dark:text-red-400"
              disabled={children.length > 0}
              onClick={() => setDeleteConfirmationOpen(true)}
              variant="ghost"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete department
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/50">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Delete {department.name}?
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-300">
              This removes the department record and cannot be undone.
            </p>
            {deleteError ? (
              <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-300">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button
                disabled={deleteDepartment.isPending}
                onClick={handleDelete}
                variant="danger"
              >
                {deleteDepartment.isPending ? 'Deleting…' : 'Confirm delete'}
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
    </div>
  )
}
