import { ReportEditor } from '../features/reports/components/ReportEditor'

export function CreateReportPage() {
  return <ReportEditor mode="create" />
}

export function EditReportPage() {
  return <ReportEditor mode="edit" />
}
