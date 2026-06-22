import type { ZodType } from 'zod'
import { browserStorage } from './browserStorage'

interface PersistedEnvelope {
  data: unknown
  schemaVersion: number
  updatedAt: string
}

type Migration = (data: unknown) => unknown

interface VersionedStoreOptions<T> {
  key: string
  migrateLegacy?: (data: unknown) => T | undefined
  migrations?: Record<number, Migration>
  obsoleteKeys?: string[]
  prepareLegacy?: (data: T) => T
  schema: ZodType<T>
  seed: () => T
  version: number
}

export class PersistenceMigrationError extends Error {
  readonly key: string

  constructor(key: string, message: string) {
    super(message)
    this.name = 'PersistenceMigrationError'
    this.key = key
  }
}

function isEnvelope(value: unknown): value is PersistedEnvelope {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PersistedEnvelope>
  return (
    'data' in candidate &&
    typeof candidate.schemaVersion === 'number' &&
    Number.isInteger(candidate.schemaVersion) &&
    candidate.schemaVersion > 0 &&
    typeof candidate.updatedAt === 'string'
  )
}

export function createVersionedStore<T>({
  key,
  migrateLegacy,
  migrations = {},
  obsoleteKeys = [],
  prepareLegacy = (data) => data,
  schema,
  seed,
  version,
}: VersionedStoreOptions<T>) {
  if (!Number.isInteger(version) || version < 1) {
    throw new Error(`Persistence store "${key}" requires a positive version.`)
  }

  const removeObsoleteKeys = () =>
    obsoleteKeys.forEach((obsoleteKey) => browserStorage.remove(obsoleteKey))

  const persist = (data: T) => {
    const validated = schema.parse(data)
    browserStorage.write(key, {
      data: validated,
      schemaVersion: version,
      updatedAt: new Date().toISOString(),
    } satisfies PersistedEnvelope)
    removeObsoleteKeys()
    return validated
  }

  const read = (): T => {
    const stored = browserStorage.read(key)

    if (stored === null) {
      return persist(seed())
    }

    if (!isEnvelope(stored)) {
      const currentLegacy = schema.safeParse(stored)
      if (currentLegacy.success) {
        return persist(prepareLegacy(currentLegacy.data))
      }

      const migratedLegacy = migrateLegacy?.(stored)
      if (migratedLegacy !== undefined) {
        return persist(migratedLegacy)
      }

      throw new PersistenceMigrationError(
        key,
        `Stored data for "${key}" is invalid and was preserved for recovery.`,
      )
    }

    if (stored.schemaVersion > version) {
      throw new PersistenceMigrationError(
        key,
        `Stored data for "${key}" uses newer schema version ${stored.schemaVersion}.`,
      )
    }

    let data = stored.data
    let currentVersion = stored.schemaVersion

    while (currentVersion < version) {
      const migrate = migrations[currentVersion]
      if (!migrate) {
        throw new PersistenceMigrationError(
          key,
          `No migration exists for "${key}" from version ${currentVersion}.`,
        )
      }
      data = migrate(data)
      currentVersion += 1
    }

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      throw new PersistenceMigrationError(
        key,
        `Stored data for "${key}" failed schema version ${version} validation.`,
      )
    }

    if (stored.schemaVersion !== version) {
      return persist(parsed.data)
    }

    removeObsoleteKeys()
    return parsed.data
  }

  return {
    read,
    remove: () => browserStorage.remove(key),
    write: persist,
  }
}
