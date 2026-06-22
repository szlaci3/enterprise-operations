import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useUrlState<T extends string>({
  defaultValue,
  key,
  values,
}: {
  defaultValue: T
  key: string
  values?: readonly T[]
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const candidate = searchParams.get(key)
  const value =
    candidate !== null && (!values || values.includes(candidate as T))
      ? (candidate as T)
      : defaultValue

  const setValue = useCallback(
    (nextValue: T) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (nextValue === defaultValue || nextValue === '') {
            next.delete(key)
          } else {
            next.set(key, nextValue)
          }
          return next
        },
        { replace: true },
      )
    },
    [defaultValue, key, setSearchParams],
  )

  return [value, setValue] as const
}
