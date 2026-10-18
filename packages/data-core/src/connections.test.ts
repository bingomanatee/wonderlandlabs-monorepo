import { BehaviorSubject, Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import {
  DataConnectionManager,
  connectionStatus,
  createEmptyConnectionState,
  type ConnectionState,
  type DataConnection,
  type DataStreamAdapter,
} from '@wonderlandlabs/forestry-data-core/connections'

interface Change {
  id: string
}

function restConnection(): DataConnection<Change> {
  return {
    ensureReady: vi.fn(async () => {}),
    get: vi.fn().mockResolvedValue({ id: 'one' }),
    put: vi.fn().mockResolvedValue({ id: 'two' }),
    delete: vi.fn().mockResolvedValue(undefined),
    start: vi.fn(),
    stop: vi.fn(),
  }
}

describe('standalone connection exports', () => {
  it('supports REST requests without streams', async () => {
    const rest = restConnection()
    const manager = new DataConnectionManager([rest])
    manager.start()

    await expect(manager.get('books', 'one')).resolves.toEqual({ id: 'one' })
    await expect(manager.put('books', { id: 'two' })).resolves.toEqual({
      id: 'two',
    })
    await expect(manager.delete('books', 'one')).resolves.toBeUndefined()
    expect(rest.ensureReady).toHaveBeenCalledTimes(3)
    expect(manager.state$.value.status).toBe(connectionStatus.idle)
    manager.stop()
    expect(rest.stop).toHaveBeenCalledOnce()
  })

  it('supports socket lifecycle, changes, and REST fallback', async () => {
    const state$ = new BehaviorSubject<ConnectionState>(
      createEmptyConnectionState(),
    )
    const changes$ = new Subject<Change>()
    const stream: DataStreamAdapter<Change> = {
      state$,
      changes$,
      connect() {
        state$.next({
          ...createEmptyConnectionState(),
          status: connectionStatus.connected,
        })
      },
      disconnect: vi.fn(),
    }
    const socket: DataConnection<Change> = {
      ...restConnection(),
      state$,
      changes$,
      start: () => stream.connect(),
      stop: () => stream.disconnect(),
      get: vi.fn(async () => { throw new Error('Socket unavailable') }),
    }
    const rest = restConnection()
    const manager = new DataConnectionManager([socket, rest])
    const observed = vi.fn()
    const subscription = manager.changes$.subscribe(observed)
    manager.start()
    changes$.next({ id: 'one' })

    expect(manager.state$.value.status).toBe(connectionStatus.connected)
    expect(observed).toHaveBeenCalledWith({ id: 'one' })
    await expect(manager.get('books', 'one')).resolves.toEqual({ id: 'one' })
    expect(rest.get).toHaveBeenCalledWith('books', 'one')
    manager.stop()
    expect(stream.disconnect).toHaveBeenCalledOnce()
    subscription.unsubscribe()
  })
})
