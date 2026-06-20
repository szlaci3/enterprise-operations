import { WorkflowEditor } from '../features/workflows/components/WorkflowEditor'

export function CreateWorkflowPage() {
  return <WorkflowEditor mode="create" />
}

export function EditWorkflowPage() {
  return <WorkflowEditor mode="edit" />
}
