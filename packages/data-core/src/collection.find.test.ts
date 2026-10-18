import { describe, expect, it } from 'vitest'
import { defineCollection } from './defineCollection.js'
import { createCollectionValue } from './factories.js'
import { numericModelSchema } from './test/schemas.js'
import type { NumericRecord } from './test/types.js'
import { CollectionBase } from './CollectionBase.js'

const NumericCollection = defineCollection(numericModelSchema, 'identity')

function collection() {
  const records = new NumericCollection({
    value: createCollectionValue<NumericRecord, number>(),
  })
  records.setMany([
    { identity: 2, label: 'Same' },
    { identity: 0, label: 'Zero' },
    { identity: 1, label: 'Same' },
  ])
  return records
}

describe('CollectionBase.find', () => {
  it('matches every example field and keeps insertion order', () => {
    const records = collection()
    expect(records.find({ label: 'Same' }).map((item) => item.identity))
      .toEqual([2, 1])
    expect(records.find({ identity: 0, label: 'Zero' }))
      .toEqual([{ identity: 0, label: 'Zero' }])
    expect(records.find({ identity: 0, label: 'Same' })).toEqual([])
    expect(records.find({})).toEqual(records.list())
  })

  it('compares example fields with Object.is', () => {
    interface Record {
      id: string
      score: number
      details: { label: string }
    }
    const records = new CollectionBase<Record>({
      value: createCollectionValue<Record>(),
    })
    records.setItem({ id: 'nan', score: NaN, details: { label: 'same' } })
    records.setItem({ id: 'zero', score: -0, details: { label: 'same' } })
    expect(records.find({ score: NaN }).map((item) => item.id))
      .toEqual(['nan'])
    expect(records.find(['zero', 'nan']).map((item) => item.id))
      .toEqual(['zero', 'nan'])
    expect(records.find({ score: 0 })).toEqual([])
    expect(records.find({ details: { label: 'same' } })).toEqual([])
    expect(records.find({ details: records.getItem('nan')!.details }))
      .toHaveLength(1)
  })

  it('keeps ID order and duplicates, skipping missing keys', () => {
    const records = collection()
    const ids = [1, 99, 0, 1] as const
    expect(records.find(ids).map((item) => item.identity))
      .toEqual([1, 0, 1])
    expect(records.find([])).toEqual([])
    expect(() => records.find([1, -1])).toThrow()
    expect(() => records.find([NaN])).toThrow()
  })

  it('filters with a predicate and propagates callback errors', () => {
    const records = collection()
    expect(records.find((item) => item.identity > 0)
      .map((item) => item.identity)).toEqual([2, 1])
    const error = new Error('Filter failed')
    expect(() => records.find(() => { throw error })).toThrow(error)
    expect(() => records.find({}, () => { throw error })).toThrow(error)
  })

  it('sorts every query form without changing storage or tracking', () => {
    const records = collection()
    records.update(0, { label: 'Zero' })
    const before = records.value
    const ascending = (a: NumericRecord, b: NumericRecord) =>
      a.identity - b.identity

    expect(records.find({ label: 'Same' }, ascending)
      .map((item) => item.identity)).toEqual([1, 2])
    expect(records.find([2, 0, 1], ascending)
      .map((item) => item.identity)).toEqual([0, 1, 2])
    const matches = records.find(() => true, ascending)
    expect(matches.map((item) => item.identity)).toEqual([0, 1, 2])
    matches.pop()
    expect(records.list().map((item) => item.identity)).toEqual([2, 0, 1])
    expect(records.value).toBe(before)
    expect([...records.value.changed]).toEqual([0])
    expect(records.value.created.size).toBe(0)
  })
})
