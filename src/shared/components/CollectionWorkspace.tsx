import { Search } from 'lucide-react'
import type {
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import { Button } from './Button'
import { Card } from './Card'

export function CollectionLoading({
  label,
  height = 'h-96',
}: {
  height?: string
  label: string
}) {
  return (
    <Card className={`${height} animate-pulse bg-slate-100 dark:bg-slate-800`}>
      <span className="sr-only">{label}</span>
    </Card>
  )
}

export function CollectionError({
  description,
  onRetry,
  title,
}: {
  description?: string
  onRetry?: () => void
  title: string
}) {
  return (
    <Card className="p-8 text-center" role="alert">
      <h1 className="text-xl font-semibold text-slate-950 dark:text-white">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Card>
  )
}

export function CollectionEmpty({
  description,
  icon,
  title,
}: {
  description?: string
  icon: ReactNode
  title: string
}) {
  return (
    <div className="p-10 text-center" role="status">
      <div className="mx-auto flex size-10 items-center justify-center text-slate-300">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-slate-900 dark:text-white">
        {title}
      </p>
      {description ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function FilterBar({
  children,
  primary,
  secondary,
}: {
  children?: ReactNode
  primary: ReactNode
  secondary?: ReactNode
}) {
  return (
    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
      {secondary ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          {secondary}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        {primary}
        {children}
      </div>
    </div>
  )
}

export function SearchField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="relative min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  )
}

export function SelectFilter({
  label,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className={`h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-brand-950 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  ariaLabel: string
  onChange: (value: T) => void
  options: readonly { label: string; value: T }[]
  value: T
}) {
  return (
    <div aria-label={ariaLabel} className="flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            value === option.value
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
