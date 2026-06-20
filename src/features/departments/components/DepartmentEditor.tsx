import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  departmentDetailOptions,
  departmentListOptions,
  useCreateDepartment,
  useUpdateDepartment,
} from '../queries/departmentQueries'
import type { DepartmentFormValues } from '../schemas/departmentSchemas'
import { DepartmentForm } from './DepartmentForm'

export function DepartmentEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { departmentId = '' } = useParams()
  const navigate = useNavigate()
  const departmentsQuery = useQuery(departmentListOptions())
  const departmentQuery = useQuery({
    ...departmentDetailOptions(departmentId),
    enabled: mode === 'edit',
  })
  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment(departmentId)

  const isPending =
    departmentsQuery.isPending ||
    (mode === 'edit' && departmentQuery.isPending)

  if (isPending) {
    return (
      <div className="space-y-5">
        <div className="h-20 max-w-2xl animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading department form</span>
        </Card>
      </div>
    )
  }

  const department = departmentQuery.data
  if (
    departmentsQuery.isError ||
    (mode === 'edit' && (departmentQuery.isError || !department))
  ) {
    return (
      <Card className="p-8 text-center">
        <Building2
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
          Department form unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The department data needed for this form could not be loaded.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/departments"
        >
          Back to departments
        </Link>
      </Card>
    )
  }

  const initialValues: DepartmentFormValues | undefined = department
    ? {
        code: department.code,
        costCenter: department.costCenter,
        description: department.description,
        headcount: department.headcount,
        name: department.name,
        ownerEmail: department.owner.email,
        ownerName: department.owner.name,
        ownerTitle: department.owner.title,
        parentDepartmentId: department.parentDepartmentId ?? '',
        status: department.status,
      }
    : undefined

  const handleSubmit = async (values: DepartmentFormValues) => {
    const savedDepartment =
      mode === 'create'
        ? await createDepartment.mutateAsync(values)
        : await updateDepartment.mutateAsync(values)

    navigate(`/departments/${savedDepartment.id}`, { replace: true })
  }

  const cancelTarget =
    mode === 'edit' ? `/departments/${departmentId}` : '/departments'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          to={cancelTarget}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {mode === 'edit' ? 'Department details' : 'Departments'}
        </Link>
      </div>
      <PageHeader
        description={
          mode === 'create'
            ? 'Add an accountable organizational unit and place it within the enterprise reporting structure.'
            : 'Update department identity, hierarchy, operating metadata, and accountable ownership.'
        }
        eyebrow="Organization management"
        title={mode === 'create' ? 'Create department' : 'Edit department'}
      />
      <DepartmentForm
        departmentId={mode === 'edit' ? departmentId : undefined}
        departments={departmentsQuery.data ?? []}
        initialValues={initialValues}
        isSubmitting={
          createDepartment.isPending || updateDepartment.isPending
        }
        onCancel={() => navigate(cancelTarget)}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Create department' : 'Save changes'}
      />
    </div>
  )
}
