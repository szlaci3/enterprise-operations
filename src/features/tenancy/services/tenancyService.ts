import { createVersionedStore } from '../../../services/persistence/versionedStore'
import {
  tenancyStoreSchema,
  workspaceSnapshotSchema,
  type TenancyStore,
  type WorkspaceSnapshot,
} from '../schemas/tenancySchemas'
import { getActiveTenantId } from './tenantContext'

const tenancyStore: TenancyStore = {
  memberships: [
    {
      joinedAt: '2022-03-14T09:00:00.000Z',
      role: 'owner',
      status: 'active',
      tenantId: 'northstar',
      userId: 'user-avery-morgan',
    },
    {
      joinedAt: '2026-04-01T09:00:00.000Z',
      role: 'administrator',
      status: 'active',
      tenantId: 'atlas',
      userId: 'user-avery-morgan',
    },
  ],
  tenants: [
    {
      id: 'northstar',
      name: 'Northstar Group',
      region: 'Europe',
      slug: 'northstar',
      status: 'active',
    },
    {
      id: 'atlas',
      name: 'Atlas Services',
      region: 'North America',
      slug: 'atlas-services',
      status: 'active',
    },
  ],
}

const store = createVersionedStore({
  key: 'enterprise-operations-tenancy',
  schema: tenancyStoreSchema,
  scope: 'global',
  seed: () => tenancyStore,
  version: 1,
})

export class TenancyServiceError extends Error {
  readonly code: 'invalid-membership'

  constructor(message: string) {
    super(message)
    this.name = 'TenancyServiceError'
    this.code = 'invalid-membership'
  }
}

export const tenancyService = {
  getSnapshot(userId: string): WorkspaceSnapshot {
    const data = store.read()
    const memberships = data.memberships
      .filter(
        (membership) =>
          membership.userId === userId && membership.status === 'active',
      )
      .map((membership) => ({
        membership,
        tenant: data.tenants.find((tenant) => tenant.id === membership.tenantId),
      }))
      .filter(
        (
          item,
        ): item is {
          membership: (typeof data.memberships)[number]
          tenant: (typeof data.tenants)[number]
        } => Boolean(item.tenant?.status === 'active'),
      )

    const active =
      memberships.find(
        (item) => item.tenant.id === getActiveTenantId(),
      ) ?? memberships[0]

    if (!active) {
      throw new TenancyServiceError(
        'The current identity has no active workspace membership.',
      )
    }

    return workspaceSnapshotSchema.parse({
      activeTenant: active.tenant,
      membership: active.membership,
      memberships,
    })
  },
}
