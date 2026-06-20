import { z } from 'zod'

export const workflowStatusSchema = z.enum(['draft', 'active', 'retired'])

export const workflowStateTypeSchema = z.enum([
  'initial',
  'standard',
  'terminal',
])

export const workflowStateSchema = z.object({
  description: z.string(),
  id: z.string(),
  key: z.string(),
  name: z.string(),
  type: workflowStateTypeSchema,
})

export const workflowTransitionSchema = z.object({
  fromStateId: z.string(),
  id: z.string(),
  name: z.string(),
  toStateId: z.string(),
})

export const workflowDefinitionSchema = z.object({
  createdAt: z.string().datetime(),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  states: z.array(workflowStateSchema),
  status: workflowStatusSchema,
  templateId: z.string().nullable(),
  transitions: z.array(workflowTransitionSchema),
  updatedAt: z.string().datetime(),
  version: z.number().int().positive(),
  workflowKey: z.string(),
})

export const workflowDefinitionsSchema = z.array(workflowDefinitionSchema)

const workflowStateFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(5, 'Describe the business meaning of this state.')
    .max(200, 'Use no more than 200 characters.'),
  id: z.string(),
  key: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(40, 'Use no more than 40 characters.')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Use lowercase letters, numbers, and underscores.',
    ),
  name: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(60, 'Use no more than 60 characters.'),
  type: workflowStateTypeSchema,
})

const workflowTransitionFormSchema = z.object({
  fromStateId: z.string().min(1, 'Select a source state.'),
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(80, 'Use no more than 80 characters.'),
  toStateId: z.string().min(1, 'Select a destination state.'),
})

function addGraphIssues(
  values: {
    states: z.infer<typeof workflowStateFormSchema>[]
    transitions: z.infer<typeof workflowTransitionFormSchema>[]
  },
  context: z.RefinementCtx,
) {
  const stateIds = new Set(values.states.map((state) => state.id))
  const initialStates = values.states.filter((state) => state.type === 'initial')

  if (initialStates.length !== 1) {
    context.addIssue({
      code: 'custom',
      message: 'A workflow must have exactly one initial state.',
      path: ['states'],
    })
  }

  const normalizedKeys = values.states.map((state) => state.key.toLowerCase())
  if (new Set(normalizedKeys).size !== normalizedKeys.length) {
    context.addIssue({
      code: 'custom',
      message: 'State keys must be unique.',
      path: ['states'],
    })
  }

  values.transitions.forEach((transition, index) => {
    if (
      !stateIds.has(transition.fromStateId) ||
      !stateIds.has(transition.toStateId)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Every transition must reference available states.',
        path: ['transitions', index],
      })
    }
    if (transition.fromStateId === transition.toStateId) {
      context.addIssue({
        code: 'custom',
        message: 'A transition cannot return to the same state.',
        path: ['transitions', index, 'toStateId'],
      })
    }
  })

  const duplicateEdges = new Set<string>()
  values.transitions.forEach((transition, index) => {
    const edge = `${transition.fromStateId}:${transition.toStateId}`
    if (duplicateEdges.has(edge)) {
      context.addIssue({
        code: 'custom',
        message: 'Only one transition may connect the same two states.',
        path: ['transitions', index],
      })
    }
    duplicateEdges.add(edge)
  })

  for (const state of values.states) {
    const outgoing = values.transitions.filter(
      (transition) => transition.fromStateId === state.id,
    )
    if (state.type === 'terminal' && outgoing.length > 0) {
      context.addIssue({
        code: 'custom',
        message: `Terminal state "${state.name}" cannot have outgoing transitions.`,
        path: ['transitions'],
      })
    }
    if (state.type !== 'terminal' && outgoing.length === 0) {
      context.addIssue({
        code: 'custom',
        message: `Non-terminal state "${state.name}" needs an outgoing transition.`,
        path: ['transitions'],
      })
    }
  }

  const initialState = initialStates[0]
  if (initialState) {
    const reachable = new Set([initialState.id])
    const pending = [initialState.id]
    while (pending.length > 0) {
      const currentId = pending.shift()
      for (const transition of values.transitions) {
        if (
          transition.fromStateId === currentId &&
          !reachable.has(transition.toStateId)
        ) {
          reachable.add(transition.toStateId)
          pending.push(transition.toStateId)
        }
      }
    }
    const unreachable = values.states.find((state) => !reachable.has(state.id))
    if (unreachable) {
      context.addIssue({
        code: 'custom',
        message: `State "${unreachable.name}" is not reachable from the initial state.`,
        path: ['states'],
      })
    }
  }
}

export const workflowFormSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(20, 'Provide at least 20 characters of context.')
      .max(500, 'Use no more than 500 characters.'),
    name: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(100, 'Use no more than 100 characters.'),
    states: z
      .array(workflowStateFormSchema)
      .min(2, 'Add at least two workflow states.')
      .max(20, 'A workflow supports up to 20 states.'),
    templateId: z.string(),
    transitions: z
      .array(workflowTransitionFormSchema)
      .min(1, 'Add at least one transition.')
      .max(60, 'A workflow supports up to 60 transitions.'),
    workflowKey: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(50, 'Use no more than 50 characters.')
      .regex(
        /^[a-z][a-z0-9-]*$/,
        'Use lowercase letters, numbers, and hyphens.',
      ),
  })
  .superRefine(addGraphIssues)

export const workflowTemplateSchema = z.object({
  description: z.string(),
  id: z.string(),
  name: z.string(),
  states: z.array(workflowStateFormSchema),
  transitions: z.array(workflowTransitionFormSchema),
})

export const workflowTemplatesSchema = z.array(workflowTemplateSchema)

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>
export type WorkflowFormValues = z.infer<typeof workflowFormSchema>
export type WorkflowState = z.infer<typeof workflowStateSchema>
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>
export type WorkflowTemplate = z.infer<typeof workflowTemplateSchema>
export type WorkflowTransition = z.infer<typeof workflowTransitionSchema>
