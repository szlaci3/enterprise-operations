import {
  createRoleApi,
  deleteRoleApi,
  getRoleApi,
  listPermissionsApi,
  listRoleAssignmentsApi,
  listRolesApi,
  replaceUserRoleAssignmentsApi,
  updateRoleApi,
} from '../../../mocks/accessApi'
import { userService } from '../../users/services/userService'
import {
  accessSnapshotSchema,
  permissionsSchema,
  roleAssignmentsSchema,
  roleFormSchema,
  roleSchema,
  rolesSchema,
  type AccessSnapshot,
  type Permission,
  type Role,
  type RoleAssignment,
  type RoleFormValues,
} from '../schemas/accessSchemas'

export class AccessServiceError extends Error {
  readonly code:
    | 'duplicate-name'
    | 'invalid-assignment'
    | 'not-found'
    | 'protected-role'

  constructor(message: string, code: AccessServiceError['code']) {
    super(message)
    this.name = 'AccessServiceError'
    this.code = code
  }
}

async function listRoles(): Promise<Role[]> {
  return rolesSchema.parse(await listRolesApi())
}

async function listAssignments(): Promise<RoleAssignment[]> {
  return roleAssignmentsSchema.parse(await listRoleAssignmentsApi())
}

function assertUniqueName(roles: Role[], name: string, currentId?: string) {
  if (
    roles.some(
      (role) =>
        role.id !== currentId &&
        role.name.toLowerCase() === name.trim().toLowerCase(),
    )
  ) {
    throw new AccessServiceError(
      'A role already uses this name.',
      'duplicate-name',
    )
  }
}

export const accessService = {
  async createRole(values: RoleFormValues): Promise<Role> {
    const parsed = roleFormSchema.parse(values)
    const roles = await listRoles()
    assertUniqueName(roles, parsed.name)
    const now = new Date().toISOString()
    const role: Role = {
      ...parsed,
      createdAt: now,
      id: crypto.randomUUID(),
      isSystem: false,
      permissionKeys: [...new Set(parsed.permissionKeys)],
      updatedAt: now,
    }
    return roleSchema.parse(await createRoleApi(role))
  },

  async deleteRole(id: string): Promise<void> {
    const [role, assignments] = await Promise.all([
      accessService.getRole(id),
      listAssignments(),
    ])
    if (!role) {
      throw new AccessServiceError('The role no longer exists.', 'not-found')
    }
    if (role.isSystem) {
      throw new AccessServiceError(
        'System roles cannot be deleted.',
        'protected-role',
      )
    }
    if (assignments.some((assignment) => assignment.roleId === id)) {
      throw new AccessServiceError(
        'Remove all user assignments before deleting this role.',
        'invalid-assignment',
      )
    }
    await deleteRoleApi(id)
  },

  async getAccess(userId: string): Promise<AccessSnapshot> {
    const [user, roles, assignments] = await Promise.all([
      userService.get(userId),
      listRoles(),
      listAssignments(),
    ])
    if (!user || user.status !== 'active') {
      return accessSnapshotSchema.parse({
        permissionKeys: [],
        roles: [],
        userId,
      })
    }
    const assignedRoleIds = assignments
      .filter((assignment) => assignment.userId === userId)
      .map((assignment) => assignment.roleId)
    const assignedRoles = roles.filter((role) =>
      assignedRoleIds.includes(role.id),
    )
    return accessSnapshotSchema.parse({
      permissionKeys: [
        ...new Set(assignedRoles.flatMap((role) => role.permissionKeys)),
      ],
      roles: assignedRoles,
      userId,
    })
  },

  async getRole(id: string): Promise<Role | null> {
    const response = await getRoleApi(id)
    return response === null ? null : roleSchema.parse(response)
  },

  async listPermissions(): Promise<Permission[]> {
    return permissionsSchema.parse(await listPermissionsApi())
  },

  listAssignments,
  listRoles,

  async replaceUserRoles(
    userId: string,
    roleIds: string[],
  ): Promise<RoleAssignment[]> {
    const [user, users, roles, assignments] = await Promise.all([
      userService.get(userId),
      userService.list(),
      listRoles(),
      listAssignments(),
    ])
    if (!user || user.status === 'deactivated') {
      throw new AccessServiceError(
        'Roles can only be assigned to available users.',
        'invalid-assignment',
      )
    }
    const uniqueRoleIds = [...new Set(roleIds)]
    if (uniqueRoleIds.some((id) => !roles.some((role) => role.id === id))) {
      throw new AccessServiceError(
        'One or more selected roles no longer exist.',
        'invalid-assignment',
      )
    }
    const securityRoleIds = roles
      .filter((role) => role.permissionKeys.includes('security.manage'))
      .map((role) => role.id)
    const proposedAssignments = [
      ...assignments.filter((assignment) => assignment.userId !== userId),
      ...uniqueRoleIds.map((roleId) => ({
        assignedAt: new Date().toISOString(),
        roleId,
        userId,
      })),
    ]
    const activeUserIds = users
      .filter((item) => item.status === 'active')
      .map((item) => item.id)
    const hasSecurityManager = proposedAssignments.some(
      (assignment) =>
        activeUserIds.includes(assignment.userId) &&
        securityRoleIds.includes(assignment.roleId),
    )
    if (!hasSecurityManager) {
      throw new AccessServiceError(
        'At least one active user must retain security administration access.',
        'invalid-assignment',
      )
    }
    return roleAssignmentsSchema.parse(
      await replaceUserRoleAssignmentsApi(userId, uniqueRoleIds),
    )
  },

  async updateRole(id: string, values: RoleFormValues): Promise<Role> {
    const parsed = roleFormSchema.parse(values)
    const roles = await listRoles()
    const existing = roles.find((role) => role.id === id)
    if (!existing) {
      throw new AccessServiceError('The role no longer exists.', 'not-found')
    }
    if (existing.isSystem) {
      throw new AccessServiceError(
        'System roles cannot be edited.',
        'protected-role',
      )
    }
    assertUniqueName(roles, parsed.name, id)
    const role: Role = {
      ...existing,
      ...parsed,
      permissionKeys: [...new Set(parsed.permissionKeys)],
      updatedAt: new Date().toISOString(),
    }
    return roleSchema.parse(await updateRoleApi(role))
  },
}
