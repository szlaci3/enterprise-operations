import { Laptop, Moon, Sun } from 'lucide-react'
import { Card } from '../shared/components/Card'
import { PageHeader } from '../shared/components/PageHeader'
import {
  useUiStore,
  type ThemePreference,
} from '../store/uiStore'

const themeOptions: {
  description: string
  icon: typeof Sun
  label: string
  value: ThemePreference
}[] = [
  {
    description: 'Use a bright, high-contrast workspace.',
    icon: Sun,
    label: 'Light',
    value: 'light',
  },
  {
    description: 'Reduce glare in low-light environments.',
    icon: Moon,
    label: 'Dark',
    value: 'dark',
  },
  {
    description: 'Follow your operating system preference.',
    icon: Laptop,
    label: 'System',
    value: 'system',
  },
]

export function SettingsPage() {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)

  return (
    <div className="space-y-6">
      <PageHeader
        description="Personalize how the Enterprise Operations Platform behaves for your session."
        eyebrow="Personal preferences"
        title="Settings"
      />

      <Card className="max-w-3xl p-6">
        <fieldset>
          <legend className="font-semibold text-slate-950 dark:text-white">
            Appearance
          </legend>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Theme preferences are saved locally and restored automatically.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <label
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                  key={option.value}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    name="theme"
                    onChange={() => setTheme(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <Icon
                    aria-hidden="true"
                    className={`size-5 ${
                      isSelected
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-slate-500'
                    }`}
                  />
                  <span className="mt-3 block text-sm font-semibold text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {option.description}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </Card>
    </div>
  )
}
