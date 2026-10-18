import { entry, type ApiSections } from './shared';

export const fileProviderApi: ApiSections = [
  {
    title: 'Imports, results, and errors',
    paragraphs: [
      'All APIs below are package-root exports from ' +
      '@timothyopensource/fileprovider. The root includes Node filesystem, ' +
      'networking, and crypto modules; use it in Node services or build ' +
      'tools. Forestry is not a dependency.',
      'Promise helpers reject with the first failed response.error. Stream ' +
      'methods return FileIoResponseStream<T>: an Observable of response ' +
      'arrays with complete(). Inspect ok before using output; handle ' +
      'observable errors too. Streams are scoped to commissioned operations. ' +
      'FileIoSubscription describes unsubscribe(): void.',
      'FileIoResponse<T> has id: string, input: FileIoRequest, ok: boolean, ' +
      'and optional output: T and error: unknown. FileIoRequestOutput is ' +
      'the union of FileIoData, FileIoData[], FileIoWriteResult, ' +
      'Map<string, boolean>, boolean, and void.',
    ],
  },
  {
    title: 'Provider constructors and options',
    paragraphs: [
      'Every concrete provider inherits the methods documented below. Local, ' +
      'key-value, S3, and mock providers support the full file interface. ' +
      'REST supports reading, existence checks, and writes; delete, ' +
      'deleteMany, move, search, map, and maps emit failed responses.',
    ],
    methods: [
      entry('new LocalFileIoProvider(options: LocalFileIoProviderOptions)',
        'Required root: string is the filesystem base directory. File ' +
        'operations resolve provider-relative paths beneath that root. ' +
        'Writes create parent directories.'),
      entry('new KeyValueFileIoProvider(options: ' +
        'KeyValueFileIoProviderOptions)',
        'Required url: string for a Redis/Valkey-compatible server. Optional ' +
        'keyPrefix namespaces storage and notifications, default ' +
        'timothy:file-io:v4; providerType is ' +
        'redis | valkey, default redis. The readonly ' +
        'providerType property exposes the selected label. ' +
        'KeyValueFileIoProviderType is that two-string union.'),
      entry('new RestFileIoProvider(options: RestFileIoProviderOptions)',
        'Required urlPrefix accepts HTTP(S), a file URL, or local prefix. ' +
        'Optional fetch must be supplied for HTTP(S). defaultWriteMethod ' +
        'is PATCH | POST | PUT, default PUT. headers accepts request headers ' +
        'or a callback. Fetch is injected per request; no global fallback.'),
      entry('RestFileIoHeadersInit / RestFileIoHeadersFn',
        'RestFileIoHeadersInit is NonNullable<RequestInit[headers]>. ' +
        'RestFileIoHeadersFn receives a path and synchronously or ' +
        'asynchronously returns RestFileIoRequestOptions. Those options ' +
        'contain optional headers and method. RestFileIoWriteMethod is ' +
        'PATCH | POST | PUT. Headers callbacks can supply path-specific ' +
        'authorization and write methods.'),
      entry('new S3FileIoProvider(options: S3FileIoProviderOptions)',
        'Required accessKeyId, secretAccessKey, bucket, region (strings), ' +
        'and fetch. Optional endpoint, forcePathStyle (boolean), and ' +
        'sessionToken support compatible services and temporary credentials. ' +
        'Requests use AWS Signature Version 4. Keep credentials server-side.'),
      entry('new MockFileIoProvider(options: MockFileIoProviderOptions = {})',
        'Optional files maps paths to FileIoBinary or FileIoDataInput. ' +
        'bufferOptions accepts maxBufferSize and maxDelay. Optional onDelete ' +
        '(path) and onDeleteMany(glob) return void; onGet(path) and ' +
        'onMove(from, to) return FileIoDataInput; onPut(path, data) returns ' +
        'FileIoWriteResult or void; onSearch(glob) returns ' +
          'FileIoDataInput[]. ' +
        'All callbacks may return promises and thrown errors fail requests.'),
    ],
  },
  {
    title: 'FileIoProvider promise methods',
    paragraphs: [
      'Use promises for ordinary request/response code. FileIoPathInput is ' +
      'a string or a readonly nested array of path inputs. FileIoWriteInput ' +
      'extends FileIoDataInput with required path: string. ' +
      'FileIoWriteInputList is one write input or a readonly nested array ' +
      'of them. Batch arguments are flattened in supplied order.',
    ],
    methods: [
      entry('read(path: string): Promise<FileIoData>',
        'Read one file and resolve its normalized data. Missing files or ' +
        'provider errors reject the promise.'),
      entry('readMany(...paths: FileIoPathInput[]): ' +
        'Promise<Map<string, FileIoData>>',
        'Read several paths and return a Map keyed by each result’s ' +
          'storedAt. ' +
        'A failed response rejects the batch; duplicate keys share one entry.'),
      entry('write(path: string, data: FileIoBinary | FileIoDataInput): ' +
        'Promise<FileIoWriteResult>',
        'Normalize and store one file, returning acknowledged metadata ' +
        'rather than the file contents.'),
      entry('writeMany(...inputs: FileIoWriteInputList[]): ' +
        'Promise<Map<string, FileIoWriteResult>>',
        'Store flattened write inputs and collect results by storedAt. A ' +
        'failure rejects the promise; a batch is not an atomic transaction.'),
      entry('hasAll(...paths: FileIoPathInput[]): Promise<boolean>',
        'Return true only if every requested path exists. Empty inputs ' +
        'resolve true. Provider failures reject rather than returning false.'),
    ],
  },
  {
    title: 'FileIoProvider stream methods',
    paragraphs: [
      'Every method returns FileIoResponseStream<Output>, with Output shown ' +
      'below. Batches can emit several response arrays before completing; ' +
      'do not assume that the first emission contains all results.',
    ],
    methods: [
      entry('get(path: string) / getMany(...paths: FileIoPathInput[])',
        'Output: FileIoData per file. Read one path or nested batches.'),
      entry('put(path: string, data: FileIoBinary | FileIoDataInput) / ' +
        'putMany(...inputs: FileIoWriteInputList[])',
        'Output: FileIoWriteResult per write. Normalize and store one or ' +
        'several files; failures are represented by failed responses.'),
      entry('has(path: string)',
        'Output: boolean indicating whether one path exists.'),
      entry('hasMany(...paths: FileIoPathInput[])',
        'Output: Map<string, boolean> keyed by requested paths. Unlike ' +
        'hasAll, preserves per-path results.'),
      entry('delete(path: string) / deleteMany(globString: string)',
        'Output: void. Remove one file or files matching a glob. These ' +
        'operations are unsupported by RestFileIoProvider.'),
      entry('move(fromPath: string, toPath: string)',
        'Output: FileIoData for the destination. Move a file through the ' +
        'provider. Unsupported by RestFileIoProvider.'),
      entry('search(globString: string)',
        'Output: FileIoData[] of matching files. Glob matching supports ' +
        '* within a path segment and ** across separators.'),
      entry('map(path: string, updateFn: FileIoMapFn)',
        'Output: FileIoData[] written by the transformation. Callback ' +
        'receives one normalized file and returns FileIoDataDelta or a ' +
        'promise. If delta.in is omitted, remove the source file.'),
      entry('maps(globString: string, updateFn: FileIoMapsFn)',
        'Output: FileIoData[] written by transforming all matching files. ' +
        'Callback receives FileIoData[] and returns a delta or promise. ' +
        'Only files explicitly listed in delta.in are removed.'),
      entry('inputStream(): FileIoInputStream',
        'Return { next(input: FileIoWriteInputList), complete() }. Each next ' +
        'creates a batch ID and returns a FileIoResponseStream<' +
        'FileIoWriteResult> scoped to that write commission. Complete the ' +
        'input when finished; it does not dispose the provider itself.'),
    ],
  },
  {
    title: 'File data and transformation types',
    paragraphs: [],
    methods: [
      entry('FileIoBinary',
        'ArrayBuffer | ArrayBufferView | string. Strings are encoded ' +
          'as UTF-8.'),
      entry('FileIoDataInput',
        'Required value: FileIoBinary. Optional mediaType, name, ' +
          'storedAt are ' +
        'string | null. Null or omitted metadata uses provider defaults.'),
      entry('FileIoData',
        'Readonly mediaType, name, storedAt: string; value: Uint8Array. ' +
        'storedAt is the provider path. name defaults to its basename.'),
      entry('FileIoWriteResult',
        'byteSize: number; contentHash: SHA-256 hex string; mediaType, name, ' +
        'storedAt: string; writtenAt: ISO timestamp generated on ' +
          'acknowledgement.'),
      entry('FileIoDataDelta',
        'Optional in: FileIoData[] selects files to remove. Required out: ' +
        'FileIoData[] selects files to write. Transform operations are not ' +
        'atomic multi-file transactions.'),
      entry('FileIoMapFn / FileIoMapsFn',
        '(data: FileIoData) => FileIoDataDelta | Promise<FileIoDataDelta> ' +
        'and the corresponding FileIoData[] input callback, respectively.'),
      entry('FileIoObservation / FileIoObservationStream',
        'Observation fields: ok: boolean, path: string, optional data: ' +
        'FileIoData and error: unknown. Stream is Observable<' +
        'FileIoObservation> with complete(), used by key-value subscriptions.'),
    ],
  },
  {
    title: 'Mock inspection and key-value observation',
    paragraphs: [],
    methods: [
      entry('mock.readStored(path): BinaryFileIoData | null / ' +
        'mock.readStoredText(path): string | null',
        'Inspect in-memory files synchronously without commissioning a read. ' +
        'Missing paths return null. readStoredText decodes stored bytes.'),
      entry('mock.files / mock.gets / mock.puts / mock.deletes',
        'files is Map<string, FileIoDataInput>. gets and deletes are path ' +
        'arrays; puts records { path, data }. Also inspect hasChecks ' +
        '(string[]), hasManyChecks (string[][]), moves ({ fromPath, ' +
          'toPath }[]), ' +
        'deleteManyCalls and searches (glob call arrays).'),
      entry('MockFileIoProviderCall / MockFileIoProviderPutCall / ' +
        'MockFileIoProviderGlobCall',
        'Call record types: { path: string }; { path: string, data: ' +
        'FileIoDataInput }; and { globString: string }, respectively.'),
      entry('keyValue.subscribe(path, options?): FileIoObservationStream',
        'Observe change notifications for one path using a Redis/Valkey ' +
        'pub/sub socket. options accepts maxBufferSize and maxDelay; ' +
        'default maxDelay is 50 ms for debouncing; maxBufferSize is unused ' +
        'by this observer. Emits reads after ' +
        'matching notifications, not an initial snapshot. Errors are ' +
        'failed observations. Call stream.complete() to close its socket ' +
        'and clear timers; unsubscribing a listener alone does not close it.'),
    ],
  },
  {
    title: 'ProviderBase and custom providers',
    paragraphs: [
      'ProviderBase is also exported as BaseFileIoInstance and ' +
      'BaseFileIoProvider. It supplies shared buffering and request routing ' +
      'for concrete provider implementations, plus all methods above.',
    ],
    methods: [
      entry('new subclass({ bufferOptions? } = {})',
        'Optional maxBufferSize and maxDelay control flushing. The default ' +
        'is { maxBufferSize: 1 }; at least one truthy limit is required.'),
      entry('input<Output>(request: FileIoRequest | FileIoRequest[])',
        'Return FileIoResponseStream<Output> for raw requests. Assign ' +
          'missing ' +
        'IDs, enqueue requests, and scope responses to those IDs. The ' +
        'generic is a caller-supplied result type, not runtime validation.'),
      entry('responseStream',
        'Shared RxJS subject of individual FileIoResponse values across ' +
        'requests. Prefer scoped operation streams for application I/O.'),
      entry('complete(): void',
        'Clear read timers and complete the buffer, flushing queued input. ' +
        'Dispose observation streams separately; this is not a promise ' +
        'that all asynchronous storage work has finished.'),
      entry('protected handleGet/Put/Delete/DeleteMany/Search/Has/' +
        'HasMany/Move/Map/Maps(request): Promise<void>',
        'Implement each operation handler. Use protected respond(request, ' +
        '{ ok, output?, error? }) or fail(request, error) to publish ' +
          'results. ' +
        'protected process(requests) dispatches a buffered request list.'),
    ],
  },
  {
    title: 'Raw request types',
    paragraphs: [
      'Every raw request extends FileIoRequestMeta with optional at: number, ' +
      'batchId: string, and id: string. FileIoRequest is their discriminated ' +
      'union. Request helper methods populate the op discriminator for you.',
    ],
    methods: [
      entry('FileIoGetRequest / FileIoPutRequest / FileIoDeleteRequest',
        'op is get, put, or delete and path is required. Put additionally ' +
        'requires data: FileIoBinary | FileIoDataInput.'),
      entry('FileIoDeleteManyRequest / FileIoSearchRequest',
        'op is deleteMany or search; globString: string selects files.'),
      entry('FileIoHasRequest / FileIoHasManyRequest',
        'op is has with path: string, or hasMany with paths: string[].'),
      entry('FileIoMoveRequest',
        'op: move; required fromPath and toPath strings.'),
      entry('FileIoMapRequest / FileIoMapsRequest',
        'op is map with path and updateFn: FileIoMapFn, or maps with ' +
        'globString and updateFn: FileIoMapsFn.'),
    ],
  },
  {
    title: 'Binary, glob, and media helpers',
    paragraphs: [],
    methods: [
      entry('new BinaryFileIoData(input: FileIoDataInput, ' +
        'fallbackPath: string)',
        'Normalize value to bytes. storedAt defaults to fallbackPath; name ' +
        'defaults to the storedAt basename. mediaType uses an override or ' +
        'detection. Implements FileIoData.'),
      entry('coerceFileIoData(input: FileIoBinary | FileIoDataInput, path)',
        'Return BinaryFileIoData from raw bytes/text or a metadata object.'),
      entry('binaryToUint8Array(input: FileIoBinary): Uint8Array',
        'Encode strings, reuse Uint8Array inputs, or expose the relevant ' +
        'buffer view. Does not promise a defensive copy.'),
      entry('writeResult({ mediaType, name, storedAt, value })',
        'Return FileIoWriteResult using supplied strings and Uint8Array, ' +
        'its byte length, SHA-256 hash, and the current timestamp.'),
      entry('globToRegExp(globString: string): RegExp / ' +
        'globMatch(globString: string, path: string): boolean',
        'Build an anchored full-path matcher or test a path. * matches ' +
        'within one segment and ** crosses separators. These helpers ' +
        'do not implement shell brace expansion or character classes.'),
      entry('mediaTypeFor(path: string, value: Uint8Array): string',
        'Prefer recognized magic bytes, then extension detection, then ' +
        'BINARY_MEDIA_TYPE (application/octet-stream).'),
      entry('mediaTypeFromPath(path: string): string',
        'Detect from a recognized case-insensitive suffix; use the binary ' +
        'fallback for unknown suffixes.'),
      entry('mediaTypeForExtension(extension: string): string | undefined',
        'Normalize case and an optional leading dot; unknown extensions ' +
        'return undefined.'),
      entry('getExtension(path: string): string',
        'Return the normalized recognized extension, including compound ' +
        'original.md when recognized, or an empty string.'),
      entry('MEDIA_KEYS / MEDIA_EXTENSIONS / MediaMapKey / mediaMap',
        'Exported format-key and extension dictionaries, the key union, and ' +
        'the Map of format records. Records contain extension, mediaType, ' +
        'and optional bytePrefix, asciiPrefixes, or magic predicate. Formats ' +
        'include Markdown variants, text, JSON, YAML, PDF, DOCX, ZIP, GIF, ' +
        'JPEG, PNG, and WebP. Extension lookup tables initialize at module ' +
        'load; mutating mediaMap does not rebuild those tables.'),
    ],
  },
];
