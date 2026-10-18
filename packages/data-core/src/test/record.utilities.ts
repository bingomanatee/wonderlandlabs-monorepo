import type { RecordUtility } from '../types.js'
import type { SoftDeleteConfig, SoftDeleteRecord } from './types.js'

export const softDelete: RecordUtility<
  SoftDeleteRecord,
  number,
  SoftDeleteConfig,
  SoftDeleteRecord | undefined
> = (id, config, collection) => {
  collection.update(id, {
    deletedAt: config?.deletedAt ?? new Date().toISOString(),
  })
  return collection.getItem(id)
}
