import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Plus, Save, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import {
  workflowFormSchema,
  type WorkflowFormValues,
  type WorkflowTemplate,
} from '../schemas/workflowSchemas'
import { WorkflowServiceError } from '../services/workflowService'

interface WorkflowFormProps {
  initialValues: WorkflowFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: WorkflowFormValues) => Promise<void>
  submitLabel: string
  templates: WorkflowTemplate[]
  lockKey?: boolean
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-950'
const labelClassName =
  'text-sm font-semibold text-slate-700 dark:text-slate-200'
const errorClassName = 'mt-1 block text-xs text-red-600 dark:text-red-400'

export function WorkflowForm({
  initialValues,
  isSubmitting,
  lockKey,
  onCancel,
  onSubmit,
  submitLabel,
  templates,
}: WorkflowFormProps) {
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<WorkflowFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(workflowFormSchema),
  })
  const states = useFieldArray({
    control,
    keyName: 'fieldKey',
    name: 'states',
  })
  const transitions = useFieldArray({
    control,
    keyName: 'fieldKey',
    name: 'transitions',
  })
  const watchedStates = useWatch({ control, name: 'states' })
  const selectedTemplateId = useWatch({ control, name: 'templateId' })

  const applyTemplate = (templateId: string) => {
    if (!templateId) {
      setValue('templateId', '')
      return
    }
    const template = templates.find((item) => item.id === templateId)
    if (!template) {
      return
    }
    const stateIdMap = new Map<string, string>()
    const nextStates = template.states.map((state) => {
      const id = crypto.randomUUID()
      stateIdMap.set(state.id, id)
      return { ...state, id }
    })
    reset({
      ...getValues(),
      states: nextStates,
      templateId,
      transitions: template.transitions.map((transition) => ({
        ...transition,
        fromStateId: stateIdMap.get(transition.fromStateId) ?? '',
        id: crypto.randomUUID(),
        toStateId: stateIdMap.get(transition.toStateId) ?? '',
      })),
    })
  }

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (
        error instanceof WorkflowServiceError &&
        error.code === 'duplicate-key'
      ) {
        setError('workflowKey', { message: error.message })
        return
      }
      setError('root.server', {
        message: 'The workflow could not be saved. Please try again.',
      })
    }
  })

  const stateOptions = states.fields.map((state, index) => ({
    id: state.id,
    label: watchedStates[index]?.name || `State ${index + 1}`,
  }))

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      {errors.root?.server ? (
        <div
          className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {errors.root.server.message}
        </div>
      ) : null}

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold text-slate-950 dark:text-white">
          Definition identity
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Workflow name
            <input className={inputClassName} {...register('name')} />
            {errors.name ? (
              <span className={errorClassName}>{errors.name.message}</span>
            ) : null}
          </label>
          <label className={labelClassName}>
            Stable workflow key
            <input
              className={inputClassName}
              disabled={lockKey}
              {...register('workflowKey')}
            />
            {errors.workflowKey ? (
              <span className={errorClassName}>
                {errors.workflowKey.message}
              </span>
            ) : null}
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Business purpose
            <textarea
              className={`${inputClassName} h-28 resize-y py-2.5`}
              {...register('description')}
            />
            {errors.description ? (
              <span className={errorClassName}>
                {errors.description.message}
              </span>
            ) : null}
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Starting template
            <select
              className={inputClassName}
              onChange={(event) => applyTemplate(event.target.value)}
              value={selectedTemplateId}
            >
              <option value="">Custom workflow</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} — {template.description}
                </option>
              ))}
            </select>
            <input type="hidden" {...register('templateId')} />
          </label>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Workflow states
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Define one initial state, working states, and terminal outcomes.
            </p>
          </div>
          <Button
            onClick={() =>
              states.append({
                description: '',
                id: crypto.randomUUID(),
                key: '',
                name: '',
                type: 'standard',
              })
            }
            variant="secondary"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add state
          </Button>
        </div>
        {errors.states?.root?.message ? (
          <p className={errorClassName}>{errors.states.root.message}</p>
        ) : typeof errors.states?.message === 'string' ? (
          <p className={errorClassName}>{errors.states.message}</p>
        ) : null}
        <div className="mt-5 space-y-4">
          {states.fields.map((field, index) => (
            <fieldset
              className="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-12"
              key={field.fieldKey}
            >
              <legend className="sr-only">State {index + 1}</legend>
              <input type="hidden" {...register(`states.${index}.id`)} />
              <label className={`${labelClassName} sm:col-span-4`}>
                Name
                <input
                  className={inputClassName}
                  {...register(`states.${index}.name`)}
                />
              </label>
              <label className={`${labelClassName} sm:col-span-3`}>
                Key
                <input
                  className={inputClassName}
                  {...register(`states.${index}.key`)}
                />
              </label>
              <label className={`${labelClassName} sm:col-span-3`}>
                Type
                <select
                  className={inputClassName}
                  {...register(`states.${index}.type`)}
                >
                  <option value="initial">Initial</option>
                  <option value="standard">Standard</option>
                  <option value="terminal">Terminal</option>
                </select>
              </label>
              <div className="flex items-end sm:col-span-2">
                <Button
                  aria-label={`Remove state ${index + 1}`}
                  className="w-full"
                  disabled={states.fields.length <= 2}
                  onClick={() => states.remove(index)}
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Remove
                </Button>
              </div>
              <label className={`${labelClassName} sm:col-span-12`}>
                Business meaning
                <input
                  className={inputClassName}
                  {...register(`states.${index}.description`)}
                />
              </label>
            </fieldset>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Allowed transitions
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Every non-terminal state needs an onward path.
            </p>
          </div>
          <Button
            onClick={() =>
              transitions.append({
                fromStateId: '',
                id: crypto.randomUUID(),
                name: '',
                toStateId: '',
              })
            }
            variant="secondary"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add transition
          </Button>
        </div>
        {typeof errors.transitions?.message === 'string' ? (
          <p className={errorClassName}>{errors.transitions.message}</p>
        ) : null}
        <div className="mt-5 space-y-3">
          {transitions.fields.map((field, index) => (
            <fieldset
              className="grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-12"
              key={field.fieldKey}
            >
              <legend className="sr-only">Transition {index + 1}</legend>
              <input type="hidden" {...register(`transitions.${index}.id`)} />
              <label className={`${labelClassName} sm:col-span-4`}>
                Action name
                <input
                  className={inputClassName}
                  {...register(`transitions.${index}.name`)}
                />
              </label>
              <label className={`${labelClassName} sm:col-span-3`}>
                From
                <select
                  className={inputClassName}
                  {...register(`transitions.${index}.fromStateId`)}
                >
                  <option value="">Select state</option>
                  {stateOptions.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${labelClassName} sm:col-span-3`}>
                To
                <select
                  className={inputClassName}
                  {...register(`transitions.${index}.toStateId`)}
                >
                  <option value="">Select state</option>
                  {stateOptions.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end sm:col-span-2">
                <Button
                  aria-label={`Remove transition ${index + 1}`}
                  className="w-full"
                  disabled={transitions.fields.length <= 1}
                  onClick={() => transitions.remove(index)}
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Remove
                </Button>
              </div>
            </fieldset>
          ))}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          <Save aria-hidden="true" className="size-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
