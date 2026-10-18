import { describe, expect, it, vi } from 'vitest'
import { CollectionBase } from './CollectionBase.js'
import { DataManager } from './DataManager.js'
import { defineCollection } from './defineCollection.js'
import { createCollectionValue } from './factories.js'
import { numericModelSchema } from './test/schemas.js'
import type { NumericRecord } from './test/types.js'

const Records = defineCollection(numericModelSchema, 'identity')

function collection() {
  const records = new Records({
    value: createCollectionValue<NumericRecord, number>(),
  })
  records.setMany([
    { identity: 0, label: 'Keep' },
    { identity: 1, label: 'Clean' },
    { identity: 2, label: 'Clean' },
  ], true)
  return records
}

describe('collection housekeeping', () => {
  it('cleans examples while preserving unmatched state', () => {
    const records = collection()
    records.cleanCollection({ label: 'Clean' })
    expect(records.list()).toEqual([{ identity: 0, label: 'Keep' }])
    expect([...records.value.created]).toEqual([0])
    expect([...records.value.changed]).toEqual([0])
  })

  it('cleans readonly IDs, including zero, duplicates and missing keys', () => {
    const records = collection()
    records.cleanCollection([0, 99, 0] as const)
    expect(records.list().map((item) => item.identity)).toEqual([1, 2])
    const before = records.value
    records.cleanCollection([])
    records.cleanCollection([99])
    expect(records.value).toBe(before)
  })

  it('uses the same predicate matches as find in a single state change', () => {
    const records = collection()
    const query = (item: NumericRecord) => item.identity > 0
    const matches = records.find(query)
    const seen = vi.fn()
    const sub = records.subscribe(seen)
    seen.mockClear()
    records.cleanCollection(query)
    expect(matches.map((item) => item.identity)).toEqual([1, 2])
    expect(records.list().map((item) => item.identity)).toEqual([0])
    expect(seen).toHaveBeenCalledTimes(1)
    sub.unsubscribe()
  })

  it('preserves state on invalid IDs or predicate failure', () => {
    const records = collection()
    const before = records.value
    expect(() => records.cleanCollection([0, -1])).toThrow()
    expect(() => records.cleanCollection((item) => {
      if (item.identity === 2) throw new Error('Failed selection')
      return true
    })).toThrow('Failed selection')
    expect(records.value).toBe(before)
  })

  it('cleans actual map keys for schema-free explicit-key records', () => {
    const records = new CollectionBase<{ id: string; label: string }>({
      value: createCollectionValue<{ id: string; label: string }>(),
    })
    records.put('storage-key', { id: 'record-id', label: 'Clean' })
    records.cleanCollection({ label: 'Clean' })
    expect(records.list()).toEqual([])
    expect(records.value.created.size).toBe(0)
    expect(records.value.changed.size).toBe(0)
  })

  it('supports an empty example as a full selection', () => {
    const records = collection()
    records.cleanCollection({})
    expect(records.list()).toEqual([])
    expect(records.value.created.size).toBe(0)
    expect(records.value.changed.size).toBe(0)
  })

  it('deletes by scalar ID, example, ID array, or predicate', () => {
    const records = collection()
    records.delete(0)
    expect(records.has(0)).toBe(false)
    records.delete([1, 99, 1] as const)
    expect(records.list().map((item) => item.identity)).toEqual([2])
    records.delete({ label: 'Clean' })
    expect(records.list()).toEqual([])
    records.setMany([{ identity: 3, label: 'Keep' }], true)
    records.delete((item) => item.identity === 3)
    expect(records.value.created.size).toBe(0)
    expect(records.value.changed.size).toBe(0)
  })

  it('validates delete queries before removing any records', () => {
    const records = collection()
    const before = records.value
    expect(() => records.delete([0, -1])).toThrow()
    expect(() => records.delete((item) => {
      if (item.identity === 2) throw new Error('Failed selection')
      return true
    })).toThrow('Failed selection')
    expect(records.value).toBe(before)
    records.delete([])
    expect(records.value).toBe(before)
    records.delete({})
    expect(records.list()).toEqual([])
  })

  it('resets one reusable collection without calling I/O', () => {
    const connector = {
      get: vi.fn(), put: vi.fn(), delete: vi.fn(),
      start: vi.fn(), stop: vi.fn(),
    }
    const manager = new DataManager({ connector })
    const records = manager.addModel('records', Records)
    const other = manager.addModel('other', Records)
    records.setItem({ identity: 0, label: 'Clean' })
    other.setItem({ identity: 1, label: 'Keep' })
    records.cleanAll()
    records.cleanAll()
    expect(records.list()).toEqual([])
    expect(records.value.created.size).toBe(0)
    expect(records.value.changed.size).toBe(0)
    expect(manager.collection('records')).toBe(records)
    expect(other.has(1)).toBe(true)
    expect(connector.delete).not.toHaveBeenCalled()
    expect(connector.put).not.toHaveBeenCalled()
    records.setItem({ identity: 2, label: 'Reusable' })
    expect(records.value.created.has(2)).toBe(true)
  })
})
