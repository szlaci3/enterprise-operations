import { Check, Minus } from 'lucide-react'
import type { Permission, Role } from '../schemas/accessSchemas'

export function PermissionMatrix({
  permissions,
  roles,
}: {
  permissions: Permission[]
  roles: Role[]
}) {
  const modules = [...new Set(permissions.map((permission) => permission.module))]

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-220 text-left text-sm">
        <caption className="sr-only">
          Matrix of permissions granted by each role
        </caption>
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <tr>
            <th className="sticky left-0 z-10 min-w-70 bg-slate-50 px-5 py-3 font-semibold dark:bg-slate-800" scope="col">
              Permission
            </th>
            {roles.map((role) => (
              <th
                className="min-w-40 px-4 py-3 text-center font-semibold"
                key={role.id}
                scope="col"
              >
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {modules.flatMap((module) => {
            const modulePermissions = permissions.filter(
              (permission) => permission.module === module,
            )
            return [
              <tr key={`${module}-heading`}>
                <th
                  className="bg-slate-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40"
                  colSpan={roles.length + 1}
                  scope="rowgroup"
                >
                  {module}
                </th>
              </tr>,
              ...modulePermissions.map((permission) => (
                <tr key={permission.key}>
                  <th
                    className="sticky left-0 bg-white px-5 py-4 dark:bg-slate-900"
                    scope="row"
                  >
                    <span className="block font-semibold text-slate-900 dark:text-white">
                      {permission.action}
                    </span>
                    <span className="mt-1 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">
                      {permission.description}
                    </span>
                  </th>
                  {roles.map((role) => {
                    const granted = role.permissionKeys.includes(permission.key)
                    return (
                      <td className="px-4 py-4 text-center" key={role.id}>
                        <span
                          className={`inline-flex size-7 items-center justify-center rounded-full ${
                            granted
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }`}
                        >
                          {granted ? (
                            <Check aria-hidden="true" className="size-4" />
                          ) : (
                            <Minus aria-hidden="true" className="size-4" />
                          )}
                          <span className="sr-only">
                            {granted ? 'Granted' : 'Not granted'}
                          </span>
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )),
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}
