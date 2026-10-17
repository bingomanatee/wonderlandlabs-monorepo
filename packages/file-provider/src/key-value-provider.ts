import { createConnection } from 'node:net'
import { Subject } from 'rxjs'
import { coerceFileIoData } from './data.js'
import { globMatch } from './glob.js'
import { writeResult } from './local-provider.js'
import { BaseFileIoInstance } from './provider-base.js'
import type { BufferOptions } from './provider-buffer.js'
import type {
  FileIoDeleteManyRequest,
  FileIoDeleteRequest,
  FileIoGetRequest,
  FileIoHasRequest,
  FileIoHasManyRequest,
  FileIoData,
  FileIoObservationStream,
  FileIoMapRequest,
  FileIoMapsRequest,
  FileIoMoveRequest,
  FileIoPutRequest,
  FileIoSearchRequest,
  KeyValueFileIoProviderOptions,
} from './types.js'

type KeyValueReply = Buffer | KeyValueReply[] | number | string | null

export class KeyValueFileIoProvider extends BaseFileIoInstance {
  readonly providerType: 'redis' | 'valkey'

  private readonly keyPrefix: string
  private readonly url: URL

  constructor(private readonly options: KeyValueFileIoProviderOptions) {
    super()
    this.keyPrefix = options.keyPrefix ?? 'timothy:file-io:v4'
    this.providerType = options.providerType ?? 'redis'
    this.url = new URL(options.url)
  }

  protected async handleDelete(request: FileIoDeleteRequest) {
    try {
      await this.command(['DEL', this.fileKey(request.path)])
      await this.publishPath(request.path)
      this.respond(request, { ok: true })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleDeleteMany(request: FileIoDeleteManyRequest) {
    try {
      const paths = await this.pathsForGlob(request.globString)

      if (paths.length > 0) {
        await this.command(['DEL', ...paths.map((path) => this.fileKey(path))])
        await Promise.all(paths.map((path) => this.publishPath(path)))
      }

      this.respond(request, { ok: true })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleGet(request: FileIoGetRequest) {
    try {
      const reply = await this.command(['GET', this.fileKey(request.path)])

      if (reply === null) {
        throw new Error(`${this.providerType} file not found: ${request.path}`)
      }

      this.respond(request, {
        ok: true,
        output: coerceFileIoData(
          { storedAt: request.path, value: replyBuffer(reply) },
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
        output:
          (await this.command(['EXISTS', this.fileKey(request.path)])) === 1,
      })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleHasMany(request: FileIoHasManyRequest) {
    try {
      const entries = await Promise.all(
        request.paths.map(
          async (path) =>
            [
              path,
              (await this.command(['EXISTS', this.fileKey(path)])) === 1,
            ] as const,
        ),
      )

      this.respond(request, { ok: true, output: new Map(entries) })
    } catch (error: unknown) {
      this.fail(request, error)
    }
  }

  protected async handleMap(request: FileIoMapRequest) {
    try {
      const reply = await this.command(['GET', this.fileKey(request.path)])

      if (reply === null) {
        throw new Error(`${this.providerType} file not found: ${request.path}`)
      }

      const file = coerceFileIoData(
        { storedAt: request.path, value: replyBuffer(reply) },
        request.path,
      )
      const delta = await request.updateFn(file)

      await this.applyDeltaResponse(request, { in: [file], out: delta.out })
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
      await this.command([
        'RENAME',
        this.fileKey(request.fromPath),
        this.fileKey(request.toPath),
      ])
      await Promise.all([
        this.publishPath(request.fromPath),
        this.publishPath(request.toPath),
      ])
      const reply = await this.command(['GET', this.fileKey(request.toPath)])

      if (reply === null) {
        throw new Error(
          `${this.providerType} file not found: ${request.toPath}`,
        )
      }

      this.respond(request, {
        ok: true,
        output: coerceFileIoData(
          { storedAt: request.toPath, value: replyBuffer(reply) },
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

      await this.command(['SET', this.fileKey(request.path), normalized.value])
      await this.publishPath(request.path)
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
    const deleteKeys = (delta.in ?? []).map((file) =>
      this.fileKey(file.storedAt),
    )
    const writeCommands = delta.out.map((file) => [
      'SET',
      this.fileKey(file.storedAt),
      file.value,
    ])

    if (deleteKeys.length > 0) {
      await this.command(['DEL', ...deleteKeys])
    }
    for (const command of writeCommands) {
      await this.command(command)
    }
    await Promise.all([
      ...(delta.in ?? []).map((file) => this.publishPath(file.storedAt)),
      ...delta.out.map((file) => this.publishPath(file.storedAt)),
    ])

    this.respond(request, { ok: true, output: delta.out })
  }

  subscribe(
    path: string,
    options: BufferOptions = { maxDelay: 50 },
  ): FileIoObservationStream {
    const output = new Subject<Observation>()
    const timers = new Map<string, ReturnType<typeof setTimeout>>()
    const watchedPath = safeStoragePath(path)
    const socket = createConnection({
      host: this.url.hostname || '127.0.0.1',
      port: Number(this.url.port || 6379),
    })
    const parser = new RespParser()
    let active = true

    const emit = (changedPath: string) => {
      if (!active || changedPath !== watchedPath) {
        return
      }

      const existing = timers.get(changedPath)
      if (existing) {
        clearTimeout(existing)
      }

      timers.set(
        changedPath,
        setTimeout(() => {
          timers.delete(changedPath)
          void this.readObservation(changedPath, output)
        }, options.maxDelay ?? 0),
      )
    }

    socket.on('connect', () => {
      socket.write(
        Buffer.concat([
          ...this.connectionCommands().map(encodeCommand),
          encodeCommand([
            Buffer.from('SUBSCRIBE'),
            Buffer.from(this.channel()),
          ]),
        ]),
      )
    })
    socket.on('data', (chunk: Buffer) => {
      try {
        for (const reply of parser.push(chunk)) {
          const changedPath = subscriptionPath(reply)
          if (changedPath) {
            emit(changedPath)
          }
        }
      } catch (error: unknown) {
        output.next({ error, ok: false, path: watchedPath })
      }
    })
    socket.on('error', (error) => {
      output.next({ error, ok: false, path: watchedPath })
    })
    socket.on('close', () => {
      active = false
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
      output.complete()
    })

    return Object.assign(output.asObservable(), {
      complete: () => {
        active = false
        for (const timer of timers.values()) {
          clearTimeout(timer)
        }
        socket.end()
        output.complete()
      },
    })
  }

  private async readObservation(path: string, output: Subject<Observation>) {
    try {
      const reply = await this.command(['GET', this.fileKey(path)])

      output.next({
        data:
          reply === null
            ? undefined
            : coerceFileIoData(
                { storedAt: path, value: replyBuffer(reply) },
                path,
              ),
        ok: true,
        path,
      })
    } catch (error: unknown) {
      output.next({ error, ok: false, path })
    }
  }

  private async filesForGlob(globString: string) {
    const paths = await this.pathsForGlob(globString)

    return Promise.all(
      paths.map(async (path) => {
        const reply = await this.command(['GET', this.fileKey(path)])

        if (reply === null) {
          throw new Error(`${this.providerType} file not found: ${path}`)
        }

        return coerceFileIoData(
          { storedAt: path, value: replyBuffer(reply) },
          path,
        )
      }),
    )
  }

  private async pathsForGlob(globString: string) {
    const reply = await this.command(['KEYS', `${this.keyPrefix}:*`])

    if (!Array.isArray(reply)) {
      return []
    }

    return reply
      .map((key) => this.storagePath(String(replyBuffer(key))))
      .filter((path) => globMatch(globString, path))
      .sort()
  }

  private fileKey(storagePath: string) {
    return `${this.keyPrefix}:${safeStoragePath(storagePath)}`
  }

  private channel() {
    return `${this.keyPrefix}:changes`
  }

  private async publishPath(path: string) {
    await this.command(['PUBLISH', this.channel(), safeStoragePath(path)])
  }

  private storagePath(key: string) {
    return key.startsWith(`${this.keyPrefix}:`)
      ? key.slice(this.keyPrefix.length + 1)
      : key
  }

  private async command(parts: Array<Buffer | string | Uint8Array>) {
    const replies = await this.runCommands([
      ...this.connectionCommands(),
      parts.map((part) => Buffer.from(part)),
    ])

    return replies.at(-1) ?? null
  }

  private connectionCommands() {
    const commands: Buffer[][] = []

    if (this.url.password) {
      commands.push(
        this.url.username
          ? [
              Buffer.from('AUTH'),
              Buffer.from(decodeURIComponent(this.url.username)),
              Buffer.from(this.url.password),
            ]
          : [Buffer.from('AUTH'), Buffer.from(this.url.password)],
      )
    }

    const db = this.url.pathname.replace(/^\//, '')
    if (db) {
      commands.push([Buffer.from('SELECT'), Buffer.from(db)])
    }

    return commands
  }

  private runCommands(commands: Buffer[][]) {
    return new Promise<KeyValueReply[]>((resolve, reject) => {
      const socket = createConnection({
        host: this.url.hostname || '127.0.0.1',
        port: Number(this.url.port || 6379),
      })
      const parser = new RespParser()
      const replies: KeyValueReply[] = []
      let settled = false

      socket.on('connect', () => {
        socket.write(Buffer.concat(commands.map(encodeCommand)))
      })
      socket.on('data', (chunk: Buffer) => {
        try {
          replies.push(...parser.push(chunk))
          if (replies.length === commands.length) {
            settled = true
            socket.end()
            resolve(replies)
          }
        } catch (error) {
          settled = true
          socket.destroy()
          reject(error)
        }
      })
      socket.on('error', (error) => {
        settled = true
        reject(error)
      })
      socket.on('close', () => {
        if (!settled && replies.length < commands.length) {
          reject(
            new Error(`${this.providerType} connection closed before reply`),
          )
        }
      })
    })
  }
}

type Observation = {
  data?: FileIoData
  error?: unknown
  ok: boolean
  path: string
}

class RespParser {
  private buffer = Buffer.alloc(0)
  private offset = 0

  push(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer.subarray(this.offset), chunk])
    this.offset = 0

    const replies: KeyValueReply[] = []
    while (this.offset < this.buffer.length) {
      const start = this.offset
      const reply = this.parseReply()

      if (reply === undefined) {
        this.offset = start
        break
      }

      replies.push(reply)
    }

    return replies
  }

  private parseReply(): KeyValueReply | undefined {
    const type = this.buffer[this.offset]

    if (type === undefined) {
      return undefined
    }

    this.offset += 1

    if (type === 42) {
      return this.readArray()
    }
    if (type === 43) {
      return this.readLine()
    }
    if (type === 45) {
      const message = this.readLine()

      if (message === undefined) {
        return undefined
      }

      throw new Error(`Key value provider error: ${message}`)
    }
    if (type === 58) {
      const value = this.readLine()

      return value === undefined ? undefined : Number(value)
    }
    if (type === 36) {
      return this.readBulkString()
    }

    throw new Error(
      `Unsupported key value reply type: ${String.fromCharCode(type)}`,
    )
  }

  private readArray(): KeyValueReply[] | null | undefined {
    const lengthValue = this.readLine()

    if (lengthValue === undefined) {
      return undefined
    }

    const length = Number(lengthValue)
    if (length < 0) {
      return null
    }

    const items: KeyValueReply[] = []
    for (let index = 0; index < length; index += 1) {
      const item = this.parseReply()

      if (item === undefined) {
        return undefined
      }

      items.push(item)
    }

    return items
  }

  private readBulkString(): Buffer | null | undefined {
    const lengthValue = this.readLine()

    if (lengthValue === undefined) {
      return undefined
    }

    const length = Number(lengthValue)
    if (length < 0) {
      return null
    }

    const end = this.offset + length
    if (this.buffer.length < end + 2) {
      return undefined
    }

    const reply = this.buffer.subarray(this.offset, end)
    this.offset = end + 2

    return reply
  }

  private readLine() {
    const end = this.buffer.indexOf('\r\n', this.offset)

    if (end < 0) {
      return undefined
    }

    const line = this.buffer.toString('utf8', this.offset, end)
    this.offset = end + 2

    return line
  }
}

function encodeCommand(parts: Buffer[]) {
  return Buffer.concat([
    Buffer.from(`*${parts.length}\r\n`),
    ...parts.flatMap((part) => [
      Buffer.from(`$${part.length}\r\n`),
      part,
      Buffer.from('\r\n'),
    ]),
  ])
}

function replyBuffer(reply: KeyValueReply) {
  if (Buffer.isBuffer(reply)) {
    return reply
  }

  if (reply instanceof Uint8Array) {
    return Buffer.from(reply)
  }

  return Buffer.from(String(reply))
}

function subscriptionPath(reply: KeyValueReply) {
  if (!Array.isArray(reply) || reply.length < 3) {
    return null
  }

  const kind = String(replyBuffer(reply[0]))
  if (kind !== 'message') {
    return null
  }

  return String(replyBuffer(reply[2]))
}

function safeStoragePath(path: string) {
  const normalized = path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')

  if (!normalized) {
    throw new Error('Key path is required')
  }

  return normalized
}
