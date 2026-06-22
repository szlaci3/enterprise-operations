import type { ZodType } from 'zod'
import { browserStorage } from './browserStorage'
import {
  getActiveTenantId,
  tenantStorageKey,
} from '../../features/tenancy/services/tenantContext'

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
  scope?: 'global' | 'tenant'
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
  scope = 'tenant',
  seed,
  version,
}: VersionedStoreOptions<T>) {
  if (!Number.isInteger(version) || version < 1) {
    throw new Error(`Persistence store "${key}" requires a positive version.`)
  }

  const resolveKey = (targetKey: string) =>
    scope === 'tenant' ? tenantStorageKey(targetKey) : targetKey
  const removeObsoleteKeys = () =>
    obsoleteKeys.forEach((obsoleteKey) => {
      browserStorage.remove(resolveKey(obsoleteKey))
      if (scope === 'tenant' && getActiveTenantId() === 'northstar') {
        browserStorage.remove(obsoleteKey)
      }
    })

  const persist = (data: T) => {
    const validated = schema.parse(data)
    browserStorage.write(resolveKey(key), {
      data: validated,
      schemaVersion: version,
      updatedAt: new Date().toISOString(),
    } satisfies PersistedEnvelope)
    removeObsoleteKeys()
    return validated
  }

  const read = (): T => {
    const resolvedKey = resolveKey(key)
    let stored = browserStorage.read(resolvedKey)
    let migratedLegacyKey: string | null = null

    if (
      stored === null &&
      scope === 'tenant' &&
      getActiveTenantId() === 'northstar'
    ) {
      stored = browserStorage.read(key)
      if (stored !== null) {
        migratedLegacyKey = key
      }
    }

    if (stored === null) {
      return persist(seed())
    }

    if (!isEnvelope(stored)) {
      const currentLegacy = schema.safeParse(stored)
      if (currentLegacy.success) {
        const data = persist(prepareLegacy(currentLegacy.data))
        if (migratedLegacyKey) browserStorage.remove(migratedLegacyKey)
        return data
      }

      const migratedLegacy = migrateLegacy?.(stored)
      if (migratedLegacy !== undefined) {
        const data = persist(migratedLegacy)
        if (migratedLegacyKey) browserStorage.remove(migratedLegacyKey)
        return data
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
      const data = persist(parsed.data)
      if (migratedLegacyKey) browserStorage.remove(migratedLegacyKey)
      return data
    }

    if (migratedLegacyKey) {
      persist(parsed.data)
      browserStorage.remove(migratedLegacyKey)
    }
    removeObsoleteKeys()
    return parsed.data
  }

  return {
    read,
    remove: () => browserStorage.remove(resolveKey(key)),
    write: persist,
  }
}
