import { getActiveTenantId } from '../services/tenantContext'

export function tenantQueryKey<T extends readonly unknown[]>(
  ...segments: T
): readonly ['tenant', ReturnType<typeof getActiveTenantId>, ...T] {
  return ['tenant', getActiveTenantId(), ...segments]
}
