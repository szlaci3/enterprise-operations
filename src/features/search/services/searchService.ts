import {
  getSearchPreferencesApi,
  updateSearchPreferencesApi,
} from '../../../mocks/searchApi'
import type { PermissionKey } from '../../access/schemas/accessSchemas'
import {
  savedSearchSchema,
  searchPreferencesSchema,
  searchRequestSchema,
  searchResponseSchema,
  searchResultSchema,
  type SavedSearch,
  type SearchEntityType,
  type SearchPreferences,
  type SearchRequest,
  type SearchResponse,
} from '../schemas/searchSchemas'

interface SearchDocument {
  body: string
  description: string
  entityType: SearchEntityType
  id: string
  metadata: string[]
  status: string
  title: string
  updatedAt: string
  url: string
}

const permissionByType: Record<SearchEntityType, PermissionKey> = {
  approval: 'approvals.review',
  department: 'departments.view',
  report: 'reports.view',
  task: 'tasks.view',
  user: 'users.view',
  workflow: 'workflows.view',
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function scoreDocument(document: SearchDocument, query: string) {
  if (!query) return 1
  const title = normalize(document.title)
  const description = normalize(document.description)
  const body = normalize(document.body)
  const tokens = query.split(' ').filter(Boolean)
  let score = 0
  if (title === query) score += 100
  if (title.startsWith(query)) score += 60
  if (title.includes(query)) score += 35
  if (description.includes(query)) score += 15
  if (body.includes(query)) score += 10
  for (const token of tokens) {
    if (title.split(' ').some((word) => word.startsWith(token))) score += 12
    if (body.includes(token)) score += 3
  }
  return score
}

async function buildIndex(
  permissionKeys: PermissionKey[],
): Promise<SearchDocument[]> {
  const allowed = (type: SearchEntityType) =>
    permissionKeys.includes(permissionByType[type])
  const imports = await Promise.all([
    allowed('department')
      ? import('../../departments/services/departmentService')
      : null,
    allowed('user') ? import('../../users/services/userService') : null,
    allowed('workflow')
      ? import('../../workflows/services/workflowService')
      : null,
    allowed('task') ? import('../../tasks/services/taskService') : null,
    allowed('approval')
      ? import('../../approvals/services/approvalService')
      : null,
    allowed('report') ? import('../../reports/services/reportService') : null,
  ])
  const [
    departmentModule,
    userModule,
    workflowModule,
    taskModule,
    approvalModule,
    reportModule,
  ] = imports
  const [departments, users, workflows, tasks, approvals, reports] =
    await Promise.all([
      departmentModule?.departmentService.list() ?? [],
      userModule?.userService.list() ?? [],
      workflowModule?.workflowService.list() ?? [],
      taskModule?.taskService.list() ?? [],
      approvalModule?.approvalService.list() ?? [],
      reportModule?.reportService.list() ?? [],
    ])

  return [
    ...departments.map((department) => ({
      body: `${department.code} ${department.costCenter} ${department.owner.name} ${department.owner.email}`,
      description: department.description,
      entityType: 'department' as const,
      id: department.id,
      metadata: [department.code, department.owner.name, department.costCenter],
      status: department.status,
      title: department.name,
      updatedAt: department.updatedAt,
      url: `/departments/${department.id}`,
    })),
    ...users.map((user) => ({
      body: `${user.email} ${user.employeeId} ${user.jobTitle} ${user.location}`,
      description: `${user.jobTitle} in ${user.location}`,
      entityType: 'user' as const,
      id: user.id,
      metadata: [user.email, user.employeeId, user.jobTitle],
      status: user.status,
      title: `${user.firstName} ${user.lastName}`,
      updatedAt: user.updatedAt,
      url: `/users/${user.id}`,
    })),
    ...workflows.map((workflow) => ({
      body: `${workflow.workflowKey} ${workflow.states.map((state) => state.name).join(' ')}`,
      description: workflow.description,
      entityType: 'workflow' as const,
      id: workflow.id,
      metadata: [
        workflow.workflowKey,
        `Version ${workflow.version}`,
        `${workflow.states.length} states`,
      ],
      status: workflow.status,
      title: workflow.name,
      updatedAt: workflow.updatedAt,
      url: `/workflows/${workflow.id}`,
    })),
    ...tasks.map((task) => ({
      body: `${task.priority} ${task.status} ${task.dueDate} ${task.departmentId} ${task.assigneeUserId}`,
      description: task.description,
      entityType: 'task' as const,
      id: task.id,
      metadata: [task.priority, task.status, `Due ${task.dueDate}`],
      status: task.status,
      title: task.title,
      updatedAt: task.updatedAt,
      url: `/tasks/${task.id}`,
    })),
    ...approvals.map((approval) => ({
      body: `${approval.category} ${approval.priority} ${approval.status} ${approval.workflow.name}`,
      description: approval.description,
      entityType: 'approval' as const,
      id: approval.id,
      metadata: [
        approval.priority,
        approval.workflow.name,
        `Due ${approval.dueDate}`,
      ],
      status: approval.status,
      title: approval.title,
      updatedAt: approval.updatedAt,
      url: `/approvals/${approval.id}`,
    })),
    ...reports.map((report) => ({
      body: `${report.source} ${report.columns.join(' ')}`,
      description: report.description,
      entityType: 'report' as const,
      id: report.id,
      metadata: [report.source, `${report.columns.length} columns`],
      status: 'saved',
      title: report.name,
      updatedAt: report.updatedAt,
      url: `/reports/${report.id}`,
    })),
  ]
}

export const searchService = {
  async getPreferences(userId: string): Promise<SearchPreferences> {
    return searchPreferencesSchema.parse(await getSearchPreferencesApi(userId))
  },

  async recordRecent(userId: string, query: string): Promise<SearchPreferences> {
    const normalized = query.trim()
    const preferences = await searchService.getPreferences(userId)
    if (!normalized) return preferences
    return searchPreferencesSchema.parse(
      await updateSearchPreferencesApi({
        ...preferences,
        recentQueries: [
          normalized,
          ...preferences.recentQueries.filter(
            (item) => item.toLowerCase() !== normalized.toLowerCase(),
          ),
        ].slice(0, 10),
      }),
    )
  },

  async removeSaved(
    userId: string,
    savedSearchId: string,
  ): Promise<SearchPreferences> {
    const preferences = await searchService.getPreferences(userId)
    return searchPreferencesSchema.parse(
      await updateSearchPreferencesApi({
        ...preferences,
        savedSearches: preferences.savedSearches.filter(
          (saved) => saved.id !== savedSearchId,
        ),
      }),
    )
  },

  async save(
    userId: string,
    name: string,
    request: SearchRequest,
  ): Promise<SavedSearch> {
    const parsed = searchRequestSchema.parse(request)
    const preferences = await searchService.getPreferences(userId)
    if (
      preferences.savedSearches.some(
        (saved) => saved.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      throw new Error('A saved search already uses this name.')
    }
    const saved = savedSearchSchema.parse({
      createdAt: new Date().toISOString(),
      filters: parsed.filters,
      id: crypto.randomUUID(),
      name: name.trim(),
      query: parsed.query,
    })
    await updateSearchPreferencesApi({
      ...preferences,
      savedSearches: [...preferences.savedSearches, saved],
    })
    return saved
  },

  async search(
    request: SearchRequest,
    permissionKeys: PermissionKey[],
  ): Promise<SearchResponse> {
    const parsed = searchRequestSchema.parse(request)
    const normalizedQuery = normalize(parsed.query)
    const documents = await buildIndex(permissionKeys)
    const results = documents
      .filter(
        (document) =>
          parsed.filters.entityTypes.length === 0 ||
          parsed.filters.entityTypes.includes(document.entityType),
      )
      .filter(
        (document) =>
          !parsed.filters.status ||
          document.status === parsed.filters.status,
      )
      .map((document) => ({
        ...document,
        score: scoreDocument(document, normalizedQuery),
      }))
      .filter((document) => !normalizedQuery || document.score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          right.updatedAt.localeCompare(left.updatedAt),
      )
      .slice(0, 100)
      .map((result) => searchResultSchema.parse(result))
    return searchResponseSchema.parse({
      executedAt: new Date().toISOString(),
      results,
      total: results.length,
    })
  },
}
