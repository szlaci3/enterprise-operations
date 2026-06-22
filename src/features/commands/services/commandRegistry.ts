import type { CommandDefinition } from '../schemas/commandSchemas'
import { platformModules } from '../../../app/platform/platformRegistry'

const moduleCommands: CommandDefinition[] = platformModules.flatMap((module) => [
  {
    category: 'Navigate',
    description: module.description,
    feature: module.feature,
    icon: module.icon,
    id: `navigate-${module.key}`,
    keywords: [...module.keywords],
    label: `Go to ${module.label.toLowerCase()}`,
    permission: module.viewPermission,
    to: module.route,
  },
  ...(module.create
    ? [
        {
          category: 'Create' as const,
          description: module.create.description,
          feature: module.feature,
          icon: module.icon,
          id: `create-${module.key}`,
          keywords: [...module.create.keywords],
          label: module.create.label,
          permission: module.create.permission,
          to: module.create.to,
        },
      ]
    : []),
])

export const commandRegistry: CommandDefinition[] = [
  ...moduleCommands,
  {
    category: 'Search',
    description: 'Open the full cross-entity search workspace.',
    icon: 'search',
    id: 'navigate-search',
    keywords: ['find', 'discover', 'saved searches'],
    label: 'Open global search',
    to: '/search',
  },
]
