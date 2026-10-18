import { BaseFileIoInstance } from './provider-base.js'
import { coerceFileIoData } from './data.js'
import { globMatch } from './glob.js'
import { writeResult } from './local-provider.js'
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
  MockFileIoProviderGlobCall,
  MockFileIoProviderOptions,
  MockFileIoProviderPutCall,
} from './types.js'

export class MockFileIoProvider extends BaseFileIoInstance {
  readonly deletes: string[] = []
  readonly deleteManyCalls: MockFileIoProviderGlobCall[] = []
  readonly gets: string[] = []
  readonly hasChecks: string[] = []
  readonly hasManyChecks: string[][] = []
  readonly moves: { fromPath: string; toPath: string }[] = []
  readonly puts: MockFileIoProviderPutCall[] = []
  readonly searches: MockFileIoProviderGlobCall[] = []
  readonly files = new Map<string, FileIoDataInput>()

  constructor(private readonly options: MockFileIoProviderOptions = {}) {
    super({ bufferOptions: options.bufferOptions ?? { maxBufferSize: 1 } })

    for (const [path, data] of Object.entries(options.files ?? {})) {
      this.files.set(path, this.normalizeInput(path, data))
    }
  }

  protected async handleDelete(request: FileIoDeleteRequest) {
    try {
      this.deletes.push(request.path)

      if (this.options.onDelete) {
        await this.options.onDelete(request.path)
        this.respond(request, { ok: true })
        return
      }

      this.files.delete(request.path)
      this.respond(request, { ok: true })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleDeleteMany(request: FileIoDeleteManyRequest) {
    try {
      this.deleteManyCalls.push({ globString: request.globString })

      if (this.options.onDeleteMany) {
        await this.options.onDeleteMany(request.globString)
        this.respond(request, { ok: true })
        return
      }

      for (const path of Array.from(this.files.keys()).filter((path) =>
        globMatch(request.globString, path),
      )) {
        this.files.delete(path)
      }
      this.respond(request, { ok: true })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleGet(request: FileIoGetRequest) {
    try {
      this.gets.push(request.path)
      const callbackData = await this.options.onGet?.(request.path)
      this.respondGet(request, callbackData)
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHas(request: FileIoHasRequest) {
    try {
      this.hasChecks.push(request.path)
      this.respond(request, { ok: true, output: this.files.has(request.path) })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHasMany(request: FileIoHasManyRequest) {
    try {
      this.hasManyChecks.push(request.paths)
      this.respond(request, {
        ok: true,
        output: new Map(
          request.paths.map((path) => [path, this.files.has(path)] as const),
        ),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMap(request: FileIoMapRequest) {
    try {
      const data = this.files.get(request.path)
      if (!data) {
        this.fail(request, new Error(`Mock file not found: ${request.path}`))
        return
      }

      const file = coerceFileIoData(data, request.path)
      const delta = await request.updateFn(file)
      this.applyDeltaResponse(request, { in: [file], out: delta.out })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMaps(request: FileIoMapsRequest) {
    try {
      const inputs = this.matchFiles(request.globString)
      const delta = await request.updateFn(inputs)
      this.applyDeltaResponse(request, delta)
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMove(request: FileIoMoveRequest) {
    try {
      this.moves.push({ fromPath: request.fromPath, toPath: request.toPath })
      const callbackData = await this.options.onMove?.(
        request.fromPath,
        request.toPath,
      )
      this.respondMove(request, callbackData)
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handlePut(request: FileIoPutRequest) {
    try {
      const normalized = coerceFileIoData(request.data, request.path)
      const input = {
        mediaType: normalized.mediaType,
        name: normalized.name,
        storedAt: normalized.storedAt,
        value: normalized.value,
      }
      this.puts.push({ data: input, path: request.path })
      this.files.set(request.path, input)

      const result = await this.options.onPut?.(request.path, input)
      this.respond(request, {
        ok: true,
        output: result ?? writeResult(normalized),
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleSearch(request: FileIoSearchRequest) {
    try {
      this.searches.push({ globString: request.globString })
      const callbackData = await this.options.onSearch?.(request.globString)
      this.respondSearch(request, callbackData)
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  readStored(path: string) {
    const file = this.files.get(path)

    return file ? coerceFileIoData(file, path) : null
  }

  readStoredText(path: string) {
    const file = this.readStored(path)

    return file ? new TextDecoder().decode(file.value) : null
  }

  private applyDeltaResponse(
    request: FileIoMapRequest | FileIoMapsRequest,
    delta: Awaited<ReturnType<typeof request.updateFn>>,
  ) {
    for (const file of delta.in ?? []) {
      this.files.delete(file.storedAt)
    }
    for (const file of delta.out) {
      this.files.set(file.storedAt, {
        mediaType: file.mediaType,
        name: file.name,
        storedAt: file.storedAt,
        value: file.value,
      })
    }
    this.respond(request, { ok: true, output: delta.out })
  }

  private matchFiles(globString: string) {
    return Array.from(this.files.entries())
      .filter(([path]) => globMatch(globString, path))
      .map(([path, data]) => coerceFileIoData(data, path))
  }

  private respondGet(request: FileIoGetRequest, data?: FileIoDataInput | null) {
    const file = data ?? this.files.get(request.path)
    if (!file) {
      this.fail(request, new Error(`Mock file not found: ${request.path}`))
      return
    }

    this.respond(request, {
      ok: true,
      output: coerceFileIoData(file, request.path),
    })
  }

  private respondMove(
    request: FileIoMoveRequest,
    callbackData?: FileIoDataInput | null,
  ) {
    if (callbackData) {
      this.files.set(
        request.toPath,
        this.normalizeInput(request.toPath, callbackData),
      )
      this.respond(request, {
        ok: true,
        output: coerceFileIoData(callbackData, request.toPath),
      })
      return
    }

    const data = this.files.get(request.fromPath)
    if (!data) {
      this.fail(request, new Error(`Mock file not found: ${request.fromPath}`))
      return
    }

    this.files.delete(request.fromPath)
    this.files.set(request.toPath, this.normalizeInput(request.toPath, data))
    this.respond(request, {
      ok: true,
      output: coerceFileIoData(data, request.toPath),
    })
  }

  private respondSearch(
    request: FileIoSearchRequest,
    data?: FileIoDataInput[] | null,
  ) {
    this.respond(request, {
      ok: true,
      output: data
        ? data.map((file) =>
            coerceFileIoData(file, file.storedAt ?? request.globString),
          )
        : this.matchFiles(request.globString),
    })
  }

  private normalizeInput(
    path: string,
    data: FileIoBinary | FileIoDataInput,
  ): FileIoDataInput {
    const normalized = coerceFileIoData(data, path)

    return {
      mediaType: normalized.mediaType,
      name: normalized.name,
      storedAt: normalized.storedAt,
      value: normalized.value,
    }
  }
}
