import { describe, expect, it, vi } from 'vitest'
import { defineCollection } from './defineCollection.js'
import { DataManager } from './DataManager.js'
import { numericModelSchema } from './test/schemas.js'

const timestampSchema = numericModelSchema.extend({
  updatedAt: numericModelSchema.shape.identity,
})
const driftMs = 5000
const equivalent = (
  current: { identity: number; label: string; updatedAt: number },
  incoming: { identity: number; label: string; updatedAt: number },
) => current.identity === incoming.identity &&
  current.label === incoming.label &&
  Math.abs(current.updatedAt - incoming.updatedAt) <= driftMs

function collection() {
  const Records = defineCollection(timestampSchema, 'identity', {
    recordComparator: equivalent,
  })
  return new DataManager().addModel('records', Records)
}

const original = { identity: 1, label: 'One', updatedAt: 10000 }

describe('remote record reconciliation', () => {
  it('preserves references and emits nothing for timestamp-only drift', () => {
    const records = collection()
    records.syncRecords(new Map([[1, original]]))
    const state = records.value
    const observer = vi.fn()
    const subscription = records.subscribe(observer)
    observer.mockClear()
    records.syncRecords(new Map([[1, { ...original, updatedAt: 12000 }]]))
    expect(records.value).toBe(state)
    expect(records.getItem(1)).toBe(state.records.get(1))
    expect(observer).not.toHaveBeenCalled()
    subscription.unsubscribe()
  })

  it('applies real changes and timestamps outside the chosen tolerance', () => {
    const records = collection()
    records.syncRecords(new Map([[1, original]]))
    records.syncRecords(new Map([[1, { ...original, label: 'Different' }]]))
    expect(records.getItem(1)?.label).toBe('Different')
    records.syncRecords(new Map([[1, { ...original, updatedAt: 20000 }]]))
    expect(records.getItem(1)?.updatedAt).toBe(20000)
  })

  it('preserves dirty records unless explicitly accepting remote data', () => {
    const records = collection()
    records.setItem(original)
    const local = records.getItem(1)
    const remote = new Map([[1, { ...original, updatedAt: 12000 }]])
    records.syncRecords(remote)
    expect(records.value.changed.has(1)).toBe(true)
    records.syncRecords(remote, true)
    expect(records.getItem(1)).toBe(local)
    expect(records.value.changed.size).toBe(0)
    expect(records.value.created.size).toBe(0)
  })

  it('validates and compares all input before mutation', () => {
    const compare = vi.fn(equivalent)
    const Records = defineCollection(timestampSchema, 'identity', {
      recordComparator: compare,
    })
    const records = new DataManager().addModel('records', Records)
    records.syncRecords(new Map([[1, original]]))
    expect(() => records.syncRecords(new Map([
      [1, { ...original, updatedAt: -1 }],
    ]))).toThrow()
    expect(compare).not.toHaveBeenCalled()
    compare.mockImplementation(() => { throw new Error('Cannot compare') })
    const state = records.value
    expect(() => records.syncRecords(new Map([
      [2, { ...original, identity: 2 }],
      [1, original],
    ]))).toThrow('Cannot compare')
    expect(records.value).toBe(state)
  })

  it('still retains newer edits after an equivalent remote echo', async () => {
    const records = collection()
    records.setItem(original)
    let finish!: (success: boolean) => void
    let started!: () => void
    const ready = new Promise<void>((resolve) => { started = resolve })
    const saving = records.persist({
      sendRecords: async () => {
        started()
        return new Promise<boolean>((resolve) => { finish = resolve })
      },
    })
    await ready
    records.update(1, { label: 'Newer edit' })
    records.syncRecords(new Map([[1, { ...original, updatedAt: 12000 }]]))
    finish(true)
    await expect(saving).resolves.toBe(true)
    expect(records.value.changed.has(1)).toBe(true)
    expect(records.getItem(1)?.label).toBe('Newer edit')
  })
})
