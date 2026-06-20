import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from '../router/router'
import { AppErrorBoundary } from '../../shared/components/AppErrorBoundary'
import { useUiStore } from '../../store/uiStore'

function ThemeSynchronizer({ children }: { children: ReactNode }) {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const useDarkTheme =
        theme === 'dark' || (theme === 'system' && colorScheme.matches)
      root.classList.toggle('dark', useDarkTheme)
    }

    applyTheme()
    colorScheme.addEventListener('change', applyTheme)

    return () => colorScheme.removeEventListener('change', applyTheme)
  }, [theme])

  return children
}

export function AppProviders() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
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
      <QueryClientProvider client={queryClient}>
        <ThemeSynchronizer>
          <RouterProvider router={appRouter} />
        </ThemeSynchronizer>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}
