import { describe, expect, expectTypeOf, it } from 'vitest'
import { DataManager } from './DataManager.js'
import { defineCollection } from './defineCollection.js'
import { softDeleteModelSchema } from './test/schemas.js'
import { softDelete } from './test/record.utilities.js'
import type { SoftDeleteConfig, SoftDeleteRecord } from './test/types.js'

const Records = defineCollection(softDeleteModelSchema, 'id', {
  recordMethods: { softDelete },
  collectionMethods: {
    active: (_config, collection) =>
      collection.list().filter((record) => !record.deletedAt),
    deleteAll: (config: SoftDeleteConfig | undefined, collection) => {
      for (const record of collection.list())
        softDelete(record.id, config, collection)
      return collection.list().length
    },
    get: (_config, collection) => collection.list(),
    count: async (_config, collection) => collection.list().length,
    fail: () => {
      throw new Error('Collection utility failure')
    },
  },
})

describe('custom collection utilities', () => {
  it('binds its collection and retains return types', () => {
    const manager = new DataManager()
    const records = manager.addModel('records', Records)
    const other = manager.addModel('other', Records)
    records.setItem({ id: 0, label: 'Zero', deletedAt: null })
    other.setItem({ id: 1, label: 'One', deletedAt: null })
    const { active, deleteAll } = records.collectionMethods
    expectTypeOf(active).returns.toEqualTypeOf<SoftDeleteRecord[]>()
    expectTypeOf(deleteAll).returns.toBeNumber()
    expect(active()).toHaveLength(1)
    expect(deleteAll({ deletedAt: 'deleted' })).toBe(1)
    expect(active()).toEqual([])
    expect(other.collectionMethods.active()).toHaveLength(1)
    expect(records.value.changed.has(0)).toBe(true)
    expect(records.recordMethods.softDelete(0)?.id).toBe(0)
  })

  it('preserves Forestry, promises, and errors', async () => {
    const records = new DataManager().addModel('records', Records)
    records.setItem({ id: 0, label: 'Zero', deletedAt: null })
    expect(records.get('records')).toBe(records.value.records)
    expect(records.collectionMethods.get()).toHaveLength(1)
    await expect(records.collectionMethods.count()).resolves.toBe(1)
    expect(() => records.collectionMethods.fail()).toThrow(
      'Collection utility failure',
    )
  })
})
