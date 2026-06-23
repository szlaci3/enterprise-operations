import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SavedViewPresentation } from '../components/SavedViewToolbar'

export function useSavedViewUrlState({
  defaults,
  stateKeys,
}: {
  defaults: Record<string, string>
  stateKeys: string[]
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(
    () =>
      Object.fromEntries(
        stateKeys.map((key) => [
          key,
          searchParams.get(key) ?? defaults[key] ?? '',
        ]),
      ),
    [defaults, searchParams, stateKeys],
  )
  const presentation = useMemo<SavedViewPresentation>(() => {
    const columns = searchParams.get('columns')?.split(',').filter(Boolean) ?? []
    return {
      columns,
      density:
        searchParams.get('density') === 'compact' ? 'compact' : 'comfortable',
    }
  }, [searchParams])
  const hasActiveState = [...stateKeys, 'columns', 'density'].some((key) =>
    searchParams.has(key),
  )

  const apply = useCallback(
    (
      nextState: Record<string, string>,
      nextPresentation: SavedViewPresentation,
    ) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const key of stateKeys) {
            const value = nextState[key] ?? defaults[key] ?? ''
            if (!value || value === defaults[key]) next.delete(key)
            else next.set(key, value)
          }
          if (nextPresentation.density === 'comfortable') next.delete('density')
          else next.set('density', nextPresentation.density)
          if (nextPresentation.columns.length === 0) next.delete('columns')
          else next.set('columns', nextPresentation.columns.join(','))
          return next
        },
        { replace: true },
      )
    },
    [defaults, setSearchParams, stateKeys],
  )

  const setPresentation = useCallback(
    (nextPresentation: SavedViewPresentation) =>
      apply(state, nextPresentation),
    [apply, state],
  )

  return {
    apply,
    hasActiveState,
    presentation,
    setPresentation,
    state,
  }
}
