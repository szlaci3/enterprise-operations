import {
  Building2,
  Menu,
  X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { settingsSnapshotOptions } from '../../features/settings/queries/settingsQueries'
import type { FeatureKey } from '../../features/settings/schemas/settingsSchemas'
import { featureIsAvailable } from '../../features/settings/utils/featureAvailability'
import { workspaceSnapshotOptions } from '../../features/tenancy/queries/tenancyQueries'
import { useWorkspaceStore } from '../../features/tenancy/store/workspaceStore'
import { WorkspaceSwitcher } from '../../features/tenancy/components/WorkspaceSwitcher'
import { useUiStore } from '../../store/uiStore'
import { currentSessionUserId } from '../session/currentSession'
import { platformIconByKey } from '../platform/platformIcons'
import {
  platformModules,
  type PlatformModuleDefinition,
} from '../platform/platformRegistry'

const CommandLauncher = lazy(async () => {
  const module = await import(
    '../../features/commands/components/CommandLauncher'
  )
  return { default: module.CommandLauncher }
})

const NotificationBell = lazy(async () => {
  const module = await import(
    '../../features/notifications/components/NotificationBell'
  )
  return { default: module.NotificationBell }
})

const SyncStatus = lazy(async () => {
  const module = await import('../../features/offline/components/SyncStatus')
  return { default: module.SyncStatus }
})

function NavigationLink({ module }: { module: PlatformModuleDefinition }) {
  const { icon, label, route } = module
  const Icon = platformIconByKey[icon]
  return (
    <NavLink
      className={({ isActive }) =>
        `flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`
      }
      to={route}
    >
      <Icon aria-hidden="true" className="size-4.5 shrink-0" />
      {label}
    </NavLink>
  )
}

function SidebarContent({
  moduleIsVisible,
  organizationName,
}: {
  moduleIsVisible: (module: PlatformModuleDefinition) => boolean
  organizationName: string
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Building2 aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            Enterprise Ops
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {organizationName}
          </p>
        </div>
      </div>
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <WorkspaceSwitcher />
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5"
      >
        <div className="space-y-1">
          {platformModules
            .filter((item) => item.navigationGroup === 'primary')
            .filter(moduleIsVisible)
            .map((item) => (
              <NavigationLink key={item.route} module={item} />
            ))}
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Platform
          </p>
          <div className="space-y-1">
            {platformModules
              .filter((item) => item.navigationGroup === 'platform')
              .filter(moduleIsVisible)
              .map((item) => (
                <NavigationLink key={item.route} module={item} />
              ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex w-full items-center gap-3 rounded-lg p-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
            AM
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              Avery Morgan
            </span>
            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
              Operations lead
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const location = useLocation()
  useWorkspaceStore((state) => state.activeTenantId)
  const mobileDialogRef = useRef<HTMLElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const wasMobileNavigationOpen = useRef(false)
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const workspaceQuery = useQuery(workspaceSnapshotOptions())
  const isMobileNavigationOpen = useUiStore(
    (state) => state.isMobileNavigationOpen,
  )
  const closeMobileNavigation = useUiStore(
    (state) => state.closeMobileNavigation,
  )
  const toggleMobileNavigation = useUiStore(
    (state) => state.toggleMobileNavigation,
  )
  const organizationName =
    settingsQuery.data?.organization.name ??
    workspaceQuery.data?.activeTenant.name ??
    'Enterprise workspace'
  const density = settingsQuery.data?.personal.density ?? 'comfortable'
  const featureIsVisible = (feature?: FeatureKey) =>
    !feature ||
    Boolean(
      settingsQuery.data &&
        workspaceQuery.data &&
        featureIsAvailable(
          settingsQuery.data.features,
          feature,
          workspaceQuery.data.membership.role,
        ),
    )
  const moduleIsVisible = (module: PlatformModuleDefinition) =>
    featureIsVisible(module.feature)

  useEffect(() => {
    closeMobileNavigation()
  }, [location.pathname, closeMobileNavigation])

  useEffect(() => {
    if (!isMobileNavigationOpen) {
      if (wasMobileNavigationOpen.current) {
        mobileMenuButtonRef.current?.focus()
      }
      wasMobileNavigationOpen.current = false
      return
    }

    wasMobileNavigationOpen.current = true
    const dialog = mobileDialogRef.current
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileNavigation()
      }
      if (event.key === 'Tab' && focusable && focusable.length > 0) {
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
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [closeMobileNavigation, isMobileNavigationOpen])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <SidebarContent
          moduleIsVisible={moduleIsVisible}
          organizationName={organizationName}
        />
      </aside>

      {isMobileNavigationOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeMobileNavigation}
            type="button"
          />
          <aside
            aria-label="Mobile navigation"
            aria-modal="true"
            className="relative h-full w-72 bg-white shadow-xl dark:bg-slate-900"
            ref={mobileDialogRef}
            role="dialog"
          >
            <button
              aria-label="Close navigation"
              className="absolute right-3 top-3 z-10 rounded-md p-2"
              onClick={closeMobileNavigation}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <SidebarContent
              moduleIsVisible={moduleIsVisible}
              organizationName={organizationName}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header
          className={`sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 ${
            density === 'compact' ? 'h-14' : 'h-16'
          }`}
        >
          <button
            aria-label="Open navigation"
            className="rounded-md p-2 lg:hidden"
            onClick={toggleMobileNavigation}
            ref={mobileMenuButtonRef}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Enterprise workspace
            </p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Operations, governance, and reporting
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Suspense
              fallback={
                <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 md:w-48" />
              }
            >
              <CommandLauncher />
            </Suspense>
            <Suspense
              fallback={
                <div className="size-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              }
            >
              <NotificationBell />
            </Suspense>
            <Suspense
              fallback={
                <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800 sm:w-24" />
              }
            >
              <SyncStatus />
            </Suspense>
            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 md:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-white">
                AM
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Avery Morgan
              </span>
            </div>
          </div>
        </header>

        <main
          className={`mx-auto w-full max-w-[1600px] ${
            density === 'compact'
              ? 'p-3 sm:p-4 lg:p-5'
              : 'p-4 sm:p-6 lg:p-8'
          }`}
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
