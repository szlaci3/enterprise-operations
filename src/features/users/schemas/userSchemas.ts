import { z } from 'zod'

export const userStatusSchema = z.enum([
  'invited',
  'active',
  'suspended',
  'deactivated',
])

export const employmentTypeSchema = z.enum([
  'employee',
  'contractor',
  'service-account',
])

export const teamSchema = z.object({
  description: z.string(),
  id: z.string(),
  name: z.string(),
})

export const teamsSchema = z.array(teamSchema)

export const userSchema = z.object({
  createdAt: z.string().datetime(),
  departmentId: z.string(),
  email: z.string().email(),
  employeeId: z.string(),
  employmentType: employmentTypeSchema,
  firstName: z.string(),
  id: z.string(),
  jobTitle: z.string(),
  lastName: z.string(),
  lastSeenAt: z.string().datetime().nullable(),
  location: z.string(),
  managerId: z.string().nullable(),
  startDate: z.string().date(),
  status: userStatusSchema,
  teamIds: z.array(z.string()),
  updatedAt: z.string().datetime(),
})

export const usersSchema = z.array(userSchema)

export const userFormSchema = z.object({
  departmentId: z.string().min(1, 'Select a department.'),
  email: z.string().trim().email('Enter a valid business email.'),
  employeeId: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(20, 'Use no more than 20 characters.')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers, and hyphens only.'),
  employmentType: employmentTypeSchema,
  firstName: z
    .string()
    .trim()
    .min(2, 'Enter the first name.')
    .max(50, 'Use no more than 50 characters.'),
  jobTitle: z
    .string()
    .trim()
    .min(3, 'Enter a job title.')
    .max(100, 'Use no more than 100 characters.'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Enter the last name.')
    .max(50, 'Use no more than 50 characters.'),
  location: z
    .string()
    .trim()
    .min(2, 'Enter a location.')
    .max(80, 'Use no more than 80 characters.'),
  managerId: z.string(),
  startDate: z.string().date('Enter a valid start date.'),
  status: userStatusSchema,
  teamIds: z.array(z.string()),
})

export type EmploymentType = z.infer<typeof employmentTypeSchema>
export type Team = z.infer<typeof teamSchema>
export type User = z.infer<typeof userSchema>
export type UserFormValues = z.infer<typeof userFormSchema>
export type UserStatus = z.infer<typeof userStatusSchema>
