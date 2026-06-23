import {
  permissionsSchema,
  roleAssignmentsSchema,
  rolesSchema,
  type Permission,
  type Role,
  type RoleAssignment,
} from '../features/access/schemas/accessSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

const rolesStorageKey = 'enterprise-operations-roles'
const assignmentsStorageKey = 'enterprise-operations-role-assignments'

const permissionCatalog: Permission[] = [
  {
    action: 'View',
    description: 'View executive metrics and operational summaries.',
    key: 'dashboard.view',
    module: 'Dashboard',
  },
  {
    action: 'View',
    description: 'Explore operational metrics, trends, and distributions.',
    key: 'analytics.view',
    module: 'Analytics',
  },
  {
    action: 'View',
    description: 'View department records and organization structure.',
    key: 'departments.view',
    module: 'Organization',
  },
  {
    action: 'Manage',
    description: 'Create, edit, move, and remove department records.',
    key: 'departments.manage',
    module: 'Organization',
  },
  {
    action: 'View',
    description: 'View managed identities and user profiles.',
    key: 'users.view',
    module: 'Organization',
  },
  {
    action: 'Manage',
    description: 'Create, edit, assign, and change user lifecycle state.',
    key: 'users.manage',
    module: 'Organization',
  },
  {
    action: 'View',
    description: 'View roles, permissions, policies, and assignments.',
    key: 'security.view',
    module: 'Security',
  },
  {
    action: 'Manage',
    description: 'Create roles and change permission or user assignments.',
    key: 'security.manage',
    module: 'Security',
  },
  {
    action: 'View',
    description: 'View operational and executive reports.',
    key: 'reports.view',
    module: 'Reporting',
  },
  {
    action: 'Manage',
    description: 'Create, edit, execute, and delete saved report definitions.',
    key: 'reports.manage',
    module: 'Reporting',
  },
  {
    action: 'Export',
    description: 'Export and distribute controlled report outputs.',
    key: 'reports.export',
    module: 'Reporting',
  },
  {
    action: 'View',
    description: 'View workflow definitions, states, and execution history.',
    key: 'workflows.view',
    module: 'Workflows',
  },
  {
    action: 'Manage',
    description: 'Create and change workflow definitions and transitions.',
    key: 'workflows.manage',
    module: 'Workflows',
  },
  {
    action: 'Review',
    description: 'Review and decide approval requests assigned to the user.',
    key: 'approvals.review',
    module: 'Approvals',
  },
  {
    action: 'View',
    description: 'View operational tasks, queues, and delivery status.',
    key: 'tasks.view',
    module: 'Tasks',
  },
  {
    action: 'Manage',
    description: 'Create, assign, edit, and progress operational tasks.',
    key: 'tasks.manage',
    module: 'Tasks',
  },
  {
    action: 'View',
    description: 'Search immutable cross-domain audit records and history.',
    key: 'audit.view',
    module: 'Audit',
  },
  {
    action: 'View',
    description: 'View entity discussions and combined activity streams.',
    key: 'collaboration.view',
    module: 'Collaboration',
  },
  {
    action: 'Contribute',
    description: 'Create, reply to, and edit owned collaboration comments.',
    key: 'collaboration.contribute',
    module: 'Collaboration',
  },
  {
    action: 'Moderate',
    description: 'Edit or remove collaboration comments from any contributor.',
    key: 'collaboration.moderate',
    module: 'Collaboration',
  },
  {
    action: 'View',
    description: 'View controlled documents, metadata, links, and versions.',
    key: 'documents.view',
    module: 'Documents',
  },
  {
    action: 'Manage',
    description: 'Create, version, classify, link, and archive documents.',
    key: 'documents.manage',
    module: 'Documents',
  },
  {
    action: 'Download',
    description: 'Download governed document version content.',
    key: 'documents.download',
    module: 'Documents',
  },
  {
    action: 'View',
    description: 'View personal preferences and platform configuration.',
    key: 'settings.view',
    module: 'Settings',
  },
  {
    action: 'View',
    description: 'Inspect runtime, persistence, synchronization, and query health.',
    key: 'diagnostics.view',
    module: 'Diagnostics',
  },
  {
    action: 'Manage',
    description: 'Run safe recovery actions and clear resolved diagnostic history.',
    key: 'diagnostics.manage',
    module: 'Diagnostics',
  },
  {
    action: 'Share',
    description: 'Publish and administer shared operational saved views.',
    key: 'views.share',
    module: 'Platform',
  },
  {
    action: 'Manage',
    description: 'Change organization policy and feature rollout controls.',
    key: 'settings.manage',
    module: 'Settings',
  },
]

const allPermissionKeys = permissionCatalog.map((permission) => permission.key)

const seedRoles: Role[] = [
  {
    createdAt: '2026-01-03T09:00:00.000Z',
    description:
      'Full administrative authority across organization, security, workflows, approvals, and reporting.',
    id: 'role-platform-administrator',
    isSystem: true,
    name: 'Platform Administrator',
    permissionKeys: allPermissionKeys,
    updatedAt: '2026-06-20T09:00:00.000Z',
  },
  {
    createdAt: '2026-01-03T09:00:00.000Z',
    description:
      'Manages departments and users while retaining visibility into operational performance.',
    id: 'role-operations-administrator',
    isSystem: false,
    name: 'Operations Administrator',
    permissionKeys: [
      'dashboard.view',
      'analytics.view',
      'departments.view',
      'departments.manage',
      'users.view',
      'users.manage',
      'reports.view',
      'reports.manage',
      'workflows.view',
      'tasks.view',
      'tasks.manage',
      'collaboration.view',
      'collaboration.contribute',
      'documents.view',
      'documents.manage',
      'documents.download',
      'settings.view',
      'settings.manage',
      'diagnostics.view',
      'diagnostics.manage',
    ],
    updatedAt: '2026-06-18T12:00:00.000Z',
  },
  {
    createdAt: '2026-01-03T09:00:00.000Z',
    description:
      'Reviews service performance, controlled reports, and assigned approval decisions.',
    id: 'role-service-governor',
    isSystem: false,
    name: 'Service Governor',
    permissionKeys: [
      'dashboard.view',
      'departments.view',
      'users.view',
      'reports.view',
      'reports.export',
      'approvals.review',
      'tasks.view',
      'collaboration.view',
      'collaboration.contribute',
      'documents.view',
      'documents.download',
      'settings.view',
      'diagnostics.view',
    ],
    updatedAt: '2026-06-18T12:00:00.000Z',
  },
  {
    createdAt: '2026-01-03T09:00:00.000Z',
    description:
      'Provides read-only access to organizational and operational information.',
    id: 'role-operations-viewer',
    isSystem: false,
    name: 'Operations Viewer',
    permissionKeys: [
      'dashboard.view',
      'departments.view',
      'users.view',
      'reports.view',
      'collaboration.view',
      'documents.view',
      'settings.view',
    ],
    updatedAt: '2026-06-18T12:00:00.000Z',
  },
]

const seedAssignments: RoleAssignment[] = [
  {
    assignedAt: '2026-01-05T09:00:00.000Z',
    roleId: 'role-platform-administrator',
    userId: 'user-avery-morgan',
  },
  {
    assignedAt: '2026-01-10T09:00:00.000Z',
    roleId: 'role-operations-administrator',
    userId: 'user-maya-chen',
  },
  {
    assignedAt: '2026-01-14T09:00:00.000Z',
    roleId: 'role-service-governor',
    userId: 'user-elena-rossi',
  },
  {
    assignedAt: '2026-02-01T09:00:00.000Z',
    roleId: 'role-service-governor',
    userId: 'user-jon-bell',
  },
  {
    assignedAt: '2026-02-12T09:00:00.000Z',
    roleId: 'role-operations-administrator',
    userId: 'user-priya-shah',
  },
  {
    assignedAt: '2026-05-05T09:00:00.000Z',
    roleId: 'role-operations-viewer',
    userId: 'user-liam-okafor',
  },
]

const atlasAssignments: RoleAssignment[] = [
  {
    assignedAt: '2026-04-01T09:00:00.000Z',
    roleId: 'role-platform-administrator',
    userId: 'user-avery-morgan',
  },
  {
    assignedAt: '2026-04-02T09:00:00.000Z',
    roleId: 'role-service-governor',
    userId: 'user-jordan-lee',
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function prepareLegacyRoles(roles: Role[]): Role[] {
  return roles.map((role) => {
    const seedRole = seedRoles.find((seed) => seed.id === role.id)
    return seedRole
      ? {
          ...role,
          permissionKeys: [
            ...new Set([...role.permissionKeys, ...seedRole.permissionKeys]),
          ],
        }
      : role
  })
}

const rolesStore = createVersionedStore({
  key: rolesStorageKey,
  obsoleteKeys: [
    'enterprise-operations-collaboration-permissions-v1',
    'enterprise-operations-document-permissions-v1',
    'enterprise-operations-settings-permissions-v1',
    'enterprise-operations-diagnostics-permissions-v1',
  ],
  prepareLegacy: prepareLegacyRoles,
  schema: rolesSchema,
  seed: () => seedRoles,
  version: 1,
})

const assignmentsStore = createVersionedStore({
  key: assignmentsStorageKey,
  schema: roleAssignmentsSchema,
  seed: () =>
    getActiveTenantId() === 'atlas' ? atlasAssignments : seedAssignments,
  version: 1,
})

function readRoles(): Role[] {
  const roles = rolesStore.read()
  const synchronized = roles.map((role) => {
      const systemRole = seedRoles.find(
        (seedRole) => seedRole.id === role.id && seedRole.isSystem,
      )
      return systemRole
        ? {
            ...role,
            description: systemRole.description,
            name: systemRole.name,
            permissionKeys: systemRole.permissionKeys,
          }
        : role
  })
  if (JSON.stringify(roles) !== JSON.stringify(synchronized)) {
    rolesStore.write(synchronized)
  }
  return synchronized
}

function writeRoles(roles: Role[]) {
  rolesStore.write(roles)
}

function writeAssignments(assignments: RoleAssignment[]) {
  assignmentsStore.write(assignments)
}

export async function listPermissionsApi(): Promise<unknown> {
  await delay(120)
  return permissionsSchema.parse(permissionCatalog)
}

export async function listRolesApi(): Promise<unknown> {
  await delay(260)
  return readRoles()
}

export async function getRoleApi(id: string): Promise<unknown> {
  await delay(200)
  return readRoles().find((role) => role.id === id) ?? null
}

export async function createRoleApi(role: Role): Promise<unknown> {
  await delay(360)
  writeRoles([...readRoles(), role])
  return role
}

export async function updateRoleApi(role: Role): Promise<unknown> {
  await delay(360)
  writeRoles(readRoles().map((item) => (item.id === role.id ? role : item)))
  return role
}

export async function deleteRoleApi(id: string): Promise<void> {
  await delay(320)
  writeRoles(readRoles().filter((role) => role.id !== id))
  writeAssignments(
    assignmentsStore
      .read()
      .filter((assignment) => assignment.roleId !== id),
  )
}

export async function listRoleAssignmentsApi(): Promise<unknown> {
  await delay(180)
  return assignmentsStore.read()
}

export async function replaceUserRoleAssignmentsApi(
  userId: string,
  roleIds: string[],
): Promise<unknown> {
  await delay(340)
  const retained = assignmentsStore.read().filter(
    (assignment) => assignment.userId !== userId,
  )
  const assignedAt = new Date().toISOString()
  const replacements = roleIds.map((roleId) => ({
    assignedAt,
    roleId,
    userId,
  }))
  const assignments = [...retained, ...replacements]
  writeAssignments(assignments)
  return assignments
}
