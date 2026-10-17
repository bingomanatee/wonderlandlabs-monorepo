import { z } from 'zod'

export const numericModelSchema = z.strictObject({
  identity: z.number().int().nonnegative(),
  label: z.string().min(1),
})

export const brandedModelSchema = z.object({
  id: z.string().min(1).brand<'RecordId'>(),
  label: z.string().trim().min(1),
})

export const softDeleteModelSchema = z.object({
  id: z.number().int().nonnegative(),
  label: z.string().min(1),
  deletedAt: z.string().nullable(),
})
