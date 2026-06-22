import type { TenantRole } from '../../tenancy/schemas/tenancySchemas'
import type {
  FeatureConfiguration,
  FeatureKey,
} from '../schemas/settingsSchemas'

export function featureIsAvailable(
  configurations: FeatureConfiguration[],
  key: FeatureKey,
  tenantRole: TenantRole,
  visited = new Set<FeatureKey>(),
): boolean {
  if (visited.has(key)) return false
  visited.add(key)
  const configuration = configurations.find((item) => item.key === key)
  if (!configuration || configuration.state === 'disabled') return false
  if (
    configuration.state === 'pilot' &&
    configuration.audience === 'administrators' &&
    tenantRole === 'member'
  ) {
    return false
  }
  return configuration.prerequisiteKeys.every((prerequisite) =>
    featureIsAvailable(
      configurations,
      prerequisite,
      tenantRole,
      new Set(visited),
    ),
  )
}
