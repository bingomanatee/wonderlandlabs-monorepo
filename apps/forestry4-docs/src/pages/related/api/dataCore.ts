import { collectionMethods } from './collectionMethods';
import { entry, type ApiSections } from './shared';

export const dataCoreApi: ApiSections = [
  {
    title: 'Pending data indicator',
    paragraphs: [
      'Import from @wonderlandlabs/forestry-data-core/pending-indicator. ' +
      'This standalone browser utility has no runtime framework dependencies. ' +
      'It is safe to import on a server; create it only in a browser after ' +
      'document.body exists. It does not observe collections automatically.',
    ],
    methods: [
      entry('createPendingIndicator(options?: PendingIndicatorOptions)',
        'Create a hidden lower-right indicator using the supplied artwork. ' +
        'scale defaults to 0.5 of 64px; speed defaults to 1 turn per second. ' +
        'hue defaults to 64 degrees and wraps around 360. The two spinner ' +
        'parts use 85% and 15% lightness. All options must be finite; ' +
        'scale positive and speed nonnegative. ' +
        'Invalid options throw TypeError. Reduced motion disables spinning.'),
      entry('indicator.setPending(unsavedRecords: number): void',
        'Show a stationary count of unique unsaved records inside the spinning ' +
        'icon; zero hides it. Count must be a nonnegative safe integer or ' +
        'TypeError is thrown. Include failed unsaved changes. A positive ' +
        'count attaches the icon to document.body. It does not block clicks ' +
        'or page closure.'),
      entry('indicator.configure(options: PendingIndicatorOptions): void',
        'Update scale, speed or hue without recreating the element. Speed zero ' +
        'pauses rotation. Omitted settings keep their current values. ' +
        'Validation happens before applying either option.'),
      entry('showPendingNotice(options?: PendingNoticeOptions): () => void',
        'Open a native modal explaining unsaved changes and the spinner. ' +
        'Include a Don’t show this again checkbox, remembered in localStorage ' +
        'when dismissed. storageKey optionally scopes the preference. ' +
        'Return a cleanup function; skipped notices return a no-op. Repeated ' +
        'calls share the open notice. Programmatic cleanup does not store ' +
        'the checkbox preference. Storage failures do not block dismissal. ' +
        'Call only in a browser after document.body exists. Does not save, ' +
        'change the indicator or install a navigation warning.'),
      entry('indicator.destroy(): void',
        'Remove the indicator. Repeated destruction is safe; later show, ' +
        'hide and configure calls do nothing.'),
    ],
  },
  {
    title: 'Imports and scope',
    paragraphs: [
      'Import the collection API from @wonderlandlabs/forestry-data-core. ' +
      'DataManager and CollectionBase extend Forestry Forest; inherited ' +
      'subscription, mutation, branching, and lifecycle APIs are documented ' +
      'in the Forestry API. The connection exports have their own reference ' +
      'linked below and are also available from this package root.',
    ],
  },
  {
    title: 'Collection construction and configuration',
    paragraphs: [
      'Item is the stored record type and Key is its identity type. Schema ' +
      'validation parses complete records on writes, validates keys, and ' +
      'rejects identity changes. Bulk writes validate before applying data. ' +
      'Identity schemas must accept their own output because stored keys ' +
      'are validated again during access.',
    ],
    methods: [
      entry('recordComparator?: RecordComparator<Item>',
        'Optional (current: Item, incoming: Item) => boolean equality ' +
        'predicate used only by syncRecords after validation. Defaults to ' +
        'Object.is. true preserves the existing record reference, including ' +
        'its timestamp. No state update emits for a wholly equivalent sync ' +
        'unless tracking must clear. Comparison errors leave state ' +
        'unchanged. ' +
        'Does not change sorting, local writes, or persist acknowledgments.'),
      entry('defineCollection(schema, identity, methods?)',
        'Create a CollectionBase subclass from a Zod object schema. Infer ' +
        'Item from schema output and Key from the selected identity field. ' +
        'identity must produce strings or finite numbers, including zero. ' +
        'methods accepts recordMethods and collectionMethods; both default ' +
        'to empty objects. persistRetry configures retries. Returns a class ' +
        'for DataManager.addModel.'),
      entry('new CollectionBase<Item, Key, Utilities, Collections>' +
        '(params, config = {})',
        'Construct a Forestry collection branch. params is passed to Forest ' +
        'and must supply valid collection state when constructed directly. ' +
        'The key type defaults to ItemKey<Item>; utility generics default ' +
        'to empty objects.'),
      entry('CollectionBaseConfig<Item, Key, Utilities, Collections>',
        'Optional fields: schema (Zod model), identity (schema identity ' +
        'property, defaults to id), keyOf (schema-free identity callback), ' +
        'recordMethods, collectionMethods, recordComparator, persistRetry. ' +
        'A schema cannot be combined with keyOf. Without a schema or ' +
        'keyOf, records use id.'),
      entry('collection.value: CollectionBaseValue<Item, Key>',
        'State contains records: Map<Key, Item>, created: ReadonlySet<Key>, ' +
        'and changed: ReadonlySet<Key>. Collection write methods maintain ' +
        'validation ' +
        'and tracking; arbitrary inherited mutations do not.'),
      entry('collection.recordMethods / collection.collectionMethods',
        'Bound custom utilities, preserving names, optional config, return ' +
        'types, promises, and errors. Detached functions retain the owner. ' +
        'Record utilities validate their supplied key before invocation.'),
    ],
  },
  {
    title: 'Collection and registration methods',
    paragraphs: [
      'All writes are local. Single-record writes default to tracking; bulk ' +
      'writes default to untracked. Tracking adds keys even if values have ' +
      'not changed. No connector calls or deletion queue are implicit.',
    ],
    methods: collectionMethods,
  },
  {
    title: 'Tracking state',
    paragraphs: [],
    methods: [
      entry('value.changed: ReadonlySet<Key>',
        'Keys touched by tracked inserts, replacements, or updates. ' +
        'Repeated writes retain one entry; writing an equal or reverted ' +
        'value does not remove it. Entries contain no previous values.'),
      entry('value.created: ReadonlySet<Key>',
        'Keys absent locally when inserted by a tracked write. Each is ' +
        'also in changed. Later writes retain its created entry until ' +
        'cleared or removed. This does not describe remote existence.'),
      entry('trackChange: boolean',
        'Per-write flag. true adds tracking entries; false preserves ' +
        'existing entries without adding new ones. Neither value changes ' +
        'schema validation or Forestry reactivity. Defaults are specified ' +
        'on each write method.'),
      entry('Tracking reset and removal',
        'Tracking properties are read-only. persist acknowledges saves; ' +
        'syncRecords(map, true) clears tracking for incoming IDs. ' +
        'cleanCollection and delete remove the selected records and their ' +
        'tracking entries; cleanAll empties records and both sets. No ' +
        'deleted set is maintained. persist performs explicit I/O with ' +
        'snapshot-aware acknowledgement; ordinary writes do not.'),
    ],
  },
  {
    title: 'DataManager',
    paragraphs: [],
    methods: [
      entry('new DataManager<ValueType, Change>(config = {})',
        'Create a Forest with named collection branches. ValueType extends ' +
        'DataManagerValue; Change defaults to unknown. config.value defaults ' +
        'to createDataManagerValue(); name defaults to DataManager.'),
      entry('DataManagerConfig<ValueType, Change>',
        'Optional name, value, connector, and connections fields. connector ' +
        'takes precedence. Otherwise connections creates an ordered ' +
        'DataConnectionManager. Omit both for local-only collections.'),
      entry('manager.collections / DataManagerValue.collections',
        'Map<string, CollectionBaseValue<unknown, CollectionKey>> containing ' +
        'state values, rather than collection instances. Registered branch ' +
        'instances are returned by addModel or collection.'),
      entry('manager.connector: DataConnector<Change> | null',
        'Configured connector or connection manager. Its lifecycle is ' +
        'explicit. Loading, saving, event reconciliation, and ' +
        'clearing tracking are application responsibilities.'),
      entry('createDataManagerValue(): DataManagerValue',
        'Return a fresh manager value with an empty collections Map.'),
    ],
  },
  {
    title: 'Utility and identity types',
    paragraphs: [],
    methods: [
      entry('CollectionPersistArgs<Item, Key>',
        'Optional ids: readonly Key[]; required sendRecords: ' +
        '(records: Map<Key, Item>) => Promise<boolean>. IDs are validated, ' +
        'deduplicated, and missing records omitted. Each task captures a ' +
        'deep copy at call time. A true sender result acknowledges the ' +
        'whole compacted batch; false or thrown errors are retried.'),
      entry('CollectionPersistRetry',
        'Optional delayMs: finite nonnegative number, default 1000; ' +
        'maxRetries: nonnegative integer, default 3 retries beyond the ' +
        'initial send. Configured through persistRetry on CollectionBase ' +
        'or defineCollection. A fresh payload copy is supplied on each ' +
        'attempt. Later work with the same sender waits during backoff; ' +
        'other senders remain eligible.'),
      entry('CollectionKey = string | number',
        'Supported identity primitives. Schema identities must be finite ' +
        'numbers or strings; key schemas may refine or brand them.'),
      entry('ItemKey<Item>',
        'Infer a string or numeric id property from Item; otherwise default ' +
        'to string. Specify Key explicitly for another identity property.'),
      entry('IdentityProperty<Item, Key>',
        'Union of property names whose values extend Key. Used to constrain ' +
        'the schema identity selector.'),
      entry('CollectionFindQuery<Item, Key>',
        'Partial<Item> | readonly Key[] | ((item: Item) => boolean). The ' +
        'three accepted find query forms. Object examples compare own ' +
        'fields with Object.is; ID arrays preserve order and duplicates.'),
      entry('CollectionComparator<Item>',
        '(left: Item, right: Item) => number. Negative sorts left first, ' +
        'positive sorts right first, and zero preserves relative order.'),
      entry('RecordUtility<Item, Key, Config, Result>',
        '(id: Key, config: Config | undefined, collection: ' +
        'CollectionBase<Item, Key>) => Result. Call the bound utility with ' +
        '(id, config?). Missing-record behavior belongs to the callback.'),
      entry('RecordUtilities<Item, Key>',
        'Named record-utility dictionary used as a generic constraint. ' +
        'Concrete function types retain each config and result.'),
      entry('CollectionUtility<Item, Key, Config, Result>',
        '(config: Config | undefined, collection: CollectionBase<Item, Key>) ' +
        '=> Result. Bound calls take only config?. The owner is supplied ' +
        'as the second callback argument.'),
      entry('CollectionUtilities<Item, Key>',
        'Named collection-utility dictionary. Collection utilities do not ' +
        'take an identity argument.'),
      entry('ModelAdapter<Item, Key>',
        'Local model contract: delete(idOrQuery): void; getItem(id): Item ' +
        '| undefined; put(id, item, trackChange?): void; and ' +
        'putMany(iterableOrMap, trackChange?): void.'),
    ],
  },
  {
    title: 'Constants and validation failures',
    paragraphs: [
      'Zod parse failures throw ZodError. Other validation failures use the ' +
      'messages in dataCoreErrors. Failed validation leaves the attempted ' +
      'write unapplied.',
    ],
    methods: [
      entry('dataCoreDefaults',
        'Default dictionary: managerName is DataManager; identity is id; ' +
        'persistRetryDelayMs is 1000; persistMaxRetries is 3.'),
      entry('dataCoreErrors',
        'Message dictionary: invalidIdentity, missingIdentity, schemaKeyOf, ' +
        'mismatchedIdentity, changedIdentity, invalidPersistRetry, ' +
        'dataSourceFailed, plus ' +
        'duplicateCollection(name) and missingItemId(storeName) message ' +
        'factories. connectionStatus and createEmptyConnectionState are ' +
        'covered in the Data Connections API.'),
    ],
  },
];
