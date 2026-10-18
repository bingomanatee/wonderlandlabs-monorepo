import { BehaviorSubject } from 'rxjs'
import type { Subscription } from 'rxjs'
import type {
  CollectionBase,
  CollectionKey,
  CollectionPersistArgs,
  CollectionPersistRetry,
  CollectionPersistRequest,
  CollectionPersistState,
} from './types.js'
import { dataCoreDefaults, dataCoreErrors, persistState } from './constants.js'

type Args<Item, Key extends CollectionKey> =
  CollectionPersistRequest<Item, Key>

interface PersistTask<Item, Key extends CollectionKey> {
  args: Args<Item, Key>
  originals: Map<Key, Item>
  snapshot: Map<Key, Item>
  modified: Set<Key>
  subscription: Subscription
  resolve: (success: boolean) => void
  status: { state: CollectionPersistState }
  aborted: boolean
  retries: number
  sequence: number
}

export class CollectionPersistence<Item, Key extends CollectionKey> {
  readonly work$ = new BehaviorSubject<Args<Item, Key>[]>([])
  readonly retry$ = new BehaviorSubject<Args<Item, Key>[]>([])
  private readonly tasks = new Map<Args<Item, Key>, PersistTask<Item, Key>>()
  private readonly timers = new Set<ReturnType<typeof setTimeout>>()
  private readonly delayMs: number
  private readonly maxRetries: number
  private readonly queueSubscription: Subscription
  private scheduled = false
  private running = false
  private stopped = false
  private sequence = 0

  constructor(
    private readonly collection: CollectionBase<Item, Key>,
    private readonly parseKey: (key: Key) => Key,
    retry: CollectionPersistRetry = {},
  ) {
    this.delayMs = retry.delayMs ?? dataCoreDefaults.persistRetryDelayMs
    this.maxRetries = retry.maxRetries ?? dataCoreDefaults.persistMaxRetries
    if (
      !Number.isFinite(this.delayMs) || this.delayMs < 0 ||
      !Number.isInteger(this.maxRetries) || this.maxRetries < 0
    ) {
      throw new Error(dataCoreErrors.invalidPersistRetry)
    }
    this.queueSubscription = this.work$.subscribe(() => this.schedule())
  }

  async persist(input: CollectionPersistArgs<Item, Key>): Promise<boolean> {
    if (this.stopped) return false
    const ids = [...new Set(
      (input.ids ?? [...this.collection.value.changed]).map(this.parseKey),
    )]
    const originals = new Map<Key, Item>()
    for (const id of ids) {
      if (this.collection.value.records.has(id)) {
        originals.set(id, this.collection.value.records.get(id) as Item)
      }
    }
    const snapshot = structuredClone(originals)
    if (!snapshot.size) return true
    const status: { state: CollectionPersistState } = {
      state: persistState.pending,
    }
    const createdAt = Date.now()
    const args: Args<Item, Key> = Object.freeze({
      createdAt,
      get state() { return status.state },
      ids: Object.freeze([...snapshot.keys()]),
      sendRecords: input.sendRecords,
    })
    if (this.stopped) return false
    return new Promise<boolean>((resolve) => {
      const modified = new Set<Key>()
      const subscription = this.collection.subscribe((value) => {
        for (const [id, record] of originals) {
          if (
            !value.records.has(id) ||
            !Object.is(value.records.get(id), record)
          ) {
            modified.add(id)
          }
        }
      })
      this.tasks.set(args, {
        args, originals, snapshot, modified, subscription, resolve,
        status, aborted: false, retries: 0, sequence: this.sequence++,
      })
      this.work$.next([...this.work$.value, args])
    })
  }

  pending(): Key[] {
    return [...new Set(
      [...this.tasks.values()].flatMap((task) => [...task.snapshot.keys()]),
    )]
  }

  abortPending(ids?: readonly Key[]): void {
    const cutoff = this.sequence
    const selected = ids?.map(this.parseKey)
    for (const task of [...this.tasks.values()]) {
      if (task.sequence >= cutoff ||
        task.status.state !== persistState.pending) continue
      for (const id of selected ?? [...task.snapshot.keys()]) {
        if (!task.snapshot.delete(id)) continue
        task.aborted = true
        task.originals.delete(id)
        task.modified.add(id)
      }
      if (!task.snapshot.size) this.finish(task, false)
    }
    this.work$.next(this.work$.value.filter((args) => this.tasks.has(args)))
    this.retry$.next(this.retry$.value.filter((args) => this.tasks.has(args)))
  }

  stop() {
    if (this.stopped) return
    this.stopped = true
    this.queueSubscription.unsubscribe()
    for (const timer of this.timers) clearTimeout(timer)
    this.timers.clear()
    for (const task of [...this.tasks.values()]) this.finish(task, false)
    this.work$.next([])
    this.retry$.next([])
    this.work$.complete()
    this.retry$.complete()
  }

  private schedule() {
    if (this.scheduled || this.running || this.stopped) return
    this.scheduled = true
    queueMicrotask(() => {
      this.scheduled = false
      void this.drain()
    })
  }

  private nextBatch() {
    const blocked = new Set(this.retry$.value.map((args) => args.sendRecords))
    const first = this.work$.value.find((args) =>
      this.tasks.has(args) && !blocked.has(args.sendRecords),
    )
    if (!first) return []
    return this.work$.value
      .filter((args) => args.sendRecords === first.sendRecords)
      .map((args) => this.tasks.get(args))
      .filter((task): task is PersistTask<Item, Key> => Boolean(task))
      .sort((left, right) => left.sequence - right.sequence)
  }

  private async drain() {
    if (this.running || this.stopped) return
    this.running = true
    try {
      while (!this.stopped) {
        const batch = this.nextBatch()
        if (!batch.length) break
        for (const task of batch) task.status.state = persistState.active
        this.work$.next([...this.work$.value])
        if (this.stopped) break
        let success = false
        try {
          success = await this._innerPersist(batch)
        } catch {
          success = false
        }
        if (this.stopped) break
        if (success) {
          for (const task of batch) this.finish(task, !task.aborted)
        } else {
          this.retry(batch)
        }
        const handled = new Set(batch.map((task) => task.args))
        this.work$.next(this.work$.value.filter((args) => !handled.has(args)))
      }
    } finally {
      this.running = false
    }
  }

  private async _innerPersist(batch: PersistTask<Item, Key>[]) {
    const snapshots = new Map<Key, Item>()
    const owners = new Map<Key, PersistTask<Item, Key>>()
    for (const task of batch) {
      for (const [id, record] of task.snapshot) {
        snapshots.set(id, record)
        owners.set(id, task)
      }
    }
    let success = false
    try {
      success = await batch[0].args.sendRecords(structuredClone(snapshots))
    } catch {
      return false
    }
    if (success !== true || this.stopped) return false
    this.collection.mutate((draft) => {
      for (const [id, task] of owners) {
        if (
          this.tasks.has(task.args) &&
          task.snapshot.has(id) &&
          !task.modified.has(id) &&
          this.collection.value.records.has(id) &&
          Object.is(
            this.collection.value.records.get(id), task.originals.get(id),
          )
        ) {
          draft.changed.delete(id)
          draft.created.delete(id)
        }
      }
    })
    return true
  }

  private retry(batch: PersistTask<Item, Key>[]) {
    const retrying = batch.filter((task) => {
      if (!this.tasks.has(task.args)) return false
      task.status.state = persistState.failed
      if (task.retries >= this.maxRetries) {
        this.finish(task, false)
        return false
      }
      task.retries += 1
      return true
    })
    if (!retrying.length) return
    const args = retrying.map((task) => task.args)
    this.retry$.next([...this.retry$.value, ...args])
    if (this.stopped) return
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      if (this.stopped) return
      const ready = new Set(args)
      this.retry$.next(this.retry$.value.filter((arg) => !ready.has(arg)))
      if (this.stopped) return
      const live = args.filter((arg) => this.tasks.has(arg))
      this.work$.next([...live, ...this.work$.value])
    }, this.delayMs)
    this.timers.add(timer)
  }

  private finish(task: PersistTask<Item, Key>, success: boolean) {
    task.status.state = success ? persistState.complete : persistState.failed
    task.subscription.unsubscribe()
    this.tasks.delete(task.args)
    task.resolve(success)
  }
}
