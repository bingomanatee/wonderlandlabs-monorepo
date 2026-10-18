import { createServer, type Server } from 'node:http'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { firstOutput } from './test-helpers.js'
import { RestFileIoProvider } from './rest-provider.js'
import type { FileIoData } from './types.js'

const roots: string[] = []
const servers: Server[] = []

afterEach(async () => {
  await Promise.all([
    ...roots.map((root) => rm(root, { force: true, recursive: true })),
    ...servers.map((server) => closeServer(server)),
  ])
  roots.length = 0
  servers.length = 0
})

describe('RestFileIoProvider', () => {
  it('gets files from an HTTP URL prefix', async () => {
    const { prefix } = await httpFixture({
      'story/chapter.md': '# Chapter\n',
    })
    const provider = new RestFileIoProvider({
      fetch: globalThis.fetch,
      urlPrefix: prefix,
    })

    const data = await provider.read('story/chapter.md')

    expect(new TextDecoder().decode(data.value)).toBe('# Chapter\n')
    expect(data.mediaType).toBe('text/markdown')
    expect(data.name).toBe('chapter.md')
    expect(data.storedAt).toBe('story/chapter.md')
  })

  it('checks HTTP existence with HEAD requests', async () => {
    const { prefix } = await httpFixture({ 'exists.txt': 'yes' })
    const provider = new RestFileIoProvider({
      fetch: globalThis.fetch,
      urlPrefix: prefix,
    })

    expect(await firstOutput(provider.has('exists.txt'))).toBe(true)
    expect(await firstOutput(provider.has('missing.txt'))).toBe(false)
  })

  it('gets files from a local file URL prefix', async () => {
    const root = await tempRoot()
    await writeFile(join(root, 'local.txt'), 'local file')
    const provider = new RestFileIoProvider({
      urlPrefix: `${pathToFileURL(root).href}/`,
    })

    const data = await provider.read('local.txt')

    expect(new TextDecoder().decode(data.value)).toBe('local file')
    expect(await firstOutput(provider.has('local.txt'))).toBe(true)
    expect(await firstOutput(provider.has('missing.txt'))).toBe(false)
  })

  it('puts files through an HTTP URL prefix', async () => {
    const { prefix, writes } = await httpFixture({})
    const provider = new RestFileIoProvider({
      defaultWriteMethod: 'PATCH',
      fetch: globalThis.fetch,
      headers: (path) => ({
        headers: {
          authorization: `Bearer ${path}`,
          'x-upload': 'story',
        },
        method: 'POST',
      }),
      urlPrefix: prefix,
    })

    const write = await provider.write('story/chapter.md', '# Chapter\n')

    expect(write.byteSize).toBe(10)
    expect(writes).toEqual([
      {
        authorization: 'Bearer story/chapter.md',
        body: '# Chapter\n',
        contentType: 'text/markdown',
        method: 'POST',
        path: 'story/chapter.md',
        upload: 'story',
      },
    ])
  })

  it('puts files through a local file URL prefix', async () => {
    const root = await tempRoot()
    const provider = new RestFileIoProvider({
      urlPrefix: `${pathToFileURL(root).href}/`,
    })

    await provider.write('local/out.txt', 'local file')

    await expect(readFile(join(root, 'local/out.txt'), 'utf8')).resolves.toBe(
      'local file',
    )
  })

  it('resolves the injected fetch for each remote request', async () => {
    const firstFetch = vi.fn(async () => new Response('first'))
    const secondFetch = vi.fn(async () => new Response('second'))
    const options = {
      fetch: firstFetch,
      urlPrefix: 'https://files.example.test',
    }
    const provider = new RestFileIoProvider(options)

    await provider.read('first.txt')
    options.fetch = secondFetch
    const second = await provider.read('second.txt')

    expect(firstFetch).toHaveBeenCalledOnce()
    expect(secondFetch).toHaveBeenCalledOnce()
    expect(new TextDecoder().decode(second.value)).toBe('second')
  })

  it('does not assume a global fetch for remote requests', async () => {
    const provider = new RestFileIoProvider({
      urlPrefix: 'https://files.example.test',
    })

    await expect(provider.read('missing.txt')).rejects.toThrow(
      'Fetch is not available in this runtime',
    )
  })
})

async function httpFixture(files: Record<string, string>) {
  const writes: {
    authorization: string | undefined
    body: string
    contentType: string | undefined
    method: string | undefined
    path: string
    upload: string | undefined
  }[] = []
  const server = createServer((request, response) => {
    const path = decodeURIComponent(
      new URL(request.url ?? '/', 'http://localhost').pathname,
    ).replace(/^\/files\//, '')
    if (!['GET', 'HEAD'].includes(request.method ?? '')) {
      const chunks: Buffer[] = []

      request.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      request.on('end', () => {
        writes.push({
          authorization: request.headers.authorization,
          body: Buffer.concat(chunks).toString('utf8'),
          contentType: request.headers['content-type'],
          method: request.method,
          path,
          upload: request.headers['x-upload'],
        })
        response.writeHead(204)
        response.end()
      })
      return
    }

    const body = files[path]

    if (!body) {
      response.writeHead(404)
      response.end()
      return
    }

    response.setHeader('content-type', 'text/markdown')
    response.writeHead(200)
    if (request.method !== 'HEAD') {
      response.end(body)
      return
    }
    response.end()
  })
  servers.push(server)

  await new Promise<void>((resolve) => {
    server.listen(0, resolve)
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('HTTP fixture did not bind to a port')
  }

  return { prefix: `http://127.0.0.1:${address.port}/files`, writes }
}

async function tempRoot() {
  const root = await mkdtemp(join(tmpdir(), 'rest-file-provider-'))
  roots.push(root)

  return root
}

async function closeServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}
