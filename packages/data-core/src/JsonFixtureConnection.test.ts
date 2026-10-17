import { describe, expect, it } from 'vitest'
import { JsonFixtureConnection } from './JsonFixtureConnection.js'
import { modelSocketStatus } from './constants.js'

import type { TestRecord } from './test/types.js'

describe('JsonFixtureConnection', () => {
  it('reads fixture records by model and id', async () => {
    const connection = new JsonFixtureConnection({
      things: {
        one: { id: 'one', label: 'One' },
        two: { id: 'two', label: 'Two' },
      },
    })

    await expect(connection.get<TestRecord>('things', 'one')).resolves.toEqual({
      id: 'one',
      label: 'One',
    })
    await expect(connection.get<TestRecord[]>('things')).resolves.toEqual([
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ])
  })

  it('keeps writes local to the fixture connection', async () => {
    const fixtures = {
      things: {
        one: { id: 'one', label: 'One' },
      },
    }
    const connection = new JsonFixtureConnection(fixtures)

    await connection.put('things', { id: 'two', label: 'Two' })
    await connection.delete('things', 'one')

    await expect(connection.get<TestRecord[]>('things')).resolves.toEqual([
      { id: 'two', label: 'Two' },
    ])
    expect(fixtures.things.one).toEqual({ id: 'one', label: 'One' })
  })

  it('reports a connected fixture state when started', () => {
    const connection = new JsonFixtureConnection({})

    connection.start()

    expect(connection.state$.value.status).toBe(modelSocketStatus.connected)
    expect(connection.state$.value.connectedAt).toEqual(expect.any(String))
  })
})

describe('fixture isolation', () => {
  it('copies records on write and read', async () => {
    const connection = new JsonFixtureConnection({})
    const record = { id: 'one', label: 'Original' }

    await connection.put('things', record)
    record.label = 'Changed outside'
    const stored = await connection.get<TestRecord>('things', 'one')
    expect(stored.label).toBe('Original')
    stored.label = 'Changed after read'
    await expect(connection.get('things', 'one')).resolves.toEqual({
      id: 'one',
      label: 'Original',
    })
  })

  it('stores prototype names as ordinary model and record ids', async () => {
    const connection = new JsonFixtureConnection({ things: {} })

    await expect(connection.get('things', 'toString')).resolves.toBeUndefined()
    await connection.put('__proto__', {
      id: '__proto__',
      label: 'Stored',
    })
    await expect(connection.get('__proto__', '__proto__')).resolves.toEqual({
      id: '__proto__',
      label: 'Stored',
    })
    await connection.delete('__proto__', '__proto__')
    await expect(connection.get('__proto__')).resolves.toEqual([])
  })
})
