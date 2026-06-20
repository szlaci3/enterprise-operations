import {
  createReportApi,
  deleteReportApi,
  getReportApi,
  listReportsApi,
  updateReportApi,
} from '../../../mocks/reportsApi'
import {
  reportDefinitionSchema,
  reportDefinitionsSchema,
  reportFormSchema,
  reportResultSchema,
  type ReportColumn,
  type ReportDefinition,
  type ReportFilters,
  type ReportFormValues,
  type ReportResult,
} from '../schemas/reportSchemas'
import {
  reportColumnLabels,
  reportColumnsBySource,
  reportTemplates,
} from './reportCatalog'

export class ReportServiceError extends Error {
  readonly code: 'duplicate-name' | 'invalid-columns' | 'not-found'

  constructor(message: string, code: ReportServiceError['code']) {
    super(message)
    this.name = 'ReportServiceError'
    this.code = code
  }
}

function assertColumns(values: ReportFormValues) {
  const available = reportColumnsBySource[values.source]
  if (values.columns.some((column) => !available.includes(column))) {
    throw new ReportServiceError(
      'One or more selected columns are not available for this data source.',
      'invalid-columns',
    )
  }
}

function assertUniqueName(
  reports: ReportDefinition[],
  name: string,
  currentId?: string,
) {
  if (
    reports.some(
      (report) =>
        report.id !== currentId &&
        report.name.toLowerCase() === name.trim().toLowerCase(),
    )
  ) {
    throw new ReportServiceError(
      'A saved report already uses this name.',
      'duplicate-name',
    )
  }
}

function inDateRange(
  value: string,
  filters: ReportFilters,
) {
  const date = value.slice(0, 10)
  return (
    (!filters.dateFrom || date >= filters.dateFrom) &&
    (!filters.dateTo || date <= filters.dateTo)
  )
}

function selectedRow(
  columns: ReportColumn[],
  values: Partial<Record<ReportColumn, string>>,
) {
  return Object.fromEntries(
    columns.map((column) => [column, values[column] ?? '']),
  )
}

async function executeTasks(
  report: ReportDefinition,
): Promise<Record<string, string>[]> {
  const [{ taskService }, { userService }, { departmentService }, { approvalService }] =
    await Promise.all([
      import('../../tasks/services/taskService'),
      import('../../users/services/userService'),
      import('../../departments/services/departmentService'),
      import('../../approvals/services/approvalService'),
    ])
  const [tasks, users, departments, approvals] = await Promise.all([
    taskService.list(),
    userService.list(),
    departmentService.list(),
    approvalService.list(),
  ])
  const usersById = new Map(users.map((user) => [user.id, user]))
  const departmentsById = new Map(
    departments.map((department) => [department.id, department]),
  )
  const approvalsById = new Map(
    approvals.map((approval) => [approval.id, approval]),
  )
  return tasks
    .filter((task) => {
      const statusMatches =
        !report.filters.status ||
        (report.filters.status === 'open'
          ? task.status !== 'completed' && task.status !== 'cancelled'
          : task.status === report.filters.status)
      return (
        statusMatches &&
        (!report.filters.priority ||
          task.priority === report.filters.priority) &&
        (!report.filters.departmentId ||
          task.departmentId === report.filters.departmentId) &&
        inDateRange(task.dueDate, report.filters)
      )
    })
    .map((task) => {
      const assignee = usersById.get(task.assigneeUserId)
      return selectedRow(report.columns, {
        approval: task.approvalRequestId
          ? approvalsById.get(task.approvalRequestId)?.title ??
            task.approvalRequestId
          : '',
        assignee: assignee
          ? `${assignee.firstName} ${assignee.lastName}`
          : task.assigneeUserId,
        createdAt: task.createdAt,
        department:
          departmentsById.get(task.departmentId)?.name ?? task.departmentId,
        dueDate: task.dueDate,
        id: task.id,
        priority: task.priority,
        status: task.status,
        title: task.title,
        updatedAt: task.updatedAt,
      })
    })
}

async function executeApprovals(
  report: ReportDefinition,
): Promise<Record<string, string>[]> {
  const [{ approvalService }, { userService }] = await Promise.all([
    import('../../approvals/services/approvalService'),
    import('../../users/services/userService'),
  ])
  const [approvals, users] = await Promise.all([
    approvalService.list(),
    userService.list(),
  ])
  const usersById = new Map(users.map((user) => [user.id, user]))
  return approvals
    .filter(
      (approval) =>
        (!report.filters.status ||
          approval.status === report.filters.status) &&
        (!report.filters.priority ||
          approval.priority === report.filters.priority) &&
        inDateRange(approval.createdAt, report.filters),
    )
    .map((approval) => {
      const requester = usersById.get(approval.requesterUserId)
      return selectedRow(report.columns, {
        category: approval.category,
        createdAt: approval.createdAt,
        dueDate: approval.dueDate,
        id: approval.id,
        priority: approval.priority,
        requester: requester
          ? `${requester.firstName} ${requester.lastName}`
          : approval.requesterUserId,
        status: approval.status,
        title: approval.title,
        updatedAt: approval.updatedAt,
        workflow: `${approval.workflow.name} v${approval.workflow.version}`,
      })
    })
}

async function executeAudit(
  report: ReportDefinition,
): Promise<Record<string, string>[]> {
  const [{ auditService }, { userService }] = await Promise.all([
    import('../../audit/services/auditService'),
    import('../../users/services/userService'),
  ])
  const [records, users] = await Promise.all([
    auditService.list(),
    userService.list(),
  ])
  const usersById = new Map(users.map((user) => [user.id, user]))
  return records
    .filter(
      (record) =>
        (!report.filters.status ||
          record.action === report.filters.status) &&
        inDateRange(record.createdAt, report.filters),
    )
    .map((record) => {
      const actor = usersById.get(record.actorUserId)
      return selectedRow(report.columns, {
        action: record.action,
        actor: actor
          ? `${actor.firstName} ${actor.lastName}`
          : record.actorUserId,
        changes: record.changes
          .map(
            (change) =>
              `${change.field}: ${change.from ?? '—'} → ${change.to ?? '—'}`,
          )
          .join('; '),
        createdAt: record.createdAt,
        entityName: record.entityName,
        entityType: record.entityType,
        id: record.id,
        summary: record.summary,
      })
    })
}

async function list(): Promise<ReportDefinition[]> {
  return reportDefinitionsSchema.parse(await listReportsApi())
}

export const reportService = {
  async create(
    actorUserId: string,
    values: ReportFormValues,
  ): Promise<ReportDefinition> {
    const parsed = reportFormSchema.parse(values)
    assertColumns(parsed)
    const reports = await list()
    assertUniqueName(reports, parsed.name)
    const now = new Date().toISOString()
    const report: ReportDefinition = {
      ...parsed,
      columns: [...new Set(parsed.columns)],
      createdAt: now,
      createdByUserId: actorUserId,
      id: crypto.randomUUID(),
      templateId: parsed.templateId || null,
      updatedAt: now,
    }
    return reportDefinitionSchema.parse(await createReportApi(report))
  },

  async delete(id: string): Promise<void> {
    const report = await reportService.get(id)
    if (!report) {
      throw new ReportServiceError('The report no longer exists.', 'not-found')
    }
    await deleteReportApi(id)
  },

  async execute(id: string): Promise<ReportResult> {
    const report = await reportService.get(id)
    if (!report) {
      throw new ReportServiceError('The report no longer exists.', 'not-found')
    }
    const rows =
      report.source === 'tasks'
        ? await executeTasks(report)
        : report.source === 'approvals'
          ? await executeApprovals(report)
          : await executeAudit(report)
    return reportResultSchema.parse({
      columns: report.columns.map((column) => ({
        key: column,
        label: reportColumnLabels[column],
      })),
      executedAt: new Date().toISOString(),
      reportId: report.id,
      rows,
    })
  },

  async get(id: string): Promise<ReportDefinition | null> {
    const response = await getReportApi(id)
    return response === null ? null : reportDefinitionSchema.parse(response)
  },

  list,

  async listTemplates() {
    return reportTemplates
  },

  async update(
    id: string,
    values: ReportFormValues,
  ): Promise<ReportDefinition> {
    const parsed = reportFormSchema.parse(values)
    assertColumns(parsed)
    const reports = await list()
    const existing = reports.find((report) => report.id === id)
    if (!existing) {
      throw new ReportServiceError('The report no longer exists.', 'not-found')
    }
    assertUniqueName(reports, parsed.name, id)
    const report: ReportDefinition = {
      ...existing,
      ...parsed,
      columns: [...new Set(parsed.columns)],
      templateId: parsed.templateId || null,
      updatedAt: new Date().toISOString(),
    }
    return reportDefinitionSchema.parse(await updateReportApi(report))
  },
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export function reportResultToCsv(result: ReportResult) {
  const header = result.columns.map((column) => escapeCsv(column.label)).join(',')
  const rows = result.rows.map((row) =>
    result.columns.map((column) => escapeCsv(row[column.key] ?? '')).join(','),
  )
  return [header, ...rows].join('\r\n')
}
