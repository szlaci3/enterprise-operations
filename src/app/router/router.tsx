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
