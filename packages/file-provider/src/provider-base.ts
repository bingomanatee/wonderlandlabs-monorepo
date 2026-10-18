import * as console from 'node:console'
import { firstValueFrom, ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { v4 } from 'uuid'
import { coerceFileIoData } from './data.js'
import { type BufferOptions, ProviderBuffer } from './provider-buffer.js'
import type {
  FileIoDeleteManyRequest,
  FileIoDeleteRequest,
  FileIoData,
  FileIoGetRequest,
  FileIoHasRequest,
  FileIoHasManyRequest,
  FileIoInputStream,
  FileIoMapRequest,
  FileIoMapsRequest,
  FileIoMoveRequest,
  FileIoPathInput,
  FileIoPutRequest,
  FileIoRequest,
  FileIoRequestOutput,
  FileIoResponse,
  FileIoResponseStream,
  FileIoSearchRequest,
  FileIoWriteInput,
  FileIoWriteInputList,
  FileIoWriteResult,
} from './types.js'

export abstract class ProviderBase {
  readonly #buffer: ProviderBuffer
  readonly #activeReadGroups = new Map<string, FileIoGetRequest[]>()
  readonly #activeWriteGroups = new Map<
    string,
    { latest: FileIoPutRequest; requests: FileIoPutRequest[] }
  >()
  readonly #activeWritePaths = new Set<string>()
  readonly #pendingReads = new Set<string>()
  readonly #pendingReadRequests = new Map<string, FileIoGetRequest[]>()
  readonly #pendingWrites = new Map<
    string,
    { latest: FileIoPutRequest; requests: FileIoPutRequest[] }
  >()
  readonly #readTimers = new Map<string, ReturnType<typeof setTimeout>>()
  readonly #bufferOptions: BufferOptions

  constructor({
    bufferOptions = { maxBufferSize: 1 },
  }: { bufferOptions?: BufferOptions } = {}) {
    this.#bufferOptions = bufferOptions
    this.#buffer = new ProviderBuffer(bufferOptions)
    this.#buffer.batchStream.subscribe((list) => {
      this.process(list)
    })
  }

  complete() {
    for (const timer of this.#readTimers.values()) {
      clearTimeout(timer)
    }
    this.#readTimers.clear()
    this.#buffer.complete()
  }

  input<TOutput = FileIoRequestOutput>(
    input: FileIoRequest | FileIoRequest[],
  ): FileIoResponseStream<TOutput> {
    const requests = Array.isArray(input) ? input : [input]
    const keyedRequests = requests.map((request) => ({
      ...request,
      id: request.id ?? v4(),
    }))
    const ids = new Set(keyedRequests.map((request) => request.id))
    const stream = new ReplaySubject<FileIoResponse<TOutput>[]>(requests.length)
    const subscription = this.#buffer.resultStream
      .pipe(filter((response) => ids.has(response.id)))
      .subscribe((response) => {
        stream.next([response as FileIoResponse<TOutput>])
        ids.delete(response.id)
        if (ids.size === 0) {
          stream.complete()
          subscription.unsubscribe()
        }
      })

    for (const request of keyedRequests) {
      this.#buffer.input(request)
    }

    return stream
  }

  delete(path: string): FileIoResponseStream<void> {
    return this.input<void>({ op: 'delete', path })
  }

  deleteMany(globString: string): FileIoResponseStream<void> {
    return this.input<void>({ globString, op: 'deleteMany' })
  }

  get(path: string): FileIoResponseStream<FileIoData> {
    return this.input<FileIoData>({ op: 'get', path })
  }

  getMany(...paths: FileIoPathInput[]): FileIoResponseStream<FileIoData> {
    return this.input<FileIoData>(
      flattenPathInputs(paths).map((path) => ({ op: 'get', path })),
    )
  }

  has(path: string): FileIoResponseStream<boolean> {
    return this.input<boolean>({ op: 'has', path })
  }

  hasMany(...paths: FileIoPathInput[]): FileIoResponseStream<
    Map<string, boolean>
  > {
    return this.input<Map<string, boolean>>({
      op: 'hasMany',
      paths: flattenPathInputs(paths),
    })
  }

  async hasAll(...paths: FileIoPathInput[]): Promise<boolean> {
    const results = await firstOutput(this.hasMany(...paths))

    return Array.from(results.values()).every(Boolean)
  }

  inputStream(): FileIoInputStream {
    let active = true

    return {
      complete: () => {
        active = false
      },
      next: (input) => {
        if (!active) {
          throw new Error('FileIo input stream is complete')
        }
        const batchId = v4()
        const requests = flattenWriteInputs([input]).map((writeInput) => ({
          ...putRequestFromWriteInput(writeInput),
          batchId,
          id: v4(),
        }))

        return this.input<FileIoWriteResult>(requests)
      },
    }
  }

  map(
    path: string,
    updateFn: FileIoMapRequest['updateFn'],
  ): FileIoResponseStream<FileIoData[]> {
    return this.input<FileIoData[]>({ op: 'map', path, updateFn })
  }

  maps(
    globString: string,
    updateFn: FileIoMapsRequest['updateFn'],
  ): FileIoResponseStream<FileIoData[]> {
    return this.input<FileIoData[]>({ globString, op: 'maps', updateFn })
  }

  move(fromPath: string, toPath: string): FileIoResponseStream<FileIoData> {
    return this.input<FileIoData>({ fromPath, op: 'move', toPath })
  }

  put(
    path: string,
    data: FileIoPutRequest['data'],
  ): FileIoResponseStream<FileIoWriteResult> {
    return this.input<FileIoWriteResult>({ data, op: 'put', path })
  }

  putMany(
    ...inputs: FileIoWriteInputList[]
  ): FileIoResponseStream<FileIoWriteResult> {
    return this.input<FileIoWriteResult>(
      flattenWriteInputs(inputs).map(putRequestFromWriteInput),
    )
  }

  read(path: string): Promise<FileIoData> {
    return firstOutput(this.get(path))
  }

  async readMany(
    ...paths: FileIoPathInput[]
  ): Promise<Map<string, FileIoData>> {
    const files = await allOutputs(this.getMany(...paths))

    return new Map(files.map((file) => [file.storedAt, file]))
  }

  search(globString: string): FileIoResponseStream<FileIoData[]> {
    return this.input<FileIoData[]>({ globString, op: 'search' })
  }

  write(
    path: string,
    data: FileIoPutRequest['data'],
  ): Promise<FileIoWriteResult> {
    return firstOutput(this.put(path, data))
  }

  async writeMany(
    ...inputs: FileIoWriteInputList[]
  ): Promise<Map<string, FileIoWriteResult>> {
    const writes = await allOutputs(this.putMany(...inputs))

    return new Map(writes.map((write) => [write.storedAt, write]))
  }

  protected process(list: FileIoRequest[]) {
    const directRequests: FileIoRequest[] = []
    for (const request of list) {
      if (request.op === 'get') {
        this.queueRead(request)
        continue
      }
      if (request.op === 'put') {
        this.queueWrite(request)
        continue
      }
      directRequests.push(request)
    }
    this.drainWrites()
    this.drainReads()

    for (const request of directRequests) {
      switch (request.op) {
        case 'delete':
          void this.handleDelete(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'deleteMany':
          void this.handleDeleteMany(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'has':
          void this.handleHas(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'hasMany':
          void this.handleHasMany(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'map':
          void this.handleMap(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'maps':
          void this.handleMaps(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'move':
          void this.handleMove(request).catch((error) =>
            this.fail(request, error),
          )
          break
        case 'search':
          void this.handleSearch(request).catch((error) =>
            this.fail(request, error),
          )
          break
        default:
          console.error('unknown request to FileProvider', request)
          this.fail(request, new Error('unknown request to FileProvider'))
      }
    }
  }

  get responseStream() {
    return this.#buffer.resultStream
  }

  protected abstract handleDelete(request: FileIoDeleteRequest): Promise<void>
  protected abstract handleDeleteMany(
    request: FileIoDeleteManyRequest,
  ): Promise<void>
  protected abstract handleGet(request: FileIoGetRequest): Promise<void>
  protected abstract handleSearch(request: FileIoSearchRequest): Promise<void>
  protected abstract handleHas(request: FileIoHasRequest): Promise<void>
  protected abstract handleHasMany(request: FileIoHasManyRequest): Promise<void>
  protected abstract handleMove(request: FileIoMoveRequest): Promise<void>
  protected abstract handleMap(request: FileIoMapRequest): Promise<void>
  protected abstract handleMaps(request: FileIoMapsRequest): Promise<void>
  protected abstract handlePut(request: FileIoPutRequest): Promise<void>

  protected fail(request: FileIoRequest, error: unknown) {
    if (request.op === 'get') {
      const group = this.#activeReadGroups.get(request.id ?? '')
      if (group) {
        this.#activeReadGroups.delete(request.id ?? '')
        this.clearReadTimer(request.path)
        for (const groupedRequest of group) {
          this.failOne(groupedRequest, error)
        }
        return
      }
    }
    if (request.op === 'put') {
      const group = this.#activeWriteGroups.get(request.id ?? '')
      if (group) {
        this.#activeWriteGroups.delete(request.id ?? '')
        this.#activeWritePaths.delete(request.path)
        for (const groupedRequest of group.requests) {
          this.failOne(groupedRequest, error)
        }
        if (!this.#pendingWrites.has(request.path)) {
          this.failParkedReads(request.path, error)
        }
        this.drainWrites()
        this.drainReads()
        return
      }
    }
    this.failOne(request, error)
  }

  private failOne(request: FileIoRequest, error: unknown) {
    this.#buffer.resultStream.next({
      error,
      id: request.id ?? v4(),
      input: request,
      ok: false,
    })
  }

  protected respond(
    request: FileIoRequest,
    response: Omit<FileIoResponse, 'id' | 'input'>,
  ) {
    if (request.op === 'get') {
      const group = this.#activeReadGroups.get(request.id ?? '')
      if (group) {
        this.#activeReadGroups.delete(request.id ?? '')
        this.clearReadTimer(request.path)
        for (const groupedRequest of group) {
          this.respondOne(groupedRequest, response)
        }
        return
      }
    }
    if (request.op === 'put') {
      const group = this.#activeWriteGroups.get(request.id ?? '')
      if (group) {
        this.#activeWriteGroups.delete(request.id ?? '')
        this.#activeWritePaths.delete(request.path)
        for (const groupedRequest of group.requests) {
          this.respondOne(groupedRequest, response)
        }
        this.satisfyParkedReadsFromWrite(group.latest)
        this.drainWrites()
        this.drainReads()
        return
      }
    }
    this.respondOne(request, response)
  }

  private respondOne(
    request: FileIoRequest,
    response: Omit<FileIoResponse, 'id' | 'input'>,
  ) {
    this.#buffer.resultStream.next({
      id: request.id ?? v4(),
      input: request,
      ...response,
    })
  }

  private queueRead(request: FileIoGetRequest) {
    if (
      this.#pendingWrites.has(request.path) ||
      this.#activeWritePaths.has(request.path)
    ) {
      this.#pendingReads.add(request.path)
      this.addPendingReadRequest(request)
      this.watchRead(request.path)
      return
    }
    this.addPendingReadRequest(request)
  }

  private queueWrite(request: FileIoPutRequest) {
    const group = this.#pendingWrites.get(request.path)
    this.#pendingWrites.set(request.path, {
      latest: request,
      requests: [...(group?.requests ?? []), request],
    })
    if (this.#pendingReadRequests.has(request.path)) {
      this.#pendingReads.add(request.path)
    }
  }

  private addPendingReadRequest(request: FileIoGetRequest) {
    this.#pendingReadRequests.set(request.path, [
      ...(this.#pendingReadRequests.get(request.path) ?? []),
      request,
    ])
  }

  private drainWrites() {
    for (const [path, group] of [...this.#pendingWrites.entries()]) {
      if (this.#activeWritePaths.has(path)) {
        continue
      }
      this.#pendingWrites.delete(path)
      this.#activeWritePaths.add(path)
      this.#activeWriteGroups.set(group.latest.id ?? '', group)
      void this.handlePut(group.latest).catch((error) =>
        this.fail(group.latest, error),
      )
    }
  }

  private drainReads() {
    for (const [path, requests] of [...this.#pendingReadRequests.entries()]) {
      if (
        this.#pendingWrites.has(path) ||
        this.#activeWritePaths.has(path) ||
        this.#pendingReads.has(path)
      ) {
        continue
      }
      const [request] = requests
      if (!request) {
        continue
      }
      this.triggerRead(path, request, requests)
    }
  }

  private satisfyParkedReadsFromWrite(request: FileIoPutRequest) {
    const requests = this.#pendingReadRequests.get(request.path)
    if (!requests || this.#pendingWrites.has(request.path)) {
      return
    }
    this.clearReadTimer(request.path)
    this.#pendingReadRequests.delete(request.path)
    this.#pendingReads.delete(request.path)
    const output = coerceFileIoData(request.data, request.path)
    for (const readRequest of requests) {
      this.respondOne(readRequest, { ok: true, output })
    }
  }

  private triggerRead(
    path: string,
    request: FileIoGetRequest,
    requests: FileIoGetRequest[],
  ) {
    this.clearReadTimer(path)
    this.#pendingReadRequests.delete(path)
    this.#pendingReads.delete(path)
    this.#activeReadGroups.set(request.id ?? '', requests)
    void this.handleGet(request).catch((error) => this.fail(request, error))
  }

  private watchRead(path: string) {
    const delay = this.#bufferOptions.maxDelay
    if (!delay || this.#readTimers.has(path)) {
      return
    }
    this.#readTimers.set(
      path,
      setTimeout(() => {
        const requests = this.#pendingReadRequests.get(path)
        const [request] = requests ?? []
        if (request) {
          this.triggerRead(path, request, requests ?? [])
        }
      }, delay),
    )
  }

  private clearReadTimer(path: string) {
    const timer = this.#readTimers.get(path)
    if (!timer) {
      return
    }
    clearTimeout(timer)
    this.#readTimers.delete(path)
  }

  private failParkedReads(path: string, error: unknown) {
    const requests = this.#pendingReadRequests.get(path)
    if (!requests) {
      return
    }
    this.clearReadTimer(path)
    this.#pendingReadRequests.delete(path)
    this.#pendingReads.delete(path)
    for (const request of requests) {
      this.failOne(request, error)
    }
  }
}

export {
  ProviderBase as BaseFileIoInstance,
  ProviderBase as BaseFileIoProvider,
}

async function firstOutput<TOutput>(
  stream: FileIoResponseStream<TOutput>,
): Promise<TOutput> {
  const [response] = await firstValueFrom(stream)

  if (!response.ok) {
    throw response.error
  }

  return response.output as TOutput
}

function allOutputs<TOutput>(
  stream: FileIoResponseStream<TOutput>,
): Promise<TOutput[]> {
  return new Promise((resolve, reject) => {
    const outputs: TOutput[] = []
    const subscription = stream.subscribe({
      complete: () => {
        resolve(outputs)
      },
      error: reject,
      next: (responses) => {
        for (const response of responses) {
          if (!response.ok) {
            reject(response.error)
            return
          }
          outputs.push(response.output as TOutput)
        }
      },
    })
  })
}

function flattenPathInputs(paths: FileIoPathInput[]): string[] {
  const output: string[] = []

  for (const path of paths) {
    if (typeof path === 'string') {
      output.push(path)
      continue
    }

    output.push(...flattenPathInputs([...path]))
  }

  return output
}

function flattenWriteInputs(
  inputs: FileIoWriteInputList[],
): FileIoWriteInput[] {
  const output: FileIoWriteInput[] = []

  for (const input of inputs) {
    if ('path' in input) {
      output.push(input)
      continue
    }

    output.push(...flattenWriteInputs([...input]))
  }

  return output
}

function putRequestFromWriteInput(input: FileIoWriteInput): FileIoPutRequest {
  const { path, ...data } = input

  return { data, op: 'put', path }
}
