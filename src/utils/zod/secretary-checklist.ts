import { z } from 'zod'

export const CHECKLIST_STATE_VALUES = [
  'YES',
  'NO',
  'NOT_APPLICABLE',
  'PENDING',
] as const

export const ChecklistStateSchema = z.enum(CHECKLIST_STATE_VALUES)

export const ChecklistItemSchema = z.object({
  key: z.string().min(1),
  state: ChecklistStateSchema,
  comment: z.string().nullable().optional().default(null),
})

export const SecretaryChecklistSchema = z.object({
  items: ChecklistItemSchema.array().default([]),
  updatedAt: z.coerce.date().nullable().optional().default(null),
  updatedById: z.string().nullable().optional().default(null),
  completedAt: z.coerce.date().nullable().optional().default(null),
})

export type SecretaryChecklist = z.infer<typeof SecretaryChecklistSchema>
export type SecretaryChecklistItem = z.infer<typeof ChecklistItemSchema>
