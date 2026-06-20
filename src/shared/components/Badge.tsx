import type { ReactNode } from 'react'

type BadgeTone = 'blue' | 'green' | 'amber' | 'red' | 'slate'

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
}

const tones: Record<BadgeTone, string> = {
  blue: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200',
  green:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

export function Badge({ children, tone = 'slate' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
