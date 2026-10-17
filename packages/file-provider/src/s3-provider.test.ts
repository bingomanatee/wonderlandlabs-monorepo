import { describe, expect, it, vi } from 'vitest'
import { firstOutput } from './test-helpers.js'
import { S3FileIoProvider } from './s3-provider.js'
import type { FileIoData } from './types.js'

describe('S3FileIoProvider', () => {
  it('writes and reads objects through signed S3 requests', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      responseFor(input, init, {
        GET: new Response('hello', {
          headers: { 'content-type': 'text/plain' },
        }),
        PUT: new Response(null),
      }),
    )
    const provider = testProvider(fetch)

    const write = await provider.write('folder/a.txt', 'hello')
    const data = await provider.read('folder/a.txt')

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(String(fetch.mock.calls[0]?.[0])).toBe(
      'https://s3.test/bucket/folder/a.txt',
    )
    expect(fetch.mock.calls[0]?.[1]?.method).toBe('PUT')
    expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).get(
      'authorization',
    )).toContain('AWS4-HMAC-SHA256')
    expect(write.byteSize).toBe(5)
    expect(new TextDecoder().decode(data.value)).toBe('hello')
    expect(data.mediaType).toBe('text/plain')
    expect(data.storedAt).toBe('folder/a.txt')
  })

  it('checks one or many objects with HEAD requests', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      responseFor(input, init, {
        HEAD: String(input).endsWith('/missing.txt')
          ? new Response(null, { status: 404 })
          : new Response(null),
      }),
    )
    const provider = testProvider(fetch)

    expect(await firstOutput(provider.has('exists.txt'))).toBe(true)
    expect(await firstOutput(provider.has('missing.txt'))).toBe(false)
    expect(await firstOutput(provider.hasMany('exists.txt', 'missing.txt')))
      .toEqual(
        new Map([
          ['exists.txt', true],
          ['missing.txt', false],
        ]),
      )
  })

  it('searches objects with ListObjectsV2 and glob filtering', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      responseFor(input, init, {
        GET: String(input).includes('list-type=2')
          ? new Response(listXml(['chapters/a.md', 'chapters/b.txt']))
          : new Response(`body:${String(input).split('/').at(-1)}`, {
              headers: { 'content-type': 'text/markdown' },
            }),
      }),
    )
    const provider = testProvider(fetch)

    const files = await firstOutput<FileIoData[]>(
      provider.search('chapters/*.md'),
    )

    expect(String(fetch.mock.calls[0]?.[0])).toBe(
      'https://s3.test/bucket?list-type=2&prefix=chapters%2F',
    )
    expect(files.map((file) => file.storedAt)).toEqual(['chapters/a.md'])
    expect(new TextDecoder().decode(files[0]!.value)).toBe('body:a.md')
  })
})

function testProvider(fetch: typeof globalThis.fetch) {
  return new S3FileIoProvider({
    accessKeyId: 'key',
    bucket: 'bucket',
    endpoint: 'https://s3.test',
    fetch,
    forcePathStyle: true,
    region: 'us-east-1',
    secretAccessKey: 'secret',
  })
}

function responseFor(
  _input: RequestInfo | URL,
  init: RequestInit | undefined,
  responses: Partial<Record<string, Response>>,
) {
  const method = init?.method ?? 'GET'
  const response = responses[method]

  if (!response) {
    return new Response(`unexpected ${method}`, { status: 500 })
  }

  return response
}

function listXml(keys: string[]) {
  return [
    '<ListBucketResult>',
    ...keys.map((key) => `<Contents><Key>${key}</Key></Contents>`),
    '</ListBucketResult>',
  ].join('')
}
