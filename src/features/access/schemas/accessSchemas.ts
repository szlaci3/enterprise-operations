import { z } from 'zod'

export const permissionKeySchema = z.enum([
  'dashboard.view',
  'analytics.view',
  'departments.view',
  'departments.manage',
  'users.view',
  'users.manage',
  'security.view',
  'security.manage',
  'reports.view',
  'reports.manage',
  'reports.export',
  'workflows.view',
  'workflows.manage',
  'approvals.review',
  'tasks.view',
  'tasks.manage',
  'audit.view',
  'collaboration.view',
  'collaboration.contribute',
  'collaboration.moderate',
  'documents.view',
  'documents.manage',
  'documents.download',
])

export const permissionSchema = z.object({
  action: z.string(),
  description: z.string(),
  key: permissionKeySchema,
  module: z.enum([
    'Dashboard',
    'Analytics',
    'Organization',
    'Security',
    'Reporting',
    'Workflows',
    'Approvals',
    'Tasks',
    'Audit',
    'Collaboration',
    'Documents',
  ]),
})

export const permissionsSchema = z.array(permissionSchema)

export const roleSchema = z.object({
  createdAt: z.string().datetime(),
  description: z.string(),
  id: z.string(),
  isSystem: z.boolean(),
  name: z.string(),
  permissionKeys: z.array(permissionKeySchema),
  updatedAt: z.string().datetime(),
})

export const rolesSchema = z.array(roleSchema)

export const roleAssignmentSchema = z.object({
  assignedAt: z.string().datetime(),
  roleId: z.string(),
  userId: z.string(),
})

export const roleAssignmentsSchema = z.array(roleAssignmentSchema)

export const roleFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(20, 'Provide at least 20 characters of context.')
    .max(300, 'Use no more than 300 characters.'),
  name: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(80, 'Use no more than 80 characters.'),
  permissionKeys: z
    .array(permissionKeySchema)
    .min(1, 'Select at least one permission.'),
})

export const accessSnapshotSchema = z.object({
  permissionKeys: z.array(permissionKeySchema),
  roles: z.array(roleSchema),
  userId: z.string(),
})

export type AccessSnapshot = z.infer<typeof accessSnapshotSchema>
export type Permission = z.infer<typeof permissionSchema>
export type PermissionKey = z.infer<typeof permissionKeySchema>
export type Role = z.infer<typeof roleSchema>
export type RoleAssignment = z.infer<typeof roleAssignmentSchema>
export type RoleFormValues = z.infer<typeof roleFormSchema>
