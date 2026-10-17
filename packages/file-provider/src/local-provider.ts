import { createHash } from 'node:crypto'
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  rename,
  writeFile,
} from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { coerceFileIoData } from './data.js'
import { globMatch } from './glob.js'
import { BaseFileIoInstance } from './provider-base.js'
import type {
  FileIoBinary,
  FileIoDataInput,
  FileIoDeleteManyRequest,
  FileIoDeleteRequest,
  FileIoGetRequest,
  FileIoHasRequest,
  FileIoHasManyRequest,
  FileIoMapRequest,
  FileIoMapsRequest,
  FileIoMoveRequest,
  FileIoPutRequest,
  FileIoSearchRequest,
  FileIoWriteResult,
  LocalFileIoProviderOptions,
} from './types.js'

export class LocalFileIoProvider extends BaseFileIoInstance {
  constructor(private readonly options: LocalFileIoProviderOptions) {
    super()
  }

  protected async handleDelete(request: FileIoDeleteRequest) {
    try {
      await rm(this.localPath(request.path), { force: true })
      this.respond(request, { ok: true })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleDeleteMany(request: FileIoDeleteManyRequest) {
    try {
      const paths = await this.listPaths()
      await Promise.all(
        paths
          .filter((path) => globMatch(request.globString, path))
          .map((path) => rm(this.localPath(path), { force: true })),
      )
      this.respond(request, { ok: true })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleGet(request: FileIoGetRequest) {
    try {
      const value = await readFile(this.localPath(request.path))
      this.respond(request, {
        ok: true,
        output: coerceFileIoData(
          { storedAt: request.path, value },
          request.path,
        ),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHas(request: FileIoHasRequest) {
    try {
      this.respond(request, {
        ok: true,
        output: await this.fileExists(request.path),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHasMany(request: FileIoHasManyRequest) {
    try {
      const entries = await Promise.all(
        request.paths.map(
          async (path) => [path, await this.fileExists(path)] as const,
        ),
      )
      this.respond(request, { ok: true, output: new Map(entries) })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMap(request: FileIoMapRequest) {
    try {
      const value = await readFile(this.localPath(request.path))
      const delta = await request.updateFn(
        coerceFileIoData({ storedAt: request.path, value }, request.path),
      )
      await this.applyDeltaResponse(request, delta)
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMaps(request: FileIoMapsRequest) {
    try {
      const files = await this.filesForGlob(request.globString)
      const delta = await request.updateFn(files)
      await this.applyDeltaResponse(request, delta)
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMove(request: FileIoMoveRequest) {
    try {
      const from = this.localPath(request.fromPath)
      const to = this.localPath(request.toPath)

      await mkdir(dirname(to), { recursive: true })
      await rename(from, to)
      const value = await readFile(to)
      this.respond(request, {
        ok: true,
        output: coerceFileIoData(
          { storedAt: request.toPath, value },
          request.toPath,
        ),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handlePut(request: FileIoPutRequest) {
    try {
      const normalized = coerceFileIoData(request.data, request.path)
      const localPath = this.localPath(request.path)

      await mkdir(dirname(localPath), { recursive: true })
      await writeFile(localPath, normalized.value)
      this.respond(request, { ok: true, output: writeResult(normalized) })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleSearch(request: FileIoSearchRequest) {
    try {
      this.respond(request, {
        ok: true,
        output: await this.filesForGlob(request.globString),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  private async applyDeltaResponse(
    request: FileIoMapRequest | FileIoMapsRequest,
    delta: Awaited<ReturnType<typeof request.updateFn>>,
  ) {
    await Promise.all([
      ...(delta.in ?? []).map((file) =>
        rm(this.localPath(file.storedAt), { force: true }),
      ),
      ...delta.out.map((file) => {
        const localPath = this.localPath(file.storedAt)
        return mkdir(dirname(localPath), { recursive: true }).then(() =>
          writeFile(localPath, file.value),
        )
      }),
    ])
    this.respond(request, { ok: true, output: delta.out })
  }

  private async filesForGlob(globString: string) {
    const paths = await this.listPaths()

    return Promise.all(
      paths
        .filter((path) => globMatch(globString, path))
        .map(async (path) =>
          coerceFileIoData(
            { storedAt: path, value: await readFile(this.localPath(path)) },
            path,
          ),
        ),
    )
  }

  private async fileExists(path: string) {
    try {
      await access(this.localPath(path))
      return true
    } catch {
      return false
    }
  }

  private async listPaths(dir = this.options.root): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
    const paths = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          return this.listPaths(fullPath)
        }
        if (!entry.isFile()) {
          return []
        }

        return [relative(this.options.root, fullPath).replace(/\\/g, '/')]
      }),
    )

    return paths.flat()
  }

  private localPath(path: string) {
    return resolve(this.options.root, safeStoragePath(path))
  }
}

export function writeResult(data: {
  mediaType: string
  name: string
  storedAt: string
  value: Uint8Array
}): FileIoWriteResult {
  return {
    byteSize: data.value.byteLength,
    contentHash: createHash('sha256').update(data.value).digest('hex'),
    mediaType: data.mediaType,
    name: data.name,
    storedAt: data.storedAt,
    writtenAt: new Date().toISOString(),
  }
}

function safeStoragePath(path: string) {
  const normalized = path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')

  if (!normalized) {
    throw new Error('File path is required')
  }

  return normalized
}
