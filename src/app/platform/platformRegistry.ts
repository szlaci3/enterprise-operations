import type { PermissionKey } from '../../features/access/schemas/accessSchemas'
import type { FeatureKey } from '../../features/settings/schemas/settingsSchemas'

export type PlatformIconKey =
  | 'analytics'
  | 'approval'
  | 'audit'
  | 'department'
  | 'diagnostics'
  | 'document'
  | 'overview'
  | 'report'
  | 'security'
  | 'settings'
  | 'task'
  | 'user'
  | 'workflow'

export type PlatformModuleKey =
  | 'overview'
  | 'analytics'
  | 'tasks'
  | 'workflows'
  | 'approvals'
  | 'reports'
  | 'documents'
  | 'departments'
  | 'users'
  | 'access'
  | 'audit'
  | 'diagnostics'
  | 'settings'

export interface PlatformModuleDefinition {
  create?: {
    description: string
    keywords: string[]
    label: string
    permission: PermissionKey
    to: string
  }
  description: string
  feature?: FeatureKey
  icon: PlatformIconKey
  key: PlatformModuleKey
  keywords: string[]
  label: string
  navigationGroup: 'primary' | 'platform'
  route: string
  viewPermission?: PermissionKey
}

export const platformModules: readonly PlatformModuleDefinition[] = [
  {
    description: 'Open the executive operational overview.',
    icon: 'overview',
    key: 'overview',
    keywords: ['dashboard', 'home', 'kpi'],
    label: 'Overview',
    navigationGroup: 'primary',
    route: '/overview',
    viewPermission: 'dashboard.view',
  },
  {
    description: 'Explore operational trends and distributions.',
    feature: 'analytics',
    icon: 'analytics',
    key: 'analytics',
    keywords: ['metrics', 'trends', 'charts'],
    label: 'Analytics',
    navigationGroup: 'primary',
    route: '/analytics',
    viewPermission: 'analytics.view',
  },
  {
    create: {
      description: 'Create and assign a new operational task.',
      keywords: ['add', 'new', 'work'],
      label: 'Create task',
      permission: 'tasks.manage',
      to: '/tasks/new',
    },
    description: 'Open assigned and department operational work.',
    icon: 'task',
    key: 'tasks',
    keywords: ['work', 'queue', 'board'],
    label: 'Tasks',
    navigationGroup: 'primary',
    route: '/tasks',
    viewPermission: 'tasks.view',
  },
  {
    create: {
      description: 'Design a new versioned workflow definition.',
      keywords: ['new', 'process', 'designer'],
      label: 'Create workflow',
      permission: 'workflows.manage',
      to: '/workflows/new',
    },
    description: 'Browse governed process definitions.',
    icon: 'workflow',
    key: 'workflows',
    keywords: ['process', 'state', 'transition'],
    label: 'Workflows',
    navigationGroup: 'primary',
    route: '/workflows',
    viewPermission: 'workflows.view',
  },
  {
    create: {
      description: 'Submit a governed request for approval.',
      keywords: ['new', 'request', 'decision'],
      label: 'Create approval request',
      permission: 'approvals.review',
      to: '/approvals/new',
    },
    description: 'Review assigned and submitted decisions.',
    icon: 'approval',
    key: 'approvals',
    keywords: ['review', 'decision', 'request'],
    label: 'Approvals',
    navigationGroup: 'primary',
    route: '/approvals',
    viewPermission: 'approvals.review',
  },
  {
    create: {
      description: 'Configure a reusable operational report.',
      keywords: ['new', 'builder', 'export'],
      label: 'Create report',
      permission: 'reports.manage',
      to: '/reports/new',
    },
    description: 'Execute and manage saved operational reports.',
    icon: 'report',
    key: 'reports',
    keywords: ['business intelligence', 'export', 'table'],
    label: 'Reports',
    navigationGroup: 'primary',
    route: '/reports',
    viewPermission: 'reports.view',
  },
  {
    create: {
      description: 'Register a new controlled document.',
      keywords: ['upload', 'file', 'attachment'],
      label: 'Add document',
      permission: 'documents.manage',
      to: '/documents/new',
    },
    description: 'Browse controlled files and immutable versions.',
    feature: 'documents',
    icon: 'document',
    key: 'documents',
    keywords: ['files', 'attachments', 'versions'],
    label: 'Documents',
    navigationGroup: 'primary',
    route: '/documents',
    viewPermission: 'documents.view',
  },
  {
    create: {
      description: 'Add an accountable organization unit.',
      keywords: ['new', 'organization', 'unit'],
      label: 'Create department',
      permission: 'departments.manage',
      to: '/departments/new',
    },
    description: 'Manage organization structure and ownership.',
    icon: 'department',
    key: 'departments',
    keywords: ['organization', 'unit', 'owner'],
    label: 'Departments',
    navigationGroup: 'platform',
    route: '/departments',
    viewPermission: 'departments.view',
  },
  {
    create: {
      description: 'Add a managed workforce identity.',
      keywords: ['new', 'person', 'identity'],
      label: 'Create user',
      permission: 'users.manage',
      to: '/users/new',
    },
    description: 'Browse managed workforce identities.',
    icon: 'user',
    key: 'users',
    keywords: ['people', 'identity', 'directory'],
    label: 'Users',
    navigationGroup: 'platform',
    route: '/users',
    viewPermission: 'users.view',
  },
  {
    description: 'Review roles, permissions, and assignments.',
    icon: 'security',
    key: 'access',
    keywords: ['roles', 'permissions', 'rbac'],
    label: 'Access control',
    navigationGroup: 'platform',
    route: '/access',
    viewPermission: 'security.manage',
  },
  {
    description: 'Inspect immutable cross-domain change records.',
    icon: 'audit',
    key: 'audit',
    keywords: ['history', 'trace', 'changes'],
    label: 'Audit trail',
    navigationGroup: 'platform',
    route: '/audit',
    viewPermission: 'audit.view',
  },
  {
    description:
      'Inspect runtime, persistence, synchronization, and query health.',
    icon: 'diagnostics',
    key: 'diagnostics',
    keywords: ['health', 'monitoring', 'recovery', 'system'],
    label: 'System health',
    navigationGroup: 'platform',
    route: '/diagnostics',
    viewPermission: 'diagnostics.view',
  },
  {
    description: 'Manage workspace preferences and platform policy.',
    icon: 'settings',
    key: 'settings',
    keywords: ['preferences', 'configuration', 'policy'],
    label: 'Settings',
    navigationGroup: 'platform',
    route: '/settings',
    viewPermission: 'settings.view',
  },
]

export function getPlatformModule(key: PlatformModuleKey) {
  const definition = platformModules.find((module) => module.key === key)
  if (!definition) {
    throw new Error(`Unknown platform module "${key}".`)
  }
  return definition
}
