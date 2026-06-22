import {
  acknowledgeDashboardAlert,
  getDashboardSnapshot,
} from '../../../mocks/dashboardApi'
import { createVersionedStore } from '../../../services/persistence/versionedStore'
import {
  acknowledgedAlertIdsSchema,
  dashboardSnapshotSchema,
  type DashboardPeriod,
  type DashboardSnapshot,
} from '../schemas/dashboardSchemas'

const acknowledgedAlertsKey = 'enterprise-operations-acknowledged-alerts'

const acknowledgedAlertsStore = createVersionedStore({
  key: acknowledgedAlertsKey,
  schema: acknowledgedAlertIdsSchema,
  seed: () => [],
  version: 1,
})

export const dashboardService = {
  async acknowledgeAlert(alertId: string): Promise<void> {
    await acknowledgeDashboardAlert()
    const ids = new Set(acknowledgedAlertsStore.read())
    ids.add(alertId)
    acknowledgedAlertsStore.write([...ids])
  },

  async getSnapshot(period: DashboardPeriod): Promise<DashboardSnapshot> {
    const response = await getDashboardSnapshot(
      period,
      acknowledgedAlertsStore.read(),
    )

    return dashboardSnapshotSchema.parse(response)
  },
}
