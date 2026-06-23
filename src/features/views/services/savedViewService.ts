import {
  listSavedViewsApi,
  replaceSavedViewsApi,
} from '../../../mocks/savedViewsApi'
import {
  savedViewInputSchema,
  savedViewSchema,
  savedViewsSchema,
  type SavedView,
  type SavedViewInput,
  type SavedViewResource,
} from '../schemas/savedViewSchemas'
import {
  getSearchPreferencesApi,
  updateSearchPreferencesApi,
} from '../../../mocks/searchApi'
import { searchPreferencesSchema } from '../../search/schemas/searchSchemas'

export class SavedViewServiceError extends Error {
  readonly code: 'duplicate-name' | 'forbidden' | 'not-found'

  constructor(message: string, code: SavedViewServiceError['code']) {
    super(message)
    this.name = 'SavedViewServiceError'
    this.code = code
  }
}

async function listAll() {
  return savedViewsSchema.parse(await listSavedViewsApi())
}

async function migrateSavedSearches(
  views: SavedView[],
  userId: string,
): Promise<SavedView[]> {
  if (views.some((view) => view.resource === 'search')) return views
  const preferences = searchPreferencesSchema.parse(
    await getSearchPreferencesApi(userId),
  )
  if (preferences.savedSearches.length === 0) return views
  const now = new Date().toISOString()
  const migrated = preferences.savedSearches.map((saved) =>
    savedViewSchema.parse({
      columns: [],
      createdAt: saved.createdAt,
      density: 'comfortable',
      id: saved.id,
      isDefault: false,
      name: saved.name,
      ownerUserId: userId,
      resource: 'search',
      state: {
        q: saved.query,
        sort: 'relevance',
        status: saved.filters.status,
        types: saved.filters.entityTypes.join(','),
        updated: saved.filters.updatedWithin,
      },
      updatedAt: now,
      visibility: 'personal',
    }),
  )
  const next = [...views, ...migrated]
  await replaceSavedViewsApi(next)
  await updateSearchPreferencesApi({
    ...preferences,
    savedSearches: [],
  })
  return next
}

function visibleToUser(view: SavedView, userId: string) {
  return view.visibility === 'shared' || view.ownerUserId === userId
}

export const savedViewService = {
  async create(
    userId: string,
    canShare: boolean,
    input: SavedViewInput,
  ): Promise<SavedView> {
    const parsed = savedViewInputSchema.parse(input)
    if (parsed.visibility === 'shared' && !canShare) {
      throw new SavedViewServiceError(
        'You do not have permission to share saved views.',
        'forbidden',
      )
    }
    const views = await listAll()
    if (
      views.some(
        (view) =>
          view.resource === parsed.resource &&
          view.ownerUserId === userId &&
          view.name.toLowerCase() === parsed.name.toLowerCase(),
      )
    ) {
      throw new SavedViewServiceError(
        'You already have a view with this name.',
        'duplicate-name',
      )
    }
    const now = new Date().toISOString()
    const next = savedViewSchema.parse({
      ...parsed,
      createdAt: now,
      id: crypto.randomUUID(),
      ownerUserId: userId,
      updatedAt: now,
    })
    const retained = parsed.isDefault
      ? views.map((view) =>
          view.resource === parsed.resource &&
          view.ownerUserId === userId &&
          view.isDefault
            ? { ...view, isDefault: false, updatedAt: now }
            : view,
        )
      : views
    await replaceSavedViewsApi([...retained, next])
    return next
  },

  async list(
    resource: SavedViewResource,
    userId: string,
  ): Promise<SavedView[]> {
    const views = await migrateSavedSearches(await listAll(), userId)
    return views
      .filter(
        (view) => view.resource === resource && visibleToUser(view, userId),
      )
      .map((view) =>
        view.ownerUserId === userId ? view : { ...view, isDefault: false },
      )
      .sort(
        (left, right) =>
          Number(right.isDefault) - Number(left.isDefault) ||
          left.name.localeCompare(right.name),
      )
  },

  async remove(id: string, userId: string, canShare: boolean): Promise<void> {
    const views = await listAll()
    const view = views.find((item) => item.id === id)
    if (!view) {
      throw new SavedViewServiceError('The saved view no longer exists.', 'not-found')
    }
    if (
      view.ownerUserId !== userId &&
      !(view.visibility === 'shared' && canShare)
    ) {
      throw new SavedViewServiceError(
        'You cannot remove this saved view.',
        'forbidden',
      )
    }
    await replaceSavedViewsApi(views.filter((item) => item.id !== id))
  },

  async setDefault(id: string, userId: string): Promise<SavedView[]> {
    const views = await listAll()
    const view = views.find(
      (item) => item.id === id && item.ownerUserId === userId,
    )
    if (!view) {
      throw new SavedViewServiceError(
        'Only the owner can make this view their default.',
        'forbidden',
      )
    }
    const now = new Date().toISOString()
    const updated = views.map((item) =>
      item.resource === view.resource && item.ownerUserId === userId
        ? {
            ...item,
            isDefault: item.id === view.id,
            updatedAt: item.isDefault === (item.id === view.id)
              ? item.updatedAt
              : now,
          }
        : item,
    )
    await replaceSavedViewsApi(updated)
    return updated.filter(
      (item) => item.resource === view.resource && visibleToUser(item, userId),
    )
  },
}
