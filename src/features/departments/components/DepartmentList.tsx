import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  ChevronRight,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { departmentListOptions } from '../queries/departmentQueries'
import type { DepartmentStatus } from '../schemas/departmentSchemas'
import { DepartmentStatusBadge } from './DepartmentStatusBadge'

type StatusFilter = DepartmentStatus | 'all'

export function DepartmentList() {
  const departmentsQuery = useQuery(departmentListOptions())
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  )
  const filteredDepartments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return departments
      .filter((department) => status === 'all' || department.status === status)
      .filter((department) => {
        if (!normalizedSearch) {
          return true
        }
        return [
          department.name,
          department.code,
          department.owner.name,
          department.costCenter,
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
      })
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [departments, search, status])

  if (departmentsQuery.isPending) {
    return (
      <div className="space-y-5">
        <div className="h-20 max-w-xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Card className="h-96 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading departments</span>
        </Card>
      </div>
    )
  }

  if (departmentsQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
          Departments could not be loaded
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Refresh the collection to try the request again.
        </p>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => departmentsQuery.refetch()}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  const activeCount = departments.filter(
    (department) => department.status === 'active',
  ).length
  const totalHeadcount = departments.reduce(
    (total, department) => total + department.headcount,
    0,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            to="/departments/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            New department
          </Link>
        }
        description="Manage organizational ownership, reporting alignment, and the departments responsible for enterprise outcomes."
        eyebrow="Organization"
        title="Departments"
      />

      <section
        aria-label="Department summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Departments
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {departments.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active departments
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {activeCount}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Managed headcount
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {totalHeadcount.toLocaleString()}
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search departments</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by department, code, owner, or cost center"
              type="search"
              value={search}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-brand-950"
              onChange={(event) => {
                const value = event.target.value
                if (
                  value === 'all' ||
                  value === 'active' ||
                  value === 'planned' ||
                  value === 'inactive'
                ) {
                  setStatus(value)
                }
              }}
              value={status}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {filteredDepartments.length === 0 ? (
          <div className="p-10 text-center">
            <Building2
              aria-hidden="true"
              className="mx-auto size-8 text-slate-300"
            />
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              No departments match these filters
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Adjust the search or lifecycle status to see more results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Department
                  </th>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Owner
                  </th>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Parent
                  </th>
                  <th className="px-5 py-3 text-right font-semibold" scope="col">
                    Headcount
                  </th>
                  <th className="px-5 py-3 font-semibold" scope="col">
                    Status
                  </th>
                  <th className="w-12 px-5 py-3" scope="col">
                    <span className="sr-only">Open department</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDepartments.map((department) => {
                  const parent = departments.find(
                    (item) => item.id === department.parentDepartmentId,
                  )
                  return (
                    <tr
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      key={department.id}
                    >
                      <th className="px-5 py-4" scope="row">
                        <Link
                          className="font-semibold text-slate-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
                          to={`/departments/${department.id}`}
                        >
                          {department.name}
                        </Link>
                        <p className="mt-1 text-xs font-normal text-slate-400">
                          {department.code} · {department.costCenter}
                        </p>
                      </th>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          {department.owner.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {department.owner.title}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {parent?.name ?? 'Top level'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                          <Users aria-hidden="true" className="size-4 text-slate-400" />
                          {department.headcount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <DepartmentStatusBadge status={department.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          aria-label={`Open ${department.name}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                          to={`/departments/${department.id}`}
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
