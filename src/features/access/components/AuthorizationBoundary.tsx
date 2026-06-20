import { LockKeyhole } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Card } from '../../../shared/components/Card'
import type { PermissionKey } from '../schemas/accessSchemas'
import { useAuthorization } from '../hooks/useAuthorization'

export function AuthorizationBoundary({
  permission,
}: {
  permission: PermissionKey
}) {
  const { accessQuery, can } = useAuthorization()

  if (accessQuery.isPending) {
    return (
      <Card className="h-72 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Checking access</span>
      </Card>
    )
  }

  if (accessQuery.isError || !can(permission)) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
          <LockKeyhole aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
          Access restricted
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Your current roles do not grant access to this platform area.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          to="/overview"
        >
          Return to overview
        </Link>
      </Card>
    )
  }

  return <Outlet />
}
