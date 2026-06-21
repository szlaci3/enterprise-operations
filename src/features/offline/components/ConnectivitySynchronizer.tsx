import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, type ReactNode } from 'react'
import {
  offlineSnapshotOptions,
  useSynchronizeOfflineQueue,
} from '../queries/offlineQueries'
import { useConnectivityStore } from '../store/connectivityStore'

export function ConnectivitySynchronizer({
  children,
}: {
  children: ReactNode
}) {
  const browserOnline = useConnectivityStore((state) => state.browserOnline)
  const forcedOffline = useConnectivityStore((state) => state.forcedOffline)
  const setBrowserOnline = useConnectivityStore(
    (state) => state.setBrowserOnline,
  )
  const snapshotQuery = useQuery(offlineSnapshotOptions())
  const synchronize = useSynchronizeOfflineQueue()
  const online = browserOnline && !forcedOffline
  const reconnectHandled = useRef(false)

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true)
    const handleOffline = () => setBrowserOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setBrowserOnline])

  useEffect(() => {
    if (!online) {
      reconnectHandled.current = false
      return
    }
    if (
      !reconnectHandled.current &&
      (snapshotQuery.data?.pendingCount || snapshotQuery.data?.failedCount)
    ) {
      reconnectHandled.current = true
      synchronize.mutate()
    }
  }, [
    online,
    snapshotQuery.data?.failedCount,
    snapshotQuery.data?.pendingCount,
    synchronize,
  ])

  return children
}
