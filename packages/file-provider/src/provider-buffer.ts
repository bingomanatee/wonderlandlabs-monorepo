import { BehaviorSubject, Subject } from 'rxjs'
import { v4 } from 'uuid'
import type { FileIoRequest, FileIoResponse } from './types.js'

export type BufferOptions = {
  maxBufferSize?: number
  maxDelay?: number
}

export class ProviderBuffer {
  readonly batchStream: Subject<FileIoRequest[]>
  readonly resultStream: Subject<FileIoResponse>

  #commandBuffer: BehaviorSubject<FileIoRequest[]>
  #flushTimer: ReturnType<typeof setTimeout> | null = null
  #options: BufferOptions

  constructor(options: BufferOptions) {
    if (!(options.maxBufferSize || options.maxDelay)) {
      throw new Error('ProviderBuffer requires maxBufferSize or maxDelay')
    }
    this.#options = options
    this.#commandBuffer = new BehaviorSubject<FileIoRequest[]>([])
    this.batchStream = new Subject()
    this.resultStream = new Subject()
  }

  complete() {
    this.clearFlushTimer()
    this.flush()
    ;[this.#commandBuffer, this.batchStream, this.resultStream].forEach(
      (stream) => stream.complete(),
    )
  }

  input(request: FileIoRequest) {
    const id = request.id ?? v4()
    this.#commandBuffer.next([
      ...this.#commandBuffer.value,
      { ...request, at: Date.now(), id },
    ])
    this.watchRequests()

    return id
  }

  private flush() {
    this.clearFlushTimer()
    const items = [...this.#commandBuffer.value]
    if (items.length === 0) {
      return
    }
    this.batchStream.next(items)
    this.#commandBuffer.next([])
  }

  private watchRequests() {
    const buffer = this.#commandBuffer.value
    if (buffer.length === 0) {
      return
    }
    if (
      this.#options.maxBufferSize &&
      buffer.length >= this.#options.maxBufferSize
    ) {
      this.flush()
      return
    }
    if (!this.#options.maxDelay || this.#flushTimer) {
      return
    }

    this.#flushTimer = setTimeout(() => {
      this.flush()
    }, this.#options.maxDelay)
  }

  private clearFlushTimer() {
    if (!this.#flushTimer) {
      return
    }
    clearTimeout(this.#flushTimer)
    this.#flushTimer = null
  }
}
