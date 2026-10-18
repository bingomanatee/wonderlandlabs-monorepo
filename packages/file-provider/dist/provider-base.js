import * as console from 'node:console';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { v4 } from 'uuid';
import { coerceFileIoData } from './data.js';
import { ProviderBuffer } from './provider-buffer.js';
export class ProviderBase {
    #buffer;
    #activeReadGroups = new Map();
    #activeWriteGroups = new Map();
    #activeWritePaths = new Set();
    #pendingReads = new Set();
    #pendingReadRequests = new Map();
    #pendingWrites = new Map();
    #readTimers = new Map();
    #bufferOptions;
    constructor({ bufferOptions = { maxBufferSize: 1 }, } = {}) {
        this.#bufferOptions = bufferOptions;
        this.#buffer = new ProviderBuffer(bufferOptions);
        this.#buffer.batchStream.subscribe((list) => {
            this.process(list);
        });
    }
    complete() {
        for (const timer of this.#readTimers.values()) {
            clearTimeout(timer);
        }
        this.#readTimers.clear();
        this.#buffer.complete();
    }
    input(input) {
        const requests = Array.isArray(input) ? input : [input];
        const keyedRequests = requests.map((request) => ({
            ...request,
            id: request.id ?? v4(),
        }));
        const ids = new Set(keyedRequests.map((request) => request.id));
        const stream = new ReplaySubject(requests.length);
        const subscription = this.#buffer.resultStream
            .pipe(filter((response) => ids.has(response.id)))
            .subscribe((response) => {
            stream.next([response]);
            ids.delete(response.id);
            if (ids.size === 0) {
                stream.complete();
                subscription.unsubscribe();
            }
        });
        for (const request of keyedRequests) {
            this.#buffer.input(request);
        }
        return stream;
    }
    delete(path) {
        return this.input({ op: 'delete', path });
    }
    deleteMany(globString) {
        return this.input({ globString, op: 'deleteMany' });
    }
    get(path) {
        return this.input({ op: 'get', path });
    }
    getMany(...paths) {
        return this.input(flattenPathInputs(paths).map((path) => ({ op: 'get', path })));
    }
    has(path) {
        return this.input({ op: 'has', path });
    }
    hasMany(...paths) {
        return this.input({
            op: 'hasMany',
            paths: flattenPathInputs(paths),
        });
    }
    async hasAll(...paths) {
        const results = await firstOutput(this.hasMany(...paths));
        return Array.from(results.values()).every(Boolean);
    }
    inputStream() {
        let active = true;
        return {
            complete: () => {
                active = false;
            },
            next: (input) => {
                if (!active) {
                    throw new Error('FileIo input stream is complete');
                }
                const batchId = v4();
                const requests = flattenWriteInputs([input]).map((writeInput) => ({
                    ...putRequestFromWriteInput(writeInput),
                    batchId,
                    id: v4(),
                }));
                return this.input(requests);
            },
        };
    }
    map(path, updateFn) {
        return this.input({ op: 'map', path, updateFn });
    }
    maps(globString, updateFn) {
        return this.input({ globString, op: 'maps', updateFn });
    }
    move(fromPath, toPath) {
        return this.input({ fromPath, op: 'move', toPath });
    }
    put(path, data) {
        return this.input({ data, op: 'put', path });
    }
    putMany(...inputs) {
        return this.input(flattenWriteInputs(inputs).map(putRequestFromWriteInput));
    }
    read(path) {
        return firstOutput(this.get(path));
    }
    async readMany(...paths) {
        const files = await allOutputs(this.getMany(...paths));
        return new Map(files.map((file) => [file.storedAt, file]));
    }
    search(globString) {
        return this.input({ globString, op: 'search' });
    }
    write(path, data) {
        return firstOutput(this.put(path, data));
    }
    async writeMany(...inputs) {
        const writes = await allOutputs(this.putMany(...inputs));
        return new Map(writes.map((write) => [write.storedAt, write]));
    }
    process(list) {
        const directRequests = [];
        for (const request of list) {
            if (request.op === 'get') {
                this.queueRead(request);
                continue;
            }
            if (request.op === 'put') {
                this.queueWrite(request);
                continue;
            }
            directRequests.push(request);
        }
        this.drainWrites();
        this.drainReads();
        for (const request of directRequests) {
            switch (request.op) {
                case 'delete':
                    void this.handleDelete(request).catch((error) => this.fail(request, error));
                    break;
                case 'deleteMany':
                    void this.handleDeleteMany(request).catch((error) => this.fail(request, error));
                    break;
                case 'has':
                    void this.handleHas(request).catch((error) => this.fail(request, error));
                    break;
                case 'hasMany':
                    void this.handleHasMany(request).catch((error) => this.fail(request, error));
                    break;
                case 'map':
                    void this.handleMap(request).catch((error) => this.fail(request, error));
                    break;
                case 'maps':
                    void this.handleMaps(request).catch((error) => this.fail(request, error));
                    break;
                case 'move':
                    void this.handleMove(request).catch((error) => this.fail(request, error));
                    break;
                case 'search':
                    void this.handleSearch(request).catch((error) => this.fail(request, error));
                    break;
                default:
                    console.error('unknown request to FileProvider', request);
                    this.fail(request, new Error('unknown request to FileProvider'));
            }
        }
    }
    get responseStream() {
        return this.#buffer.resultStream;
    }
    fail(request, error) {
        if (request.op === 'get') {
            const group = this.#activeReadGroups.get(request.id ?? '');
            if (group) {
                this.#activeReadGroups.delete(request.id ?? '');
                this.clearReadTimer(request.path);
                for (const groupedRequest of group) {
                    this.failOne(groupedRequest, error);
                }
                return;
            }
        }
        if (request.op === 'put') {
            const group = this.#activeWriteGroups.get(request.id ?? '');
            if (group) {
                this.#activeWriteGroups.delete(request.id ?? '');
                this.#activeWritePaths.delete(request.path);
                for (const groupedRequest of group.requests) {
                    this.failOne(groupedRequest, error);
                }
                if (!this.#pendingWrites.has(request.path)) {
                    this.failParkedReads(request.path, error);
                }
                this.drainWrites();
                this.drainReads();
                return;
            }
        }
        this.failOne(request, error);
    }
    failOne(request, error) {
        this.#buffer.resultStream.next({
            error,
            id: request.id ?? v4(),
            input: request,
            ok: false,
        });
    }
    respond(request, response) {
        if (request.op === 'get') {
            const group = this.#activeReadGroups.get(request.id ?? '');
            if (group) {
                this.#activeReadGroups.delete(request.id ?? '');
                this.clearReadTimer(request.path);
                for (const groupedRequest of group) {
                    this.respondOne(groupedRequest, response);
                }
                return;
            }
        }
        if (request.op === 'put') {
            const group = this.#activeWriteGroups.get(request.id ?? '');
            if (group) {
                this.#activeWriteGroups.delete(request.id ?? '');
                this.#activeWritePaths.delete(request.path);
                for (const groupedRequest of group.requests) {
                    this.respondOne(groupedRequest, response);
                }
                this.satisfyParkedReadsFromWrite(group.latest);
                this.drainWrites();
                this.drainReads();
                return;
            }
        }
        this.respondOne(request, response);
    }
    respondOne(request, response) {
        this.#buffer.resultStream.next({
            id: request.id ?? v4(),
            input: request,
            ...response,
        });
    }
    queueRead(request) {
        if (this.#pendingWrites.has(request.path) ||
            this.#activeWritePaths.has(request.path)) {
            this.#pendingReads.add(request.path);
            this.addPendingReadRequest(request);
            this.watchRead(request.path);
            return;
        }
        this.addPendingReadRequest(request);
    }
    queueWrite(request) {
        const group = this.#pendingWrites.get(request.path);
        this.#pendingWrites.set(request.path, {
            latest: request,
            requests: [...(group?.requests ?? []), request],
        });
        if (this.#pendingReadRequests.has(request.path)) {
            this.#pendingReads.add(request.path);
        }
    }
    addPendingReadRequest(request) {
        this.#pendingReadRequests.set(request.path, [
            ...(this.#pendingReadRequests.get(request.path) ?? []),
            request,
        ]);
    }
    drainWrites() {
        for (const [path, group] of [...this.#pendingWrites.entries()]) {
            if (this.#activeWritePaths.has(path)) {
                continue;
            }
            this.#pendingWrites.delete(path);
            this.#activeWritePaths.add(path);
            this.#activeWriteGroups.set(group.latest.id ?? '', group);
            void this.handlePut(group.latest).catch((error) => this.fail(group.latest, error));
        }
    }
    drainReads() {
        for (const [path, requests] of [...this.#pendingReadRequests.entries()]) {
            if (this.#pendingWrites.has(path) ||
                this.#activeWritePaths.has(path) ||
                this.#pendingReads.has(path)) {
                continue;
            }
            const [request] = requests;
            if (!request) {
                continue;
            }
            this.triggerRead(path, request, requests);
        }
    }
    satisfyParkedReadsFromWrite(request) {
        const requests = this.#pendingReadRequests.get(request.path);
        if (!requests || this.#pendingWrites.has(request.path)) {
            return;
        }
        this.clearReadTimer(request.path);
        this.#pendingReadRequests.delete(request.path);
        this.#pendingReads.delete(request.path);
        const output = coerceFileIoData(request.data, request.path);
        for (const readRequest of requests) {
            this.respondOne(readRequest, { ok: true, output });
        }
    }
    triggerRead(path, request, requests) {
        this.clearReadTimer(path);
        this.#pendingReadRequests.delete(path);
        this.#pendingReads.delete(path);
        this.#activeReadGroups.set(request.id ?? '', requests);
        void this.handleGet(request).catch((error) => this.fail(request, error));
    }
    watchRead(path) {
        const delay = this.#bufferOptions.maxDelay;
        if (!delay || this.#readTimers.has(path)) {
            return;
        }
        this.#readTimers.set(path, setTimeout(() => {
            const requests = this.#pendingReadRequests.get(path);
            const [request] = requests ?? [];
            if (request) {
                this.triggerRead(path, request, requests ?? []);
            }
        }, delay));
    }
    clearReadTimer(path) {
        const timer = this.#readTimers.get(path);
        if (!timer) {
            return;
        }
        clearTimeout(timer);
        this.#readTimers.delete(path);
    }
    failParkedReads(path, error) {
        const requests = this.#pendingReadRequests.get(path);
        if (!requests) {
            return;
        }
        this.clearReadTimer(path);
        this.#pendingReadRequests.delete(path);
        this.#pendingReads.delete(path);
        for (const request of requests) {
            this.failOne(request, error);
        }
    }
}
export { ProviderBase as BaseFileIoInstance, ProviderBase as BaseFileIoProvider, };
async function firstOutput(stream) {
    const [response] = await firstValueFrom(stream);
    if (!response.ok) {
        throw response.error;
    }
    return response.output;
}
function allOutputs(stream) {
    return new Promise((resolve, reject) => {
        const outputs = [];
        const subscription = stream.subscribe({
            complete: () => {
                resolve(outputs);
            },
            error: reject,
            next: (responses) => {
                for (const response of responses) {
                    if (!response.ok) {
                        reject(response.error);
                        return;
                    }
                    outputs.push(response.output);
                }
            },
        });
    });
}
function flattenPathInputs(paths) {
    const output = [];
    for (const path of paths) {
        if (typeof path === 'string') {
            output.push(path);
            continue;
        }
        output.push(...flattenPathInputs([...path]));
    }
    return output;
}
function flattenWriteInputs(inputs) {
    const output = [];
    for (const input of inputs) {
        if ('path' in input) {
            output.push(input);
            continue;
        }
        output.push(...flattenWriteInputs([...input]));
    }
    return output;
}
function putRequestFromWriteInput(input) {
    const { path, ...data } = input;
    return { data, op: 'put', path };
}
