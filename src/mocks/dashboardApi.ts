import type {
  DashboardActivity,
  DashboardAlert,
  DashboardKpi,
  DashboardPeriod,
  DashboardSnapshot,
  ServiceSummary,
  WorkloadPoint,
} from '../features/dashboard/schemas/dashboardSchemas'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

const latency = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const periodMultiplier: Record<DashboardPeriod, number> = {
  '7d': 0.28,
  '30d': 1,
  '90d': 2.84,
}

const workloadByPeriod: Record<DashboardPeriod, WorkloadPoint[]> = {
  '7d': [
    { completed: 124, label: 'Sat', received: 132 },
    { completed: 138, label: 'Sun', received: 143 },
    { completed: 192, label: 'Mon', received: 211 },
    { completed: 205, label: 'Tue', received: 218 },
    { completed: 227, label: 'Wed', received: 238 },
    { completed: 216, label: 'Thu', received: 229 },
    { completed: 241, label: 'Fri', received: 247 },
  ],
  '30d': [
    { completed: 860, label: 'May 22', received: 912 },
    { completed: 924, label: 'May 29', received: 948 },
    { completed: 1015, label: 'Jun 5', received: 1046 },
    { completed: 1098, label: 'Jun 12', received: 1115 },
    { completed: 638, label: 'Jun 20', received: 651 },
  ],
  '90d': [
    { completed: 2940, label: 'Apr', received: 3052 },
    { completed: 3428, label: 'May', received: 3491 },
    { completed: 2676, label: 'Jun', received: 2744 },
  ],
}

const alerts: Omit<DashboardAlert, 'acknowledged'>[] = [
  {
    createdAt: '2026-06-20T07:42:00.000Z',
    description:
      'Resolution time has exceeded the 4-hour target for 11 priority requests.',
    id: 'alert-sla-breach',
    severity: 'critical',
    source: 'Customer Operations',
    title: 'Priority request SLA at risk',
  },
  {
    createdAt: '2026-06-20T06:18:00.000Z',
    description:
      'Invoice exception volume is 23% above the trailing four-week baseline.',
    id: 'alert-volume-variance',
    severity: 'warning',
    source: 'Finance Operations',
    title: 'Exception volume above baseline',
  },
  {
    createdAt: '2026-06-19T15:05:00.000Z',
    description:
      'Quarterly access certification opens Monday for 186 application owners.',
    id: 'alert-access-review',
    severity: 'info',
    source: 'Identity Governance',
    title: 'Access review window approaching',
  },
]

const activities: DashboardActivity[] = [
  {
    actor: 'Maya Chen',
    createdAt: '2026-06-20T08:26:00.000Z',
    description: 'Approved the EMEA vendor onboarding exception.',
    id: 'activity-1',
    type: 'approval',
  },
  {
    actor: 'Workforce automation',
    createdAt: '2026-06-20T08:12:00.000Z',
    description: 'Assigned 38 intake items across the service desk.',
    id: 'activity-2',
    type: 'system',
  },
  {
    actor: 'Elena Rossi',
    createdAt: '2026-06-20T07:54:00.000Z',
    description: 'Completed the month-end controls checklist.',
    id: 'activity-3',
    type: 'task',
  },
  {
    actor: 'Jon Bell',
    createdAt: '2026-06-20T07:31:00.000Z',
    description: 'Published the weekly operational performance pack.',
    id: 'activity-4',
    type: 'report',
  },
  {
    actor: 'Priya Shah',
    createdAt: '2026-06-20T06:48:00.000Z',
    description: 'Escalated three customer remediation cases.',
    id: 'activity-5',
    type: 'task',
  },
]

function createKpis(period: DashboardPeriod): DashboardKpi[] {
  const multiplier = periodMultiplier[period]

  return [
    {
      description: 'All operational items completed in the selected period.',
      format: 'number',
      id: 'completed-work',
      label: 'Work completed',
      series: [72, 76, 74, 81, 84, 88, 91],
      trend: {
        change: 8.4,
        direction: 'up',
        favorable: true,
        label: 'vs previous period',
      },
      value: Math.round(3678 * multiplier),
    },
    {
      description: 'Items currently waiting for an accountable owner.',
      format: 'number',
      id: 'open-work',
      label: 'Open work',
      series: [64, 62, 59, 61, 57, 55, 52],
      trend: {
        change: 6.1,
        direction: 'down',
        favorable: true,
        label: 'vs previous period',
      },
      value: 284,
    },
    {
      description: 'Completed items delivered inside their service target.',
      format: 'percent',
      id: 'sla-performance',
      label: 'SLA performance',
      series: [91, 93, 92, 94, 95, 94, 96],
      trend: {
        change: 2.3,
        direction: 'up',
        favorable: true,
        label: 'vs previous period',
      },
      value: 95.7,
    },
    {
      description: 'Median elapsed time from intake to resolution.',
      format: 'duration',
      id: 'cycle-time',
      label: 'Median cycle time',
      series: [79, 76, 74, 70, 67, 65, 62],
      trend: {
        change: 11.2,
        direction: 'down',
        favorable: true,
        label: 'vs previous period',
      },
      value: 6.2,
    },
  ]
}

function createServices(period: DashboardPeriod): ServiceSummary[] {
  const multiplier = periodMultiplier[period]

  return [
    {
      id: 'customer-operations',
      name: 'Customer Operations',
      openItems: 96,
      owner: 'Maya Chen',
      slaPerformance: 91.4,
      status: 'critical',
      throughput: Math.round(1084 * multiplier),
    },
    {
      id: 'finance-operations',
      name: 'Finance Operations',
      openItems: 71,
      owner: 'Elena Rossi',
      slaPerformance: 94.8,
      status: 'watch',
      throughput: Math.round(864 * multiplier),
    },
    {
      id: 'people-services',
      name: 'People Services',
      openItems: 48,
      owner: 'Jon Bell',
      slaPerformance: 97.2,
      status: 'healthy',
      throughput: Math.round(732 * multiplier),
    },
    {
      id: 'technology-operations',
      name: 'Technology Operations',
      openItems: 69,
      owner: 'Priya Shah',
      slaPerformance: 96.5,
      status: 'healthy',
      throughput: Math.round(998 * multiplier),
    },
  ]
}

export async function getDashboardSnapshot(
  period: DashboardPeriod,
  acknowledgedAlertIds: string[],
): Promise<unknown> {
  await latency(450)

  if (getActiveTenantId() === 'atlas') {
    const snapshot: DashboardSnapshot = {
      activities: [],
      alerts: [],
      generatedAt: new Date().toISOString(),
      kpis: createKpis(period).map((kpi) => ({
        ...kpi,
        series: kpi.series.map(() => 0),
        trend: { ...kpi.trend, change: 0, direction: 'flat' },
        value:
          kpi.format === 'percent'
            ? 100
            : kpi.format === 'duration'
              ? 0
              : 0,
      })),
      period,
      services: [
        {
          id: 'atlas-service-operations',
          name: 'Atlas Service Operations',
          openItems: 0,
          owner: 'Jordan Lee',
          slaPerformance: 100,
          status: 'healthy',
          throughput: 0,
        },
      ],
      workload: workloadByPeriod[period].map((point) => ({
        ...point,
        completed: 0,
        received: 0,
      })),
    }
    return snapshot
  }

  const snapshot: DashboardSnapshot = {
    activities,
    alerts: alerts.map((alert) => ({
      ...alert,
      acknowledged: acknowledgedAlertIds.includes(alert.id),
    })),
    generatedAt: new Date().toISOString(),
    kpis: createKpis(period),
    period,
    services: createServices(period),
    workload: workloadByPeriod[period],
  }

  return snapshot
}

export async function acknowledgeDashboardAlert(): Promise<void> {
  await latency(250)
}
