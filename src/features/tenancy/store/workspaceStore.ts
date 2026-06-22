import { create } from 'zustand'
import {
  getActiveTenantId,
  setActiveTenantId,
} from '../services/tenantContext'
import type { TenantId } from '../schemas/tenancySchemas'

interface WorkspaceState {
  activeTenantId: TenantId
  selectTenant: (tenantId: TenantId) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTenantId: getActiveTenantId(),
  selectTenant: (tenantId) => {
    setActiveTenantId(tenantId)
    set({ activeTenantId: tenantId })
  },
}))
