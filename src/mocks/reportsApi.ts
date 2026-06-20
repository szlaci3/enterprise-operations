import {
  reportDefinitionsSchema,
  type ReportDefinition,
} from '../features/reports/schemas/reportSchemas'
import { browserStorage } from '../services/persistence/browserStorage'

const reportsStorageKey = 'enterprise-operations-report-definitions'

const seedReports: ReportDefinition[] = [
  {
    columns: [
      'title',
      'status',
      'priority',
      'assignee',
      'department',
      'dueDate',
    ],
    createdAt: '2026-06-18T09:00:00.000Z',
    createdByUserId: 'user-avery-morgan',
    description:
      'Tracks open operational work by ownership, urgency, department, and committed delivery date.',
    filters: {
      dateFrom: '',
      dateTo: '',
      departmentId: '',
      priority: '',
      status: 'open',
    },
    id: 'report-open-task-portfolio',
    name: 'Open task portfolio',
    source: 'tasks',
    templateId: 'template-task-portfolio',
    updatedAt: '2026-06-18T09:00:00.000Z',
  },
  {
    columns: [
      'title',
      'status',
      'priority',
      'requester',
      'workflow',
      'dueDate',
    ],
    createdAt: '2026-06-19T11:30:00.000Z',
    createdByUserId: 'user-avery-morgan',
    description:
      'Provides a governance view of approval outcomes and requests still awaiting a decision.',
    filters: {
      dateFrom: '',
      dateTo: '',
      departmentId: '',
      priority: '',
      status: '',
    },
    id: 'report-approval-register',
    name: 'Approval decision register',
    source: 'approvals',
    templateId: 'template-approval-register',
    updatedAt: '2026-06-19T11:30:00.000Z',
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function readReports(): ReportDefinition[] {
  const persisted = reportDefinitionsSchema.safeParse(
    browserStorage.read(reportsStorageKey),
  )
  if (persisted.success) return persisted.data
  browserStorage.write(reportsStorageKey, seedReports)
  return seedReports
}

function writeReports(reports: ReportDefinition[]) {
  browserStorage.write(reportsStorageKey, reports)
}

export async function listReportsApi(): Promise<unknown> {
  await delay(260)
  return readReports()
}

export async function getReportApi(id: string): Promise<unknown> {
  await delay(200)
  return readReports().find((report) => report.id === id) ?? null
}

export async function createReportApi(
  report: ReportDefinition,
): Promise<unknown> {
  await delay(380)
  writeReports([...readReports(), report])
  return report
}

export async function updateReportApi(
  report: ReportDefinition,
): Promise<unknown> {
  await delay(380)
  writeReports(
    readReports().map((item) => (item.id === report.id ? report : item)),
  )
  return report
}

export async function deleteReportApi(id: string): Promise<void> {
  await delay(320)
  writeReports(readReports().filter((report) => report.id !== id))
}
