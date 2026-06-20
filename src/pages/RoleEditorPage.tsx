import { RoleEditor } from '../features/access/components/RoleEditor'

export function CreateRolePage() {
  return <RoleEditor mode="create" />
}

export function EditRolePage() {
  return <RoleEditor mode="edit" />
}
