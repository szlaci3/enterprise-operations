import {
  analyticsFiltersSchema,
  analyticsSnapshotSchema,
  type AnalyticsFilters,
  type AnalyticsSnapshot,
} from '../schemas/analyticsSchemas'

const periodDays = {
  '180d': 180,
  '30d': 30,
  '90d': 90,
} as const

function startOfDay(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 86_400_000)
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length
}

function countBy<T>(
  items: T[],
  key: (item: T) => string,
) {
  const counts = new Map<string, number>()
  for (const item of items) {
    const itemKey = key(item)
    counts.set(itemKey, (counts.get(itemKey) ?? 0) + 1)
  }
  return counts
}

export const analyticsService = {
  async getSnapshot(filters: AnalyticsFilters): Promise<AnalyticsSnapshot> {
    const parsed = analyticsFiltersSchema.parse(filters)
    const [
      { taskService },
      { approvalService },
      { departmentService },
    ] = await Promise.all([
      import('../../tasks/services/taskService'),
      import('../../approvals/services/approvalService'),
      import('../../departments/services/departmentService'),
    ])
    const [allTasks, approvals, departments] = await Promise.all([
      taskService.list(),
      approvalService.list(),
      departmentService.list(),
    ])

    const now = new Date()
    const currentStart = addDays(
      startOfDay(now),
      -periodDays[parsed.period] + 1,
    )
    const previousStart = addDays(currentStart, -periodDays[parsed.period])
    const departmentTasks = parsed.departmentId
      ? allTasks.filter((task) => task.departmentId === parsed.departmentId)
      : allTasks
    const linkedApprovalIds = new Set(
      departmentTasks
        .map((task) => task.approvalRequestId)
        .filter((id): id is string => Boolean(id)),
    )
    const scopedApprovals = parsed.departmentId
      ? approvals.filter((approval) => linkedApprovalIds.has(approval.id))
      : approvals

    const currentTasks = departmentTasks.filter(
      (task) =>
        new Date(task.createdAt) >= currentStart &&
        new Date(task.createdAt) <= now,
    )
    const previousTasks = departmentTasks.filter(
      (task) =>
        new Date(task.createdAt) >= previousStart &&
        new Date(task.createdAt) < currentStart,
    )
    const currentApprovals = scopedApprovals.filter(
      (approval) =>
        new Date(approval.createdAt) >= currentStart &&
        new Date(approval.createdAt) <= now,
    )
    const previousApprovals = scopedApprovals.filter(
      (approval) =>
        new Date(approval.createdAt) >= previousStart &&
        new Date(approval.createdAt) < currentStart,
    )

    const activeTasks = currentTasks.filter(
      (task) => task.status !== 'completed' && task.status !== 'cancelled',
    )
    const overdueTasks = activeTasks.filter(
      (task) => new Date(`${task.dueDate}T23:59:59`) < now,
    )
    const completedCurrent = currentTasks.filter(
      (task) => task.status === 'completed',
    ).length
    const completedPrevious = previousTasks.filter(
      (task) => task.status === 'completed',
    ).length
    const completionRate =
      currentTasks.length === 0
        ? 0
        : (completedCurrent / currentTasks.length) * 100
    const previousCompletionRate =
      previousTasks.length === 0
        ? 0
        : (completedPrevious / previousTasks.length) * 100
    const approvalCycleHours = currentApprovals
      .filter((approval) => approval.status !== 'pending')
      .map(
        (approval) =>
          (new Date(approval.updatedAt).getTime() -
            new Date(approval.createdAt).getTime()) /
          3_600_000,
      )
    const previousCycleHours = previousApprovals
      .filter((approval) => approval.status !== 'pending')
      .map(
        (approval) =>
          (new Date(approval.updatedAt).getTime() -
            new Date(approval.createdAt).getTime()) /
          3_600_000,
      )

    const bucketCount = Math.min(12, Math.ceil(periodDays[parsed.period] / 7))
    const bucketDays = periodDays[parsed.period] / bucketCount
    const trend = Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = addDays(currentStart, index * bucketDays)
      const bucketEnd =
        index === bucketCount - 1
          ? now
          : addDays(currentStart, (index + 1) * bucketDays)
      const inBucket = (value: string) => {
        const date = new Date(value)
        return date >= bucketStart && date < bucketEnd
      }
      return {
        approvalsDecided: scopedApprovals.filter(
          (approval) =>
            approval.status !== 'pending' && inBucket(approval.updatedAt),
        ).length,
        label: bucketStart.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        }),
        tasksCompleted: departmentTasks.filter(
          (task) => task.completedAt && inBucket(task.completedAt),
        ).length,
        tasksCreated: departmentTasks.filter((task) =>
          inBucket(task.createdAt),
        ).length,
      }
    })

    const taskStatusCounts = countBy(currentTasks, (task) => task.status)
    const approvalOutcomeCounts = countBy(
      currentApprovals,
      (approval) => approval.status,
    )
    const departmentCounts = countBy(
      allTasks.filter(
        (task) =>
          new Date(task.createdAt) >= currentStart &&
          new Date(task.createdAt) <= now &&
          task.status !== 'completed' &&
          task.status !== 'cancelled',
      ),
      (task) => task.departmentId,
    )

    return analyticsSnapshotSchema.parse({
      approvalOutcomes: ['pending', 'approved', 'rejected'].map((status) => ({
        id: status,
        label: status[0].toUpperCase() + status.slice(1),
        value: approvalOutcomeCounts.get(status) ?? 0,
      })),
      departmentWorkload: departments
        .map((department) => ({
          id: department.id,
          label: department.name,
          value: departmentCounts.get(department.id) ?? 0,
        }))
        .filter((item) => item.value > 0)
        .sort((left, right) => right.value - left.value),
      filters: parsed,
      generatedAt: now.toISOString(),
      metrics: [
        {
          description: 'Operational tasks not completed or cancelled.',
          format: 'number',
          id: 'active-tasks',
          label: 'Active tasks',
          trendChange: percentChange(
            currentTasks.length,
            previousTasks.length,
          ),
          trendDirection:
            currentTasks.length > previousTasks.length
              ? 'up'
              : currentTasks.length < previousTasks.length
                ? 'down'
                : 'flat',
          trendFavorable: currentTasks.length <= previousTasks.length,
          value: activeTasks.length,
        },
        {
          description: 'Share of active work beyond its committed due date.',
          format: 'percent',
          id: 'overdue-rate',
          label: 'Overdue rate',
          trendChange: activeTasks.length
            ? (overdueTasks.length / activeTasks.length) * 100
            : 0,
          trendDirection: overdueTasks.length > 0 ? 'up' : 'flat',
          trendFavorable: overdueTasks.length === 0,
          value: activeTasks.length
            ? (overdueTasks.length / activeTasks.length) * 100
            : 0,
        },
        {
          description: 'Tasks created in the period that are now completed.',
          format: 'percent',
          id: 'completion-rate',
          label: 'Task completion rate',
          trendChange: completionRate - previousCompletionRate,
          trendDirection:
            completionRate > previousCompletionRate
              ? 'up'
              : completionRate < previousCompletionRate
                ? 'down'
                : 'flat',
          trendFavorable: completionRate >= previousCompletionRate,
          value: completionRate,
        },
        {
          description: 'Average elapsed time for completed approval decisions.',
          format: 'duration',
          id: 'approval-cycle',
          label: 'Approval cycle time',
          trendChange:
            average(approvalCycleHours) - average(previousCycleHours),
          trendDirection:
            average(approvalCycleHours) >
            average(previousCycleHours)
              ? 'up'
              : average(approvalCycleHours) <
                  average(previousCycleHours)
                ? 'down'
                : 'flat',
          trendFavorable:
            average(approvalCycleHours) <= average(previousCycleHours),
          value: average(approvalCycleHours),
        },
      ],
      taskStatusDistribution: [
        'backlog',
        'in-progress',
        'blocked',
        'completed',
        'cancelled',
      ].map((status) => ({
        id: status,
        label: status.replace('-', ' '),
        value: taskStatusCounts.get(status) ?? 0,
      })),
      trend,
    })
  },
}
