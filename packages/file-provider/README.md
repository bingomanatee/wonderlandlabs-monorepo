# @timothyopensource/fileprovider

Path-based file I/O provider abstractions. Get and put text or binary files
into a variety of contexts in a switchable way without coupling application
code to the underlying storage mechanics.

## Why use FileProvider?

Applications often need the same file behavior across different environments:
local development, staging servers, production systems, test suites, and
experiments. This package keeps file operations behind one provider interface so
code can switch between local, remote, in-memory, or key-value-backed storage
without changing the application logic.

That makes it useful when you need to test locally with a mock or filesystem
provider, run staging against remote storage, or A/B test storage backends by
swapping the provider at the application boundary.

## Install

```sh
npm install @timothyopensource/fileprovider
```

## Exports

The package exports its current API from the package root.
See [README.API.md](./README.API.md) for the full method and type reference.

```ts
import {
  KeyValueFileIoProvider,
  LocalFileIoProvider,
  MockFileIoProvider,
  RestFileIoProvider,
  S3FileIoProvider,
  mediaTypeFromPath,
} from '@timothyopensource/fileprovider'
```

## Promise API

Use `read` and `write` for normal request/response code. They wrap the
underlying streams and either return the output or throw the response error.

```ts
import { LocalFileIoProvider } from '@timothyopensource/fileprovider'

const provider = new LocalFileIoProvider({ root: './data/files' })

const write = await provider.write('chapters/001.md', '# Chapter One\n')
const file = await provider.read('chapters/001.md')
const text = new TextDecoder().decode(file.value)

console.log(write.byteSize, text)

const reads = await provider.readMany('chapters/001.md', ['chapters/002.md'])
const writes = await provider.writeMany(
  { path: 'chapters/003.md', value: '# Chapter Three\n' },
  [{ path: 'chapters/004.md', value: '# Chapter Four\n' }],
)

console.log(reads.get('chapters/001.md')?.mediaType)
console.log(writes.get('chapters/003.md')?.byteSize)
```

## Stream API

Use `get` and `put` when you want RxJS response streams instead of promises.
Each stream emits a list of matching responses and completes when the requested
operation is done.

```ts
import { LocalFileIoProvider } from '@timothyopensource/fileprovider'

const files = new LocalFileIoProvider({ root: './data/files' })

files.put('chapters/001.md', '# Chapter One\n').subscribe({
  error: (error) => {
    console.error(error)
  },
  next: ([response]) => {
    if (!response.ok) {
      console.error(response.error)
      return
    }

    console.log(response.output.byteSize)
  },
})

files.get('chapters/001.md').subscribe({
  error: (error) => {
    console.error(error)
  },
  next: ([response]) => {
    if (!response.ok) {
      console.error(response.error)
      return
    }

    console.log(new TextDecoder().decode(response.output.value))
  },
})

files
  .putMany({ path: 'chapters/002.md', value: '# Chapter Two\n' }, [
    { path: 'chapters/003.md', value: '# Chapter Three\n' },
  ])
  .subscribe({
    next: (responses) => {
      for (const response of responses) {
        console.log(response.id, response.ok)
      }
    },
  })

files.getMany('chapters/001.md', ['chapters/002.md']).subscribe({
  next: (responses) => {
    for (const response of responses) {
      if (response.ok) {
        console.log(response.output.storedAt)
      }
    }
  },
})
```

## Input Streams

Use `inputStream` when callers should commission writes through a shared input
object. Each `next` call creates its own transaction id and returns a response
stream scoped to that write commission. `next` accepts one file or a nested
array of files.

```ts
import { MockFileIoProvider } from '@timothyopensource/fileprovider'

const files = new MockFileIoProvider()
const input = files.inputStream()

input.next({ path: 'one.md', value: '# One\n' }).subscribe({
  next: ([response]) => {
    if (response.ok) {
      console.log(response.id, response.output.storedAt)
    }
  },
})

input
  .next([
    { path: 'two.md', value: '# Two\n' },
    [{ path: 'three.md', value: '# Three\n' }],
  ])
  .subscribe({
    next: (responses) => {
      for (const response of responses) {
        if (response.ok) {
          console.log(response.id, response.output.storedAt)
        }
      }
    },
  })

input.complete()
```

## Switch Providers

Keep the provider at the application boundary. The rest of the code can depend
on the shared `FileIoProvider` interface.

```ts
import {
  KeyValueFileIoProvider,
  LocalFileIoProvider,
  MockFileIoProvider,
  RestFileIoProvider,
  S3FileIoProvider,
  type FileIoProvider,
} from '@timothyopensource/fileprovider'

export function createFileProvider(env: NodeJS.ProcessEnv): FileIoProvider {
  if (env.FILE_PROVIDER === 'mock') {
    return new MockFileIoProvider()
  }

  if (env.FILE_PROVIDER === 'redis') {
    return new KeyValueFileIoProvider({
      keyPrefix: env.FILE_PROVIDER_KEY_PREFIX,
      url: env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    })
  }

  if (env.FILE_PROVIDER === 'rest') {
    return new RestFileIoProvider({
      fetch: globalThis.fetch,
      urlPrefix: env.FILE_PROVIDER_URL ?? 'https://example.com/files',
    })
  }

  if (env.FILE_PROVIDER === 's3') {
    return new S3FileIoProvider({
      accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
      bucket: env.FILE_PROVIDER_BUCKET ?? '',
      endpoint: env.FILE_PROVIDER_S3_ENDPOINT,
      fetch: globalThis.fetch,
      forcePathStyle: env.FILE_PROVIDER_S3_PATH_STYLE === 'true',
      region: env.AWS_REGION ?? 'us-east-1',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
      sessionToken: env.AWS_SESSION_TOKEN,
    })
  }

  return new LocalFileIoProvider({
    root: env.FILE_PROVIDER_ROOT ?? './data/files',
  })
}
```

## Local Development

Use `LocalFileIoProvider` when you want transparent files on disk.

```ts
import { LocalFileIoProvider } from '@timothyopensource/fileprovider'

const files = new LocalFileIoProvider({ root: '/tmp/my-app-files' })

await files.write('imports/source.md', {
  mediaType: 'text/markdown',
  value: '# Draft\n',
})

const source = await files.read('imports/source.md')

console.log(new TextDecoder().decode(source.value))
```

## Tests

The package test suite starts an isolated in-memory `js-valkey-server` from
its dev dependencies on an available local port. No Docker or external
Redis/Valkey service is needed. The mock is reset between tests and closed
when the suite finishes. Development tests require Node.js 22 or newer.

Set `VALKEY_TEST_URL` to run the same tests against an existing Redis/Valkey
server instead. External servers are never flushed by the test setup; each
test uses a unique key prefix.

Use `MockFileIoProvider` to assert storage behavior without touching disk or
network services.

```ts
import { expect, it } from 'vitest'
import { MockFileIoProvider } from '@timothyopensource/fileprovider'

it('writes an export artifact', async () => {
  const files = new MockFileIoProvider()

  await files.write('exports/book.md', '# Book\n')

  expect(files.readStoredText('exports/book.md')).toBe('# Book\n')
  expect(files.puts.map((write) => write.path)).toEqual(['exports/book.md'])
})
```

## Fetch Injection

HTTP REST and S3 providers receive `fetch` at the composition boundary. They
resolve the injected implementation for each request and never capture or fall
back to a global fetch implementation. Local REST paths do not require fetch.

## REST Gateways

Use `RestFileIoProvider` when files already live behind a static file server,
CDN, HTTP route, `file://` URL, or local prefix. It supports `get`, `has`, and
`hasMany`. It also supports `hasAll`, which resolves to one boolean. For HTTP
and HTTPS prefixes, `put` and `write` send the normalized bytes with
configurable headers and a configurable write method.

```ts
import { RestFileIoProvider } from '@timothyopensource/fileprovider'

const files = new RestFileIoProvider({
  defaultWriteMethod: 'PUT',
  fetch: globalThis.fetch,
  headers: () => ({
    headers: { authorization: `Bearer ${process.env.FILE_TOKEN ?? ''}` },
  }),
  urlPrefix: 'https://cdn.example.com/project-assets/',
})

const asset = await files.read('images/cover.png')
const ready = await files.hasAll('images/cover.png', ['data/index.json'])

await files.write('uploads/draft.md', '# Draft\n')

console.log(asset.mediaType, ready)
```

## S3 Storage

Use `S3FileIoProvider` when production or staging files should live in an S3
bucket or an S3-compatible service. It signs requests with AWS Signature
Version 4 and supports read, write, delete, move, search, and transform
operations through the same provider API.

```ts
import { S3FileIoProvider } from '@timothyopensource/fileprovider'

const files = new S3FileIoProvider({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  bucket: process.env.FILE_PROVIDER_BUCKET ?? '',
  endpoint: process.env.FILE_PROVIDER_S3_ENDPOINT,
  fetch: globalThis.fetch,
  forcePathStyle: process.env.FILE_PROVIDER_S3_PATH_STYLE === 'true',
  region: process.env.AWS_REGION ?? 'us-east-1',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  sessionToken: process.env.AWS_SESSION_TOKEN,
})

await files.write('drafts/001.md', '# Draft\n')

const draft = await files.read('drafts/001.md')
const exists = await files.hasAll('drafts/001.md')

console.log(new TextDecoder().decode(draft.value), exists)
```

## Batch And Transform

Providers that support writes can transform one file into many files, or many
files into a new set of files.

```ts
import { firstValueFrom } from 'rxjs'
import {
  LocalFileIoProvider,
  type FileIoResponseStream,
} from '@timothyopensource/fileprovider'

const files = new LocalFileIoProvider({ root: './workspace' })

await files.write('source.txt', 'alpha beta')

const parts = await firstResponse(
  files.map('source.txt', (file) => ({
    in: [file],
    out: new TextDecoder()
      .decode(file.value)
      .split(' ')
      .map((word, index) => ({
        ...file,
        name: `part-${index + 1}.txt`,
        storedAt: `parts/${index + 1}.txt`,
        value: new TextEncoder().encode(word),
      })),
  })),
)

console.log(parts.map((file) => file.storedAt))

async function firstResponse<T>(stream: FileIoResponseStream<T>): Promise<T> {
  const [response] = await firstValueFrom(stream)

  if (!response.ok) {
    throw response.error
  }

  return response.output as T
}
```

## Providers

- `LocalFileIoProvider`: stores files under a local root directory.
- `KeyValueFileIoProvider`: stores files in a Redis/Valkey-compatible backend.
- `RestFileIoProvider`: reads and writes files through an HTTP, HTTPS, file
  URL, or local path prefix.
- `S3FileIoProvider`: stores files in S3 or an S3-compatible service.
- `MockFileIoProvider`: in-memory provider for tests.

## Core Types

- `FileIoProvider`
- `FileIoData`
- `FileIoDataInput`
- `FileIoWriteResult`
- `FileIoResponseStream`

## Notes

This package contains the current file-provider API. Timothy's older
leaf-text provider API lives in `@timothy/file-provider-legacy`.
