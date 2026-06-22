import { FlaskConical } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge'
import { Card } from '../../../shared/components/Card'
import type {
  FeatureConfiguration,
  FeatureAudience,
  FeatureKey,
  FeatureState,
} from '../schemas/settingsSchemas'

const featureCatalog: Record<
  FeatureKey,
  { description: string; label: string }
> = {
  analytics: {
    description:
      'Executive trends, distribution analysis, and segmented operational metrics.',
    label: 'Analytics workspace',
  },
  collaboration: {
    description:
      'Entity discussions, replies, mentions, and combined activity streams.',
    label: 'Contextual collaboration',
  },
  documents: {
    description:
      'Controlled files, immutable versions, downloads, and operational links.',
    label: 'Document management',
  },
}

export function FeatureConfigurationPanel({
  features,
  isSaving,
  onChange,
}: {
  features: FeatureConfiguration[]
  isSaving: boolean
  onChange: (
    key: FeatureKey,
    values: { audience: FeatureAudience; state: FeatureState },
  ) => Promise<void>
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <FlaskConical aria-hidden="true" className="size-5" />
          Feature rollout
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Control organization-wide availability without changing user roles.
        </p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {features.map((feature) => {
          const catalog = featureCatalog[feature.key]
          return (
            <div
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              key={feature.key}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{catalog.label}</h3>
                  {feature.state === 'pilot' ? (
                    <Badge tone="amber">pilot</Badge>
                  ) : null}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  {catalog.description}
                </p>
                {feature.prerequisiteKeys.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-400">
                    Requires:{' '}
                    {feature.prerequisiteKeys
                      .map((key) => featureCatalog[key].label)
                      .join(', ')}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  aria-label={`${catalog.label} pilot audience`}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  disabled={isSaving || feature.state !== 'pilot'}
                  onChange={(event) =>
                    onChange(feature.key, {
                      audience: event.target.value as FeatureAudience,
                      state: feature.state,
                    })
                  }
                  value={feature.audience}
                >
                  <option value="all-members">All members</option>
                  <option value="administrators">Administrators</option>
                </select>
                <select
                  aria-label={`${catalog.label} rollout state`}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  disabled={isSaving}
                  onChange={(event) =>
                    onChange(feature.key, {
                      audience: feature.audience,
                      state: event.target.value as FeatureState,
                    })
                  }
                  value={feature.state}
                >
                  <option value="enabled">Enabled</option>
                  <option value="pilot">Pilot</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
