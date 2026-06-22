import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { RouteErrorPage } from '../../pages/RouteErrorPage'
import type { PlatformModuleKey } from '../platform/platformRegistry'

const moduleBoundary = (
  module: PlatformModuleKey,
  permission: 'create' | 'view' = 'view',
) => async () => {
  const { PlatformModuleBoundary } = await import(
    '../platform/PlatformModuleBoundary'
  )
  return {
    Component: () => (
      <PlatformModuleBoundary module={module} permission={permission} />
    ),
  }
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />,
      },
      {
        path: 'overview',
        lazy: moduleBoundary('overview'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { OverviewPage } = await import('../../pages/OverviewPage')
              return { Component: OverviewPage }
            },
          },
        ],
      },
      {
        path: 'analytics',
        lazy: moduleBoundary('analytics'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { AnalyticsPage } = await import(
                '../../pages/AnalyticsPage'
              )
              return { Component: AnalyticsPage }
            },
          },
        ],
      },
      {
        path: 'search',
        lazy: async () => {
          const { SearchPage } = await import('../../pages/SearchPage')
          return { Component: SearchPage }
        },
      },
      {
        path: 'operations',
        element: <Navigate to="/tasks" replace />,
      },
      {
        path: 'tasks',
        lazy: moduleBoundary('tasks'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { TasksPage } = await import('../../pages/TasksPage')
              return { Component: TasksPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { CreateTaskPage } = await import(
                '../../pages/TaskEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="tasks" permission="create">
                    <CreateTaskPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
          {
            path: ':taskId',
            lazy: async () => {
              const { TaskDetailPage } = await import(
                '../../pages/TaskDetailPage'
              )
              return { Component: TaskDetailPage }
            },
          },
          {
            path: ':taskId/edit',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { EditTaskPage } = await import(
                '../../pages/TaskEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="tasks" permission="create">
                    <EditTaskPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
        ],
      },
      {
        path: 'departments',
        lazy: moduleBoundary('departments'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { DepartmentsPage } = await import(
                '../../pages/DepartmentsPage'
              )
              return { Component: DepartmentsPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { CreateDepartmentPage } = await import(
                '../../pages/DepartmentEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary
                    module="departments"
                    permission="create"
                  >
                    <CreateDepartmentPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
          {
            path: ':departmentId',
            lazy: async () => {
              const { DepartmentDetailPage } = await import(
                '../../pages/DepartmentDetailPage'
              )
              return { Component: DepartmentDetailPage }
            },
          },
          {
            path: ':departmentId/edit',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { EditDepartmentPage } = await import(
                '../../pages/DepartmentEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary
                    module="departments"
                    permission="create"
                  >
                    <EditDepartmentPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
        ],
      },
      {
        path: 'users',
        lazy: moduleBoundary('users'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { UsersPage } = await import('../../pages/UsersPage')
              return { Component: UsersPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { CreateUserPage } = await import(
                '../../pages/UserEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="users" permission="create">
                    <CreateUserPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
          {
            path: ':userId',
            lazy: async () => {
              const { UserProfilePage } = await import(
                '../../pages/UserProfilePage'
              )
              return { Component: UserProfilePage }
            },
          },
          {
            path: ':userId/edit',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { EditUserPage } = await import(
                '../../pages/UserEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="users" permission="create">
                    <EditUserPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
        ],
      },
      {
        path: 'access',
        lazy: moduleBoundary('access'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { AccessPage } = await import('../../pages/AccessPage')
              return { Component: AccessPage }
            },
          },
          {
            path: 'roles/new',
            lazy: async () => {
              const { CreateRolePage } = await import(
                '../../pages/RoleEditorPage'
              )
              return { Component: CreateRolePage }
            },
          },
          {
            path: 'roles/:roleId',
            lazy: async () => {
              const { RoleDetailPage } = await import(
                '../../pages/RoleDetailPage'
              )
              return { Component: RoleDetailPage }
            },
          },
          {
            path: 'roles/:roleId/edit',
            lazy: async () => {
              const { EditRolePage } = await import(
                '../../pages/RoleEditorPage'
              )
              return { Component: EditRolePage }
            },
          },
        ],
      },
      {
        path: 'workflows',
        lazy: moduleBoundary('workflows'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { WorkflowsPage } = await import(
                '../../pages/WorkflowsPage'
              )
              return { Component: WorkflowsPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { CreateWorkflowPage } = await import(
                '../../pages/WorkflowEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary
                    module="workflows"
                    permission="create"
                  >
                    <CreateWorkflowPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
          {
            path: ':workflowId',
            lazy: async () => {
              const { WorkflowDetailPage } = await import(
                '../../pages/WorkflowDetailPage'
              )
              return { Component: WorkflowDetailPage }
            },
          },
          {
            path: ':workflowId/edit',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { EditWorkflowPage } = await import(
                '../../pages/WorkflowEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary
                    module="workflows"
                    permission="create"
                  >
                    <EditWorkflowPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
        ],
      },
      {
        path: 'approvals',
        lazy: moduleBoundary('approvals'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { ApprovalsPage } = await import(
                '../../pages/ApprovalsPage'
              )
              return { Component: ApprovalsPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { ApprovalRequestEditorPage } = await import(
                '../../pages/ApprovalRequestEditorPage'
              )
              return { Component: ApprovalRequestEditorPage }
            },
          },
          {
            path: ':approvalId',
            lazy: async () => {
              const { ApprovalDetailPage } = await import(
                '../../pages/ApprovalDetailPage'
              )
              return { Component: ApprovalDetailPage }
            },
          },
        ],
      },
      {
        path: 'reports',
        lazy: moduleBoundary('reports'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { ReportsPage } = await import('../../pages/ReportsPage')
              return { Component: ReportsPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { CreateReportPage } = await import(
                '../../pages/ReportEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="reports" permission="create">
                    <CreateReportPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
          {
            path: ':reportId',
            lazy: async () => {
              const { ReportDetailPage } = await import(
                '../../pages/ReportDetailPage'
              )
              return { Component: ReportDetailPage }
            },
          },
          {
            path: ':reportId/edit',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { EditReportPage } = await import(
                '../../pages/ReportEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="reports" permission="create">
                    <EditReportPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
        ],
      },
      {
        path: 'documents',
        lazy: moduleBoundary('documents'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { DocumentsPage } = await import(
                '../../pages/DocumentsPage'
              )
              return { Component: DocumentsPage }
            },
          },
          {
            path: 'new',
            lazy: async () => {
              const { PlatformModuleBoundary } = await import(
                '../platform/PlatformModuleBoundary'
              )
              const { DocumentEditorPage } = await import(
                '../../pages/DocumentEditorPage'
              )
              return {
                Component: () => (
                  <PlatformModuleBoundary module="documents" permission="create">
                    <DocumentEditorPage />
                  </PlatformModuleBoundary>
                ),
              }
            },
          },
          {
            path: ':documentId',
            lazy: async () => {
              const { DocumentDetailPage } = await import(
                '../../pages/DocumentDetailPage'
              )
              return { Component: DocumentDetailPage }
            },
          },
        ],
      },
      {
        path: 'notifications',
        lazy: async () => {
          const { NotificationsPage } = await import(
            '../../pages/NotificationsPage'
          )
          return { Component: NotificationsPage }
        },
      },
      {
        path: 'administration',
        element: <Navigate to="/diagnostics" replace />,
      },
      {
        path: 'diagnostics',
        lazy: moduleBoundary('diagnostics'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { DiagnosticsPage } = await import(
                '../../pages/DiagnosticsPage'
              )
              return { Component: DiagnosticsPage }
            },
          },
        ],
      },
      {
        path: 'audit',
        lazy: moduleBoundary('audit'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { AuditPage } = await import('../../pages/AuditPage')
              return { Component: AuditPage }
            },
          },
        ],
      },
      {
        path: 'settings',
        lazy: moduleBoundary('settings'),
        children: [
          {
            index: true,
            lazy: async () => {
              const { SettingsPage } = await import(
                '../../pages/SettingsPage'
              )
              return { Component: SettingsPage }
            },
          },
        ],
      },
      {
        path: '*',
        element: <RouteErrorPage notFound />,
      },
    ],
  },
])
