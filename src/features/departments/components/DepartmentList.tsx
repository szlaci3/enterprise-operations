import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  ChevronRight,
  Plus,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { departmentListOptions } from '../queries/departmentQueries'
import type { DepartmentStatus } from '../schemas/departmentSchemas'
import { DepartmentStatusBadge } from './DepartmentStatusBadge'
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

type StatusFilter = DepartmentStatus | 'all'

export function DepartmentList() {
  const departmentsQuery = useQuery(departmentListOptions())
  const [search, setSearch] = useUrlState<string>({
    defaultValue: '',
    key: 'q',
  })
  const [status, setStatus] = useUrlState<StatusFilter>({
    defaultValue: 'all',
    key: 'status',
    values: ['all', 'active', 'planned', 'inactive'],
  })

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
    return <CollectionLoading label="Loading departments" />
  }

  if (departmentsQuery.isError) {
    return (
      <CollectionError
        description="Refresh the collection to try the request again."
        onRetry={() => departmentsQuery.refetch()}
        title="Departments could not be loaded"
      />
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
          <PermissionGate permission="departments.manage">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              to="/departments/new"
            >
              <Plus aria-hidden="true" className="size-4" />
              New department
            </Link>
          </PermissionGate>
        }
        description="Manage organizational ownership, reporting alignment, and the departments responsible for enterprise outcomes."
        eyebrow="Organization"
        title="Departments"
      />

      <SummaryGrid
        ariaLabel="Department summary"
        metrics={[
          { label: 'Departments', value: departments.length },
          { label: 'Active departments', value: activeCount },
          { label: 'Managed headcount', value: totalHeadcount.toLocaleString() },
        ]}
      />

      <Card className="overflow-hidden">
        <FilterBar
          primary={
            <SearchField
              label="Search departments"
              onChange={setSearch}
              placeholder="Search by department, code, owner, or cost center"
              value={search}
            />
          }
        >
          <SelectFilter
            label="Filter by status"
            onChange={(event) =>
              setStatus(event.target.value as StatusFilter)
            }
            value={status}
          >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="inactive">Inactive</option>
          </SelectFilter>
        </FilterBar>

        {filteredDepartments.length === 0 ? (
          <CollectionEmpty
            description="Adjust the search or lifecycle status to see more results."
            icon={<Building2 aria-hidden="true" className="size-8" />}
            title="No departments match these filters"
          />
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
