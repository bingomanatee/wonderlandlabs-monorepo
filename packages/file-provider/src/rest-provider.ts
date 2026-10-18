import { coerceFileIoData } from './data.js'
import { writeResult } from './local-provider.js'
import { BaseFileIoInstance } from './provider-base.js'
import type {
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
  RestFileIoHeadersInit,
  RestFileIoRequestOptions,
  RestFileIoProviderOptions,
} from './types.js'

export class RestFileIoProvider extends BaseFileIoInstance {
  constructor(private readonly options: RestFileIoProviderOptions) {
    super()
  }

  protected async handleGet(request: FileIoGetRequest) {
    try {
      const data = await this.readPath(request.path)
      this.respond(request, { ok: true, output: data })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHas(request: FileIoHasRequest) {
    try {
      this.respond(request, {
        ok: true,
        output: await this.hasPath(request.path),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHasMany(request: FileIoHasManyRequest) {
    try {
      const entries = await Promise.all(
        request.paths.map(
          async (path) => [path, await this.hasPath(path)] as const,
        ),
      )
      this.respond(request, { ok: true, output: new Map(entries) })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleDelete(request: FileIoDeleteRequest) {
    this.fail(request, unsupportedOperation('delete'))
  }

  protected async handleDeleteMany(request: FileIoDeleteManyRequest) {
    this.fail(request, unsupportedOperation('deleteMany'))
  }

  protected async handleMap(request: FileIoMapRequest) {
    this.fail(request, unsupportedOperation('map'))
  }

  protected async handleMaps(request: FileIoMapsRequest) {
    this.fail(request, unsupportedOperation('maps'))
  }

  protected async handleMove(request: FileIoMoveRequest) {
    this.fail(request, unsupportedOperation('move'))
  }

  protected async handlePut(request: FileIoPutRequest) {
    try {
      const normalized = coerceFileIoData(request.data, request.path)

      if (isFetchPrefix(this.options.urlPrefix)) {
        await this.writeRemotePath(request.path, normalized)
      } else {
        await this.writeLocalPath(request.path, normalized.value)
      }

      this.respond(request, { ok: true, output: writeResult(normalized) })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleSearch(request: FileIoSearchRequest) {
    this.fail(request, unsupportedOperation('search'))
  }

  private async readPath(path: string) {
    if (isFetchPrefix(this.options.urlPrefix)) {
      const response = await this.fetchUrl(path)
      if (!response.ok) {
        throw new Error(`REST file not found: ${path}`)
      }

      return coerceFileIoData(
        {
          mediaType: response.headers.get('content-type'),
          storedAt: path,
          value: await response.arrayBuffer(),
        },
        path,
      )
    }

    const value = await this.readLocalPath(path)

    return coerceFileIoData({ storedAt: path, value }, path)
  }

  private async hasPath(path: string) {
    if (isFetchPrefix(this.options.urlPrefix)) {
      const response = await this.fetchUrl(path, { method: 'HEAD' })
      if (response.ok) {
        return true
      }
      if (response.status !== 405 && response.status !== 501) {
        return false
      }

      return (await this.fetchUrl(path)).ok
    }

    try {
      const { access } = await import('node:fs/promises')
      await access(await this.localPath(path))
      return true
    } catch {
      return false
    }
  }

  private async fetchUrl(path: string, init?: RequestInit) {
    const fetchFn = this.options.fetch
    if (!fetchFn) {
      throw new Error('Fetch is not available in this runtime')
    }

    const headers = await this.headersForPath(path, init?.headers)

    return fetchFn(this.urlForPath(path), { ...init, headers })
  }

  private async writeRemotePath(
    path: string,
    data: { mediaType: string; value: Uint8Array },
  ) {
    const options = await this.requestOptionsForPath(path)
    const method = options.method ?? this.options.defaultWriteMethod ?? 'PUT'

    const headers = headersFrom(options.headers)
    if (!headers.has('content-type')) {
      headers.set('content-type', data.mediaType)
    }

    const response = await this.fetchUrl(path, {
      body: data.value as BodyInit,
      headers,
      method,
    })

    if (!response.ok) {
      throw new Error(
        `REST file write failed for ${path}: ` +
          `${response.status} ${await response.text()}`,
      )
    }
  }

  private async readLocalPath(path: string) {
    try {
      const { readFile } = await import('node:fs/promises')
      return readFile(await this.localPath(path))
    } catch (error: unknown) {
      if (isMissingNodeFileApi(error)) {
        throw new Error('Node file APIs are not available in this runtime')
      }
      throw error
    }
  }

  private async writeLocalPath(path: string, value: Uint8Array) {
    try {
      const { mkdir, writeFile } = await import('node:fs/promises')
      const { dirname } = await import('node:path')
      const localPath = await this.localPath(path)

      await mkdir(dirname(localPath), { recursive: true })
      await writeFile(localPath, value)
    } catch (error: unknown) {
      if (isMissingNodeFileApi(error)) {
        throw new Error('Node file APIs are not available in this runtime')
      }
      throw error
    }
  }

  private async headersForPath(path: string, input?: RestFileIoHeadersInit) {
    const options = await this.requestOptionsForPath(path)
    const headers = headersFrom(options.headers)

    for (const [key, value] of headersFrom(input)) {
      headers.set(key, value)
    }

    return headers
  }

  private async requestOptionsForPath(
    path: string,
  ): Promise<RestFileIoRequestOptions> {
    const headers = this.options.headers
    if (!headers) {
      return {}
    }
    if (typeof headers === 'function') {
      return headers(path)
    }

    return { headers }
  }

  private async localPath(path: string) {
    if (this.options.urlPrefix.startsWith('file:')) {
      const { fileURLToPath } = await import('node:url')
      return fileURLToPath(this.urlForPath(path))
    }

    const { resolve } = await import('node:path')
    return resolve(this.options.urlPrefix, safeStoragePath(path))
  }

  private urlForPath(path: string) {
    const prefix = this.options.urlPrefix.endsWith('/')
      ? this.options.urlPrefix
      : `${this.options.urlPrefix}/`

    return new URL(encodeStoragePath(safeStoragePath(path)), prefix)
  }
}

function isFetchPrefix(urlPrefix: string) {
  return urlPrefix.startsWith('http://') || urlPrefix.startsWith('https://')
}

function encodeStoragePath(path: string) {
  return path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
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

function unsupportedOperation(op: string) {
  return new Error(`RestFileIoProvider does not support ${op}`)
}

function headersFrom(input?: RestFileIoHeadersInit) {
  const headers = new Headers()

  if (!input) {
    return headers
  }

  if (Array.isArray(input)) {
    for (const [key, value] of input) {
      headers.append(key, value)
    }
    return headers
  }

  if ('forEach' in input && typeof input.forEach === 'function') {
    input.forEach((value: string, key: string) => {
      headers.append(key, value)
    })
    return headers
  }

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      headers.append(key, value)
    }
  }

  return headers
}

function isMissingNodeFileApi(error: unknown) {
  return error instanceof Error && error.message.includes('node:fs/promises')
}
