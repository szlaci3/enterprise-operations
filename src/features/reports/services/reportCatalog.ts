import {
  reportTemplatesSchema,
  type ReportColumn,
  type ReportSource,
  type ReportTemplate,
} from '../schemas/reportSchemas'

export const reportColumnLabels: Record<ReportColumn, string> = {
  action: 'Action',
  actor: 'Actor',
  approval: 'Linked approval',
  assignee: 'Assignee',
  category: 'Category',
  changes: 'Changes',
  createdAt: 'Created',
  department: 'Department',
  dueDate: 'Due date',
  entityName: 'Entity',
  entityType: 'Entity type',
  id: 'Identifier',
  priority: 'Priority',
  requester: 'Requester',
  status: 'Status',
  summary: 'Summary',
  title: 'Title',
  updatedAt: 'Updated',
  workflow: 'Workflow',
}

export const reportColumnsBySource: Record<ReportSource, ReportColumn[]> = {
  approvals: [
    'id',
    'title',
    'status',
    'priority',
    'category',
    'requester',
    'workflow',
    'dueDate',
    'createdAt',
    'updatedAt',
  ],
  audit: [
    'id',
    'entityType',
    'entityName',
    'action',
    'actor',
    'summary',
    'changes',
    'createdAt',
  ],
  tasks: [
    'id',
    'title',
    'status',
    'priority',
    'assignee',
    'department',
    'dueDate',
    'approval',
    'createdAt',
    'updatedAt',
  ],
}

export const reportTemplates: ReportTemplate[] = reportTemplatesSchema.parse([
  {
    columns: [
      'title',
      'status',
      'priority',
      'assignee',
      'department',
      'dueDate',
    ],
    description:
      'Open operational work grouped by accountable owner and delivery commitment.',
    filters: {
      dateFrom: '',
      dateTo: '',
      departmentId: '',
      priority: '',
      status: 'open',
    },
    id: 'template-task-portfolio',
    name: 'Open task portfolio',
    source: 'tasks',
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
    description:
      'Approval requests, decisions, process versions, and governance deadlines.',
    filters: {
      dateFrom: '',
      dateTo: '',
      departmentId: '',
      priority: '',
      status: '',
    },
    id: 'template-approval-register',
    name: 'Approval decision register',
    source: 'approvals',
  },
  {
    columns: [
      'entityType',
      'entityName',
      'action',
      'actor',
      'summary',
      'createdAt',
    ],
    description:
      'Actor-attributed changes across governed operational entities.',
    filters: {
      dateFrom: '',
      dateTo: '',
      departmentId: '',
      priority: '',
      status: '',
    },
    id: 'template-audit-activity',
    name: 'Audit activity register',
    source: 'audit',
  },
])
