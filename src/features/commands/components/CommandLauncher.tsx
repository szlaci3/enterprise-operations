import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  Building2,
  CheckSquare2,
  ClipboardCheck,
  Search,
  UserRound,
  Waypoints,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { useAuthorization } from '../../access/hooks/useAuthorization'
import { settingsSnapshotOptions } from '../../settings/queries/settingsQueries'
import { commandSearchOptions } from '../queries/commandQueries'
import type { CommandDefinition } from '../schemas/commandSchemas'
import { commandRegistry } from '../services/commandRegistry'
import { platformIconByKey } from '../../../app/platform/platformIcons'

const iconByKey: Record<CommandDefinition['icon'], LucideIcon> = {
  ...platformIconByKey,
  search: Search,
}

interface PaletteItem {
  category: string
  description: string
  icon: LucideIcon
  id: string
  label: string
  to: string
}

function commandScore(command: CommandDefinition, query: string) {
  if (!query) return command.category === 'Create' ? 2 : 1
  const normalized = query.toLowerCase()
  const label = command.label.toLowerCase()
  if (label === normalized) return 100
  if (label.startsWith(normalized)) return 80
  if (label.includes(normalized)) return 60
  if (command.keywords.some((keyword) => keyword.includes(normalized))) return 40
  if (command.description.toLowerCase().includes(normalized)) return 20
  return 0
}

export function CommandLauncher() {
  const navigate = useNavigate()
  const { accessQuery } = useAuthorization()
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const permissionKeys = useMemo(
    () => accessQuery.data?.permissionKeys ?? [],
    [accessQuery.data?.permissionKeys],
  )
  const enabledFeatures = useMemo(
    () =>
      (settingsQuery.data?.features ?? [])
        .filter((feature) => feature.state !== 'disabled')
        .map((feature) => feature.key),
    [settingsQuery.data?.features],
  )
  const normalizedQuery = query.trim()
  const entitySearchQuery = useQuery({
    ...commandSearchOptions(normalizedQuery, permissionKeys),
    enabled:
      isOpen &&
      normalizedQuery.length >= 2 &&
      !accessQuery.isPending &&
      !settingsQuery.isPending,
  })

  const items = useMemo<PaletteItem[]>(() => {
    const commands = commandRegistry
      .filter(
        (command) =>
          (!command.permission ||
            permissionKeys.includes(command.permission)) &&
          (!command.feature || enabledFeatures.includes(command.feature)),
      )
      .map((command) => ({
        command,
        score: commandScore(command, normalizedQuery),
      }))
      .filter(({ score }) => score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.command.label.localeCompare(right.command.label),
      )
      .map(({ command }) => ({
        category: command.category,
        description: command.description,
        icon: iconByKey[command.icon],
        id: command.id,
        label: command.label,
        to: command.to,
      }))
    const entityResults = (entitySearchQuery.data?.results ?? [])
      .slice(0, 6)
      .map((result) => ({
        category: 'Workspace result',
        description: `${result.entityType} · ${result.status} · ${result.description}`,
        icon:
          result.entityType === 'task'
            ? ClipboardCheck
            : result.entityType === 'approval'
              ? CheckSquare2
              : result.entityType === 'user'
                ? UserRound
                : result.entityType === 'department'
                  ? Building2
                  : result.entityType === 'workflow'
                    ? Waypoints
                    : BarChart3,
        id: `result-${result.entityType}-${result.id}`,
        label: result.title,
        to: result.url,
      }))
    const fullSearch: PaletteItem[] =
      normalizedQuery.length >= 2
        ? [
            {
              category: 'Search',
              description: `See all results for “${normalizedQuery}”.`,
              icon: Search,
              id: 'search-current-query',
              label: `Search workspace for “${normalizedQuery}”`,
              to: `/search?q=${encodeURIComponent(normalizedQuery)}`,
            },
          ]
        : []
    return [...commands, ...entityResults, ...fullSearch]
  }, [
    enabledFeatures,
    entitySearchQuery.data?.results,
    normalizedQuery,
    permissionKeys,
  ])

  const close = (restoreFocus = true) => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(0)
    if (restoreFocus) {
      window.requestAnimationFrame(() =>
        document.getElementById('command-palette-launcher')?.focus(),
      )
    }
  }

  const execute = (item: PaletteItem) => {
    close(false)
    navigate(item.to)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (isOpen) {
          close()
        } else {
          setIsOpen(true)
        }
      }
      if (isOpen && event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const selectedIndex = Math.min(
    activeIndex,
    Math.max(0, items.length - 1),
  )

  const trapTabKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'input, button, [href], [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (items.length ? (index + 1) % items.length : 0))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) =>
        items.length ? (index - 1 + items.length) % items.length : 0,
      )
    }
    if (event.key === 'Enter' && items[selectedIndex]) {
      event.preventDefault()
      execute(items[selectedIndex])
    }
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label="Open command palette"
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 md:min-w-48"
        id="command-palette-launcher"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="hidden flex-1 md:inline">Search or run command</span>
        <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold dark:border-slate-600 dark:bg-slate-900 md:inline">
          Ctrl K
        </kbd>
      </button>

      {isOpen ? (
        <div
          aria-labelledby="command-palette-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/55 px-3 pt-[10vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
          role="dialog"
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onKeyDown={trapTabKey}
            ref={dialogRef}
          >
            <h2 className="sr-only" id="command-palette-title">
              Command palette
            </h2>
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
              <Search
                aria-hidden="true"
                className="size-5 shrink-0 text-slate-400"
              />
              <input
                aria-activedescendant={
                  items[selectedIndex]
                    ? `command-item-${items[selectedIndex].id}`
                    : undefined
                }
                aria-controls="command-palette-results"
                aria-label="Search commands and workspace"
                aria-expanded="true"
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command, page, person, or record..."
                ref={inputRef}
                role="combobox"
                value={query}
              />
              <button
                aria-label="Close command palette"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => close()}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div
              className="max-h-[55vh] overflow-y-auto p-2"
              id="command-palette-results"
              role="listbox"
            >
              {entitySearchQuery.isFetching ? (
                <p className="px-3 py-2 text-xs text-slate-400">
                  Searching workspace...
                </p>
              ) : null}
              {items.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Search
                    aria-hidden="true"
                    className="mx-auto size-8 text-slate-300"
                  />
                  <p className="mt-3 font-semibold">No available commands</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another phrase or open global search.
                  </p>
                </div>
              ) : (
                items.map((item, index) => {
                  const Icon = item.icon
                  const isActive = index === selectedIndex
                  return (
                    <button
                      aria-selected={isActive}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
                        isActive
                          ? 'bg-brand-50 text-brand-900 dark:bg-brand-950 dark:text-brand-100'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      id={`command-item-${item.id}`}
                      key={item.id}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      type="button"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                        <Icon aria-hidden="true" className="size-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.category}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800">
              <span>↑↓ navigate</span>
              <span>Enter open</span>
              <span>Esc close</span>
              <span className="ml-auto">Permission and rollout aware</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
