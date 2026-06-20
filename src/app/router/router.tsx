import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { ModuleOverviewPage } from '../../pages/ModuleOverviewPage'
import { RouteErrorPage } from '../../pages/RouteErrorPage'
import { SettingsPage } from '../../pages/SettingsPage'

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
        path: 'operations',
        element: <ModuleOverviewPage module="operations" />,
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
        path: 'approvals',
        element: <ModuleOverviewPage module="approvals" />,
      },
      {
        path: 'reports',
        element: <ModuleOverviewPage module="reports" />,
      },
      {
        path: 'administration',
        element: <ModuleOverviewPage module="administration" />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <RouteErrorPage notFound />,
      },
    ],
  },
])
