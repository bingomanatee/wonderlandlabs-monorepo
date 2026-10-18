import type { ModuleSection } from '../modules';

export const collectionMethods: ModuleSection['methods'] = [
  {
    signature: 'syncRecords(map: Map<Key, Item>, ' +
      'clearLocalEdits = false): void',
    description: 'Validate and merge incoming records without tracking. ' +
      'Preserve edited or created local records unless clearLocalEdits ' +
      'is true; then overwrite incoming IDs and clear their tracking. ' +
      'Unmentioned records and tracking remain unchanged. Validation ' +
      'is atomic. recordComparator can suppress equivalent replacements; ' +
      'clearLocalEdits still clears tracking for equivalent incoming IDs. ' +
      'This does not cancel persistence automatically.',
  },
  {
    signature: 'abortPending(ids?: readonly Key[]): void',
    description: 'Cancel only pending work created before this call. ' +
      'Omit IDs to select all pending records, or restrict by ID. Active ' +
      'requests and failed requests awaiting retries are untouched. ' +
      'Affected requests resolve false; remaining IDs still send. Local ' +
      'records and tracking remain intact. Same-millisecond and reentrant ' +
      'enqueues after the cutoff survive.',
  },
  {
    signature: 'CollectionPersistRequest<Item, Key>',
    description: 'Inspection metadata extends CollectionPersistArgs with ' +
      'readonly createdAt (Unix milliseconds) and state. States are pending, ' +
      'active, complete and failed, exported through persistState. A failed ' +
      'request stays failed through retry backoff until active again. ' +
      'Canceled requests end failed. Retain a request reference to inspect ' +
      'its terminal state after it leaves the queues. No history is retained.',
  },
  {
    signature: 'pendingPersists(): Key[]',
    description: 'Return a fresh deduplicated array of IDs awaiting ' +
      'persistence, including queued, active and delayed retries. ' +
      'Canceled IDs are excluded. This is a method, not a state property.',
  },
  {
    signature: 'getItem(id: Key): Item | undefined',
    description: 'Read a record by identity. Returns undefined for ' +
      'a missing key. Schema-backed collections validate the key ' +
      'before lookup and throw for invalid keys.',
  },
  {
    signature: 'has(id: Key): boolean',
    description: 'Check whether a record exists, using the same ' +
      'key validation as getItem.',
  },
  {
    signature: 'list(): Item[]',
    description: 'Return a new array of records in Map insertion ' +
      'order. The array contains the stored records; it does not ' +
      'deep-clone them.',
  },
  {
    signature: 'find(example | readonly Key[] | filterFn, ' +
      'sortFn?): Item[]',
    description: 'Return matching records in a new array. Partial ' +
      'examples match every supplied own field with Object.is; ' +
      'nested objects match by reference. ID arrays validate keys, ' +
      'preserve order and duplicates, and omit missing records. ' +
      'Predicates filter in insertion order. An empty example ' +
      'matches all records; an empty ID array matches none. ' +
      'An optional (left, right) => number comparator sorts only ' +
      'the result. Records remain shared with state. Tracking is ' +
      'unchanged; callback errors propagate.',
  },
  {
    signature: 'keyOf(item: Item): Key',
    description: 'Derive a record’s identity. This uses the schema ' +
      'identity property, the configured schema-free keyOf, or ' +
      'the default id property.',
  },
  {
    signature: 'setItem(item: Item, trackChange = true): void',
    description: 'Insert or replace a complete record, deriving ' +
      'its key from the item. Schema-backed writes validate and ' +
      'store the parsed record. Tracking is enabled by default.',
  },
  {
    signature: 'put(id: Key, item: Item, trackChange = true): void',
    description: 'Insert or replace a complete record at an ' +
      'explicit key. With a schema, the key must match the ' +
      'validated record identity. Tracking defaults to true.',
  },
  {
    signature: 'update(id: Key, patch: Partial<Item>, ' +
      'trackChange = true): void',
    description: 'Shallow-merge a patch into an existing record. ' +
      'Validate the complete result before storing it and reject ' +
      'identity changes. A valid but missing key is a no-op. ' +
      'Tracking defaults to true.',
  },
  {
    signature: 'setMany(items: Item[], trackChange = false): void',
    description: 'Insert or replace an array of records. Derive ' +
      'each key from its item. Unmentioned records remain in the ' +
      'collection. Tracking defaults to false for initial loads.',
  },
  {
    signature: 'putMany(items: Iterable<Item> | Map<Key, Item>, ' +
      'trackChange = false): void',
    description: 'Bulk-insert or replace records from an iterable ' +
      'or keyed Map. Schema-backed Map keys must match identities. ' +
      'All entries are prepared and validated before any mutation; ' +
      'a validation failure leaves the collection unchanged. ' +
      'setMany uses this same bulk-write path.',
  },
  {
    signature: 'cleanCollection(query: ' +
      'CollectionFindQuery<Item, Key>): void',
    description: 'Local housekeeping using the same example, ' +
      'readonly ID array, or filter function as find. Remove ' +
      'matching records and their created/changed entries in one ' +
      'mutation. Validate and select before removing anything; ' +
      'invalid IDs or a thrown predicate leave state unchanged. ' +
      'An empty example cleans every record; an empty ID array ' +
      'does nothing. No remote request or deletion marker is made.',
  },
  {
    signature: 'cleanAll(): void',
    description: 'Empty this collection’s records and both tracking ' +
      'sets. Preserve its registration, configuration, and custom ' +
      'methods so it can be reused. Other collections and remote ' +
      'data are untouched. Pending local work is discarded.',
  },
  {
    signature: 'persist(args: CollectionPersistArgs<Item, Key>): ' +
      'Promise<boolean>',
    description: 'Capture selected records and enqueue a serialized send. ' +
      'Default IDs are current changed keys. Successful batches clear ' +
      'tracking only for records unchanged since their selected snapshot. ' +
      'Return false after retry exhaustion or disposal; invalid IDs or ' +
      'clone failures reject before enqueueing. Empty selections return true.',
  },
  {
    signature: 'complete(): CollectionBaseValue<Item, Key>',
    description: 'Dispose persistence queues, subscriptions and retry ' +
      'timers; resolve unfinished requests false and ignore late results. ' +
      'Then complete the Forestry branch and return its final value. ' +
      'Already-started callback I/O cannot be aborted by the collection.',
  },
  {
    signature: 'persistWork$ / persistRetry$',
    description: 'BehaviorSubject<CollectionPersistRequest<Item, Key>[]> ' +
      'inspection streams, initially empty. work includes active and ' +
      'queued requests; retry includes delayed requests. Requests with ' +
      'identical sender references compact before sending. For overlapping ' +
      'IDs the latest queued snapshot wins. Do not mutate these subjects.',
  },
  {
    signature: 'delete(query: Key | CollectionFindQuery<Item, Key>): void',
    description: 'Accept a single ID or any find query: partial example, ' +
      'readonly ID array, or filter function. Remove matching local ' +
      'records and both tracking entries through cleanCollection. Missing ' +
      'IDs are ignored; invalid IDs or predicate errors leave state ' +
      'unchanged. An empty example removes all records; an empty array ' +
      'removes none. No remote request or deletion queue is created.',
  },
  {
    signature: 'get(path)',
    description: 'Inherited Forestry state-path lookup. For ' +
      "example, get('records') reads the record Map. Use getItem " +
      'to look up a record by identity.',
  },
  {
    signature: 'manager.addModel(name, CollectionClass, initialData?)',
    description: 'Register a collection branch and return it. ' +
      'Optional starter data is a keyed Map loaded without ' +
      'tracking. Duplicate names throw. Invalid starter data ' +
      'removes the attempted registration.',
  },
  {
    signature: 'manager.collection<Item, Key>(name)',
    description: 'Retrieve a registered collection, or undefined ' +
      'for an unknown name. Returns the base collection type rather ' +
      'than inferred custom utility methods.',
  },
];
