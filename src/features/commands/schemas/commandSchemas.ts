import type { PermissionKey } from '../../access/schemas/accessSchemas'
import type { FeatureKey } from '../../settings/schemas/settingsSchemas'
import type { PlatformIconKey } from '../../../app/platform/platformRegistry'

export type CommandCategory = 'Create' | 'Navigate' | 'Search'

export interface CommandDefinition {
  category: CommandCategory
  description: string
  feature?: FeatureKey
  icon: PlatformIconKey | 'search'
  id: string
  keywords: string[]
  label: string
  permission?: PermissionKey
  to: string
}

export interface CommandSearchContext {
  enabledFeatures: FeatureKey[]
  permissionKeys: PermissionKey[]
}
