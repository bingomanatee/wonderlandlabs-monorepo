import { describe, expect, expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import { CollectionBase } from './CollectionBase.js'
import { DataManager } from './DataManager.js'
import { defineCollection } from './defineCollection.js'
import { createCollectionValue } from './factories.js'
import { dataCoreErrors } from './constants.js'
import { brandedModelSchema, numericModelSchema } from './test/schemas.js'
import type { BrandedRecord, NumericRecord } from './test/types.js'

const NumericCollection = defineCollection(numericModelSchema, 'identity')
const BrandedCollection = defineCollection(brandedModelSchema, 'id')

describe('schema collections', () => {
  it('infers keys from the identity field and preserves numeric zero', () => {
    const manager = new DataManager()
    const collection = manager.addModel<number, NumericRecord>(
      'numeric',
      NumericCollection,
      new Map([[0, { identity: 0, label: 'Zero' }]]),
    )

    expectTypeOf(collection.getItem).parameter(0).toEqualTypeOf<number>()
    expect(collection.getItem(0)).toEqual({ identity: 0, label: 'Zero' })
    expect(collection.get(['records'])).toBe(collection.value.records)
    collection.update(0, { label: 'Updated' })
    expect(collection.getItem(0)?.label).toBe('Updated')
    expect(collection.value.changed.has(0)).toBe(true)
    collection.delete(0)
    expect(collection.has(0)).toBe(false)
    expect(collection.value.changed.size).toBe(0)
  })

  it('rejects invalid keys across reads, writes, and deletes', () => {
    const collection = new NumericCollection({
      value: createCollectionValue<NumericRecord, number>(),
    })
    collection.setItem({ identity: 1, label: 'One' })

    expect(() => collection.getItem(-1)).toThrow(z.ZodError)
    expect(() => collection.has(0.5)).toThrow(z.ZodError)
    expect(() => collection.delete(-1)).toThrow(z.ZodError)
    expect(() => collection.put(-1, { identity: -1, label: 'Bad' })).toThrow(
      z.ZodError,
    )
    expect(collection.list()).toEqual([{ identity: 1, label: 'One' }])
  })

  it('validates complete records before changing collection state', () => {
    const collection = new NumericCollection({
      value: createCollectionValue<NumericRecord, number>(),
    })
    collection.setItem({ identity: 1, label: 'One' })
    collection.clearTracking()

    expect(() => collection.update(1, { label: '' })).toThrow(z.ZodError)
    expect(() => collection.setItem({ identity: 2, label: '' })).toThrow(
      z.ZodError,
    )
    expect(collection.list()).toEqual([{ identity: 1, label: 'One' }])
    expect(collection.value.changed.size).toBe(0)
  })

  it('rejects mismatched explicit keys and changed identities', () => {
    const collection = new NumericCollection({
      value: createCollectionValue<NumericRecord, number>(),
    })
    collection.setItem({ identity: 1, label: 'One' })

    expect(() => collection.put(2, { identity: 1, label: 'Other' })).toThrow(
      dataCoreErrors.mismatchedIdentity,
    )
    expect(() => collection.update(1, { identity: 2 })).toThrow(
      dataCoreErrors.changedIdentity,
    )
    expect(collection.list()).toEqual([{ identity: 1, label: 'One' }])
  })

  it('validates bulk writes before applying records or tracking', () => {
    const collection = new NumericCollection({
      value: createCollectionValue<NumericRecord, number>(),
    })

    expect(() =>
      collection.putMany(
        [
          { identity: 1, label: 'One' },
          { identity: 2, label: '' },
        ],
        true,
      ),
    ).toThrow(z.ZodError)
    expect(collection.list()).toEqual([])
    expect(collection.value.created.size).toBe(0)
    expect(() =>
      collection.putMany(
        new Map([
          [1, { identity: 1, label: 'One' }],
          [2, { identity: 3, label: 'Three' }],
        ]),
      ),
    ).toThrow(dataCoreErrors.mismatchedIdentity)
    expect(collection.list()).toEqual([])
  })

  it('preserves schema output and branded identity types', () => {
    const collection = new BrandedCollection({
      value: createCollectionValue<BrandedRecord>(),
    })
    const record = brandedModelSchema.parse({ id: 'one', label: ' One ' })
    collection.setItem(record)

    expectTypeOf(collection.getItem)
      .parameter(0)
      .toEqualTypeOf<BrandedRecord['id']>()
    expect(collection.getItem(record.id)?.label).toBe('One')
  })

  it('retains schema-free collections and numeric default ids', () => {
    const collection = new CollectionBase<{ id: number; label: string }>({
      value: createCollectionValue<{ id: number; label: string }>(),
    })
    collection.setItem({ id: 0, label: 'Zero' })
    expect(collection.getItem(0)?.label).toBe('Zero')
    collection.clearTracking()
    expect(collection.value.created.size).toBe(0)
  })
  it('rolls back registration when starter records fail validation', () => {
    const manager = new DataManager()

    expect(() =>
      manager.addModel(
        'numeric',
        NumericCollection,
        new Map([[1, { identity: 1, label: '' }]]),
      ),
    ).toThrow(z.ZodError)
    expect(manager.collections.has('numeric')).toBe(false)
    expect(manager.$branches.size).toBe(0)
    const collection = manager.addModel('numeric', NumericCollection)
    collection.setItem({ identity: 1, label: 'One' })
    expect(collection.getItem(1)?.label).toBe('One')
  })

  it('accepts optional schemas in existing collection subclasses', () => {
    const collection = new CollectionBase<BrandedRecord>(
      {
        value: createCollectionValue<BrandedRecord>(),
      },
      { schema: brandedModelSchema },
    )
    const record = brandedModelSchema.parse({ id: 'one', label: 'One' })

    collection.setItem(record)
    expect(() => collection.getItem('' as BrandedRecord['id'])).toThrow(
      z.ZodError,
    )
    expect(collection.getItem(record.id)).toEqual(record)
  })
})
