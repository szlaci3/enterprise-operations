import {
  BarChart3,
  Building2,
  CheckSquare2,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Network,
  Menu,
  Settings,
  ScrollText,
  ShieldCheck,
  ShieldEllipsis,
  UsersRound,
  Waypoints,
  type LucideIcon,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { NotificationBell } from '../../features/notifications/components/NotificationBell'
import { useUiStore } from '../../store/uiStore'

interface NavigationItem {
  icon: LucideIcon
  label: string
  to: string
}

const primaryNavigation: NavigationItem[] = [
  { icon: LayoutDashboard, label: 'Overview', to: '/overview' },
  { icon: LineChart, label: 'Analytics', to: '/analytics' },
  { icon: ClipboardList, label: 'Tasks', to: '/tasks' },
  { icon: Waypoints, label: 'Workflows', to: '/workflows' },
  { icon: CheckSquare2, label: 'Approvals', to: '/approvals' },
  { icon: BarChart3, label: 'Reports', to: '/reports' },
]

const secondaryNavigation: NavigationItem[] = [
  { icon: Network, label: 'Departments', to: '/departments' },
  { icon: UsersRound, label: 'Users', to: '/users' },
  { icon: ShieldEllipsis, label: 'Access control', to: '/access' },
  { icon: ScrollText, label: 'Audit trail', to: '/audit' },
  { icon: ShieldCheck, label: 'Administration', to: '/administration' },
  { icon: Settings, label: 'Settings', to: '/settings' },
]

function NavigationLink({ icon: Icon, label, to }: NavigationItem) {
  return (
    <NavLink
      className={({ isActive }) =>
        `flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`
      }
      to={to}
    >
      <Icon aria-hidden="true" className="size-4.5 shrink-0" />
      {label}
    </NavLink>
  )
}

function SidebarContent() {
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
            Northstar Group
          </p>
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5"
      >
        <div className="space-y-1">
          {primaryNavigation.map((item) => (
            <NavigationLink key={item.to} {...item} />
          ))}
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Platform
          </p>
          <div className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavigationLink key={item.to} {...item} />
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
  const isMobileNavigationOpen = useUiStore(
    (state) => state.isMobileNavigationOpen,
  )
  const closeMobileNavigation = useUiStore(
    (state) => state.closeMobileNavigation,
  )
  const toggleMobileNavigation = useUiStore(
    (state) => state.toggleMobileNavigation,
  )

  useEffect(() => {
    closeMobileNavigation()
  }, [location.pathname, closeMobileNavigation])

  useEffect(() => {
    if (!isMobileNavigationOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileNavigation()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
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
        <SidebarContent />
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
            className="relative h-full w-72 bg-white shadow-xl dark:bg-slate-900"
          >
            <Button
              aria-label="Close navigation"
              className="absolute right-3 top-3 z-10 size-10 p-0"
              onClick={closeMobileNavigation}
              variant="ghost"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
          <Button
            aria-label="Open navigation"
            className="size-10 p-0 lg:hidden"
            onClick={toggleMobileNavigation}
            variant="ghost"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Enterprise workspace
            </p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Operations, governance, and reporting
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 sm:inline-flex">
              Environment ready
            </span>
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
          className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8"
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
