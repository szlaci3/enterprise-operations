import { useQuery } from '@tanstack/react-query'
import {
  Cloud,
  CloudOff,
  RefreshCw,
  RotateCcw,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../shared/components/Button'
import {
  offlineSnapshotOptions,
  useDiscardOfflineOperation,
  useResolveOfflineWithLocal,
  useSynchronizeOfflineQueue,
} from '../queries/offlineQueries'
import { useConnectivityStore } from '../store/connectivityStore'

export function SyncStatus() {
  const browserOnline = useConnectivityStore((state) => state.browserOnline)
  const forcedOffline = useConnectivityStore((state) => state.forcedOffline)
  const setForcedOffline = useConnectivityStore(
    (state) => state.setForcedOffline,
  )
  const snapshotQuery = useQuery(offlineSnapshotOptions())
  const synchronize = useSynchronizeOfflineQueue()
  const discard = useDiscardOfflineOperation()
  const resolveLocal = useResolveOfflineWithLocal()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const online = browserOnline && !forcedOffline
  const snapshot = snapshotQuery.data
  const queuedCount =
    (snapshot?.pendingCount ?? 0) +
    (snapshot?.failedCount ?? 0) +
    (snapshot?.conflictCount ?? 0)

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (
        panelRef.current &&
        event.target instanceof Node &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const tone =
    (snapshot?.conflictCount ?? 0) > 0
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
      : !online || queuedCount > 0
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'

  return (
    <div className="relative" ref={panelRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {online ? (
          <Cloud aria-hidden="true" className="size-3.5" />
        ) : (
          <CloudOff aria-hidden="true" className="size-3.5" />
        )}
        <span className="hidden sm:inline">
          {!online
            ? 'Offline'
            : snapshot?.conflictCount
              ? `${snapshot.conflictCount} conflict`
              : queuedCount
                ? `${queuedCount} syncing`
                : 'Synchronized'}
        </span>
      </button>

      {isOpen ? (
        <div
          aria-label="Synchronization status"
          className="absolute right-0 top-12 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Synchronization</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Task status updates remain available while disconnected.
              </p>
            </div>
            <button
              aria-label="Close synchronization status"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <input
              checked={forcedOffline}
              className="mt-1 size-4 accent-brand-600"
              onChange={(event) => setForcedOffline(event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold">
                Work offline
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Pause synchronization to test or continue during poor
                connectivity.
              </span>
            </span>
          </label>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
              <p className="text-lg font-semibold">
                {snapshot?.pendingCount ?? 0}
              </p>
              <p className="text-[10px] uppercase text-slate-400">Pending</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
              <p className="text-lg font-semibold">
                {snapshot?.failedCount ?? 0}
              </p>
              <p className="text-[10px] uppercase text-slate-400">Retry</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
              <p className="text-lg font-semibold text-red-600">
                {snapshot?.conflictCount ?? 0}
              </p>
              <p className="text-[10px] uppercase text-slate-400">Conflict</p>
            </div>
          </div>

          {(snapshot?.operations.length ?? 0) > 0 ? (
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {snapshot?.operations.map((operation) => (
                <div
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  key={operation.id}
                >
                  <div className="flex items-start gap-2">
                    {operation.state === 'conflict' ? (
                      <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-red-500"
                      />
                    ) : (
                      <RefreshCw
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-amber-500"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {operation.optimisticTask.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Status → {operation.optimisticTask.status.replace('-', ' ')}
                      </p>
                      {operation.errorMessage ? (
                        <p className="mt-1 text-xs text-red-600">
                          {operation.errorMessage}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {operation.state === 'conflict' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        className="px-2 text-xs"
                        disabled={discard.isPending}
                        onClick={() => discard.mutate(operation.id)}
                        variant="secondary"
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                        Use remote
                      </Button>
                      <Button
                        className="px-2 text-xs"
                        disabled={!online || resolveLocal.isPending}
                        onClick={() => resolveLocal.mutate(operation.id)}
                      >
                        <RotateCcw aria-hidden="true" className="size-3.5" />
                        Keep mine
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500 dark:bg-slate-800">
              All changes are synchronized.
            </p>
          )}

          <Button
            className="mt-4 w-full"
            disabled={!online || synchronize.isPending || queuedCount === 0}
            onClick={() => synchronize.mutate()}
            variant="secondary"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {synchronize.isPending ? 'Synchronizing...' : 'Synchronize now'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
