import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  DocumentFilePayload,
  DocumentFormValues,
  DocumentLink,
  DocumentStatus,
  DocumentVersionFormValues,
} from '../schemas/documentSchemas'
import { documentService } from '../services/documentService'

export const documentKeys = {
  all: ['documents'] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  entity: (link: DocumentLink) =>
    [...documentKeys.all, 'entity', link.entityType, link.entityId] as const,
  list: () => [...documentKeys.all, 'list'] as const,
}

export const documentListOptions = () =>
  queryOptions({
    queryFn: documentService.list,
    queryKey: documentKeys.list(),
  })

export const documentDetailOptions = (id: string) =>
  queryOptions({
    queryFn: () => documentService.get(id),
    queryKey: documentKeys.detail(id),
  })

export const entityDocumentsOptions = (link: DocumentLink) =>
  queryOptions({
    queryFn: () => documentService.listForEntity(link),
    queryKey: documentKeys.entity(link),
  })

function useDocumentMutation<TVariables>(
  mutationFn: (variables: TVariables) => ReturnType<typeof documentService.transition>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (document) => {
      queryClient.setQueryData(documentKeys.detail(document.id), document)
      await queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useCreateDocument(actorUserId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      values,
    }: {
      file: DocumentFilePayload
      values: DocumentFormValues
    }) => documentService.create(actorUserId, values, file),
    onSuccess: async (document) => {
      queryClient.setQueryData(documentKeys.detail(document.id), document)
      await queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useAddDocumentVersion(id: string, actorUserId: string) {
  return useDocumentMutation(
    ({
      file,
      values,
    }: {
      file: DocumentFilePayload
      values: DocumentVersionFormValues
    }) => documentService.addVersion(id, actorUserId, values, file),
  )
}

export function useTransitionDocument(id: string, actorUserId: string) {
  return useDocumentMutation((status: DocumentStatus) =>
    documentService.transition(id, actorUserId, status),
  )
}

export function useAddDocumentLink(id: string) {
  return useDocumentMutation((link: DocumentLink) =>
    documentService.addLink(id, link),
  )
}

export function useRemoveDocumentLink(id: string) {
  return useDocumentMutation((link: DocumentLink) =>
    documentService.removeLink(id, link),
  )
}
