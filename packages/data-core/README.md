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

- `CollectionBase` stores records by string or numeric key and tracks created or changed
  records.
- `DataManager` owns named collection branches and an optional data connector.
- `DataConnectionManager` tries data connections in order until one succeeds.
- `JsonFixtureConnection` provides an in-memory connection for examples and
  tests.
- Connector types define the transport boundary without choosing an HTTP,
  database, or socket implementation.
- Change streams accept an application-owned event type.

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
import type { z } from 'zod'
import type { RecordUtility } from '@wonderlandlabs/forestry-data-core'

interface SoftDeleteConfig {
  deletedAt: string
}

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
const softDeleteBookSchema = bookSchema.extend({
  deletedAt: z.string().nullable(),
})
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

### Change Tracking

- `setItem` and `put` track changes by default.
- `setMany` and `putMany` do not track changes by default, which makes them
  suitable for initial loads.
- A newly tracked id appears in both `created` and `changed`.
- `delete` removes the record and its tracking entries.
- `clearTracking` preserves records while clearing `created` and `changed`.

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
when readiness or the operation fails.

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

## Lifecycle

Call `start` when a connector should begin publishing connection state or model
changes. Call `stop` once when the owning application is finished with it.

## Development

```sh
yarn workspace @wonderlandlabs/forestry-data-core test
yarn workspace @wonderlandlabs/forestry-data-core lint
yarn workspace @wonderlandlabs/forestry-data-core build
```
