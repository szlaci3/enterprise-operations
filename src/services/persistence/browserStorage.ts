export interface BrowserStorageEntry {
  bytes: number
  key: string
}

export interface BrowserStorageDiagnostics {
  available: boolean
  entries: BrowserStorageEntry[]
  totalBytes: number
}

interface BrowserStorage {
  diagnose: () => BrowserStorageDiagnostics
  read: (key: string) => unknown
  remove: (key: string) => void
  write: (key: string, value: unknown) => void
}

const memoryFallback = new Map<string, unknown>()

export const browserStorage: BrowserStorage = {
  diagnose() {
    try {
      const probeKey = 'enterprise-operations-storage-probe'
      window.localStorage.setItem(probeKey, 'ok')
      window.localStorage.removeItem(probeKey)
      const entries = Array.from(
        { length: window.localStorage.length },
        (_, index) => window.localStorage.key(index),
      )
        .filter(
          (key): key is string =>
            Boolean(key?.startsWith('enterprise-operations-')),
        )
        .map((key) => ({
          bytes: new Blob([window.localStorage.getItem(key) ?? '']).size,
          key,
        }))
        .sort((left, right) => right.bytes - left.bytes)
      return {
        available: true,
        entries,
        totalBytes: entries.reduce((total, entry) => total + entry.bytes, 0),
      }
    } catch {
      const entries = [...memoryFallback.entries()]
        .filter(([key]) => key.startsWith('enterprise-operations-'))
        .map(([key, value]) => ({
          bytes: new Blob([JSON.stringify(value)]).size,
          key,
        }))
      return {
        available: false,
        entries,
        totalBytes: entries.reduce((total, entry) => total + entry.bytes, 0),
      }
    }
  },
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
