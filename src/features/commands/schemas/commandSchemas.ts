import type { PermissionKey } from '../../access/schemas/accessSchemas'
import type { FeatureKey } from '../../settings/schemas/settingsSchemas'

export type CommandCategory = 'Create' | 'Navigate' | 'Search'

export interface CommandDefinition {
  category: CommandCategory
  description: string
  feature?: FeatureKey
  icon:
    | 'analytics'
    | 'approval'
    | 'audit'
    | 'department'
    | 'document'
    | 'overview'
    | 'report'
    | 'search'
    | 'security'
    | 'settings'
    | 'task'
    | 'user'
    | 'workflow'
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
