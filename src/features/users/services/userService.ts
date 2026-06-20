import {
  createUserApi,
  getUserApi,
  listTeamsApi,
  listUsersApi,
  updateUserApi,
} from '../../../mocks/usersApi'
import {
  teamsSchema,
  userFormSchema,
  userSchema,
  usersSchema,
  type Team,
  type User,
  type UserFormValues,
  type UserStatus,
} from '../schemas/userSchemas'
import { departmentService } from '../../departments/services/departmentService'

export class UserServiceError extends Error {
  readonly code:
    | 'duplicate-email'
    | 'duplicate-employee-id'
    | 'invalid-assignment'
    | 'invalid-transition'
    | 'not-found'

  constructor(message: string, code: UserServiceError['code']) {
    super(message)
    this.name = 'UserServiceError'
    this.code = code
  }
}

async function list(): Promise<User[]> {
  return usersSchema.parse(await listUsersApi())
}

async function listTeams(): Promise<Team[]> {
  return teamsSchema.parse(await listTeamsApi())
}

function normalize(values: UserFormValues) {
  const parsed = userFormSchema.parse(values)
  return {
    ...parsed,
    email: parsed.email.toLowerCase(),
    employeeId: parsed.employeeId.toUpperCase(),
    managerId: parsed.managerId || null,
    teamIds: [...new Set(parsed.teamIds)],
  }
}

function assertUnique(
  users: User[],
  values: ReturnType<typeof normalize>,
  currentId?: string,
) {
  const others = users.filter((user) => user.id !== currentId)
  if (others.some((user) => user.email.toLowerCase() === values.email)) {
    throw new UserServiceError(
      'A user already uses this email address.',
      'duplicate-email',
    )
  }
  if (
    others.some(
      (user) => user.employeeId.toLowerCase() === values.employeeId.toLowerCase(),
    )
  ) {
    throw new UserServiceError(
      'A user already uses this employee ID.',
      'duplicate-employee-id',
    )
  }
}

function assertManager(users: User[], managerId: string | null, userId?: string) {
  if (!managerId) {
    return
  }
  if (managerId === userId) {
    throw new UserServiceError(
      'A user cannot be their own manager.',
      'invalid-assignment',
    )
  }
  const manager = users.find((user) => user.id === managerId)
  if (!manager || manager.status === 'deactivated') {
    throw new UserServiceError(
      'Select an available manager.',
      'invalid-assignment',
    )
  }

  const visited = new Set<string>()
  let ancestor: User | undefined = manager
  while (ancestor?.managerId) {
    if (visited.has(ancestor.id) || ancestor.managerId === userId) {
      throw new UserServiceError(
        'This manager would create a circular reporting line.',
        'invalid-assignment',
      )
    }
    visited.add(ancestor.id)
    ancestor = users.find((user) => user.id === ancestor?.managerId)
  }
}

async function assertTeams(teamIds: string[]) {
  const teams = await listTeams()
  if (teamIds.some((id) => !teams.some((team) => team.id === id))) {
    throw new UserServiceError(
      'One or more selected teams no longer exist.',
      'invalid-assignment',
    )
  }
}

async function assertDepartment(departmentId: string) {
  const department = await departmentService.get(departmentId)
  if (!department || department.status === 'inactive') {
    throw new UserServiceError(
      'Select an available department.',
      'invalid-assignment',
    )
  }
}

function assertDeactivationHasNoReports(
  users: User[],
  userId: string,
  status: UserStatus,
) {
  if (
    status === 'deactivated' &&
    users.some(
      (user) => user.managerId === userId && user.status !== 'deactivated',
    )
  ) {
    throw new UserServiceError(
      'Reassign active direct reports before deactivating this user.',
      'invalid-assignment',
    )
  }
}

const allowedTransitions: Record<UserStatus, UserStatus[]> = {
  active: ['active', 'suspended', 'deactivated'],
  deactivated: ['deactivated', 'active'],
  invited: ['invited', 'active', 'deactivated'],
  suspended: ['suspended', 'active', 'deactivated'],
}

function assertTransition(from: UserStatus, to: UserStatus) {
  if (!allowedTransitions[from].includes(to)) {
    throw new UserServiceError(
      `A ${from} user cannot transition directly to ${to}.`,
      'invalid-transition',
    )
  }
}

export const userService = {
  async create(values: UserFormValues): Promise<User> {
    const normalized = normalize(values)
    const users = await list()
    assertUnique(users, normalized)
    assertManager(users, normalized.managerId)
    await assertDepartment(normalized.departmentId)
    await assertTeams(normalized.teamIds)

    const now = new Date().toISOString()
    const user: User = {
      ...normalized,
      createdAt: now,
      id: crypto.randomUUID(),
      lastSeenAt: null,
      updatedAt: now,
    }
    return userSchema.parse(await createUserApi(user))
  },

  async get(id: string): Promise<User | null> {
    const response = await getUserApi(id)
    return response === null ? null : userSchema.parse(response)
  },

  list,
  listTeams,

  async setStatus(id: string, status: UserStatus): Promise<User> {
    const users = await list()
    const user = users.find((item) => item.id === id)
    if (!user) {
      throw new UserServiceError('The user no longer exists.', 'not-found')
    }
    assertTransition(user.status, status)
    assertDeactivationHasNoReports(users, id, status)
    const updated = { ...user, status, updatedAt: new Date().toISOString() }
    return userSchema.parse(await updateUserApi(updated))
  },

  async update(id: string, values: UserFormValues): Promise<User> {
    const normalized = normalize(values)
    const users = await list()
    const existing = users.find((user) => user.id === id)
    if (!existing) {
      throw new UserServiceError('The user no longer exists.', 'not-found')
    }
    assertUnique(users, normalized, id)
    assertManager(users, normalized.managerId, id)
    assertTransition(existing.status, normalized.status)
    assertDeactivationHasNoReports(users, id, normalized.status)
    await assertDepartment(normalized.departmentId)
    await assertTeams(normalized.teamIds)

    const user: User = {
      ...existing,
      ...normalized,
      updatedAt: new Date().toISOString(),
    }
    return userSchema.parse(await updateUserApi(user))
  },
}
