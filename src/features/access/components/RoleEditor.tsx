import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import {
  permissionListOptions,
  roleDetailOptions,
  useCreateRole,
  useUpdateRole,
} from '../queries/accessQueries'
import type { RoleFormValues } from '../schemas/accessSchemas'
import { RoleForm } from './RoleForm'

export function RoleEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { roleId = '' } = useParams()
  const navigate = useNavigate()
  const permissionsQuery = useQuery(permissionListOptions())
  const roleQuery = useQuery({
    ...roleDetailOptions(roleId),
    enabled: mode === 'edit',
  })
  const createRole = useCreateRole()
  const updateRole = useUpdateRole(roleId)

  if (
    permissionsQuery.isPending ||
    (mode === 'edit' && roleQuery.isPending)
  ) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading role form</span>
      </Card>
    )
  }

  const role = roleQuery.data
  if (
    permissionsQuery.isError ||
    (mode === 'edit' && (roleQuery.isError || !role || role.isSystem))
  ) {
    return (
      <Card className="p-8 text-center">
        <ShieldCheck
          aria-hidden="true"
          className="mx-auto size-10 text-slate-300"
        />
        <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
          Role form unavailable
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

  const initialValues: RoleFormValues | undefined = role
    ? {
        description: role.description,
        name: role.name,
        permissionKeys: role.permissionKeys,
      }
    : undefined
  const cancelTarget = role ? `/access/roles/${role.id}` : '/access'

  const save = async (values: RoleFormValues) => {
    const saved =
      mode === 'create'
        ? await createRole.mutateAsync(values)
        : await updateRole.mutateAsync(values)
    navigate(`/access/roles/${saved.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        to={cancelTarget}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {role ? 'Role details' : 'Access center'}
      </Link>
      <PageHeader
        description="Define a reusable permission bundle for assignment to managed identities."
        eyebrow="Security administration"
        title={role ? 'Edit role' : 'Create role'}
      />
      <RoleForm
        initialValues={initialValues}
        isSubmitting={createRole.isPending || updateRole.isPending}
        onCancel={() => navigate(cancelTarget)}
        onSubmit={save}
        permissions={permissionsQuery.data}
        submitLabel={role ? 'Save changes' : 'Create role'}
      />
    </div>
  )
}
