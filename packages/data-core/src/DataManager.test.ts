import { describe, expect, it, vi } from 'vitest'
import { BehaviorSubject, Subject } from 'rxjs'
import { createEmptyConnectionState } from './factories.js'
import { CollectionBase } from './CollectionBase.js'
import type { DataConnection } from './types.js'
import { DataConnectionManager } from './DataConnectionManager.js'
import type { DataManagerValue } from './types.js'
import { DataManager } from './DataManager.js'

import type { TestChange, TestRecord } from './test/types.js'

class TestCollection extends CollectionBase<TestRecord> {
  constructor(params: unknown) {
    super(params)
  }

  labels() {
    return this.list().map((record) => record.label)
  }
}

describe('DataManager', () => {
  it('starts with no registered models', () => {
    const manager = new DataManager()

    expect(manager.collections.size).toBe(0)
    expect(manager.$branches.size).toBe(0)
  })

  it('adds a model as a Forestry branch under collections', () => {
    const manager = new DataManager()
    const branch = manager.addModel<string, TestRecord, TestCollection>(
      'things',
      TestCollection,
    )

    expect(branch).toBeInstanceOf(TestCollection)
    expect(manager.collection<TestRecord>('things')).toBe(branch)
    expect(manager.$branches.$get(['collections', 'things'])).toBe(branch)
  })

  it('stores collection data in manager value, not the branch instance', () => {
    const manager = new DataManager()
    const branch = manager.addModel<string, TestRecord, TestCollection>(
      'things',
      TestCollection,
    )
    const collectionValue = manager.value.collections.get('things')

    expect(collectionValue).toBeDefined()
    expect(collectionValue).not.toBe(branch)
    expect(collectionValue?.records).toBeInstanceOf(Map)
    expect(collectionValue?.changed).toBeInstanceOf(Set)
    expect(collectionValue?.created).toBeInstanceOf(Set)
  })

  it('loads optional starter data into the collection branch', () => {
    const manager = new DataManager()
    const initialData = new Map<string, TestRecord>([
      ['one', { id: 'one', label: 'One' }],
      ['two', { id: 'two', label: 'Two' }],
    ])

    const branch = manager.addModel<string, TestRecord, TestCollection>(
      'things',
      TestCollection,
      initialData,
    )

    expect(branch.getItem('one')).toEqual({ id: 'one', label: 'One' })
    expect(branch.get('records')).toBe(branch.value.records)
    expect(branch.get(['records'])).toBe(branch.value.records)
    expect(branch.labels()).toEqual(['One', 'Two'])
    expect(branch.value.changed.size).toBe(0)
    expect(branch.value.created.size).toBe(0)
  })

  it('keeps branch writes synchronized with manager collection data', () => {
    const manager = new DataManager()
    const branch = manager.addModel<string, TestRecord, TestCollection>(
      'things',
      TestCollection,
    )

    branch.setItem({ id: 'one', label: 'One' })

    const collectionValue = manager.value.collections.get('things')
    expect(collectionValue?.records.get('one')).toEqual({
      id: 'one',
      label: 'One',
    })
    expect(collectionValue?.changed.has('one')).toBe(true)
    expect(collectionValue?.created.has('one')).toBe(true)
  })

  it('rejects duplicate model names', () => {
    const manager = new DataManager()

    manager.addModel<string, TestRecord, TestCollection>(
      'things',
      TestCollection,
    )

    expect(() =>
      manager.addModel<string, TestRecord, TestCollection>(
        'things',
        TestCollection,
      ),
    ).toThrow('things data collection is already registered')
  })

  it('accepts a custom connector', async () => {
    const connector = {
      delete: vi.fn(),
      get: vi.fn().mockResolvedValue({ id: 'one', label: 'One' }),
      put: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const manager = new DataManager({ connector })

    expect(manager.connector).toBe(connector)
    expect(await manager.connector?.get<TestRecord>('things', 'one')).toEqual({
      id: 'one',
      label: 'One',
    })
    expect(connector.get).toHaveBeenCalledWith('things', 'one')
  })

  it('can create its connector from data connections', async () => {
    const connection = {
      delete: vi.fn(),
      ensureReady: vi.fn(),
      get: vi.fn().mockResolvedValue({ id: 'one', label: 'One' }),
      put: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const manager = new DataManager({ connections: [connection] })

    expect(manager.connector).toBeInstanceOf(DataConnectionManager)
    expect(await manager.connector?.get<TestRecord>('things', 'one')).toEqual({
      id: 'one',
      label: 'One',
    })
    expect(connection.ensureReady).toHaveBeenCalled()
    expect(connection.get).toHaveBeenCalledWith('things', 'one')
  })

  it('keeps connection change events application-owned', () => {
    const changes$ = new Subject<TestChange>()
    const connection: DataConnection<TestChange> = {
      changes$,
      delete: vi.fn(),
      ensureReady: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const manager = new DataManager<DataManagerValue, TestChange>({
      connections: [connection],
    })
    const observed = vi.fn()

    manager.connector?.changes$?.subscribe(observed)
    changes$.next({ id: 'book-1', operation: 'changed' })

    expect(observed).toHaveBeenCalledWith({
      id: 'book-1',
      operation: 'changed',
    })
  })
})

describe('DataConnectionManager', () => {
  it('starts each connection once and releases state subscriptions', () => {
    const connection = {
      state$: new BehaviorSubject(createEmptyConnectionState()),
      delete: vi.fn(),
      ensureReady: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const manager = new DataConnectionManager([connection])
    const observed = vi.fn()
    manager.state$.subscribe(observed)

    manager.start()
    manager.start()
    observed.mockClear()
    connection.state$.next(createEmptyConnectionState())
    expect(connection.start).toHaveBeenCalledTimes(1)
    expect(observed).toHaveBeenCalledTimes(1)

    manager.stop()
    observed.mockClear()
    connection.state$.next(createEmptyConnectionState())
    expect(observed).not.toHaveBeenCalled()
    expect(connection.stop).toHaveBeenCalledTimes(1)
  })

  it('falls back after readiness and operation failures', async () => {
    const unavailable = {
      delete: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      ensureReady: vi.fn().mockRejectedValue(new Error('Unavailable')),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const failing = {
      ...unavailable,
      ensureReady: vi.fn(),
      get: vi.fn().mockRejectedValue(new Error('Read failed')),
    }
    const ready = {
      ...unavailable,
      ensureReady: vi.fn(),
      get: vi.fn().mockResolvedValue({ id: 'one' }),
    }
    const manager = new DataConnectionManager([unavailable, failing, ready])

    await expect(manager.get('things', 'one')).resolves.toEqual({ id: 'one' })
    expect(unavailable.get).not.toHaveBeenCalled()
    expect(ready.get).toHaveBeenCalledWith('things', 'one')
  })
})
