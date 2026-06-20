import {
  teamsSchema,
  usersSchema,
  type Team,
  type User,
} from '../features/users/schemas/userSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const usersStorageKey = 'enterprise-operations-users'
const teamsStorageKey = 'enterprise-operations-teams'

const seedTeams: Team[] = [
  {
    description: 'Coordinates enterprise operating standards and governance.',
    id: 'team-operations-leadership',
    name: 'Operations Leadership',
  },
  {
    description: 'Manages critical incidents and cross-functional escalation.',
    id: 'team-incident-response',
    name: 'Incident Response',
  },
  {
    description: 'Owns automation opportunities and workflow enablement.',
    id: 'team-automation-council',
    name: 'Automation Council',
  },
  {
    description: 'Reviews service performance, controls, and operational risk.',
    id: 'team-service-governance',
    name: 'Service Governance',
  },
]

const seedUsers: User[] = [
  {
    createdAt: '2026-01-05T09:00:00.000Z',
    departmentId: 'dept-operations',
    email: 'avery.morgan@northstar.example',
    employeeId: 'NS-1001',
    employmentType: 'employee',
    firstName: 'Avery',
    id: 'user-avery-morgan',
    jobTitle: 'VP, Enterprise Operations',
    lastName: 'Morgan',
    lastSeenAt: '2026-06-20T08:42:00.000Z',
    location: 'Brussels, Belgium',
    managerId: null,
    startDate: '2022-03-14',
    status: 'active',
    teamIds: ['team-operations-leadership', 'team-service-governance'],
    updatedAt: '2026-06-18T14:20:00.000Z',
  },
  {
    createdAt: '2026-01-10T09:00:00.000Z',
    departmentId: 'dept-customer-operations',
    email: 'maya.chen@northstar.example',
    employeeId: 'NS-1048',
    employmentType: 'employee',
    firstName: 'Maya',
    id: 'user-maya-chen',
    jobTitle: 'Director, Customer Operations',
    lastName: 'Chen',
    lastSeenAt: '2026-06-20T08:26:00.000Z',
    location: 'Toronto, Canada',
    managerId: 'user-avery-morgan',
    startDate: '2023-01-09',
    status: 'active',
    teamIds: ['team-operations-leadership', 'team-incident-response'],
    updatedAt: '2026-06-20T07:42:00.000Z',
  },
  {
    createdAt: '2026-01-14T09:00:00.000Z',
    departmentId: 'dept-finance-operations',
    email: 'elena.rossi@northstar.example',
    employeeId: 'NS-1082',
    employmentType: 'employee',
    firstName: 'Elena',
    id: 'user-elena-rossi',
    jobTitle: 'Director, Finance Operations',
    lastName: 'Rossi',
    lastSeenAt: '2026-06-20T07:54:00.000Z',
    location: 'Milan, Italy',
    managerId: 'user-avery-morgan',
    startDate: '2021-09-20',
    status: 'active',
    teamIds: ['team-operations-leadership', 'team-service-governance'],
    updatedAt: '2026-06-19T16:10:00.000Z',
  },
  {
    createdAt: '2026-02-01T09:00:00.000Z',
    departmentId: 'dept-people-services',
    email: 'jon.bell@northstar.example',
    employeeId: 'NS-1126',
    employmentType: 'employee',
    firstName: 'Jon',
    id: 'user-jon-bell',
    jobTitle: 'Head of People Services',
    lastName: 'Bell',
    lastSeenAt: '2026-06-20T07:31:00.000Z',
    location: 'London, United Kingdom',
    managerId: 'user-avery-morgan',
    startDate: '2020-11-02',
    status: 'active',
    teamIds: ['team-service-governance'],
    updatedAt: '2026-06-17T12:45:00.000Z',
  },
  {
    createdAt: '2026-02-12T09:00:00.000Z',
    departmentId: 'dept-technology-operations',
    email: 'priya.shah@northstar.example',
    employeeId: 'NS-1189',
    employmentType: 'employee',
    firstName: 'Priya',
    id: 'user-priya-shah',
    jobTitle: 'VP, Technology Operations',
    lastName: 'Shah',
    lastSeenAt: '2026-06-20T08:12:00.000Z',
    location: 'Austin, United States',
    managerId: 'user-avery-morgan',
    startDate: '2019-06-17',
    status: 'active',
    teamIds: [
      'team-operations-leadership',
      'team-incident-response',
      'team-automation-council',
    ],
    updatedAt: '2026-06-20T06:35:00.000Z',
  },
  {
    createdAt: '2026-05-05T09:00:00.000Z',
    departmentId: 'dept-automation-enablement',
    email: 'liam.okafor@northstar.example',
    employeeId: 'CTR-2041',
    employmentType: 'contractor',
    firstName: 'Liam',
    id: 'user-liam-okafor',
    jobTitle: 'Head of Automation Enablement',
    lastName: 'Okafor',
    lastSeenAt: null,
    location: 'Dublin, Ireland',
    managerId: 'user-priya-shah',
    startDate: '2026-07-01',
    status: 'invited',
    teamIds: ['team-automation-council'],
    updatedAt: '2026-06-16T10:05:00.000Z',
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function readUsers(): User[] {
  const persisted = usersSchema.safeParse(browserStorage.read(usersStorageKey))
  if (persisted.success) {
    return persisted.data
  }
  browserStorage.write(usersStorageKey, seedUsers)
  return seedUsers
}

function writeUsers(users: User[]) {
  browserStorage.write(usersStorageKey, users)
}

function readTeams(): Team[] {
  const persisted = teamsSchema.safeParse(browserStorage.read(teamsStorageKey))
  if (persisted.success) {
    return persisted.data
  }
  browserStorage.write(teamsStorageKey, seedTeams)
  return seedTeams
}

export async function listUsersApi(): Promise<unknown> {
  await delay(320)
  return readUsers()
}

export async function getUserApi(id: string): Promise<unknown> {
  await delay(240)
  return readUsers().find((user) => user.id === id) ?? null
}

export async function listTeamsApi(): Promise<unknown> {
  await delay(180)
  return readTeams()
}

export async function createUserApi(user: User): Promise<unknown> {
  await delay(420)
  writeUsers([...readUsers(), user])
  return user
}

export async function updateUserApi(user: User): Promise<unknown> {
  await delay(420)
  writeUsers(readUsers().map((item) => (item.id === user.id ? user : item)))
  return user
}
