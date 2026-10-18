import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createValkeyTestEnvironment } from './test/valkey-server.js'
import { firstValueFrom } from 'rxjs'
import { KeyValueFileIoProvider } from './key-value-provider.js'
import { firstOutput } from './test-helpers.js'
import { MEDIA_KEYS, mediaMap } from './media-type.js'
import type {
  FileIoData,
  FileIoResponseStream,
  FileIoWriteResult,
} from './types.js'

const testEnvironment = createValkeyTestEnvironment(process.env.VALKEY_TEST_URL)

describe('KeyValueFileIoProvider', () => {
  beforeAll(() => testEnvironment.start())
  beforeEach(() => testEnvironment.reset())
  afterAll(() => testEnvironment.stop())

  it('round trips binary data through Valkey commands', async () => {
    const provider = keyProvider()

    const result = await firstOutput<FileIoWriteResult>(
      provider.put('story/chapter.md', { value: '# Chapter\n' }),
    )
    const data = await firstOutput<FileIoData>(provider.get('story/chapter.md'))

    expect(new TextDecoder().decode(data.value)).toBe('# Chapter\n')
    expect(data.mediaType).toBe(mediaMap.get(MEDIA_KEYS.markdown)!.mediaType)
    expect(data.name).toBe('chapter.md')
    expect(result.byteSize).toBe(10)
    expect(result.storedAt).toBe('story/chapter.md')
  })

  it('searches, moves, and deletes keys with glob strings', async () => {
    const provider = keyProvider()

    await firstOutput(provider.put('a/one.md', 'one'))
    await firstOutput(provider.put('a/two.txt', 'two'))
    await firstOutput(provider.put('b/three.md', 'three'))

    expect(
      (await firstOutput<FileIoData[]>(provider.search('**/*.md'))).map(
        (file) => file.storedAt,
      ),
    ).toEqual(['a/one.md', 'b/three.md'])

    await firstOutput(provider.move('a/one.md', 'a/moved.md'))
    await firstOutput(provider.deleteMany('**/*.txt'))

    expect(await firstOutput(provider.has('a/one.md'))).toBe(false)
    expect(await firstOutput(provider.has('a/moved.md'))).toBe(true)
    expect(await firstOutput(provider.has('a/two.txt'))).toBe(false)
  })

  it('maps one key into many keys and maps many into one key', async () => {
    const provider = keyProvider()

    await firstOutput(provider.put('source.md', 'alpha beta'))
    const split = await firstOutput<FileIoData[]>(
      provider.map('source.md', async (file) => ({
        in: [file],
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

    expect(split.map((file) => file.storedAt)).toEqual([
      'parts/1.md',
      'parts/2.md',
    ])
    expect(await firstOutput(provider.has('source.md'))).toBe(false)

    const merged = await firstOutput<FileIoData[]>(
      provider.maps('parts/*.md', async (files) => ({
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
    const book = await firstOutput<FileIoData>(provider.get('book.md'))

    expect(merged.map((file) => file.storedAt)).toEqual(['book.md'])
    expect(new TextDecoder().decode(book.value)).toBe('alpha\nbeta')
  })

  it('subscribes to path changes and emits debounced state', async () => {
    const provider = keyProvider()
    const stream = provider.subscribe('watched.md', { maxDelay: 10 })
    const next = firstValueFrom(stream)

    await firstOutput(provider.put('watched.md', 'one'))
    await firstOutput(provider.put('other.md', 'ignored'))

    const observed = await next
    stream.complete()

    expect(observed.ok).toBe(true)
    expect(observed.path).toBe('watched.md')
    expect(
      observed.data ? new TextDecoder().decode(observed.data.value) : null,
    ).toBe('one')
  })

  it('runs an e2e Valkey batch flow', async () => {
    const provider = keyProvider()
    const input = provider.inputStream()
    const streamed = await collectOutput<FileIoWriteResult>(
      input.next([
        { path: 'e2e/one.md', value: 'one' },
        { path: 'e2e/two.md', value: 'two' },
      ]),
    )

    await provider.writeMany({ path: 'e2e/three.md', value: 'three' }, [
      { path: 'e2e/four.md', value: 'four' },
    ])

    const files = await provider.readMany('e2e/one.md', [
      'e2e/two.md',
      ['e2e/three.md', 'e2e/four.md'],
    ])

    expect(streamed.map((write) => write.storedAt).sort()).toEqual([
      'e2e/one.md',
      'e2e/two.md',
    ])
    expect(await provider.hasAll('e2e/one.md', ['e2e/four.md'])).toBe(true)
    expect(
      ['one.md', 'two.md', 'three.md', 'four.md'].map((name) =>
        decodeFile(files.get(`e2e/${name}`)),
      ),
    ).toEqual(['one', 'two', 'three', 'four'])

    input.complete()
  })
})

function keyProvider() {
  return new KeyValueFileIoProvider({
    keyPrefix: `timothy:test:${crypto.randomUUID()}`,
    providerType: 'valkey',
    url: testEnvironment.url,
  })
}

function decodeFile(file: FileIoData | undefined) {
  if (!file) {
    return null
  }

  return new TextDecoder().decode(file.value)
}

function collectOutput<TOutput>(
  stream: FileIoResponseStream<TOutput>,
): Promise<TOutput[]> {
  return new Promise((resolve, reject) => {
    const output: TOutput[] = []

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
          output.push(response.output as TOutput)
        }
      },
    })
  })
}
