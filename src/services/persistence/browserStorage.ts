interface BrowserStorage {
  read: (key: string) => unknown
  remove: (key: string) => void
  write: (key: string, value: unknown) => void
}

const memoryFallback = new Map<string, unknown>()

export const browserStorage: BrowserStorage = {
  read(key) {
    try {
      const value = window.localStorage.getItem(key)

      if (value === null) {
        return memoryFallback.get(key) ?? null
      }

      try {
        return JSON.parse(value) as unknown
      } catch {
        return memoryFallback.get(key) ?? null
      }
    } catch {
      return memoryFallback.get(key) ?? null
    }
  },
  remove(key) {
    memoryFallback.delete(key)

    try {
      window.localStorage.removeItem(key)
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  },
  write(key, value) {
    memoryFallback.set(key, value)

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The dashboard remains usable when durable browser storage is blocked.
    }
  },
}
