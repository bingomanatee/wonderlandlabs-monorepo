import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { firstOutput } from './test-helpers.js'
import { LocalFileIoProvider } from './local-provider.js'
import { MEDIA_KEYS, mediaMap } from './media-type.js'
import type { FileIoData, FileIoWriteResult } from './types.js'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(
    roots.map((root) => rm(root, { force: true, recursive: true })),
  )
  roots.length = 0
})

describe('LocalFileIoProvider', () => {
  it('round trips binary data through response streams', async () => {
    const provider = await localProvider()

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

  it('round trips binary data through promise helpers', async () => {
    const provider = await localProvider()

    const result = await provider.write('story/chapter.md', '# Chapter\n')
    const data = await provider.read('story/chapter.md')

    expect(new TextDecoder().decode(data.value)).toBe('# Chapter\n')
    expect(data.mediaType).toBe(mediaMap.get(MEDIA_KEYS.markdown)!.mediaType)
    expect(result.byteSize).toBe(10)
  })

  it('searches, moves, and deletes with glob strings', async () => {
    const provider = await localProvider()

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

  it('maps one file into many files and maps many into one file', async () => {
    const provider = await localProvider()

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

    expect(merged.map((file) => file.storedAt)).toEqual(['book.md'])
    expect(
      await readFile(join(providerRoot(provider), 'book.md'), 'utf8'),
    ).toBe('alpha\nbeta')
  })
})

async function localProvider() {
  const root = await mkdtemp(join(tmpdir(), 'file-provider-'))
  roots.push(root)

  return Object.assign(new LocalFileIoProvider({ root }), { __root: root })
}

function providerRoot(provider: LocalFileIoProvider & { __root: string }) {
  return provider.__root
}
