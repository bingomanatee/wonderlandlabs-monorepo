import { BehaviorSubject, Subject } from 'rxjs';
import { v4 } from 'uuid';
export class ProviderBuffer {
    batchStream;
    resultStream;
    #commandBuffer;
    #flushTimer = null;
    #options;
    constructor(options) {
        if (!(options.maxBufferSize || options.maxDelay)) {
            throw new Error('ProviderBuffer requires maxBufferSize or maxDelay');
        }
        this.#options = options;
        this.#commandBuffer = new BehaviorSubject([]);
        this.batchStream = new Subject();
        this.resultStream = new Subject();
    }
    complete() {
        this.clearFlushTimer();
        this.flush();
        [this.#commandBuffer, this.batchStream, this.resultStream].forEach((stream) => stream.complete());
    }
    input(request) {
        const id = request.id ?? v4();
        this.#commandBuffer.next([
            ...this.#commandBuffer.value,
            { ...request, at: Date.now(), id },
        ]);
        this.watchRequests();
        return id;
    }
    flush() {
        this.clearFlushTimer();
        const items = [...this.#commandBuffer.value];
        if (items.length === 0) {
            return;
        }
        this.batchStream.next(items);
        this.#commandBuffer.next([]);
    }
    watchRequests() {
        const buffer = this.#commandBuffer.value;
        if (buffer.length === 0) {
            return;
        }
        if (this.#options.maxBufferSize &&
            buffer.length >= this.#options.maxBufferSize) {
            this.flush();
            return;
        }
        if (!this.#options.maxDelay || this.#flushTimer) {
            return;
        }
        this.#flushTimer = setTimeout(() => {
            this.flush();
        }, this.#options.maxDelay);
    }
    clearFlushTimer() {
        if (!this.#flushTimer) {
            return;
        }
        clearTimeout(this.#flushTimer);
        this.#flushTimer = null;
    }
}
