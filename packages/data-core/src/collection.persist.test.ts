import { Subscription } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CollectionBase } from './CollectionBase.js'
import { DataManager } from './DataManager.js'
import { defineCollection } from './defineCollection.js'
import { createCollectionValue } from './factories.js'
import type { CollectionPersistRetry } from './types.js'
import { persistModelSchema } from './test/schemas.js'
import type { PersistRecord } from './test/types.js'

afterEach(() => vi.useRealTimers())

function record(id: number, title = String(id)): PersistRecord {
  return { id, title, details: { count: 1 } }
}

function collection(retry: CollectionPersistRetry = { maxRetries: 0 }) {
  const Records = defineCollection(persistModelSchema, 'id', {
    persistRetry: retry,
  })
  return new Records({ value: createCollectionValue<PersistRecord, number>() })
}

function deferred() {
  let resolve!: (success: boolean) => void
  const promise = new Promise<boolean>((done) => { resolve = done })
  return { promise, resolve }
}

async function flush() {
  for (let index = 0; index < 8; index += 1) await Promise.resolve()
}

describe('collection persistence', () => {
  it('syncs remote records while preserving local edits by default', () => {
    const records = collection()
    records.setMany([record(1), record(2)], true)
    records.syncRecords(new Map([[1, record(1, 'Remote')], [3, record(3)]]))
    expect(records.getItem(1)?.title).toBe('1')
    expect(records.has(3)).toBe(true)
    expect([...records.value.changed]).toEqual([1, 2])
    records.syncRecords(new Map([[1, record(1, 'Remote')]]), true)
    expect(records.getItem(1)?.title).toBe('Remote')
    expect([...records.value.changed]).toEqual([2])
    expect([...records.value.created]).toEqual([2])
  })

  it('aborts selected queued IDs without discarding other saves', async () => {
    const records = collection()
    records.setMany([record(1), record(2)], true)
    const sender = vi.fn(async (_map: Map<number, PersistRecord>) => true)
    const result = records.persist({ sendRecords: sender })
    expect(records.pendingPersists()).toEqual([1, 2])
    records.abortPending([1])
    expect(records.pendingPersists()).toEqual([2])
    await expect(result).resolves.toBe(false)
    expect([...sender.mock.calls[0][0].keys()]).toEqual([2])
    expect([...records.value.changed]).toEqual([1])
    expect(records.pendingPersists()).toEqual([])
  })

  it('leaves active requests alone and exposes their lifecycle', async () => {
    const records = collection()
    records.setItem(record(1))
    const reply = deferred()
    const sender = vi.fn(async () => reply.promise)
    const before = Date.now()
    const result = records.persist({ sendRecords: sender })
    const request = records.persistWork$.value[0]
    expect(request.createdAt).toBeGreaterThanOrEqual(before)
    expect(request.state).toBe('pending')
    await flush()
    expect(request.state).toBe('active')
    records.abortPending([1])
    expect(records.pendingPersists()).toEqual([1])
    reply.resolve(true)
    await expect(result).resolves.toBe(true)
    expect(request.state).toBe('complete')
    expect([...records.value.changed]).toEqual([])
  })

  it('leaves failed requests and their retries alone', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 10, maxRetries: 2 })
    records.setItem(record(1))
    const sender = vi.fn(async () => false)
    const result = records.persist({ sendRecords: sender })
    const request = records.persistWork$.value[0]
    await vi.advanceTimersByTimeAsync(0)
    expect(request.state).toBe('failed')
    records.abortPending()
    expect(records.pendingPersists()).toEqual([1])
    await vi.runAllTimersAsync()
    await expect(result).resolves.toBe(false)
    expect(sender).toHaveBeenCalledTimes(3)
    expect(request.state).toBe('failed')
  })

  it('aborts only older pending work even within the same millisecond',
    async () => {
      vi.useFakeTimers()
      const records = collection()
      records.setItem(record(1))
      const sender = vi.fn(async () => true)
      const first = records.persist({ sendRecords: sender })
      const request = records.persistWork$.value[0]
      records.abortPending()
      const second = records.persist({ sendRecords: sender })
      expect(records.persistWork$.value[0].createdAt).toBe(request.createdAt)
      await expect(first).resolves.toBe(false)
      expect(request.state).toBe('failed')
      await vi.runAllTimersAsync()
      await expect(second).resolves.toBe(true)
      expect(sender).toHaveBeenCalledOnce()
    },
  )

  it('preserves requests enqueued by an abort observer', async () => {
    const records = collection()
    records.setItem(record(1))
    const sender = vi.fn(async () => true)
    const first = records.persist({ sendRecords: sender })
    let next: Promise<boolean> | undefined
    const subscription = records.persistWork$.subscribe((work) => {
      if (work.length || next) return
      // Set the guard before persist emits synchronously.
      next = Promise.resolve(false)
      next = records.persist({ sendRecords: sender })
    })
    records.abortPending()
    subscription.unsubscribe()
    await expect(first).resolves.toBe(false)
    await expect(next).resolves.toBe(true)
    expect(sender).toHaveBeenCalledOnce()
  })

  it('acknowledges only unchanged copies', async () => {
    const records = collection()
    records.setMany([record(1), record(2)], true)
    const reply = deferred()
    const sendRecords = vi.fn((_map: Map<number, PersistRecord>) => {
      return reply.promise
    })
    const result = records.persist({ sendRecords })
    await flush()
    const payload = sendRecords.mock.calls[0][0]
    expect(payload.get(1)).not.toBe(records.getItem(1))
    expect(payload.get(1)?.details).not.toBe(records.getItem(1)?.details)
    records.update(1, { title: 'Newer edit' })
    records.setItem(record(3))
    reply.resolve(true)
    await expect(result).resolves.toBe(true)
    expect(payload.get(1)?.title).toBe('1')
    expect([...records.value.changed]).toEqual([1, 3])
    expect([...records.value.created]).toEqual([1, 3])
    expect(records.persistWork$.value).toEqual([])
  })

  it('compacts senders using the latest queued snapshots', async () => {
    const records = collection()
    records.setMany([record(1), record(2)], true)
    const sendRecords = vi.fn(async (_map: Map<number, PersistRecord>) => true)
    const first = records.persist({ ids: [1], sendRecords })
    records.update(1, { title: 'Latest queued' })
    const second = records.persist({ ids: [1, 2], sendRecords })
    expect(records.persistWork$.value).toHaveLength(2)
    expect(await Promise.all([first, second])).toEqual([true, true])
    expect(sendRecords).toHaveBeenCalledOnce()
    expect([...sendRecords.mock.calls[0][0].keys()]).toEqual([1, 2])
    expect(sendRecords.mock.calls[0][0].get(1)?.title).toBe('Latest queued')
    expect(records.value.changed.size).toBe(0)
    expect(records.value.created.size).toBe(0)
  })

  it('serializes sends using request-time snapshots', async () => {
    const records = collection()
    records.setMany([record(1), record(2)], true)
    const reply = deferred()
    const firstSender = vi.fn(async () => reply.promise)
    const nextSender = vi.fn(async (_map: Map<number, PersistRecord>) => true)
    const first = records.persist({ ids: [1], sendRecords: firstSender })
    await flush()
    const second = records.persist({ ids: [2], sendRecords: nextSender })
    records.update(2, { title: 'Edited while queued' })
    expect(nextSender).not.toHaveBeenCalled()
    reply.resolve(true)
    expect(await Promise.all([first, second])).toEqual([true, true])
    expect(nextSender.mock.calls[0][0].get(2)?.title).toBe('2')
    expect([...records.value.changed]).toEqual([2])
  })

  it('keeps reverted and recreated records pending', async () => {
    const records = collection()
    records.setMany([record(1), record(2)], true)
    const original = records.getItem(2)!
    const reply = deferred()
    const result = records.persist({ sendRecords: async () => reply.promise })
    await flush()
    records.update(1, { title: 'Edited' })
    records.update(1, { title: '1' })
    records.cleanCollection([2])
    records.setItem(original)
    reply.resolve(true)
    await expect(result).resolves.toBe(true)
    expect([...records.value.changed]).toEqual([1, 2])
    expect([...records.value.created]).toEqual([1, 2])
  })

  it('does not merge new requests into a batch already in flight', async () => {
    const records = collection()
    records.setItem(record(1))
    const reply = deferred()
    const sendRecords = vi.fn(async (_map: Map<number, PersistRecord>) => true)
      .mockImplementationOnce(() => reply.promise)
    const first = records.persist({ sendRecords })
    await flush()
    records.update(1, { title: 'Second' })
    const second = records.persist({ sendRecords })
    reply.resolve(true)
    expect(await Promise.all([first, second])).toEqual([true, true])
    expect(sendRecords).toHaveBeenCalledTimes(2)
    expect(sendRecords.mock.calls[1][0].get(1)?.title).toBe('Second')
    expect(records.value.changed.size).toBe(0)
  })

  it('selects and validates IDs before enqueueing', async () => {
    const records = collection()
    records.setMany([record(1), record(2)])
    records.update(1, { title: 'Pending' })
    const sendRecords = vi.fn(async (_map: Map<number, PersistRecord>) => true)
    await records.persist({ sendRecords })
    expect([...sendRecords.mock.calls[0][0].keys()]).toEqual([1])
    await records.persist({ ids: [2, 99, 2] as const, sendRecords })
    expect([...sendRecords.mock.calls[1][0].keys()]).toEqual([2])
    await expect(records.persist({ ids: [-1], sendRecords })).rejects.toThrow()
    await expect(records.persist({ ids: [], sendRecords })).resolves.toBe(true)
    await expect(records.persist({ sendRecords })).resolves.toBe(true)
    expect(sendRecords).toHaveBeenCalledTimes(2)
  })

  it('delays retries and preserves tracking on failure', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 50, maxRetries: 2 })
    records.setItem(record(1))
    const sendRecords = vi.fn(async () => false)
      .mockRejectedValueOnce(new Error('Offline'))
    const result = records.persist({ sendRecords })
    await vi.advanceTimersByTimeAsync(0)
    expect(records.persistRetry$.value).toHaveLength(1)
    expect(records.value.changed.has(1)).toBe(true)
    await vi.advanceTimersByTimeAsync(49)
    expect(sendRecords).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(51)
    await expect(result).resolves.toBe(false)
    expect(sendRecords).toHaveBeenCalledTimes(3)
    expect(records.persistWork$.value).toEqual([])
    expect(records.persistRetry$.value).toEqual([])
    expect(records.value.changed.has(1)).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('orders retries before newer work for the same sender', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 50, maxRetries: 1 })
    records.setItem(record(1))
    const sendRecords = vi.fn(async (_map: Map<number, PersistRecord>) => true)
      .mockResolvedValueOnce(false)
    const first = records.persist({ sendRecords })
    await vi.advanceTimersByTimeAsync(0)
    records.update(1, { title: 'Newer queued' })
    const second = records.persist({ sendRecords })
    const other = vi.fn(async () => true)
    const unrelated = records.persist({ sendRecords: other })
    await vi.advanceTimersByTimeAsync(0)
    expect(other).toHaveBeenCalledOnce()
    expect(sendRecords).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(50)
    expect(await Promise.all([first, second, unrelated]))
      .toEqual([true, true, true])
    expect(sendRecords.mock.calls[1][0].get(1)?.title).toBe('Newer queued')
    expect(records.value.changed.size).toBe(0)
  })

  it('isolates sender mutation from records and retry snapshots', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 1, maxRetries: 1 })
    records.setItem(record(1))
    let calls = 0
    const sendRecords = async (map: Map<number, PersistRecord>) => {
      expect(map.get(1)?.details.count).toBe(1)
      map.get(1)!.details.count = 999
      map.clear()
      return ++calls === 2
    }
    const result = records.persist({ sendRecords })
    await vi.advanceTimersByTimeAsync(1)
    await expect(result).resolves.toBe(true)
    expect(records.getItem(1)?.details.count).toBe(1)
  })

  it('disposes active and waiting work on completion', async () => {
    const records = collection()
    records.setItem(record(1))
    const reply = deferred()
    const first = records.persist({ sendRecords: async () => reply.promise })
    await flush()
    const nextSender = vi.fn(async () => true)
    const second = records.persist({ sendRecords: nextSender })
    records.complete()
    expect(await Promise.all([first, second])).toEqual([false, false])
    reply.resolve(true)
    await flush()
    expect(nextSender).not.toHaveBeenCalled()
    expect(records.value.changed.has(1)).toBe(true)
    expect(records.persistWork$.isStopped).toBe(true)
    expect(await records.persist({ sendRecords: nextSender })).toBe(false)
  })

  it('cancels delayed retries when the collection completes', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 100, maxRetries: 3 })
    records.setItem(record(1))
    const result = records.persist({ sendRecords: async () => false })
    await vi.advanceTimersByTimeAsync(0)
    records.complete()
    await expect(result).resolves.toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('preserves untracked updates received during a save', async () => {
    const records = collection()
    records.setItem(record(1))
    const reply = deferred()
    const result = records.persist({ sendRecords: async () => reply.promise })
    await flush()
    records.update(1, { title: 'Inbound change' }, false)
    reply.resolve(true)
    await expect(result).resolves.toBe(true)
    expect(records.value.changed.has(1)).toBe(true)
  })

  it('disposes branch persistence when the manager completes', async () => {
    vi.useFakeTimers()
    const Records = defineCollection(persistModelSchema, 'id')
    const manager = new DataManager()
    const records = manager.addModel('records', Records)
    records.setItem(record(1))
    const result = records.persist({ sendRecords: async () => false })
    await vi.advanceTimersByTimeAsync(0)
    manager.complete()
    await expect(result).resolves.toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    expect(records.persistRetry$.isStopped).toBe(true)
  })

  it('defaults to three retries with a one-second delay', async () => {
    vi.useFakeTimers()
    const records = collection({})
    records.setItem(record(1))
    const sendRecords = vi.fn(async () => false)
    const result = records.persist({ sendRecords })
    await vi.advanceTimersByTimeAsync(999)
    expect(sendRecords).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(2001)
    await expect(result).resolves.toBe(false)
    expect(sendRecords).toHaveBeenCalledTimes(4)
  })

  it('handles completion triggered by retry queue observers', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 100, maxRetries: 1 })
    records.setItem(record(1))
    records.persistRetry$.subscribe((queue) => {
      if (queue.length) records.complete()
    })
    const result = records.persist({ sendRecords: async () => false })
    await vi.advanceTimersByTimeAsync(0)
    await expect(result).resolves.toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps acknowledgement baselines across retries', async () => {
    vi.useFakeTimers()
    const records = collection({ delayMs: 10, maxRetries: 1 })
    records.setItem(record(1))
    const sendRecords = vi.fn(async (_map: Map<number, PersistRecord>) => true)
      .mockResolvedValueOnce(false)
    const result = records.persist({ sendRecords })
    await vi.advanceTimersByTimeAsync(0)
    records.update(1, { title: 'Newer than retry payload' })
    await vi.advanceTimersByTimeAsync(10)
    await expect(result).resolves.toBe(true)
    expect(sendRecords.mock.calls[1][0].get(1)?.title).toBe('1')
    expect(records.value.changed.has(1)).toBe(true)
  })

  it('rejects uncloneable snapshots before queueing', async () => {
    interface Record {
      id: number
      run: () => void
    }
    const records = new CollectionBase<Record>({
      value: createCollectionValue<Record>(),
    })
    records.setItem({ id: 1, run: () => {} })
    const sendRecords = vi.fn(async () => true)
    await expect(records.persist({ sendRecords })).rejects.toThrow()
    expect(sendRecords).not.toHaveBeenCalled()
    expect(records.persistWork$.value).toEqual([])
    expect(records.value.changed.has(1)).toBe(true)
  })

  it('checks records when notifications are delayed', async () => {
    const records = collection()
    records.setItem(record(1))
    vi.spyOn(records, 'subscribe').mockImplementation(() => new Subscription())
    const reply = deferred()
    const result = records.persist({ sendRecords: async () => reply.promise })
    await flush()
    records.update(1, { title: 'Not yet observed' })
    reply.resolve(true)
    await expect(result).resolves.toBe(true)
    expect(records.value.changed.has(1)).toBe(true)
  })

  it('rejects invalid retry configuration', () => {
    expect(() => collection({ delayMs: -1 })).toThrow()
    expect(() => collection({ maxRetries: 0.5 })).toThrow()
    expect(() => collection({ delayMs: Infinity })).toThrow()
  })
})
