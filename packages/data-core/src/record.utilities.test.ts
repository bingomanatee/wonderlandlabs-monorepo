import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { z } from 'zod'
import { DataManager } from './DataManager.js'
import { defineCollection } from './defineCollection.js'
import { softDeleteModelSchema } from './test/schemas.js'
import { softDelete } from './test/record.utilities.js'
import type { SoftDeleteConfig, SoftDeleteRecord } from './test/types.js'

const RecordCollection = defineCollection(softDeleteModelSchema, 'id', {
  recordMethods: {
    softDelete,
    describe: (id, config: SoftDeleteConfig | undefined, collection) =>
      `${collection.getItem(id)?.label}:${config?.deletedAt ?? ''}`,
    get: (id, _config, collection) => collection.getItem(id),
    asyncLabel: async (id, _config, collection) =>
      collection.getItem(id)?.label,
    fail: () => {
      throw new Error('Utility failure')
    },
  },
})

describe('custom record utilities', () => {
  it('binds utilities and tracks soft deletes', () => {
    const manager = new DataManager()
    const records = manager.addModel('records', RecordCollection)
    records.setItem({ id: 0, label: 'Zero', deletedAt: null })
    records.syncRecords(new Map(records.value.records), true)
    const config = { deletedAt: '2026-10-17T00:00:00.000Z' }
    const result = records.recordMethods.softDelete(0, config)

    expectTypeOf(result).toEqualTypeOf<SoftDeleteRecord | undefined>()
    expectTypeOf(records.recordMethods.describe).returns.toBeString()
    expect(result?.deletedAt).toBe(config.deletedAt)
    expect(records.has(0)).toBe(true)
    expect(records.value.changed.has(0)).toBe(true)
    expect(records.value.created.size).toBe(0)
    expect(records.recordMethods.describe(0, config)).toBe(
      `Zero:${config.deletedAt}`,
    )
  })

  it('supports omitted config and detached calls', () => {
    const records = new DataManager().addModel('records', RecordCollection)
    records.setItem({ id: 1, label: 'One', deletedAt: null })
    const { softDelete: remove } = records.recordMethods

    expect(remove(1)?.deletedAt).toEqual(expect.any(String))
    expect(remove(2)).toBeUndefined()
  })

  it('keeps utility names separate from Forestry methods', () => {
    const records = new DataManager().addModel('records', RecordCollection)
    records.setItem({ id: 1, label: 'One', deletedAt: null })

    expect(records.get('records')).toBe(records.value.records)
    expect(records.recordMethods.get(1)?.label).toBe('One')
  })

  it('validates keys and preserves async results and errors', async () => {
    const spy = vi.fn()
    const Collection = defineCollection(softDeleteModelSchema, 'id', {
      recordMethods: {
        invoke: spy,
      },
    })
    const records = new DataManager().addModel('records', Collection)
    expect(() => records.recordMethods.invoke(-1)).toThrow(z.ZodError)
    expect(spy).not.toHaveBeenCalled()

    const custom = new DataManager().addModel('records', RecordCollection)
    custom.setItem({ id: 1, label: 'One', deletedAt: null })
    await expect(custom.recordMethods.asyncLabel(1)).resolves.toBe('One')
    expect(() => custom.recordMethods.fail(1)).toThrow('Utility failure')
  })
})
