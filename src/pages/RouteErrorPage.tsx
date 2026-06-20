import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Card } from '../shared/components/Card'

export function RouteErrorPage({ notFound = false }: { notFound?: boolean }) {
  const error = useRouteError()
  const routeNotFound =
    notFound || (isRouteErrorResponse(error) && error.status === 404)

  const title = routeNotFound ? 'Page not found' : 'Unable to load this page'
  const description = routeNotFound
    ? 'The address may be incorrect, or the page may have moved to another workspace area.'
    : 'An unexpected routing error occurred. Return to the overview and try again.'

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {routeNotFound ? 'Error 404' : 'Workspace error'}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Go back
          </button>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            to="/overview"
          >
            <Home aria-hidden="true" className="size-4" />
            Return to overview
          </Link>
        </div>
      </Card>
    </main>
  )
}
