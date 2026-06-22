import { z } from 'zod'

export const tenantIdSchema = z.enum(['northstar', 'atlas'])
export const tenantRoleSchema = z.enum(['owner', 'administrator', 'member'])

export const tenantSchema = z.object({
  id: tenantIdSchema,
  name: z.string(),
  region: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'suspended']),
})

export const tenantMembershipSchema = z.object({
  joinedAt: z.string().datetime(),
  role: tenantRoleSchema,
  status: z.enum(['active', 'suspended']),
  tenantId: tenantIdSchema,
  userId: z.string(),
})

export const tenancyStoreSchema = z.object({
  memberships: z.array(tenantMembershipSchema),
  tenants: z.array(tenantSchema),
})

export const workspaceSnapshotSchema = z.object({
  activeTenant: tenantSchema,
  membership: tenantMembershipSchema,
  memberships: z.array(
    z.object({
      membership: tenantMembershipSchema,
      tenant: tenantSchema,
    }),
  ),
})

export type Tenant = z.infer<typeof tenantSchema>
export type TenantId = z.infer<typeof tenantIdSchema>
export type TenantMembership = z.infer<typeof tenantMembershipSchema>
export type TenantRole = z.infer<typeof tenantRoleSchema>
export type TenancyStore = z.infer<typeof tenancyStoreSchema>
export type WorkspaceSnapshot = z.infer<typeof workspaceSnapshotSchema>
