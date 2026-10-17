export interface TestRecord {
  id: string
  label: string
}

export interface TestChange {
  id: string
  operation: 'changed'
}

import type { z } from '../types.js'
import type { brandedModelSchema, numericModelSchema } from './schemas.js'

export type NumericRecord = z.output<typeof numericModelSchema>
export type BrandedRecord = z.output<typeof brandedModelSchema>

export interface SoftDeleteConfig {
  deletedAt: string
}

export type SoftDeleteRecord = z.output<
  typeof import('./schemas.js').softDeleteModelSchema
>
