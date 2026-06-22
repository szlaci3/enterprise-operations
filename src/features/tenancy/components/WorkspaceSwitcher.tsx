import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { workspaceSnapshotOptions } from '../queries/tenancyQueries'
import type { TenantId } from '../schemas/tenancySchemas'
import { useWorkspaceStore } from '../store/workspaceStore'

export function WorkspaceSwitcher() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const workspaceQuery = useQuery(workspaceSnapshotOptions())
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId)
  const selectTenant = useWorkspaceStore((state) => state.selectTenant)

  if (!workspaceQuery.data || workspaceQuery.data.memberships.length < 2) {
    return null
  }

  const switchWorkspace = async (tenantId: TenantId) => {
    if (tenantId === activeTenantId) return
    await queryClient.cancelQueries()
    selectTenant(tenantId)
    queryClient.clear()
    navigate('/overview', { replace: true })
  }

  return (
    <label className="relative block">
      <span className="sr-only">Active workspace</span>
      <Building2
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <select
        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-brand-950"
        onChange={(event) =>
          switchWorkspace(event.target.value as TenantId)
        }
        value={activeTenantId}
      >
        {workspaceQuery.data.memberships.map(({ tenant }) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </label>
  )
}
