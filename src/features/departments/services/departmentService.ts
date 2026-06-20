import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentApi,
  listDepartmentsApi,
  updateDepartmentApi,
} from '../../../mocks/departmentsApi'
import {
  departmentFormSchema,
  departmentSchema,
  departmentsSchema,
  type Department,
  type DepartmentFormValues,
} from '../schemas/departmentSchemas'

export class DepartmentServiceError extends Error {
  readonly code:
    | 'duplicate-code'
    | 'duplicate-name'
    | 'hierarchy-conflict'
    | 'not-found'

  constructor(
    message: string,
    code:
      | 'duplicate-code'
      | 'duplicate-name'
      | 'hierarchy-conflict'
      | 'not-found',
  ) {
    super(message)
    this.name = 'DepartmentServiceError'
    this.code = code
  }
}

function createOwnerId(email: string) {
  return `owner-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function normalizeInput(values: DepartmentFormValues) {
  const parsed = departmentFormSchema.parse(values)

  return {
    ...parsed,
    code: parsed.code.toUpperCase(),
    parentDepartmentId: parsed.parentDepartmentId || null,
  }
}

function assertUnique(
  departments: Department[],
  values: ReturnType<typeof normalizeInput>,
  currentId?: string,
) {
  const otherDepartments = departments.filter(
    (department) => department.id !== currentId,
  )

  if (
    otherDepartments.some(
      (department) =>
        department.code.toLowerCase() === values.code.toLowerCase(),
    )
  ) {
    throw new DepartmentServiceError(
      'A department already uses this code.',
      'duplicate-code',
    )
  }

  if (
    otherDepartments.some(
      (department) =>
        department.name.toLowerCase() === values.name.toLowerCase(),
    )
  ) {
    throw new DepartmentServiceError(
      'A department already uses this name.',
      'duplicate-name',
    )
  }
}

function assertValidParent(
  departments: Department[],
  parentDepartmentId: string | null,
  currentId?: string,
) {
  if (parentDepartmentId === null) {
    return
  }

  if (parentDepartmentId === currentId) {
    throw new DepartmentServiceError(
      'A department cannot report to itself.',
      'hierarchy-conflict',
    )
  }

  const parent = departments.find(
    (department) => department.id === parentDepartmentId,
  )

  if (!parent) {
    throw new DepartmentServiceError(
      'The selected parent department no longer exists.',
      'hierarchy-conflict',
    )
  }

  const visited = new Set<string>()
  let ancestor: Department | undefined = parent
  while (ancestor?.parentDepartmentId) {
    if (visited.has(ancestor.id)) {
      throw new DepartmentServiceError(
        'The existing department hierarchy contains a circular relationship.',
        'hierarchy-conflict',
      )
    }
    visited.add(ancestor.id)

    if (ancestor.parentDepartmentId === currentId) {
      throw new DepartmentServiceError(
        'This parent would create a circular department hierarchy.',
        'hierarchy-conflict',
      )
    }
    ancestor = departments.find(
      (department) => department.id === ancestor?.parentDepartmentId,
    )
  }
}

async function list(): Promise<Department[]> {
  return departmentsSchema.parse(await listDepartmentsApi())
}

export const departmentService = {
  async create(values: DepartmentFormValues): Promise<Department> {
    const normalized = normalizeInput(values)
    const departments = await list()
    assertUnique(departments, normalized)
    assertValidParent(departments, normalized.parentDepartmentId)

    const now = new Date().toISOString()
    const department: Department = {
      code: normalized.code,
      costCenter: normalized.costCenter,
      createdAt: now,
      description: normalized.description,
      headcount: normalized.headcount,
      id: crypto.randomUUID(),
      name: normalized.name,
      owner: {
        email: normalized.ownerEmail,
        id: createOwnerId(normalized.ownerEmail),
        name: normalized.ownerName,
        title: normalized.ownerTitle,
      },
      parentDepartmentId: normalized.parentDepartmentId,
      status: normalized.status,
      updatedAt: now,
    }

    return departmentSchema.parse(await createDepartmentApi(department))
  },

  async delete(id: string): Promise<void> {
    const departments = await list()
    const department = departments.find((item) => item.id === id)

    if (!department) {
      throw new DepartmentServiceError(
        'The department no longer exists.',
        'not-found',
      )
    }

    if (
      departments.some((item) => item.parentDepartmentId === department.id)
    ) {
      throw new DepartmentServiceError(
        'Reassign child departments before deleting this department.',
        'hierarchy-conflict',
      )
    }

    await deleteDepartmentApi(id)
  },

  async get(id: string): Promise<Department | null> {
    const response = await getDepartmentApi(id)
    if (response === null) {
      return null
    }
    return departmentSchema.parse(response)
  },

  list,

  async update(
    id: string,
    values: DepartmentFormValues,
  ): Promise<Department> {
    const normalized = normalizeInput(values)
    const departments = await list()
    const existing = departments.find((department) => department.id === id)

    if (!existing) {
      throw new DepartmentServiceError(
        'The department no longer exists.',
        'not-found',
      )
    }

    assertUnique(departments, normalized, id)
    assertValidParent(departments, normalized.parentDepartmentId, id)

    const department: Department = {
      ...existing,
      code: normalized.code,
      costCenter: normalized.costCenter,
      description: normalized.description,
      headcount: normalized.headcount,
      name: normalized.name,
      owner: {
        email: normalized.ownerEmail,
        id: createOwnerId(normalized.ownerEmail),
        name: normalized.ownerName,
        title: normalized.ownerTitle,
      },
      parentDepartmentId: normalized.parentDepartmentId,
      status: normalized.status,
      updatedAt: new Date().toISOString(),
    }

    return departmentSchema.parse(await updateDepartmentApi(department))
  },
}
