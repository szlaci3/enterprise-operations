import { DepartmentEditor } from '../features/departments/components/DepartmentEditor'

export function DepartmentEditorPage({
  mode,
}: {
  mode: 'create' | 'edit'
}) {
  return <DepartmentEditor mode={mode} />
}

export function CreateDepartmentPage() {
  return <DepartmentEditorPage mode="create" />
}

export function EditDepartmentPage() {
  return <DepartmentEditorPage mode="edit" />
}
