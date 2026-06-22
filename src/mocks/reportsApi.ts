import {
  reportDefinitionsSchema,
  type ReportDefinition,
} from '../features/reports/schemas/reportSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

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

const reportsStore = createVersionedStore({
  key: reportsStorageKey,
  schema: reportDefinitionsSchema,
  seed: () => (getActiveTenantId() === 'atlas' ? [] : seedReports),
  version: 1,
})

function writeReports(reports: ReportDefinition[]) {
  reportsStore.write(reports)
}

export async function listReportsApi(): Promise<unknown> {
  await delay(260)
  return reportsStore.read()
}

export async function getReportApi(id: string): Promise<unknown> {
  await delay(200)
  return reportsStore.read().find((report) => report.id === id) ?? null
}

export async function createReportApi(
  report: ReportDefinition,
): Promise<unknown> {
  await delay(380)
  writeReports([...reportsStore.read(), report])
  return report
}

export async function updateReportApi(
  report: ReportDefinition,
): Promise<unknown> {
  await delay(380)
  writeReports(
    reportsStore.read().map((item) => (item.id === report.id ? report : item)),
  )
  return report
}

export async function deleteReportApi(id: string): Promise<void> {
  await delay(320)
  writeReports(reportsStore.read().filter((report) => report.id !== id))
}
