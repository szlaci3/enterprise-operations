import {
  acknowledgeDashboardAlert,
  getDashboardSnapshot,
} from '../../../mocks/dashboardApi'
import { browserStorage } from '../../../services/persistence/browserStorage'
import {
  acknowledgedAlertIdsSchema,
  dashboardSnapshotSchema,
  type DashboardPeriod,
  type DashboardSnapshot,
} from '../schemas/dashboardSchemas'

const acknowledgedAlertsKey = 'enterprise-operations-acknowledged-alerts'

function getAcknowledgedAlertIds(): string[] {
  const result = acknowledgedAlertIdsSchema.safeParse(
    browserStorage.read(acknowledgedAlertsKey),
  )

  return result.success ? result.data : []
}

export const dashboardService = {
  async acknowledgeAlert(alertId: string): Promise<void> {
    await acknowledgeDashboardAlert()
    const ids = new Set(getAcknowledgedAlertIds())
    ids.add(alertId)
    browserStorage.write(acknowledgedAlertsKey, [...ids])
  },

  async getSnapshot(period: DashboardPeriod): Promise<DashboardSnapshot> {
    const response = await getDashboardSnapshot(
      period,
      getAcknowledgedAlertIds(),
    )

    return dashboardSnapshotSchema.parse(response)
  },
}
