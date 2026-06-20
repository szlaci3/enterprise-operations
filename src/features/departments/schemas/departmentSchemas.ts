import { z } from 'zod'

export const departmentStatusSchema = z.enum(['active', 'planned', 'inactive'])

export const departmentOwnerSchema = z.object({
  email: z.string().email(),
  id: z.string(),
  name: z.string(),
  title: z.string(),
})

export const departmentSchema = z.object({
  code: z.string(),
  costCenter: z.string(),
  createdAt: z.string().datetime(),
  description: z.string(),
  headcount: z.number().int().nonnegative(),
  id: z.string(),
  name: z.string(),
  owner: departmentOwnerSchema,
  parentDepartmentId: z.string().nullable(),
  status: departmentStatusSchema,
  updatedAt: z.string().datetime(),
})

export const departmentsSchema = z.array(departmentSchema)

export const departmentFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(8, 'Use no more than 8 characters.')
    .regex(
      /^[A-Za-z0-9-]+$/,
      'Use letters, numbers, and hyphens only.',
    ),
  costCenter: z
    .string()
    .trim()
    .min(3, 'Enter a cost center.')
    .max(20, 'Use no more than 20 characters.'),
  description: z
    .string()
    .trim()
    .min(20, 'Provide at least 20 characters of context.')
    .max(500, 'Use no more than 500 characters.'),
  headcount: z
    .number({ error: 'Enter a valid headcount.' })
    .int('Headcount must be a whole number.')
    .min(0, 'Headcount cannot be negative.')
    .max(100_000, 'Headcount is above the supported limit.'),
  name: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(80, 'Use no more than 80 characters.'),
  ownerEmail: z.string().trim().email('Enter a valid email address.'),
  ownerName: z
    .string()
    .trim()
    .min(3, 'Enter the accountable owner.')
    .max(80, 'Use no more than 80 characters.'),
  ownerTitle: z
    .string()
    .trim()
    .min(3, 'Enter the owner’s role.')
    .max(80, 'Use no more than 80 characters.'),
  parentDepartmentId: z.string(),
  status: departmentStatusSchema,
})

export type Department = z.infer<typeof departmentSchema>
export type DepartmentFormValues = z.infer<typeof departmentFormSchema>
export type DepartmentStatus = z.infer<typeof departmentStatusSchema>
