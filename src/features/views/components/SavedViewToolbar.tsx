import { useQuery } from '@tanstack/react-query'
import { Eye, Save, Star, Trash2, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Button } from '../../../shared/components/Button'
import { useAuthorization } from '../../access/hooks/useAuthorization'
import {
  savedViewListOptions,
  useCreateSavedView,
  useRemoveSavedView,
  useSetDefaultSavedView,
} from '../queries/savedViewQueries'
import type {
  SavedViewDensity,
  SavedViewResource,
  SavedViewVisibility,
} from '../schemas/savedViewSchemas'

export interface SavedViewPresentation {
  columns: string[]
  density: SavedViewDensity
}

export function SavedViewToolbar({
  availableColumns = [],
  hasActiveState,
  onApply,
  onPresentationChange,
  presentation,
  resource,
  state,
}: {
  availableColumns?: { key: string; label: string }[]
  hasActiveState: boolean
  onApply: (
    state: Record<string, string>,
    presentation: SavedViewPresentation,
  ) => void
  onPresentationChange?: (presentation: SavedViewPresentation) => void
  presentation: SavedViewPresentation
  resource: SavedViewResource
  state: Record<string, string>
}) {
  const { can } = useAuthorization()
  const canShare = can('views.share')
  const viewsQuery = useQuery(
    savedViewListOptions(resource, currentSessionUserId),
  )
  const createView = useCreateSavedView(currentSessionUserId, canShare)
  const removeView = useRemoveSavedView(currentSessionUserId, canShare)
  const setDefault = useSetDefaultSavedView(currentSessionUserId)
  const [name, setName] = useState('')
  const [visibility, setVisibility] =
    useState<SavedViewVisibility>('personal')
  const [isDefault, setIsDefault] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const defaultApplied = useRef(false)

  useEffect(() => {
    if (defaultApplied.current || hasActiveState || !viewsQuery.data) return
    const defaultView = viewsQuery.data.find((view) => view.isDefault)
    if (defaultView) {
      defaultApplied.current = true
      onApply(defaultView.state, {
        columns: defaultView.columns,
        density: defaultView.density,
      })
    }
  }, [hasActiveState, onApply, viewsQuery.data])

  const save = async () => {
    if (!name.trim()) return
    await createView.mutateAsync({
      columns: presentation.columns,
      density: presentation.density,
      isDefault,
      name,
      resource,
      state,
      visibility,
    })
    setName('')
    setIsDefault(false)
    setIsSaving(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <Eye aria-hidden="true" className="size-4 text-slate-400" />
        <select
          aria-label="Apply saved view"
          className="h-9 min-w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          onChange={(event) => {
            const view = viewsQuery.data?.find(
              (item) => item.id === event.target.value,
            )
            if (view) {
              onApply(view.state, {
                columns: view.columns,
                density: view.density,
              })
            }
            event.target.value = ''
          }}
          value=""
        >
          <option value="">Saved views</option>
          {(viewsQuery.data ?? []).map((view) => (
            <option key={view.id} value={view.id}>
              {view.isDefault ? '★ ' : ''}
              {view.name}
              {view.visibility === 'shared' ? ' · shared' : ''}
            </option>
          ))}
        </select>

        {onPresentationChange ? (
          <select
            aria-label="View density"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) =>
              onPresentationChange({
                ...presentation,
                density: event.target.value as SavedViewDensity,
              })
            }
            value={presentation.density}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        ) : null}

        {availableColumns.length > 0 && onPresentationChange ? (
          <details className="relative">
            <summary className="flex h-9 cursor-pointer list-none items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700">
              Columns
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-56 space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {availableColumns.map((column) => (
                <label className="flex items-center gap-2 text-sm" key={column.key}>
                  <input
                    checked={presentation.columns.includes(column.key)}
                    onChange={(event) => {
                      const columns = event.target.checked
                        ? [...presentation.columns, column.key]
                        : presentation.columns.filter(
                            (item) => item !== column.key,
                          )
                      if (columns.length > 0) {
                        onPresentationChange({ ...presentation, columns })
                      }
                    }}
                    type="checkbox"
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </details>
        ) : null}

        <Button
          className="ml-auto min-h-9 px-3 py-1.5"
          onClick={() => setIsSaving((value) => !value)}
          variant="secondary"
        >
          <Save aria-hidden="true" className="size-4" />
          Save view
        </Button>
      </div>

      {isSaving ? (
        <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            aria-label="Saved view name"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) => setName(event.target.value)}
            placeholder="View name"
            value={name}
          />
          <select
            aria-label="Saved view visibility"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            onChange={(event) =>
              setVisibility(event.target.value as SavedViewVisibility)
            }
            value={visibility}
          >
            <option value="personal">Personal</option>
            {canShare ? <option value="shared">Shared</option> : null}
          </select>
          <label className="flex h-9 items-center gap-2 text-sm">
            <input
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
              type="checkbox"
            />
            Default
          </label>
          <Button
            className="min-h-9 py-1.5"
            disabled={!name.trim() || createView.isPending}
            onClick={save}
          >
            Save
          </Button>
          {createView.error ? (
            <p className="text-xs text-red-600 sm:col-span-4">
              {createView.error.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {(viewsQuery.data?.length ?? 0) > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {viewsQuery.data?.map((view) => (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800"
              key={view.id}
            >
              {view.visibility === 'shared' ? (
                <Users aria-hidden="true" className="size-3" />
              ) : null}
              {view.name}
              {view.ownerUserId === currentSessionUserId ? (
                <button
                  aria-label={`Make ${view.name} the default view`}
                  className={
                    view.isDefault ? 'text-amber-500' : 'text-slate-400'
                  }
                  onClick={() =>
                    setDefault.mutate({ id: view.id, resource })
                  }
                  type="button"
                >
                  <Star
                    aria-hidden="true"
                    className="size-3.5"
                    fill={view.isDefault ? 'currentColor' : 'none'}
                  />
                </button>
              ) : null}
              {(view.ownerUserId === currentSessionUserId || canShare) ? (
                <button
                  aria-label={`Delete saved view ${view.name}`}
                  className="text-slate-400 hover:text-red-600"
                  onClick={() =>
                    removeView.mutate({ id: view.id, resource })
                  }
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
