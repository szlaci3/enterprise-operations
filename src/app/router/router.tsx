import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { RouteErrorPage } from '../../pages/RouteErrorPage'

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
        lazy: async () => {
          const { OverviewPage } = await import('../../pages/OverviewPage')
          return { Component: OverviewPage }
        },
      },
      {
        path: 'analytics',
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="analytics.view" />
            ),
          }
        },
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
        path: 'operations',
        element: <Navigate to="/tasks" replace />,
      },
      {
        path: 'tasks',
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="tasks.view" />
            ),
          }
        },
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
              const { AuthorizationBoundary } = await import(
                '../../features/access/components/AuthorizationBoundary'
              )
              const { CreateTaskPage } = await import(
                '../../pages/TaskEditorPage'
              )
              return {
                Component: () => (
                  <AuthorizationBoundary permission="tasks.manage">
                    <CreateTaskPage />
                  </AuthorizationBoundary>
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
              const { AuthorizationBoundary } = await import(
                '../../features/access/components/AuthorizationBoundary'
              )
              const { EditTaskPage } = await import(
                '../../pages/TaskEditorPage'
              )
              return {
                Component: () => (
                  <AuthorizationBoundary permission="tasks.manage">
                    <EditTaskPage />
                  </AuthorizationBoundary>
                ),
              }
            },
          },
        ],
      },
      {
        path: 'departments',
        lazy: async () => {
          const { DepartmentsPage } = await import(
            '../../pages/DepartmentsPage'
          )
          return { Component: DepartmentsPage }
        },
      },
      {
        path: 'departments/new',
        lazy: async () => {
          const { CreateDepartmentPage } = await import(
            '../../pages/DepartmentEditorPage'
          )
          return { Component: CreateDepartmentPage }
        },
      },
      {
        path: 'departments/:departmentId',
        lazy: async () => {
          const { DepartmentDetailPage } = await import(
            '../../pages/DepartmentDetailPage'
          )
          return { Component: DepartmentDetailPage }
        },
      },
      {
        path: 'departments/:departmentId/edit',
        lazy: async () => {
          const { EditDepartmentPage } = await import(
            '../../pages/DepartmentEditorPage'
          )
          return { Component: EditDepartmentPage }
        },
      },
      {
        path: 'users',
        lazy: async () => {
          const { UsersPage } = await import('../../pages/UsersPage')
          return { Component: UsersPage }
        },
      },
      {
        path: 'users/new',
        lazy: async () => {
          const { CreateUserPage } = await import(
            '../../pages/UserEditorPage'
          )
          return { Component: CreateUserPage }
        },
      },
      {
        path: 'users/:userId',
        lazy: async () => {
          const { UserProfilePage } = await import(
            '../../pages/UserProfilePage'
          )
          return { Component: UserProfilePage }
        },
      },
      {
        path: 'users/:userId/edit',
        lazy: async () => {
          const { EditUserPage } = await import('../../pages/UserEditorPage')
          return { Component: EditUserPage }
        },
      },
      {
        path: 'access',
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="security.manage" />
            ),
          }
        },
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
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="workflows.view" />
            ),
          }
        },
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
              const { CreateWorkflowPage } = await import(
                '../../pages/WorkflowEditorPage'
              )
              return { Component: CreateWorkflowPage }
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
              const { EditWorkflowPage } = await import(
                '../../pages/WorkflowEditorPage'
              )
              return { Component: EditWorkflowPage }
            },
          },
        ],
      },
      {
        path: 'approvals',
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="approvals.review" />
            ),
          }
        },
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
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="reports.view" />
            ),
          }
        },
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
              const { AuthorizationBoundary } = await import(
                '../../features/access/components/AuthorizationBoundary'
              )
              const { CreateReportPage } = await import(
                '../../pages/ReportEditorPage'
              )
              return {
                Component: () => (
                  <AuthorizationBoundary permission="reports.manage">
                    <CreateReportPage />
                  </AuthorizationBoundary>
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
              const { AuthorizationBoundary } = await import(
                '../../features/access/components/AuthorizationBoundary'
              )
              const { EditReportPage } = await import(
                '../../pages/ReportEditorPage'
              )
              return {
                Component: () => (
                  <AuthorizationBoundary permission="reports.manage">
                    <EditReportPage />
                  </AuthorizationBoundary>
                ),
              }
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
        element: <Navigate to="/audit" replace />,
      },
      {
        path: 'audit',
        lazy: async () => {
          const { AuthorizationBoundary } = await import(
            '../../features/access/components/AuthorizationBoundary'
          )
          return {
            Component: () => (
              <AuthorizationBoundary permission="audit.view" />
            ),
          }
        },
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
        lazy: async () => {
          const { SettingsPage } = await import('../../pages/SettingsPage')
          return { Component: SettingsPage }
        },
      },
      {
        path: '*',
        element: <RouteErrorPage notFound />,
      },
    ],
  },
])
