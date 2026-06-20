import { Search } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function SearchLauncher() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        navigate('/search')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <button
      aria-label="Open global search"
      className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 md:min-w-48"
      onClick={() => navigate('/search')}
      type="button"
    >
      <Search aria-hidden="true" className="size-4" />
      <span className="hidden flex-1 md:inline">Search workspace</span>
      <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold dark:border-slate-600 dark:bg-slate-900 md:inline">
        Ctrl K
      </kbd>
    </button>
  )
}
