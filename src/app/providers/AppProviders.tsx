import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from '../router/router'
import { AppErrorBoundary } from '../../shared/components/AppErrorBoundary'
import { settingsSnapshotOptions } from '../../features/settings/queries/settingsQueries'
import { currentSessionUserId } from '../session/currentSession'
import { ConnectivitySynchronizer } from '../../features/offline/components/ConnectivitySynchronizer'
import { RuntimeIncidentSynchronizer } from '../../features/diagnostics/components/RuntimeIncidentSynchronizer'

function ThemeSynchronizer({ children }: { children: ReactNode }) {
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const theme = settingsQuery.data?.personal.theme ?? 'system'
  const reducedMotion = settingsQuery.data?.personal.reducedMotion ?? false

  useEffect(() => {
    const root = document.documentElement
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const useDarkTheme =
        theme === 'dark' || (theme === 'system' && colorScheme.matches)
      root.classList.toggle('dark', useDarkTheme)
      root.classList.toggle('reduce-motion', reducedMotion)
    }

    applyTheme()
    colorScheme.addEventListener('change', applyTheme)

    return () => colorScheme.removeEventListener('change', applyTheme)
  }, [reducedMotion, theme])

  return children
}

export function AppProviders() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode: 'always',
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return (
    <AppErrorBoundary>
      <RuntimeIncidentSynchronizer>
        <QueryClientProvider client={queryClient}>
          <ConnectivitySynchronizer>
            <ThemeSynchronizer>
              <RouterProvider router={appRouter} />
            </ThemeSynchronizer>
          </ConnectivitySynchronizer>
        </QueryClientProvider>
      </RuntimeIncidentSynchronizer>
    </AppErrorBoundary>
  )
}
