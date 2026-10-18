# @timothyopensource/fileprovider API

Full API reference for the package root export.

```ts
import {
  KeyValueFileIoProvider,
  LocalFileIoProvider,
  MockFileIoProvider,
  RestFileIoProvider,
  S3FileIoProvider,
  type FileIoProvider,
} from '@timothyopensource/fileprovider'
```

## Provider Interface

Every provider implements `FileIoProvider`.

### Read Methods

- `get(path: string): FileIoResponseStream<FileIoData>`
- `getMany(...paths: FileIoPathInput[]): FileIoResponseStream<FileIoData>`
- `read(path: string): Promise<FileIoData>`
- `readMany(...paths: FileIoPathInput[]): Promise<Map<string, FileIoData>>`

### Write Methods

- `put(path, data): FileIoResponseStream<FileIoWriteResult>`
- `putMany(...inputs): FileIoResponseStream<FileIoWriteResult>`
- `write(path, data): Promise<FileIoWriteResult>`
- `writeMany(...inputs): Promise<Map<string, FileIoWriteResult>>`

`put` and `write` accept `FileIoBinary | FileIoDataInput` as `data`.
`putMany` and `writeMany` accept `FileIoWriteInputList[]`.

### Existence Methods

- `has(path: string): FileIoResponseStream<boolean>`
- `hasMany(...paths: FileIoPathInput[]): FileIoResponseStream<
  Map<string, boolean>
  >`
- `hasAll(...paths: FileIoPathInput[]): Promise<boolean>`

### Delete Methods

- `delete(path: string): FileIoResponseStream<void>`
- `deleteMany(globString: string): FileIoResponseStream<void>`

### Move And Search Methods

- `move(fromPath, toPath): FileIoResponseStream<FileIoData>`
- `search(globString: string): FileIoResponseStream<FileIoData[]>`

Both `fromPath` and `toPath` are strings.

### Transform Methods

- `map(path, updateFn): FileIoResponseStream<FileIoData[]>`
- `maps(globString, updateFn): FileIoResponseStream<FileIoData[]>`

`map` uses `FileIoMapFn`. `maps` uses `FileIoMapsFn`.

### Input Stream Method

- `inputStream(): FileIoInputStream`

## Stream Responses

Stream methods return RxJS observables. Each emission is an array of response
objects.

Response fields:

- `id`: request id.
- `input`: the request object handled by the provider.
- `ok`: whether the operation succeeded.
- `output`: method-specific output when `ok` is true.
- `error`: provider or runtime error when `ok` is false.

`ok: true` means `output` is present for methods with output. `ok: false`
means `error` contains the provider or runtime error.

## Promise Helpers

The promise methods wrap stream methods internally.

| Promise method | Stream method | Behavior |
| --- | --- | --- |
| `read` | `get` | Resolves the first `FileIoData` output. |
| `readMany` | `getMany` | Resolves a map keyed by `storedAt`. |
| `write` | `put` | Resolves the first `FileIoWriteResult`. |
| `writeMany` | `putMany` | Resolves a map keyed by `storedAt`. |
| `hasAll` | `hasMany` | Resolves `true` only when every path exists. |

If the underlying response is not ok, the promise rejects with
`response.error`.

## File Data

`FileIoBinary` is `ArrayBuffer | ArrayBufferView | string`.

`FileIoDataInput` is accepted by writes. `FileIoData` is returned by reads.
Providers normalize strings, buffers, typed arrays, and array buffers into a
`Uint8Array`.

`storedAt` is the provider path. `name` defaults to the path basename.
`mediaType` is detected from the filename and bytes unless explicitly set.
`value` is always a `Uint8Array` after normalization.

## Write Results

`FileIoWriteResult` contains `byteSize`, `contentHash`, `mediaType`, `name`,
`storedAt`, and `writtenAt`.

`contentHash` is a SHA-256 hex digest of the written bytes. `writtenAt` is
an ISO timestamp generated when the provider acknowledges the write.

## Path Inputs

`getMany`, `readMany`, `hasMany`, and `hasAll` accept strings, arrays, or nested
arrays. Providers flatten them into one ordered list of paths.

```ts
await files.readMany('a.md', ['b.md', [['c.md']]])
```

## Write Input Lists

`putMany`, `writeMany`, and `inputStream().next` accept one write input, arrays,
or nested arrays. Each write input includes a `path` plus `FileIoDataInput`
fields.

```ts
await files.writeMany(
  { path: 'a.md', value: 'A' },
  [{ path: 'b.md', value: 'B' }],
)
```

## Transform Inputs

Transforms return a file delta.

`in` is the set of files to remove. `out` is the set of files to write. For
`map`, providers default `in` to the source file when omitted. For `maps`,
providers use the returned `in` value as provided.

## Input Streams

Each `next` call adds a transaction id to its writes and returns a response
stream scoped to that call. The input can be one file or a nested array of
files.

```ts
const input = files.inputStream()

input.next({ path: 'a.md', value: 'A' }).subscribe({
  next: ([response]) => {
    if (response.ok) {
      console.log(response.output.storedAt)
    }
  },
})

input.complete()
```

## Provider Constructors

### LocalFileIoProvider

Stores files below a local root directory.

Input: `{ root: string }`

Output: `LocalFileIoProvider`

### KeyValueFileIoProvider

Stores files in a Redis or Valkey-compatible backend.

Input fields:

- `url`: Redis/Valkey connection URL.
- `keyPrefix`: optional key namespace.
- `providerType`: optional `'redis' | 'valkey'` label.

Output: `KeyValueFileIoProvider`

### RestFileIoProvider

Reads files from an HTTP, HTTPS, file URL, or local path prefix. It can write
through HTTP, HTTPS, file URL, and local path prefixes.

Input fields:

- `urlPrefix`: HTTP, HTTPS, file URL, or local path prefix.
- `fetch`: injected fetch implementation required for HTTP and HTTPS prefixes.
- `defaultWriteMethod`: optional `PATCH`, `POST`, or `PUT`; defaults to `PUT`.
- `headers`: optional headers object or function returning `{ headers,
  method? }` for a path.

Output: `RestFileIoProvider`

### S3FileIoProvider

Stores files in S3 or an S3-compatible service using AWS Signature Version 4.

Input fields:

- `accessKeyId`: AWS access key id.
- `bucket`: S3 bucket name.
- `region`: AWS region.
- `secretAccessKey`: AWS secret access key.
- `endpoint`: optional S3-compatible endpoint.
- `fetch`: injected fetch implementation.
- `forcePathStyle`: optional path-style URL mode.
- `sessionToken`: optional AWS session token.

`endpoint` and `forcePathStyle` are for S3-compatible services, local S3
emulators, and path-style deployments.

Output: `S3FileIoProvider`

### MockFileIoProvider

Stores files in memory and exposes calls for tests.

Input fields:

- `files`: optional initial file map.
- `bufferOptions`: optional provider buffering settings.
- `onDelete`, `onDeleteMany`, `onGet`, `onMove`, `onPut`, `onSearch`:
  optional test callbacks.

The mock provider also exposes `readStored(path)` and `readStoredText(path)`
for tests.

Output: `MockFileIoProvider`

## Type Source

This document describes behavior and method IO. The canonical TypeScript
definitions publish in [dist/types.d.ts](./dist/types.d.ts).

## Provider Capabilities

| Provider | Read | Write | Delete | Search | Transform |
| --- | --- | --- | --- | --- | --- |
| `LocalFileIoProvider` | yes | yes | yes | yes | yes |
| `KeyValueFileIoProvider` | yes | yes | yes | yes | yes |
| `S3FileIoProvider` | yes | yes | yes | yes | yes |
| `MockFileIoProvider` | yes | yes | yes | yes | yes |
| `RestFileIoProvider` | yes | yes | no | no | no |

`RestFileIoProvider` does not support delete, search, or transform operations.
Unsupported operations emit a failed response in the stream API and reject
through the promise API.
