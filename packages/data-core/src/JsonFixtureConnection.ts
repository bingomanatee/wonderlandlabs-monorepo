import { BehaviorSubject, Subject } from 'rxjs'
import type {
  DataConnection,
  JsonFixtureRecords,
  ConnectionState,
} from './types.js'
import {
  fixtureRecordMap,
  setFixtureRecord,
  recordId,
} from './fixture.helpers.js'
import { createEmptyConnectionState } from './factories.js'
import { connectionStatus } from './constants.js'

export class JsonFixtureConnection implements DataConnection {
  readonly changes$ = new Subject<unknown>()
  readonly state$ = new BehaviorSubject<ConnectionState>(
    createEmptyConnectionState(),
  )
  private readonly fixtures: Record<string, unknown>

  constructor(fixtures: JsonFixtureRecords) {
    this.fixtures = structuredClone(fixtures) as Record<string, unknown>
  }

  async ensureReady() {}

  async delete<Data = unknown>(modelName: string, input?: unknown) {
    const id = recordId(input)

    if (id) {
      delete fixtureRecordMap(this.fixtures, modelName)[id]
    }

    return undefined as Data
  }

  async get<Data = unknown>(modelName: string, input?: unknown) {
    const id = recordId(input)
    const records = fixtureRecordMap(this.fixtures, modelName)

    return structuredClone(
      (id
        ? Object.hasOwn(records, id)
          ? records[id]
          : undefined
        : Object.values(records)) as Data,
    )
  }

  async put<Data = unknown>(modelName: string, input?: unknown) {
    const records = fixtureRecordMap(this.fixtures, modelName)
    const items = Array.isArray(input) ? input : [input]

    for (const item of items) {
      const id = recordId(item)

      if (id) {
        setFixtureRecord(records, id, structuredClone(item))
      }
    }

    return structuredClone(input as Data)
  }

  start() {
    this.state$.next({
      ...createEmptyConnectionState(),
      connectedAt: new Date().toISOString(),
      status: connectionStatus.connected,
    })
  }

  stop() {
    this.state$.complete()
    this.changes$.complete()
  }
}
