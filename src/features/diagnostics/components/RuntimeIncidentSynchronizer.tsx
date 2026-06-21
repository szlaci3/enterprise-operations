import { useEffect, type ReactNode } from 'react'

async function record(error: unknown, source: 'unhandled-error' | 'unhandled-rejection') {
  try {
    const { diagnosticsService } = await import(
      '../services/diagnosticsService'
    )
    await diagnosticsService.recordIncident({ error, source })
  } catch (diagnosticError) {
    console.warn('Could not record runtime incident', diagnosticError)
  }
}

export function RuntimeIncidentSynchronizer({
  children,
}: {
  children: ReactNode
}) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      void record(event.error ?? event.message, 'unhandled-error')
    }
    const handleRejection = (event: PromiseRejectionEvent) => {
      void record(event.reason, 'unhandled-rejection')
    }
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return children
}
