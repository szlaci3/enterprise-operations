import { UserEditor } from '../features/users/components/UserEditor'

export function CreateUserPage() {
  return <UserEditor mode="create" />
}

export function EditUserPage() {
  return <UserEditor mode="edit" />
}
