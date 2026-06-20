import {
  permissionsSchema,
  roleAssignmentsSchema,
  rolesSchema,
  type Permission,
  type Role,
  type RoleAssignment,
} from '../features/access/schemas/accessSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const rolesStorageKey = 'enterprise-operations-roles'
const assignmentsStorageKey = 'enterprise-operations-role-assignments'
const collaborationPermissionMigrationKey =
  'enterprise-operations-collaboration-permissions-v1'

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

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function readRoles(): Role[] {
  const persisted = rolesSchema.safeParse(browserStorage.read(rolesStorageKey))
  if (persisted.success) {
    let synchronized = persisted.data.map((role) => {
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
    if (browserStorage.read(collaborationPermissionMigrationKey) !== true) {
      synchronized = synchronized.map((role) => {
        const seedRole = seedRoles.find((seed) => seed.id === role.id)
        const collaborationKeys =
          seedRole?.permissionKeys.filter((key) =>
            key.startsWith('collaboration.'),
          ) ?? []
        return {
          ...role,
          permissionKeys: [
            ...new Set([...role.permissionKeys, ...collaborationKeys]),
          ],
        }
      })
      browserStorage.write(collaborationPermissionMigrationKey, true)
    }
    browserStorage.write(rolesStorageKey, synchronized)
    return synchronized
  }
  browserStorage.write(rolesStorageKey, seedRoles)
  return seedRoles
}

function writeRoles(roles: Role[]) {
  browserStorage.write(rolesStorageKey, roles)
}

function readAssignments(): RoleAssignment[] {
  const persisted = roleAssignmentsSchema.safeParse(
    browserStorage.read(assignmentsStorageKey),
  )
  if (persisted.success) return persisted.data
  browserStorage.write(assignmentsStorageKey, seedAssignments)
  return seedAssignments
}

function writeAssignments(assignments: RoleAssignment[]) {
  browserStorage.write(assignmentsStorageKey, assignments)
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
    readAssignments().filter((assignment) => assignment.roleId !== id),
  )
}

export async function listRoleAssignmentsApi(): Promise<unknown> {
  await delay(180)
  return readAssignments()
}

export async function replaceUserRoleAssignmentsApi(
  userId: string,
  roleIds: string[],
): Promise<unknown> {
  await delay(340)
  const retained = readAssignments().filter(
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
