import { entry, type ApiSections } from './shared';

export const connectionsApi: ApiSections = [
  {
    title: 'Imports and transport contracts',
    paragraphs: [
      'Import from @wonderlandlabs/forestry-data-core/connections for use ' +
      'without loading Forestry classes, or from the package root. The ' +
      'package still declares Forestry as a peer dependency. REST and socket ' +
      'implementations share request methods; streams are optional.',
    ],
    methods: [
      entry('DataConnector<Change = unknown>',
        'Requires get<Data>(modelName, input?), put<Data>(modelName, ' +
          'input?), ' +
        'and delete<Data>(modelName, input?), all returning Promise<Data>; ' +
        'also start(): void and stop(): void. Optional changes$ is ' +
        'Observable<Change>; optional state$ is ' +
        'BehaviorSubject<ConnectionState>. Generic Data defaults to unknown ' +
        'and does not validate results at runtime.'),
      entry('DataConnection<Change = unknown>',
        'The DataConnector contract plus ensureReady(): Promise<void>. ' +
        'REST may use no-op lifecycle methods; sockets can await connection ' +
        'readiness and publish pushed changes. Inputs are transport-owned.'),
      entry('DataStreamAdapter<Change = unknown>',
        'Required connect(): void, disconnect(): void, changes$: ' +
        'Observable<Change>, and state$: BehaviorSubject<ConnectionState>. ' +
        'A stream source contract; wrap with request methods and ensureReady ' +
        'before using it as a DataConnection.'),
      entry('ModelCrudAdapter',
        'Optional get<Data>(input?), put<Data>(input?), and delete<Data>' +
        '(input?) methods returning Promise<Data>. A single-model adapter ' +
        'contract without modelName, lifecycle, or readiness requirements.'),
    ],
  },
  {
    title: 'DataConnectionManager',
    paragraphs: [
      'Each operation tries connections in constructor order and awaits ' +
      'ensureReady before calling the operation. A readiness or operation ' +
      'failure advances to the next connection. Success returns immediately. ' +
      'When all fail, the last error is thrown; an empty list throws ' +
      'Data source failed. Fallback writes need application-owned ' +
        'idempotency ' +
      'when a lost response could duplicate a successful write.',
    ],
    methods: [
      entry('new DataConnectionManager<Change>(connections)',
        'Accept a DataConnection<Change>[] and expose connector behavior. ' +
        'Construct without a DataManager or collection.'),
      ...['get', 'put', 'delete'].map((method) => entry(
        `${method}<Data = unknown>(modelName: string, input?): Promise<Data>`,
        'Forward the model name and input unchanged to the first successful ' +
        'connection. Return that connection’s result. Request methods do ' +
        'not require start to have been called.'
      )),
      entry('start(): void',
        'Subscribe to connection state streams and start every connection. ' +
        'Repeated calls do nothing. State forwarding begins here.'),
      entry('stop(): void',
        'Release internal state subscriptions and call stop on every ' +
        'connection. Call once at application teardown. The manager cannot ' +
        'restart afterward; it does not complete its own state$ subject or ' +
        'unsubscribe application subscribers to changes$.'),
      entry('state$: BehaviorSubject<ConnectionState>',
        'Starts with createEmptyConnectionState(). The latest emission from ' +
        'any connection wins; it is not an aggregate health calculation. ' +
        'Connections without state streams leave it idle.'),
      entry('changes$: Observable<Change>',
        'Merge all provided connection change streams. Subscribe to receive ' +
        'events; dispose the subscription when finished. Events do not ' +
        'automatically update collection records.'),
    ],
  },
  {
    title: 'Connection state',
    paragraphs: [],
    methods: [
      entry('ConnectionState',
        'Fields: status: ConnectionStatus; error: string; connectedAt, ' +
        'serverTime, validatedAt: string | null. Timestamp interpretation ' +
        'belongs to the transport. For REST, connected can mean available ' +
        'rather than a persistent socket.'),
      entry('ConnectionStatus / connectionStatus',
        'Type union and matching constant dictionary: idle, connecting, ' +
        'connected, disconnected, error, validated. The layer does not ' +
        'enforce a transition state machine.'),
      entry('createEmptyConnectionState(): ConnectionState',
        'Return a fresh idle state with empty error and null timestamps.'),
    ],
  },
  {
    title: 'JsonFixtureConnection',
    paragraphs: [
      'Fixture records use string id properties. Custom identity fields and ' +
      'numeric collection keys need an application adapter. Construction, ' +
      'writes, reads, and returned results use structuredClone; values must ' +
      'be cloneable.',
    ],
    methods: [
      entry('new JsonFixtureConnection(fixtures: JsonFixtureRecords)',
        'Clone a model-name object. Each model contains a string-keyed ' +
          'record ' +
        'map. JsonFixtureRecords is the public object input type.'),
      entry('get<Data>(modelName: string, input?): Promise<Data>',
        'A nonempty string id or object with string id looks up one record; ' +
        'a missing record returns undefined. Without a recognized id, ' +
        'return an array of all records. Unknown models begin empty.'),
      entry('put<Data>(modelName: string, input?): Promise<Data>',
        'Store one record or an array using each nonempty string id. Entries ' +
        'without recognized IDs are ignored. Return a clone of the input.'),
      entry('delete<Data>(modelName: string, input?): Promise<Data>',
        'Delete the recognized string id, if any. Missing records are ' +
        'harmless. Resolves undefined, regardless of generic Data.'),
      entry('ensureReady(): Promise<void>',
        'Immediately resolve; no external connection is required.'),
      entry('start(): void / stop(): void',
        'start publishes connected state with a current connectedAt ' +
        'timestamp. stop completes state$ and changes$. Treat stopped ' +
        'fixtures as disposed.'),
      entry('state$ / changes$',
        'state$ is BehaviorSubject<ConnectionState>. changes$ is ' +
        'Subject<unknown> and does not emit record-change events itself.'),
    ],
  },
];
