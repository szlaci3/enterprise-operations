import { useQuery } from '@tanstack/react-query'
import { Building2, SlidersHorizontal, UserRound } from 'lucide-react'
import { useState } from 'react'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Card } from '../../../shared/components/Card'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PermissionGate } from '../../access/components/PermissionGate'
import { NotificationPreferences } from '../../notifications/components/NotificationPreferences'
import { userListOptions } from '../../users/queries/userQueries'
import {
  settingsSnapshotOptions,
  useUpdateFeatureConfiguration,
  useUpdateOrganizationSettings,
  useUpdatePersonalSettings,
} from '../queries/settingsQueries'
import type { FeatureKey, FeatureState } from '../schemas/settingsSchemas'
import { FeatureConfigurationPanel } from './FeatureConfigurationPanel'
import { OrganizationSettingsForm } from './OrganizationSettingsForm'
import { PersonalSettingsForm } from './PersonalSettingsForm'
import { SettingsChangeLog } from './SettingsChangeLog'

type SettingsSection = 'personal' | 'organization'

export function SettingsWorkspace() {
  const settingsQuery = useQuery(settingsSnapshotOptions(currentSessionUserId))
  const usersQuery = useQuery(userListOptions())
  const updatePersonal = useUpdatePersonalSettings(currentSessionUserId)
  const updateOrganization =
    useUpdateOrganizationSettings(currentSessionUserId)
  const updateFeature = useUpdateFeatureConfiguration(currentSessionUserId)
  const [section, setSection] = useState<SettingsSection>('personal')

  if (settingsQuery.isPending || usersQuery.isPending) {
    return (
      <Card className="h-120 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading settings</span>
      </Card>
    )
  }

  if (settingsQuery.isError || usersQuery.isError || !settingsQuery.data) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-xl font-semibold">Settings are unavailable</h1>
        <button
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => settingsQuery.refetch()}
          type="button"
        >
          Retry
        </button>
      </Card>
    )
  }

  const settings = settingsQuery.data
  const userNameById = new Map(
    (usersQuery.data ?? []).map((user) => [
      user.id,
      `${user.firstName} ${user.lastName}`,
    ]),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage personal workspace behavior and governed organization-wide platform policy."
        eyebrow="Platform control plane"
        title="Settings"
      />

      <div
        aria-label="Settings sections"
        className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
        role="tablist"
      >
        <button
          aria-selected={section === 'personal'}
          className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${
            section === 'personal'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
              : 'text-slate-500'
          }`}
          onClick={() => setSection('personal')}
          role="tab"
          type="button"
        >
          <UserRound aria-hidden="true" className="size-4" />
          My workspace
        </button>
        <PermissionGate permission="settings.manage">
          <button
            aria-selected={section === 'organization'}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${
              section === 'organization'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                : 'text-slate-500'
            }`}
            onClick={() => setSection('organization')}
            role="tab"
            type="button"
          >
            <Building2 aria-hidden="true" className="size-4" />
            Organization
          </button>
        </PermissionGate>
      </div>

      {section === 'personal' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <PersonalSettingsForm
            isSaving={updatePersonal.isPending}
            onSubmit={async (values) => {
              await updatePersonal.mutateAsync(values)
            }}
            settings={settings.personal}
          />
          <NotificationPreferences />
        </div>
      ) : (
        <PermissionGate permission="settings.manage">
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
              <OrganizationSettingsForm
                isSaving={updateOrganization.isPending}
                onSubmit={async (values) => {
                  await updateOrganization.mutateAsync(values)
                }}
                settings={settings.organization}
              />
              <Card className="p-5 sm:p-6">
                <SlidersHorizontal
                  aria-hidden="true"
                  className="size-5 text-brand-600"
                />
                <h2 className="mt-4 font-semibold">Current policy</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Last updated</dt>
                    <dd className="mt-1 font-semibold">
                      {new Date(
                        settings.organization.updatedAt,
                      ).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Updated by</dt>
                    <dd className="mt-1 font-semibold">
                      {userNameById.get(
                        settings.organization.updatedByUserId,
                      ) ?? settings.organization.updatedByUserId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Retention window</dt>
                    <dd className="mt-1 font-semibold">
                      {settings.organization.recordsRetentionDays} days
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
            <FeatureConfigurationPanel
              features={settings.features}
              isSaving={updateFeature.isPending}
              onChange={async (key: FeatureKey, state: FeatureState) => {
                await updateFeature.mutateAsync({ key, state })
              }}
            />
            <SettingsChangeLog
              changes={settings.changes}
              userNameById={userNameById}
            />
          </div>
        </PermissionGate>
      )}
    </div>
  )
}
