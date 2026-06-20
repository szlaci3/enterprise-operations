import type { User } from '../schemas/userSchemas'

export function UserAvatar({
  className = 'size-10',
  user,
}: {
  className?: string
  user: Pick<User, 'firstName' | 'lastName'>
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200 ${className}`}
    >
      {user.firstName[0]}
      {user.lastName[0]}
    </span>
  )
}
