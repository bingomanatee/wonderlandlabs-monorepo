import { describe, expect, it, vi } from 'vitest'
import { firstOutput } from './test-helpers.js'
import { MEDIA_KEYS, mediaMap } from './media-type.js'
import type {
  FileIoData,
  FileIoResponseStream,
  FileIoWriteResult,
} from './types.js'
import { MockFileIoProvider } from './mock-provider.js'

describe('MockFileIoProvider', () => {
  it('round trips binary data', async () => {
    const provider = new MockFileIoProvider()

    const result = await firstOutput<FileIoWriteResult>(
      provider.put('story/chapter.md', {
        value: '# Chapter\n',
      }),
    )
    const data = await firstOutput<FileIoData>(provider.get('story/chapter.md'))

    expect(new TextDecoder().decode(data.value)).toBe('# Chapter\n')
    expect(data.mediaType).toBe(mediaMap.get(MEDIA_KEYS.markdown)!.mediaType)
    expect(data.name).toBe('chapter.md')
    expect(result.byteSize).toBe(10)
    expect(result.storedAt).toBe('story/chapter.md')
  })

  it('round trips binary data through promise helpers', async () => {
    const provider = new MockFileIoProvider()

    const result = await provider.write('story/chapter.md', '# Chapter\n')
    const data = await provider.read('story/chapter.md')

    expect(new TextDecoder().decode(data.value)).toBe('# Chapter\n')
    expect(data.mediaType).toBe(mediaMap.get(MEDIA_KEYS.markdown)!.mediaType)
    expect(result.byteSize).toBe(10)
  })

  it('supports injectable get and put callbacks', async () => {
    const putPaths: string[] = []
    const provider = new MockFileIoProvider({
      onGet: (path) => ({
        mediaType: mediaMap.get(MEDIA_KEYS.txt)!.mediaType,
        storedAt: path,
        value: 'a',
      }),
      onPut: (path) => {
        putPaths.push(path)
      },
    })

    await firstOutput(provider.put('x.txt', 'x'))
    const data = await firstOutput<FileIoData>(provider.get('remote.txt'))

    expect(putPaths).toEqual(['x.txt'])
    expect(data.mediaType).toBe(mediaMap.get(MEDIA_KEYS.txt)!.mediaType)
    expect(provider.readStoredText('x.txt')).toBe('x')
  })

  it('searches, moves, and deletes with glob strings', async () => {
    const provider = new MockFileIoProvider({
      files: {
        'a/one.md': 'one',
        'a/two.txt': 'two',
        'b/three.md': 'three',
      },
    })

    expect(
      (await firstOutput<FileIoData[]>(provider.search('**/*.md'))).map(
        (file) => file.storedAt,
      ),
    ).toEqual(['a/one.md', 'b/three.md'])

    await firstOutput(provider.move('a/one.md', 'a/moved.md'))
    await firstOutput(provider.deleteMany('**/*.txt'))

    expect(provider.readStoredText('a/one.md')).toBeNull()
    expect(provider.readStoredText('a/moved.md')).toBe('one')
    expect(provider.readStoredText('a/two.txt')).toBeNull()
  })

  it('checks one or many paths', async () => {
    const provider = new MockFileIoProvider({
      files: {
        'a.md': 'a',
      },
    })

    expect(await firstOutput(provider.has('a.md'))).toBe(true)
    expect(await firstOutput(provider.has('b.md'))).toBe(false)
    expect(
      await firstOutput(provider.hasMany(['a.md'], 'b.md', [['c.md']])),
    ).toEqual(
      new Map([
        ['a.md', true],
        ['b.md', false],
        ['c.md', false],
      ]),
    )
    expect(provider.hasManyChecks).toEqual([['a.md', 'b.md', 'c.md']])
    expect(await provider.hasAll('a.md', ['b.md'])).toBe(false)
    expect(await provider.hasAll(['a.md'])).toBe(true)
  })

  it('gets and reads many files', async () => {
    const provider = new MockFileIoProvider({
      files: {
        'a.md': 'a',
        'b.md': 'b',
        'c.md': 'c',
      },
    })

    expect(
      (
        await collectOutput(provider.getMany(['a.md'], 'b.md', [['c.md']]))
      ).map((file) => new TextDecoder().decode(file.value)),
    ).toEqual(['a', 'b', 'c'])

    expect(
      Array.from((await provider.readMany('a.md', ['b.md'])).keys()),
    ).toEqual(['a.md', 'b.md'])
  })

  it('puts and writes many files', async () => {
    const provider = new MockFileIoProvider()

    expect(
      (
        await collectOutput(
          provider.putMany(
            { path: 'a.md', value: 'a' },
            [{ path: 'b.md', value: 'b' }],
          ),
        )
      ).map((write) => write.storedAt),
    ).toEqual(['a.md', 'b.md'])

    const written = await provider.writeMany(
      { path: 'c.md', value: 'c' },
      [[{ path: 'd.md', value: 'd' }]],
    )

    expect(Array.from(written.keys())).toEqual(['c.md', 'd.md'])
    expect(provider.readStoredText('a.md')).toBe('a')
    expect(provider.readStoredText('b.md')).toBe('b')
    expect(provider.readStoredText('c.md')).toBe('c')
    expect(provider.readStoredText('d.md')).toBe('d')
  })

  it('commissions stream writes with scoped response streams', async () => {
    const provider = new MockFileIoProvider()
    const input = provider.inputStream()
    const first = firstOutput(
      input.next({ path: 'first.md', value: 'first' }),
    )
    const second = firstOutput(
      input.next({ path: 'second.md', value: 'second' }),
    )

    await expect(first.then((write) => write.storedAt)).resolves.toBe(
      'first.md',
    )
    await expect(second.then((write) => write.storedAt)).resolves.toBe(
      'second.md',
    )
    expect(provider.readStoredText('first.md')).toBe('first')
    expect(provider.readStoredText('second.md')).toBe('second')

    input.complete()
    expect(() => input.next({ path: 'done.md', value: 'done' })).toThrow(
      'FileIo input stream is complete',
    )
  })

  it('commissions stream write arrays with one scoped stream', async () => {
    const provider = new MockFileIoProvider()
    const input = provider.inputStream()
    const writes = await collectOutput(
      input.next([
        { path: 'one.md', value: 'one' },
        [{ path: 'two.md', value: 'two' }],
      ]),
    )

    expect(writes.map((write) => write.storedAt)).toEqual([
      'one.md',
      'two.md',
    ])
    expect(provider.readStoredText('one.md')).toBe('one')
    expect(provider.readStoredText('two.md')).toBe('two')
  })

  it('maps one file into many files', async () => {
    const provider = new MockFileIoProvider({
      files: {
        'source.md': 'alpha beta',
      },
    })

    const out = await firstOutput<FileIoData[]>(
      provider.map('source.md', async (file) => ({
        out: new TextDecoder()
          .decode(file.value)
          .split(' ')
          .map((word, index) => ({
            ...file,
            name: `part-${index + 1}.md`,
            storedAt: `parts/${index + 1}.md`,
            value: new TextEncoder().encode(word),
          })),
      })),
    )

    expect(out.map((file) => file.storedAt)).toEqual([
      'parts/1.md',
      'parts/2.md',
    ])
    expect(provider.readStoredText('source.md')).toBeNull()
    expect(provider.readStoredText('parts/1.md')).toBe('alpha')
    expect(provider.readStoredText('parts/2.md')).toBe('beta')
  })

  it('maps many files into one file', async () => {
    const provider = new MockFileIoProvider({
      files: {
        'chapters/1.md': 'one',
        'chapters/2.md': 'two',
      },
    })

    const out = await firstOutput<FileIoData[]>(
      provider.maps('chapters/*.md', async (files) => ({
        in: files,
        out: [
          {
            ...files[0],
            name: 'book.md',
            storedAt: 'book.md',
            value: new TextEncoder().encode(
              files
                .map((file) => new TextDecoder().decode(file.value))
                .join('\n'),
            ),
          },
        ],
      })),
    )

    expect(out.map((file) => file.storedAt)).toEqual(['book.md'])
    expect(provider.readStoredText('chapters/1.md')).toBeNull()
    expect(provider.readStoredText('chapters/2.md')).toBeNull()
    expect(provider.readStoredText('book.md')).toBe('one\ntwo')
  })

  it('routes input requests through shared response streams', async () => {
    const provider = new MockFileIoProvider()
    const responses: string[] = []

    provider.responseStream.subscribe((response) => {
      responses.push(response.id)
    })
    provider.input({
      data: 'subject',
      id: 'subject-put',
      op: 'put',
      path: 'subject.txt',
    })

    await expect
      .poll(() => provider.readStoredText('subject.txt'))
      .toBe('subject')

    expect(responses).toEqual(['subject-put'])
  })

  it('returns scoped response streams for batched input', async () => {
    const provider = new MockFileIoProvider()
    const stream = provider.input([
      { data: 'one', op: 'put', path: 'one.txt' },
      { data: 'two', op: 'put', path: 'two.txt' },
    ])
    const batches: string[][] = []

    await new Promise<void>((resolve, reject) => {
      stream.subscribe({
        complete: resolve,
        error: reject,
        next: (responses) => {
          batches.push(responses.map((response) => response.input.op))
        },
      })
    })

    expect(batches).toEqual([['put'], ['put']])
    expect(provider.readStoredText('one.txt')).toBe('one')
    expect(provider.readStoredText('two.txt')).toBe('two')
  })

  it('coalesces same-path reads into one physical read', async () => {
    const provider = new MockFileIoProvider({
      bufferOptions: { maxBufferSize: 10, maxDelay: 10 },
      files: {
        'same.txt': 'same',
      },
    })
    const first = firstOutput<FileIoData>(provider.get('same.txt'))
    const second = firstOutput<FileIoData>(provider.get('same.txt'))

    await expect(
      first.then((file) => new TextDecoder().decode(file.value)),
    ).resolves.toBe('same')
    await expect(
      second.then((file) => new TextDecoder().decode(file.value)),
    ).resolves.toBe('same')

    expect(provider.gets).toEqual(['same.txt'])
  })

  it('coalesces same-path writes to the latest physical write', async () => {
    const provider = new MockFileIoProvider({
      bufferOptions: { maxBufferSize: 10, maxDelay: 10 },
    })
    const first = firstOutput<FileIoWriteResult>(
      provider.put('same.txt', 'first'),
    )
    const second = firstOutput<FileIoWriteResult>(
      provider.put('same.txt', 'second'),
    )

    await first
    await second

    expect(provider.puts).toHaveLength(1)
    expect(provider.readStoredText('same.txt')).toBe('second')
  })

  it('parks reads behind writes and satisfies from the write', async () => {
    const provider = new MockFileIoProvider({
      bufferOptions: { maxBufferSize: 10, maxDelay: 10 },
      files: {
        'same.txt': 'old',
      },
    })
    const write = firstOutput<FileIoWriteResult>(
      provider.put('same.txt', 'new'),
    )
    const read = firstOutput<FileIoData>(provider.get('same.txt'))

    await write

    await expect(
      read.then((file) => new TextDecoder().decode(file.value)),
    ).resolves.toBe('new')
    expect(provider.gets).toEqual([])
    expect(provider.readStoredText('same.txt')).toBe('new')
  })

  it('parks reads behind active writes', async () => {
    let releaseWrite: () => void = () => {}
    const provider = new MockFileIoProvider({
      onPut: () =>
        new Promise<void>((resolve) => {
          releaseWrite = resolve
        }),
    })
    const write = firstOutput<FileIoWriteResult>(
      provider.put('active.txt', 'active'),
    )
    const read = firstOutput<FileIoData>(provider.get('active.txt'))

    await expect.poll(() => provider.puts.length).toBe(1)
    expect(provider.gets).toEqual([])

    releaseWrite()

    await write
    await expect(
      read.then((file) => new TextDecoder().decode(file.value)),
    ).resolves.toBe('active')
    expect(provider.gets).toEqual([])
  })

  it('executes a delayed read after the buffer delay', async () => {
    vi.useFakeTimers()
    let releaseWrite: () => void = () => {}
    try {
      const provider = new MockFileIoProvider({
        bufferOptions: { maxBufferSize: 1, maxDelay: 25 },
        files: {
          'stale.txt': 'old',
        },
        onPut: () =>
          new Promise<void>((resolve) => {
            releaseWrite = resolve
          }),
      })
      const write = firstOutput<FileIoWriteResult>(
        provider.put('stale.txt', 'new'),
      )
      const read = firstOutput<FileIoData>(provider.get('stale.txt'))

      await vi.advanceTimersByTimeAsync(24)
      expect(provider.gets).toEqual([])

      await vi.advanceTimersByTimeAsync(1)
      await expect.poll(() => provider.gets).toEqual(['stale.txt'])

      releaseWrite()
      await write
      await expect(
        read.then((file) => new TextDecoder().decode(file.value)),
      ).resolves.toBe('new')
    } finally {
      releaseWrite()
      vi.useRealTimers()
    }
  })

  it('flushes a partial buffer after maxDelay', async () => {
    const provider = new MockFileIoProvider({
      bufferOptions: { maxBufferSize: 10, maxDelay: 10 },
    })

    await firstOutput(provider.put('slow.txt', 'slow'))

    expect(provider.readStoredText('slow.txt')).toBe('slow')
  })

  it('flushes a final partial buffer without another input event', async () => {
    vi.useFakeTimers()
    try {
      const provider = new MockFileIoProvider({
        bufferOptions: { maxBufferSize: 10, maxDelay: 25 },
      })
      const output = firstOutput(provider.put('final.txt', 'final'))

      await vi.advanceTimersByTimeAsync(24)
      expect(provider.readStoredText('final.txt')).toBeNull()

      await vi.advanceTimersByTimeAsync(1)
      await output

      expect(provider.readStoredText('final.txt')).toBe('final')
    } finally {
      vi.useRealTimers()
    }
  })
})

async function collectOutput<T>(stream: FileIoResponseStream<T>) {
  return new Promise<T[]>((resolve, reject) => {
    const output: T[] = []
    stream.subscribe({
      complete: () => {
        resolve(output)
      },
      error: reject,
      next: (responses) => {
        for (const response of responses) {
          if (!response.ok) {
            reject(response.error)
            return
          }
          output.push(response.output as T)
        }
      },
    })
  })
}
