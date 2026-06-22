import {
  documentsSchema,
  type DocumentRecord,
} from '../features/documents/schemas/documentSchemas'
import { createVersionedStore } from '../services/persistence/versionedStore'
import { getActiveTenantId } from '../features/tenancy/services/tenantContext'

const documentsStorageKey = 'enterprise-operations-documents'

const textDataUrl = (value: string) =>
  `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`

const seedDocuments: DocumentRecord[] = [
  {
    classification: 'confidential',
    createdAt: '2026-06-18T08:30:00.000Z',
    createdByUserId: 'user-avery-morgan',
    departmentId: 'dept-finance-operations',
    description:
      'Controlled evidence pack supporting the quarterly vendor payment approval and its financial review.',
    id: 'document-vendor-payment-evidence',
    links: [
      {
        entityId: 'approval-service-exception-1042',
        entityType: 'approval',
      },
    ],
    ownerUserId: 'user-avery-morgan',
    retentionCategory: 'financial',
    status: 'published',
    title: 'Vendor payment evidence pack',
    updatedAt: '2026-06-20T10:15:00.000Z',
    versions: [
      {
        changeSummary: 'Initial evidence package submitted for review.',
        contentDataUrl: textDataUrl(
          'Vendor payment evidence pack\n\nInitial supporting evidence.',
        ),
        contentHash:
          '346b5e4d2872269d413f524a96bc85fcf96a816c6c7767bc808d59a9082c7f25',
        createdAt: '2026-06-18T08:30:00.000Z',
        createdByUserId: 'user-avery-morgan',
        fileName: 'vendor-payment-evidence-v1.txt',
        id: 'document-version-vendor-payment-1',
        mimeType: 'text/plain',
        number: 1,
        sizeBytes: 58,
      },
      {
        changeSummary:
          'Added reconciliation notes requested by the second reviewer.',
        contentDataUrl: textDataUrl(
          'Vendor payment evidence pack\n\nReconciled totals and reviewer notes.',
        ),
        contentHash:
          'dad0054150a51d33ee89268f127efaf6e25045decc9d442c2c31b5d1757d13ea',
        createdAt: '2026-06-20T10:15:00.000Z',
        createdByUserId: 'user-elena-rossi',
        fileName: 'vendor-payment-evidence-v2.txt',
        id: 'document-version-vendor-payment-2',
        mimeType: 'text/plain',
        number: 2,
        sizeBytes: 69,
      },
    ],
  },
  {
    classification: 'internal',
    createdAt: '2026-06-19T13:00:00.000Z',
    createdByUserId: 'user-maya-chen',
    departmentId: 'dept-operations',
    description:
      'Runbook used by the service team while completing the operational readiness validation task.',
    id: 'document-readiness-runbook',
    links: [{ entityId: 'task-sla-exception-controls', entityType: 'task' }],
    ownerUserId: 'user-maya-chen',
    retentionCategory: 'operational',
    status: 'draft',
    title: 'Service readiness validation runbook',
    updatedAt: '2026-06-19T13:00:00.000Z',
    versions: [
      {
        changeSummary: 'Created the first working runbook for the task team.',
        contentDataUrl: textDataUrl(
          'Service readiness runbook\n\n1. Validate dependencies\n2. Record findings',
        ),
        contentHash:
          '4ad12a76d0c53a49f347bf2c21590b9bc009c6e8cd79c5bf0f7126a08e9cc091',
        createdAt: '2026-06-19T13:00:00.000Z',
        createdByUserId: 'user-maya-chen',
        fileName: 'service-readiness-runbook.txt',
        id: 'document-version-readiness-1',
        mimeType: 'text/plain',
        number: 1,
        sizeBytes: 71,
      },
    ],
  },
]

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const documentsStore = createVersionedStore({
  key: documentsStorageKey,
  schema: documentsSchema,
  seed: () => (getActiveTenantId() === 'atlas' ? [] : seedDocuments),
  version: 1,
})

function writeDocuments(documents: DocumentRecord[]) {
  documentsStore.write(documents)
}

export async function listDocumentsApi(): Promise<unknown> {
  await delay(240)
  return documentsStore.read()
}

export async function getDocumentApi(id: string): Promise<unknown> {
  await delay(180)
  return documentsStore.read().find((document) => document.id === id) ?? null
}

export async function createDocumentApi(
  document: DocumentRecord,
): Promise<unknown> {
  await delay(360)
  writeDocuments([...documentsStore.read(), document])
  return document
}

export async function updateDocumentApi(
  document: DocumentRecord,
): Promise<unknown> {
  await delay(340)
  writeDocuments(
    documentsStore.read().map((item) =>
      item.id === document.id ? document : item,
    ),
  )
  return document
}
