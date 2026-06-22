import { createVersionedStore } from '../services/persistence/versionedStore'
import {
  departmentsSchema,
  type Department,
} from '../features/departments/schemas/departmentSchemas'

const departmentsStorageKey = 'enterprise-operations-departments'

const seedDepartments: Department[] = [
  {
    code: 'OPS',
    costCenter: 'CC-1000',
    createdAt: '2026-01-08T09:00:00.000Z',
    description:
      'Coordinates enterprise service delivery, operating governance, and cross-functional execution standards.',
    headcount: 84,
    id: 'dept-operations',
    name: 'Enterprise Operations',
    owner: {
      email: 'avery.morgan@northstar.example',
      id: 'owner-avery-morgan',
      name: 'Avery Morgan',
      title: 'VP, Enterprise Operations',
    },
    parentDepartmentId: null,
    status: 'active',
    updatedAt: '2026-06-18T14:20:00.000Z',
  },
  {
    code: 'CUST',
    costCenter: 'CC-1120',
    createdAt: '2026-01-12T10:30:00.000Z',
    description:
      'Owns customer intake, case resolution, remediation, and service-experience operations across regions.',
    headcount: 126,
    id: 'dept-customer-operations',
    name: 'Customer Operations',
    owner: {
      email: 'maya.chen@northstar.example',
      id: 'owner-maya-chen',
      name: 'Maya Chen',
      title: 'Director, Customer Operations',
    },
    parentDepartmentId: 'dept-operations',
    status: 'active',
    updatedAt: '2026-06-20T07:42:00.000Z',
  },
  {
    code: 'FIN',
    costCenter: 'CC-2100',
    createdAt: '2026-01-15T08:15:00.000Z',
    description:
      'Runs transaction processing, financial controls, close operations, and exception-management services.',
    headcount: 73,
    id: 'dept-finance-operations',
    name: 'Finance Operations',
    owner: {
      email: 'elena.rossi@northstar.example',
      id: 'owner-elena-rossi',
      name: 'Elena Rossi',
      title: 'Director, Finance Operations',
    },
    parentDepartmentId: 'dept-operations',
    status: 'active',
    updatedAt: '2026-06-19T16:10:00.000Z',
  },
  {
    code: 'PEOPLE',
    costCenter: 'CC-3100',
    createdAt: '2026-02-02T11:00:00.000Z',
    description:
      'Delivers employee lifecycle services, workforce administration, policy support, and people operations.',
    headcount: 48,
    id: 'dept-people-services',
    name: 'People Services',
    owner: {
      email: 'jon.bell@northstar.example',
      id: 'owner-jon-bell',
      name: 'Jon Bell',
      title: 'Head of People Services',
    },
    parentDepartmentId: null,
    status: 'active',
    updatedAt: '2026-06-17T12:45:00.000Z',
  },
  {
    code: 'TECHOPS',
    costCenter: 'CC-4100',
    createdAt: '2026-02-14T13:20:00.000Z',
    description:
      'Provides workplace technology, production support, service reliability, and operational automation.',
    headcount: 102,
    id: 'dept-technology-operations',
    name: 'Technology Operations',
    owner: {
      email: 'priya.shah@northstar.example',
      id: 'owner-priya-shah',
      name: 'Priya Shah',
      title: 'VP, Technology Operations',
    },
    parentDepartmentId: null,
    status: 'active',
    updatedAt: '2026-06-20T06:35:00.000Z',
  },
  {
    code: 'AUTO',
    costCenter: 'CC-4180',
    createdAt: '2026-05-06T09:40:00.000Z',
    description:
      'Builds workflow automation and operational tooling for high-volume internal service teams.',
    headcount: 18,
    id: 'dept-automation-enablement',
    name: 'Automation Enablement',
    owner: {
      email: 'liam.okafor@northstar.example',
      id: 'owner-liam-okafor',
      name: 'Liam Okafor',
      title: 'Head of Automation Enablement',
    },
    parentDepartmentId: 'dept-technology-operations',
    status: 'planned',
    updatedAt: '2026-06-16T10:05:00.000Z',
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const departmentsStore = createVersionedStore({
  key: departmentsStorageKey,
  schema: departmentsSchema,
  seed: () => seedDepartments,
  version: 1,
})

function writeDepartments(departments: Department[]) {
  departmentsStore.write(departments)
}

export async function listDepartmentsApi(): Promise<unknown> {
  await delay(320)
  return departmentsStore.read()
}

export async function getDepartmentApi(id: string): Promise<unknown> {
  await delay(240)
  return (
    departmentsStore.read().find((department) => department.id === id) ?? null
  )
}

export async function createDepartmentApi(
  department: Department,
): Promise<unknown> {
  await delay(420)
  const departments = departmentsStore.read()
  writeDepartments([...departments, department])
  return department
}

export async function updateDepartmentApi(
  department: Department,
): Promise<unknown> {
  await delay(420)
  writeDepartments(
    departmentsStore.read().map((item) =>
      item.id === department.id ? department : item,
    ),
  )
  return department
}

export async function deleteDepartmentApi(id: string): Promise<void> {
  await delay(360)
  writeDepartments(
    departmentsStore.read().filter((department) => department.id !== id),
  )
}
