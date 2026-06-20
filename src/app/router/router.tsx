import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { ModuleOverviewPage } from '../../pages/ModuleOverviewPage'
import { OverviewPage } from '../../pages/OverviewPage'
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
        element: <OverviewPage />,
      },
      {
        path: 'operations',
        element: <ModuleOverviewPage module="operations" />,
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
