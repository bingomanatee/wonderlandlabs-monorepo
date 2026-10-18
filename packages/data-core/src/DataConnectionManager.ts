import { BehaviorSubject, merge, Subscription } from 'rxjs'
import type { DataConnection, ConnectionState, Observable } from './types.js'
import { dataCoreErrors } from './constants.js'
import { createEmptyConnectionState } from './factories.js'

export class DataConnectionManager<Change = unknown> {
  readonly #connections: DataConnection<Change>[]
  readonly #subs = new Subscription()
  #started = false
  readonly changes$: Observable<Change>
  readonly state$ = new BehaviorSubject<ConnectionState>(
    createEmptyConnectionState(),
  )

  constructor(connections: DataConnection<Change>[]) {
    this.#connections = connections
    this.changes$ = merge(
      ...connections
        .map((connection) => connection.changes$)
        .filter((changes$): changes$ is Observable<Change> =>
          Boolean(changes$),
        ),
    )
  }

  start() {
    if (this.#started || this.#subs.closed) {
      return
    }

    this.#started = true

    for (const connection of this.#connections) {
      if (connection.state$) {
        this.#subs.add(
          connection.state$.subscribe((state) => {
            this.state$.next(state)
          }),
        )
      }

      connection.start()
    }
  }

  stop() {
    this.#subs.unsubscribe()

    for (const connection of this.#connections) {
      connection.stop()
    }
  }

  async delete<Data = unknown>(
    modelName: string,
    input?: unknown,
  ): Promise<Data> {
    return this.tryConnections<Data>((connection) =>
      connection.delete<Data>(modelName, input),
    )
  }

  async get<Data = unknown>(modelName: string, input?: unknown): Promise<Data> {
    return this.tryConnections<Data>((connection) =>
      connection.get<Data>(modelName, input),
    )
  }

  async put<Data = unknown>(modelName: string, input?: unknown): Promise<Data> {
    return this.tryConnections<Data>((connection) =>
      connection.put<Data>(modelName, input),
    )
  }

  private async tryConnections<Data>(
    execute: (connection: DataConnection<Change>) => Promise<Data>,
  ): Promise<Data> {
    let lastError: unknown = new Error(dataCoreErrors.dataSourceFailed)

    for (const connection of this.#connections) {
      try {
        await connection.ensureReady()
        return await execute(connection)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  }
}
