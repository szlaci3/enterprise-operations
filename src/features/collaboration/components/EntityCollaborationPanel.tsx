import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  AtSign,
  History,
  MessageCircle,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { currentSessionUserId } from '../../../app/session/currentSession'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { useAuthorization } from '../../access/hooks/useAuthorization'
import { UserAvatar } from '../../users/components/UserAvatar'
import { userListOptions } from '../../users/queries/userQueries'
import {
  collaborationEntityOptions,
  useCreateComment,
  useRemoveComment,
  useUpdateComment,
} from '../queries/collaborationQueries'
import {
  collaborationCommentFormSchema,
  type CollaborationBusinessEvent,
  type CollaborationComment,
  type CollaborationCommentFormValues,
  type CollaborationEntityType,
} from '../schemas/collaborationSchemas'

const textareaClassName =
  'mt-1.5 min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950'

type ActivityItem =
  | {
      createdAt: string
      event: CollaborationBusinessEvent
      id: string
      type: 'business'
    }
  | {
      comment: CollaborationComment
      createdAt: string
      id: string
      type: 'comment'
    }

function CommentActions({
  canContribute,
  canManage,
  comment,
  onEdit,
  onRemove,
  onReply,
}: {
  canContribute: boolean
  canManage: boolean
  comment: CollaborationComment
  onEdit: () => void
  onRemove: () => void
  onReply: () => void
}) {
  if (comment.deletedAt) return null

  return (
    <div className="flex flex-wrap gap-1">
      {canContribute && !comment.parentCommentId ? (
        <Button className="min-h-8 px-2 py-1 text-xs" onClick={onReply} variant="ghost">
          <Reply aria-hidden="true" className="size-3.5" />
          Reply
        </Button>
      ) : null}
      {canManage ? (
        <>
          <Button className="min-h-8 px-2 py-1 text-xs" onClick={onEdit} variant="ghost">
            <Pencil aria-hidden="true" className="size-3.5" />
            Edit
          </Button>
          <Button className="min-h-8 px-2 py-1 text-xs text-red-600" onClick={onRemove} variant="ghost">
            <Trash2 aria-hidden="true" className="size-3.5" />
            Remove
          </Button>
        </>
      ) : null}
    </div>
  )
}

export function EntityCollaborationPanel({
  businessEvents,
  entityId,
  entityType,
}: {
  businessEvents: CollaborationBusinessEvent[]
  entityId: string
  entityType: CollaborationEntityType
}) {
  const { accessQuery, can } = useAuthorization()
  const permissionKeys = useMemo(
    () => accessQuery.data?.permissionKeys ?? [],
    [accessQuery.data?.permissionKeys],
  )
  const canView = can('collaboration.view')
  const canContribute = can('collaboration.contribute')
  const canModerate = can('collaboration.moderate')
  const commentsQuery = useQuery({
    ...collaborationEntityOptions(entityType, entityId, permissionKeys),
    enabled: !accessQuery.isPending && canView,
  })
  const usersQuery = useQuery({
    ...userListOptions(),
    enabled: canView,
  })
  const createComment = useCreateComment(
    entityType,
    entityId,
    currentSessionUserId,
    permissionKeys,
  )
  const updateComment = useUpdateComment(
    entityType,
    entityId,
    currentSessionUserId,
    permissionKeys,
  )
  const removeComment = useRemoveComment(
    entityType,
    entityId,
    currentSessionUserId,
    permissionKeys,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingBody, setEditingBody] = useState('')
  const [replyTarget, setReplyTarget] = useState<CollaborationComment | null>(
    null,
  )
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CollaborationCommentFormValues>({
    defaultValues: {
      body: '',
      mentionUserIds: [],
      parentCommentId: null,
    },
    resolver: zodResolver(collaborationCommentFormSchema),
  })

  if (accessQuery.isPending || !canView) return null

  if (commentsQuery.isPending || usersQuery.isPending) {
    return (
      <Card className="h-72 animate-pulse bg-slate-100 dark:bg-slate-800">
        <span className="sr-only">Loading collaboration activity</span>
      </Card>
    )
  }

  if (commentsQuery.isError || usersQuery.isError) {
    return (
      <Card className="p-5">
        <p className="font-semibold">Collaboration activity unavailable</p>
        <Button
          className="mt-4"
          onClick={() => commentsQuery.refetch()}
          variant="secondary"
        >
          Retry
        </Button>
      </Card>
    )
  }

  const comments = commentsQuery.data ?? []
  const users = usersQuery.data ?? []
  const activeUsers = users.filter(
    (user) =>
      user.status === 'active' && user.id !== currentSessionUserId,
  )
  const userById = new Map(users.map((user) => [user.id, user]))
  const commentById = new Map(comments.map((comment) => [comment.id, comment]))
  const activity: ActivityItem[] = [
    ...businessEvents.map(
      (event): ActivityItem => ({
        createdAt: event.createdAt,
        event,
        id: `business:${event.id}`,
        type: 'business',
      }),
    ),
    ...comments.map(
      (comment): ActivityItem => ({
        comment,
        createdAt: comment.createdAt,
        id: `comment:${comment.id}`,
        type: 'comment',
      }),
    ),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  const submit = handleSubmit(async (values) => {
    try {
      await createComment.mutateAsync({
        ...values,
        parentCommentId: replyTarget?.id ?? null,
      })
      reset({ body: '', mentionUserIds: [], parentCommentId: null })
      setReplyTarget(null)
    } catch {
      setError('root.server', {
        message: 'The comment could not be added.',
      })
    }
  })

  const saveEdit = async (comment: CollaborationComment) => {
    try {
      await updateComment.mutateAsync({
        id: comment.id,
        values: {
          body: editingBody,
          mentionUserIds: comment.mentionUserIds,
        },
      })
      setEditingId(null)
      setEditingBody('')
    } catch {
      // Mutation state provides a persistent error message below.
    }
  }

  const mutationError = updateComment.error ?? removeComment.error

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageCircle
                aria-hidden="true"
                className="size-5 text-brand-600"
              />
              Discussion and activity
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Business events and contextual team discussion in one timeline.
            </p>
          </div>
          <Badge tone="blue">
            {comments.filter((comment) => !comment.deletedAt).length} comments
          </Badge>
        </div>

        {canContribute ? (
          <form className="mt-5" onSubmit={submit}>
            {replyTarget ? (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                <span>
                  Replying to{' '}
                  {userById.get(replyTarget.actorUserId)?.firstName ??
                    'teammate'}
                </span>
                <button
                  aria-label="Cancel reply"
                  onClick={() => setReplyTarget(null)}
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            ) : null}
            <label className="text-sm font-semibold">
              Add to the discussion
              <textarea
                className={textareaClassName}
                placeholder="Share context, a decision, or a question..."
                {...register('body')}
              />
            </label>
            {errors.body ? (
              <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>
            ) : null}
            <details className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <summary className="cursor-pointer text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <AtSign aria-hidden="true" className="size-4" />
                  Mention teammates
                </span>
              </summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {activeUsers.map((user) => (
                  <label
                    className="flex items-center gap-2 text-sm"
                    key={user.id}
                  >
                    <input
                      className="size-4 accent-brand-600"
                      type="checkbox"
                      value={user.id}
                      {...register('mentionUserIds')}
                    />
                    {user.firstName} {user.lastName}
                  </label>
                ))}
              </div>
            </details>
            {errors.root?.server ? (
              <p className="mt-2 text-xs text-red-600">
                {errors.root.server.message}
              </p>
            ) : null}
            <div className="mt-3 flex justify-end">
              <Button disabled={createComment.isPending} type="submit">
                <Send aria-hidden="true" className="size-4" />
                {replyTarget ? 'Post reply' : 'Post comment'}
              </Button>
            </div>
          </form>
        ) : null}
      </div>

      {mutationError ? (
        <p className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {mutationError.message}
        </p>
      ) : null}

      <ol className="divide-y divide-slate-100 dark:divide-slate-800">
        {activity.map((item) => {
          if (item.type === 'business') {
            const actor = userById.get(item.event.actorUserId)
            return (
              <li className="flex gap-3 p-5" key={item.id}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <History aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{item.event.title}</p>
                    <Badge>Business event</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {item.event.summary}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {actor
                      ? `${actor.firstName} ${actor.lastName}`
                      : 'Unknown actor'}{' '}
                    · {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            )
          }

          const comment = item.comment
          const actor = userById.get(comment.actorUserId)
          const parent = comment.parentCommentId
            ? commentById.get(comment.parentCommentId)
            : null
          const canManage =
            comment.actorUserId === currentSessionUserId || canModerate
          return (
            <li
              className={`flex gap-3 p-5 ${
                comment.parentCommentId ? 'pl-10 sm:pl-16' : ''
              }`}
              key={item.id}
            >
              {actor ? (
                <UserAvatar className="size-9 shrink-0" user={actor} />
              ) : (
                <span className="size-9 shrink-0 rounded-full bg-slate-200" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {actor
                          ? `${actor.firstName} ${actor.lastName}`
                          : 'Unknown contributor'}
                      </p>
                      {comment.parentCommentId ? (
                        <Badge tone="blue">Reply</Badge>
                      ) : (
                        <Badge tone="green">Comment</Badge>
                      )}
                      {comment.editedAt ? <Badge>Edited</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleString()}
                      {parent
                        ? ` · replying to ${
                            userById.get(parent.actorUserId)?.firstName ??
                            'teammate'
                          }`
                        : ''}
                    </p>
                  </div>
                  <CommentActions
                    canContribute={canContribute}
                    canManage={canManage}
                    comment={comment}
                    onEdit={() => {
                      setEditingId(comment.id)
                      setEditingBody(comment.body)
                    }}
                    onRemove={() => removeComment.mutate(comment.id)}
                    onReply={() => setReplyTarget(comment)}
                  />
                </div>

                {comment.deletedAt ? (
                  <p className="mt-2 text-sm italic text-slate-400">
                    This comment was removed.
                  </p>
                ) : editingId === comment.id ? (
                  <div className="mt-3">
                    <textarea
                      aria-label="Edit comment"
                      className={textareaClassName}
                      onChange={(event) => setEditingBody(event.target.value)}
                      value={editingBody}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={
                          updateComment.isPending ||
                          editingBody.trim().length < 2
                        }
                        onClick={() => saveEdit(comment)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {comment.body}
                  </p>
                )}

                {!comment.deletedAt && comment.mentionUserIds.length > 0 ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <AtSign
                      aria-label="Mentioned teammates"
                      className="size-3.5 text-brand-600"
                    />
                    {comment.mentionUserIds.map((userId) => {
                      const mentionedUser = userById.get(userId)
                      return (
                        <Badge key={userId} tone="blue">
                          {mentionedUser
                            ? `${mentionedUser.firstName} ${mentionedUser.lastName}`
                            : 'Managed user'}
                        </Badge>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
