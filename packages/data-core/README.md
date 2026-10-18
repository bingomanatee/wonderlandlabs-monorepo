# @wonderlandlabs/forestry-data-core

Forestry-backed collections and pluggable data connections for TypeScript
applications.

DataCore keeps mutable record collections in Forestry state, tracks local
creates and changes, and gives applications a small connector boundary for
loading, writing, and deleting records.

## Status

DataCore is developed in the Wonderland Labs monorepo as a public package.

## Forestry Compatibility

DataCore uses the Forestry installation supplied by the application. Forestry
is a peer dependency rather than a bundled runtime dependency, so DataCore can
share one compatible Forestry instance with the rest of the application.

Install Forestry alongside DataCore:

```sh
pnpm add @wonderlandlabs/forestry-data-core \
  @wonderlandlabs/forestry4
```

DataCore supports Forestry `>=4.1.15 <5` and is developed and tested against
Forestry `4.1.17`. Applications may move to newer compatible Forestry 4
releases without waiting for a matching DataCore release.

## Package Contents

- `CollectionBase` stores records by string or numeric key and tracks created
  or changed records.
- `defineCollection` infers validated record and identity types from Zod models.
- `recordMethods` and `collectionMethods` bind application utilities to their
  owning collection while preserving config and return types.
- `DataManager` owns named collection branches and an optional data connector.
- `DataConnectionManager` tries data connections in order until one succeeds.
- `JsonFixtureConnection` provides an in-memory connection for examples and
  tests.
- Connector types define the transport boundary without choosing an HTTP,
  database, or socket implementation.
- Change streams accept an application-owned event type.
- `persist` snapshots and queues saves, safely acknowledges unchanged records,
  compacts work by sender, and retries failed batches.

## Workspace Use

Add the package to another workspace package:

```json
{
  "dependencies": {
    "@wonderlandlabs/forestry-data-core": "workspace:*"
  }
}
```

Import the public API from the package root:

```ts
import {
  CollectionBase,
  DataManager,
  type CollectionBaseValue,
  type DataManagerValue,
} from '@wonderlandlabs/forestry-data-core'
```

## Collections

Extend `CollectionBase` to add record-specific queries while retaining the
shared storage and change-tracking behavior.

```ts
import {
  CollectionBase,
  DataManager,
  type CollectionBaseValue,
  type DataManagerValue,
} from '@wonderlandlabs/forestry-data-core'

interface Book {
  id: string
  title: string
}

class BookCollection extends CollectionBase<Book> {
  titled(title: string) {
    return this.list().filter((book) => book.title === title)
  }
}

interface LibraryValue extends DataManagerValue {
  collections: Map<string, CollectionBaseValue<unknown>>
}

const data = new DataManager<LibraryValue>()
const books = data.addModel<string, Book, BookCollection>(
  'books',
  BookCollection,
)

books.setItem({
  id: 'book-1',
  title: 'The Left Hand of Darkness',
})

console.log(books.getItem('book-1'))
console.log(books.value.created.has('book-1'))
```

Records use their `id` by default, with its string or number type carried
through lookups, mutations, maps, and tracking sets. Pass `keyOf` to a
schema-free collection constructor for another identity rule.

### Zod Models

Use `defineCollection` with a Zod object schema and its identity property to
infer both record and key types:

```ts
import { z } from 'zod'
import {
  DataManager,
  defineCollection,
} from '@wonderlandlabs/forestry-data-core'

const bookSchema = z.object({
  bookId: z.number().int().nonnegative(),
  title: z.string().min(1),
})
const BookCollection = defineCollection(bookSchema, 'bookId')
const data = new DataManager()
const books = data.addModel('books', BookCollection)

books.setItem({ bookId: 0, title: 'The Dispossessed' })
books.getItem(0) // Keys are numbers, including zero.
```

String identities can use UUID checks, refinements, or Zod brands. Identity
properties must produce strings or finite numbers. Use identity schemas that
accept their own output, since stored keys are validated again on access.
`getItem`, `has`, `put`, `delete`, and `update` use the inferred key type.
`get` is inherited from Forestry and reads state paths. Record lookups use
`getItem`.

All record writes validate the complete model. Explicit map keys and `put`
keys must match the validated record identity. Updates cannot change identity.
Bulk writes validate every record before applying any changes. Failed starter
data also removes the attempted model registration.

Existing subclasses may instead pass `{ schema, identity }` as the second
`CollectionBase` constructor argument. The identity property defaults to `id`.
For another identity property, specify its type as the second class generic
or use `defineCollection` to infer it automatically.
Do not combine a schema with `keyOf`; the schema identity defines its key.
Schemas and validation helpers live outside class implementation files.

### Custom Record Utilities

Pass a named methods config as the third argument to `defineCollection`.
Supply record utilities under `recordMethods`.
They are exposed under `collection.recordMethods`, so their names cannot
replace Forestry or collection methods.

Each callback receives `(id, config, collection)` and returns its declared
result, including promises. The caller supplies only `(id, config?)`; DataCore
validates the key and supplies the owning collection. Callbacks decide what a
missing record means and use collection operations for validated writes.

Keep callbacks and their config types in application specialty files:

```ts
import { z } from 'zod'
import type { RecordUtility } from '@wonderlandlabs/forestry-data-core'

interface SoftDeleteConfig {
  deletedAt: string
}

const softDeleteBookSchema = z.object({
  bookId: z.number().int().nonnegative(),
  title: z.string().min(1),
  deletedAt: z.string().nullable(),
})

type Book = z.output<typeof softDeleteBookSchema>

const softDelete: RecordUtility<
  Book,
  number,
  SoftDeleteConfig,
  Book | undefined
> = (id, config, collection) => {
  collection.update(id, {
    deletedAt: config?.deletedAt ?? new Date().toISOString(),
  })
  return collection.getItem(id)
}
```

Register the helper with a model that permits its deletion marker:

```ts
const BookCollection = defineCollection(softDeleteBookSchema, 'bookId', {
  recordMethods: {
    softDelete,
  },
})
const books = new DataManager().addModel('books', BookCollection)
books.setItem({ bookId: 0, title: 'The Dispossessed', deletedAt: null })
const deleted = books.recordMethods.softDelete(0)
```

The config argument is optional at the call site. In the callback it is typed
as `Config | undefined`, because the collection is the required third argument.
Utility names, key types, config shapes, and return types are retained through
`DataManager.addModel`. Existing subclasses can supply `recordMethods` through
`CollectionBaseConfig` and its third `Utilities` generic.

This example marks and tracks a record; it does not remove it, filter reads, or
send a connector request. Those policies remain application-owned.

### Custom Collection Utilities

Collection utilities receive `(config, collection)` and are called without an
id. Both method groups can be supplied together:

```ts
const BookCollection = defineCollection(softDeleteBookSchema, 'bookId', {
  recordMethods: { softDelete },
  collectionMethods: {
    active: (_config, collection) =>
      collection.list().filter((book) => !book.deletedAt),
  },
})
const books = new DataManager().addModel('books', BookCollection)
const activeBooks = books.collectionMethods.active()
```

`CollectionUtility<Item, Key, Config, Result>` types standalone callbacks.
Config is optional at the call site; callbacks receive `Config | undefined`.
Return types, promises, and thrown errors are preserved. Detached calls retain
the owning collection. Collection utilities are also available through
`CollectionBaseConfig.collectionMethods` and the fourth class generic.

### Registration and Starter Data

`addModel(name, CollectionClass, initialData?)` registers a Forestry branch
under `['collections', name]`. Starter data is a `Map` of keys to records and
loads without change tracking. Duplicate model names throw an error.

```ts
const starterBooks = new Map([
  [0, { bookId: 0, title: 'The Dispossessed' }],
])
const library = new DataManager()
const books = library.addModel('books', BookCollection, starterBooks)
```

Here `BookCollection` is the Zod model from the Zod Models example.
`library.collection<z.output<typeof bookSchema>, number>('books')` retrieves
a registered collection,
returning `undefined` for an unknown name. Retain the result of `addModel` to
keep inferred custom utility types. `library.collections` exposes collection
state values, including each record map and its tracking sets.

### Finding Records

`find(query, sortFn?)` returns an array without changing collection order or
tracking. Both argument types are inferred from the collection:

- A partial example matches every supplied own field using `Object.is`.
  Nested objects match by reference. An empty example matches every record.
- A readonly ID array validates keys, preserves supplied order and duplicates,
  and omits missing records. An empty ID array returns no records.
- A predicate `(item) => boolean` filters records in insertion order.
- An optional `(left, right) => number` comparator sorts the result array.

```ts
books.find({ title: 'The Dispossessed' })
books.find([0, 2])
books.find(
  (book) => book.title.startsWith('The '),
  (left, right) => left.title.localeCompare(right.title),
)
```

This uses the numeric-id Zod collection. Returned arrays are new; records are
shared with collection state. Use collection methods to edit them. Predicate
and comparator errors propagate to the caller. `CollectionFindQuery` and
`CollectionComparator` are exported types for reusable query helpers.

### Change Tracking

Tracking identifies records your application may need to save or process.
For a collection loaded with many server records, it provides a small set of
pending keys instead of requiring every record to be resent. DataCore does not
save them automatically or interpret a connector response as acknowledgement.

- `changed` contains keys touched by tracked writes.
- `created` contains keys inserted by tracked writes while absent locally.
  Those keys also enter `changed`. Later edits keep them in both sets.
- Created means new to the local collection at that moment, not necessarily
  absent on the server. An untracked load followed by a tracked update enters
  `changed` without entering `created`.
- These are sets of touched keys, not a diff, old-value snapshot, undo history,
  or conflict detector. Writing the same value or reverting a value still
  leaves its key pending. Repeated writes use one set entry.

**Leave defaults alone** for normal single-record user edits (`setItem`,
`put`, `update`: tracking on) and bulk server hydration (`setMany`, `putMany`,
`addModel` starter data: tracking off).

**Pass `true` to a bulk write** when a user import, batch edit, or generated
records should be discovered by your pending-save workflow. Bulk methods do
not track by default, even when the caller intends a user edit.

**Pass `false` to a single-record write** for inbound server data, socket
updates, already-saved responses, or data intentionally excluded from pending
work. This prevents an inbound write from being queued as an outbound edit.
Each override applies only to that call; there is no global tracking switch.

An untracked write still validates and changes Forestry state normally. It
does not suppress subscriptions or remove existing tracking entries. It can
also overwrite a dirty record's contents: reconcile inbound data before
replacing pending local edits. Passing `false` does not mark a record clean.

```ts
// Use the numeric bookSchema from above with a fresh collection.
const TrackingBooks = defineCollection(bookSchema, 'bookId')
const trackedBooks = new DataManager().addModel('tracking', TrackingBooks)
trackedBooks.setMany([{ bookId: 1, title: 'Loaded from server' }])
trackedBooks.update(1, { title: 'Local edit' }) // Tracked by default.
trackedBooks.putMany([{ bookId: 2, title: 'User import' }], true)
trackedBooks.setItem({ bookId: 3, title: 'Socket update' }, false)

console.log([...trackedBooks.value.changed]) // [1, 2]
console.log([...trackedBooks.value.created]) // [2]
const pending = trackedBooks.find([...trackedBooks.value.changed])
// Save pending through your application, retaining tracking on failure.
```

Tracking properties are read-only `ReadonlySet<Key>` views. Inspect them
with `has`, `size`, or iteration; collection commands own their updates.
Use `persist` to acknowledge successful snapshots safely, or
`syncRecords(remoteMap, true)` to accept authoritative remote values and
clear tracking for those incoming IDs. There is no direct tracking reset.

`delete` removes the record and its tracking entries; no pending-delete marker
is retained. Coordinate remote deletes separately. Reads, including `find`,
do not change tracking, and arbitrary inherited Forest mutations do not
automatically maintain it. Use collection write helpers for tracked changes.

### Queued Persistence

`persist({ ids?, sendRecords }): Promise<boolean>` saves selected records and
acknowledges only those unchanged since the call. Without `ids`, it selects the
current `changed` keys. Explicit IDs may include untracked records. IDs are
validated and deduplicated; missing records are omitted. An empty selection
resolves `true` without invoking the sender. Invalid IDs or uncloneable records
reject before enqueueing.

Each request captures a `structuredClone` of its records and immediately
subscribes to collection updates, including while queued. The callback receives
a fresh `Map<Key, Item>` copy and returns `Promise<boolean>`. A `true` result
clears `created` and `changed` only for records unchanged since the selected
snapshot. Edits to other IDs, later edits to those same IDs, deletion and
recreation, and untracked inbound updates are preserved. A true result means
the send succeeded; newer changes can still be pending. No manual tracking reset
call is needed.

```ts
const PersistBooks = defineCollection(bookSchema, 'bookId', {
  persistRetry: { delayMs: 500, maxRetries: 2 },
})
const persistBooks = new DataManager().addModel('persist', PersistBooks)
persistBooks.setMany([
  { bookId: 1, title: 'Draft One' },
  { bookId: 2, title: 'Draft Two' },
], true)

const sendRecords = async (
  snapshot: Map<number, z.output<typeof bookSchema>>,
): Promise<boolean> => {
  // Replace this with your async backend operation.
  console.log([...snapshot.values()])
  return true // Only after the whole batch succeeds.
}
const saved = await persistBooks.persist({ ids: [1], sendRecords })
console.log(saved) // true
console.log([...persistBooks.value.changed]) // [2]
```

One worker sends one batch at a time. Pending requests sharing the exact same
`sendRecords` reference are compacted into a union of IDs before sending. For
an overlapping ID, the latest queued snapshot wins. Requests arriving during
an active send belong to a later batch. Reuse a stable sender function rather
than creating a new wrapper per call when compaction is desired.

`false` responses and thrown sender errors enter the retry queue. Configure
`persistRetry` in `CollectionBaseConfig` or the third `defineCollection`
argument. Defaults: `delayMs: 1000`, `maxRetries: 3`, meaning one initial send
plus up to three retries. Delay must be finite and nonnegative; retries must
be a nonnegative integer. `maxRetries: 0` disables retries. Exhausted requests
resolve `false` without clearing tracking. Each attempt receives a fresh copy
of the captured snapshots.

Delayed retries block newer requests for that sender until they can be retried
and compacted together, preventing an old retry from overwriting newer queued
work. Other sender references can proceed during the delay. Distinct callback
references do not share this ordering guarantee. Send operations should be
idempotent because a lost acknowledgement can cause an already-successful
write to be retried.

`persistWork$` and `persistRetry$` are initially empty
`BehaviorSubject<CollectionPersistRequest<Item, Key>[]>` inspection streams. Work
contains active and pending requests; retry contains delayed requests. Their
arguments contain normalized IDs and sender references, not record payloads.
Enqueue through `persist`; do not mutate the subjects. `CollectionPersistArgs`
and `CollectionPersistRetry` are exported types.

Completing a collection (or its owning manager) releases subscriptions and
retry timers, resolves unfinished requests `false`, and ignores late results.
It cannot abort an already-started network operation. Local cleanup does not
cancel previously requested sends. `persist` does not synchronize remote
changes or handle remote deletion; its callback owns the transport.

### Local Housekeeping

`cleanCollection(query)` removes local records using the same query forms as
`find`: a partial example, a readonly ID array, or a filter function. It clears
those records from `created` and `changed` in the same mutation. Missing IDs
are ignored. IDs and predicates are evaluated before removal, so an invalid
key or thrown predicate leaves the collection unchanged. An empty example
matches everything; an empty ID array matches nothing.

`cleanAll()` empties this collection’s record Map and both tracking sets.
The branch remains registered and reusable, with its configuration and custom
methods intact. Other collections are unaffected. Use `syncRecords(map, true)`
to accept authoritative records while retaining them in the collection.

```ts
trackedBooks.cleanCollection([3])
trackedBooks.cleanCollection({ title: 'User import' })
trackedBooks.cleanCollection((book) => book.title.startsWith('Loaded'))
trackedBooks.cleanAll()
```

Cleaning is local housekeeping: it makes no connector request and retains no
pending-delete marker. It discards pending local work for removed records.
`delete(idOrQuery)` accepts either a single ID or the same query forms as
`find` and `cleanCollection`. It remains a local removal operation:

```ts
trackedBooks.delete(3)
trackedBooks.delete([1, 2])
trackedBooks.delete({ title: 'Socket update' })
trackedBooks.delete((book) => book.title.startsWith('Imported'))
```

An empty example removes all records; an empty ID array removes none. Invalid
keys or a thrown predicate leave state unchanged. For an
intentional remote deletion, call `connector.delete` explicitly and clean the
local record after success, or retain your own retry information when removing
optimistically. No `deleted` tracking set is maintained.

## Data Connections

A `DataConnector` supplies asynchronous `get`, `put`, and `delete` operations.
Applications own the concrete transport.

```ts
import {
  DataManager,
  type DataConnector,
} from '@wonderlandlabs/forestry-data-core'

declare const connector: DataConnector

const data = new DataManager({ connector })
const books = await data.connector?.get<Book[]>('books')
```

`DataConnectionManager` accepts ordered `DataConnection` instances. It calls
`ensureReady` before each operation and falls through to the next connection
when readiness or the operation fails. If every connection fails, it throws
the last error; an empty connection list throws `Data source failed`.
An explicit `connector` takes precedence over `connections`. Without either,
`data.connector` is `null`.

Collection mutations update Forestry state locally. Applications explicitly
load connector results into collections and send writes to the connector:

```ts
const loaded = await connector.get<Book[]>('books')
books.setMany(loaded)
books.update('book-1', { title: 'The Dispossessed' })
const sendBookRecords = async (records: Map<string, Book>) => {
  for (const record of records.values()) {
    await connector.put('books', record)
  }
  return true
}
const saved = await books.persist({ sendRecords: sendBookRecords })
```

This uses the string-id `Book` and collection from the Collections example.
`persist` acknowledges unchanged saved records. Direct connector calls do not
clear tracking automatically. Connector input and result types are
transport-specific; generic result types do not provide runtime validation.

### Standalone Connections and Transports

Use the connection layer independently of `DataManager` or collections:

```ts
import {
  DataConnectionManager,
  createEmptyConnectionState,
  connectionStatus,
  type ConnectionState,
  type ConnectionStatus,
  type DataConnection,
  type DataConnector,
  type DataStreamAdapter,
} from '@wonderlandlabs/forestry-data-core/connections'
```

These exports are also available from the package root. The `/connections`
entry point loads the connection layer without loading Forestry classes.

Implement `DataConnection` for either transport:

- REST connections implement async `get`, `put`, `delete`, and `ensureReady`.
  `start` and `stop` may be no-ops. State and change streams are optional.
- Socket connections implement the same request methods, with `ensureReady`
  waiting for a usable connection. `start` and `stop` manage the socket;
  optional `state$` and `changes$` report connectivity and pushed changes.

`DataStreamAdapter` describes a stream source with `connect`, `disconnect`,
`state$`, and `changes$`. It can support a socket connection implementation;
`DataConnectionManager` accepts the full `DataConnection` contract.

`ConnectionState`, `ConnectionStatus`, `connectionStatus`, and
`createEmptyConnectionState` replace the former `ModelSocketState`,
`ModelSocketStatus`, `modelSocketStatus`, and `createEmptyModelSocketState`
names. `DataStreamAdapter` replaces `GlobalModelSocketAdapter`.
The initial state is `idle`, with null timestamps and an empty error.
For REST, `connected` can mean the service is available; it does not imply
an open socket. State streams are optional, so request-only connections can
leave the manager state at `idle`.

Fallback applies to writes as well as reads. A failed response may follow a
successful server write, so transports should use idempotent operations or
request identifiers where retrying a write could duplicate an effect.

## JSON Fixtures

`JsonFixtureConnection` clones its input and keeps later writes isolated from
the original fixture object.

```ts
import {
  DataManager,
  JsonFixtureConnection,
} from '@wonderlandlabs/forestry-data-core'

const fixtures = new JsonFixtureConnection({
  books: {
    'book-1': {
      id: 'book-1',
      title: 'The Dispossessed',
    },
  },
})

const data = new DataManager({ connections: [fixtures] })
const book = await data.connector?.get<Book>('books', 'book-1')
```

Fixture inputs may identify a record with a string id or an object containing a
string `id`. Calling `get` without an id returns all records for that model.
`put` accepts one record or an array of records with string `id` properties;
`delete` accepts a string id or an object containing one. Numeric collection
keys and custom identity properties require an application-owned adapter for
this fixture format. Reads, writes, and returned results are cloned.
The fixture exposes `changes$` but does not emit record-change events.

## Lifecycle

Call `start` when a connector should begin publishing connection state or model
changes. These methods belong to `data.connector`, not `DataManager`:

```ts
data.connector?.start()
// Use the connector and its optional state$/changes$ streams.
data.connector?.stop()
```

`DataConnectionManager.start()` starts every connection once and forwards
connection states into `state$`; the most recently emitted state wins.
`changes$` merges available connection change streams and requires a subscriber.
Applications decide how these events affect collections.

Call `stop` once when finished. It releases internal state subscriptions and
stops every connection. A stopped connection manager cannot be restarted.
`JsonFixtureConnection.stop()` completes its state and change streams.

## Development

```sh
yarn workspace @wonderlandlabs/forestry-data-core test
yarn workspace @wonderlandlabs/forestry-data-core lint
yarn workspace @wonderlandlabs/forestry-data-core build
```

### Synchronizing remote changes

`syncRecords(map, clearLocalEdits = false)` validates and merges remote
records without marking them as edited. Locally edited or created records
survive by default. Passing `true` overwrites the incoming IDs and clears
their tracking. IDs absent from the map remain untouched.

`pendingPersists()` returns unique queued, active and retrying IDs.
`abortPending(ids?)` cancels only pending requests created before the call.
Omit IDs to select all pending records. Active requests and failed requests
awaiting retries continue normally. Local data and tracking are preserved.
Affected promises resolve `false`; remaining IDs still send. Requests queued
after the call survive, even when timestamps share the same millisecond.

Queue entries expose read-only `createdAt` (Unix milliseconds) and `state`:
`pending`, `active`, `complete`, or `failed` (also exported as `persistState`).
Retries stay `failed` during backoff and become `active` when sent again.
Canceled requests end `failed`. Retain an entry reference to inspect its
terminal state after it leaves the queues; no completed history is retained.

```ts
collection.abortPending(collection.pendingPersists());
collection.syncRecords(remoteRecords, true);
```

Sync does not cancel persistence. Active writes and failed retries still
require conflict handling in the saving layer.

### Comparing server echoes

Configure `recordComparator(current, incoming): boolean` on `CollectionBase`
or in the third argument of `defineCollection`. `syncRecords` validates all
incoming data, then uses this predicate to skip equivalent replacements.
The default is `Object.is`. Equivalent records keep their existing reference
and timestamp; a wholly equivalent sync emits no state update unless tracking
needs clearing. Comparator errors leave state unchanged.

For records with `updatedAt`, compare all meaningful fields and accept only
a deliberate timestamp tolerance. For example, for a schema containing only
`id`, `title`, and a numeric millisecond `updatedAt`:

```ts
const echoToleranceMs = 5000
type TimestampedBook = { id: number; title: string; updatedAt: number }
const recordComparator = (
  current: TimestampedBook,
  incoming: TimestampedBook,
) =>
  current.id === incoming.id &&
  current.title === incoming.title &&
  Math.abs(current.updatedAt - incoming.updatedAt) <= echoToleranceMs
```

Supply that function as `{ recordComparator }`. No timestamp field is assumed
or ignored automatically. This is content equivalence, not conflict ordering.
Dirty records remain protected unless `syncRecords(map, true)` explicitly
accepts incoming data; that clears tracking even for equivalent records.
Persistence acknowledgments retain strict snapshot identity checks so newer
local edits are not accidentally acknowledged by a tolerant comparator.

### Pending data indicator (plain JavaScript)

```js
import {
  createPendingIndicator,
} from '@wonderlandlabs/forestry-data-core/pending-indicator';

const indicator = createPendingIndicator({ scale: 0.5, speed: 1 });
indicator.setPending(3);
indicator.configure({ scale: 0.75, speed: 0.5, hue: 210 });
indicator.setPending(0);
indicator.destroy();
```

The supplied icon spins in the lower right, 16px from either edge. It starts
hidden and has no React, Forestry or RxJS runtime dependency. Importing is
safe outside a browser; call the factory only after `document.body` exists.

Options are a plain JSON-compatible object. `scale` multiplies the original
64px size (default 0.5 = 32px). `speed` is turns per second (default 1), with
zero pausing rotation. Invalid nonfinite or out-of-range values throw
`TypeError`; scale must be positive and speed nonnegative. Reduced-motion
preferences show a still icon. `configure` changes only supplied options.

Drive visibility from all unsaved work, including edits waiting to send,
active saves and failed requests. Hide after confirmed saves or deliberate
discard. The icon does not save data or stop navigation. `destroy` removes
it permanently; later method calls do nothing. Each factory call creates
an independent indicator, so normally create one for the app.

`setPending(count)` shows the number of unique unsaved records in the center
while the surrounding icon spins. Zero hides it. Supply a nonnegative safe
integer; invalid counts throw `TypeError` without changing the indicator.
Count a record once even when it has several queued edits. The app supplies
the count; the utility does not inspect collections or persistence queues.

`hue` sets the base color in degrees (default 64, wrapping around 360).
The spinner’s two parts use 85% and 15% lightness at 75% saturation and full
opacity so light and dark backgrounds each have a contrasting part. The
record count stays dark on a white center. The documentation preview picks
a random size and hue on every click; normal indicators use your settings.

### Explaining the pending icon

```js
import {
  showPendingNotice,
} from '@wonderlandlabs/forestry-data-core/pending-indicator';

// Call when your app has unsaved work, alongside the spinner.
const closeExplanation = showPendingNotice();
// Remove on app disposal or when the pending work is resolved.
closeExplanation();
```

The native browser modal explains the count and asks the user to leave the
page open until saving finishes. “Don’t show this again” is remembered in
localStorage when the user dismisses the dialog. Later calls return a no-op
without opening it. Pass `{ storageKey: 'my-app:pending-notice' }` to scope
that preference. With blocked storage, the dialog works but the preference
may not persist. Repeated calls share the currently open notice.

The returned cleanup function removes the modal without storing the checkbox
preference. It is safe to call repeatedly. The notice does not affect saves,
the spinner, or page navigation. Call only after `document.body` exists.
