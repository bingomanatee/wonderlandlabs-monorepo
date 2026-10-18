import { coerceFileIoData } from './data.js';
import { writeResult } from './local-provider.js';
import { BaseFileIoInstance } from './provider-base.js';
export class RestFileIoProvider extends BaseFileIoInstance {
    options;
    constructor(options) {
        super();
        this.options = options;
    }
    async handleGet(request) {
        try {
            const data = await this.readPath(request.path);
            this.respond(request, { ok: true, output: data });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleHas(request) {
        try {
            this.respond(request, {
                ok: true,
                output: await this.hasPath(request.path),
            });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleHasMany(request) {
        try {
            const entries = await Promise.all(request.paths.map(async (path) => [path, await this.hasPath(path)]));
            this.respond(request, { ok: true, output: new Map(entries) });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleDelete(request) {
        this.fail(request, unsupportedOperation('delete'));
    }
    async handleDeleteMany(request) {
        this.fail(request, unsupportedOperation('deleteMany'));
    }
    async handleMap(request) {
        this.fail(request, unsupportedOperation('map'));
    }
    async handleMaps(request) {
        this.fail(request, unsupportedOperation('maps'));
    }
    async handleMove(request) {
        this.fail(request, unsupportedOperation('move'));
    }
    async handlePut(request) {
        try {
            const normalized = coerceFileIoData(request.data, request.path);
            if (isFetchPrefix(this.options.urlPrefix)) {
                await this.writeRemotePath(request.path, normalized);
            }
            else {
                await this.writeLocalPath(request.path, normalized.value);
            }
            this.respond(request, { ok: true, output: writeResult(normalized) });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleSearch(request) {
        this.fail(request, unsupportedOperation('search'));
    }
    async readPath(path) {
        if (isFetchPrefix(this.options.urlPrefix)) {
            const response = await this.fetchUrl(path);
            if (!response.ok) {
                throw new Error(`REST file not found: ${path}`);
            }
            return coerceFileIoData({
                mediaType: response.headers.get('content-type'),
                storedAt: path,
                value: await response.arrayBuffer(),
            }, path);
        }
        const value = await this.readLocalPath(path);
        return coerceFileIoData({ storedAt: path, value }, path);
    }
    async hasPath(path) {
        if (isFetchPrefix(this.options.urlPrefix)) {
            const response = await this.fetchUrl(path, { method: 'HEAD' });
            if (response.ok) {
                return true;
            }
            if (response.status !== 405 && response.status !== 501) {
                return false;
            }
            return (await this.fetchUrl(path)).ok;
        }
        try {
            const { access } = await import('node:fs/promises');
            await access(await this.localPath(path));
            return true;
        }
        catch {
            return false;
        }
    }
    async fetchUrl(path, init) {
        const fetchFn = this.options.fetch;
        if (!fetchFn) {
            throw new Error('Fetch is not available in this runtime');
        }
        const headers = await this.headersForPath(path, init?.headers);
        return fetchFn(this.urlForPath(path), { ...init, headers });
    }
    async writeRemotePath(path, data) {
        const options = await this.requestOptionsForPath(path);
        const method = options.method ?? this.options.defaultWriteMethod ?? 'PUT';
        const headers = headersFrom(options.headers);
        if (!headers.has('content-type')) {
            headers.set('content-type', data.mediaType);
        }
        const response = await this.fetchUrl(path, {
            body: data.value,
            headers,
            method,
        });
        if (!response.ok) {
            throw new Error(`REST file write failed for ${path}: ` +
                `${response.status} ${await response.text()}`);
        }
    }
    async readLocalPath(path) {
        try {
            const { readFile } = await import('node:fs/promises');
            return readFile(await this.localPath(path));
        }
        catch (error) {
            if (isMissingNodeFileApi(error)) {
                throw new Error('Node file APIs are not available in this runtime');
            }
            throw error;
        }
    }
    async writeLocalPath(path, value) {
        try {
            const { mkdir, writeFile } = await import('node:fs/promises');
            const { dirname } = await import('node:path');
            const localPath = await this.localPath(path);
            await mkdir(dirname(localPath), { recursive: true });
            await writeFile(localPath, value);
        }
        catch (error) {
            if (isMissingNodeFileApi(error)) {
                throw new Error('Node file APIs are not available in this runtime');
            }
            throw error;
        }
    }
    async headersForPath(path, input) {
        const options = await this.requestOptionsForPath(path);
        const headers = headersFrom(options.headers);
        for (const [key, value] of headersFrom(input)) {
            headers.set(key, value);
        }
        return headers;
    }
    async requestOptionsForPath(path) {
        const headers = this.options.headers;
        if (!headers) {
            return {};
        }
        if (typeof headers === 'function') {
            return headers(path);
        }
        return { headers };
    }
    async localPath(path) {
        if (this.options.urlPrefix.startsWith('file:')) {
            const { fileURLToPath } = await import('node:url');
            return fileURLToPath(this.urlForPath(path));
        }
        const { resolve } = await import('node:path');
        return resolve(this.options.urlPrefix, safeStoragePath(path));
    }
    urlForPath(path) {
        const prefix = this.options.urlPrefix.endsWith('/')
            ? this.options.urlPrefix
            : `${this.options.urlPrefix}/`;
        return new URL(encodeStoragePath(safeStoragePath(path)), prefix);
    }
}
function isFetchPrefix(urlPrefix) {
    return urlPrefix.startsWith('http://') || urlPrefix.startsWith('https://');
}
function encodeStoragePath(path) {
    return path
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/');
}
function safeStoragePath(path) {
    const normalized = path
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .split('/')
        .filter((part) => part && part !== '.' && part !== '..')
        .join('/');
    if (!normalized) {
        throw new Error('File path is required');
    }
    return normalized;
}
function unsupportedOperation(op) {
    return new Error(`RestFileIoProvider does not support ${op}`);
}
function headersFrom(input) {
    const headers = new Headers();
    if (!input) {
        return headers;
    }
    if (Array.isArray(input)) {
        for (const [key, value] of input) {
            headers.append(key, value);
        }
        return headers;
    }
    if ('forEach' in input && typeof input.forEach === 'function') {
        input.forEach((value, key) => {
            headers.append(key, value);
        });
        return headers;
    }
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined) {
            headers.append(key, value);
        }
    }
    return headers;
}
function isMissingNodeFileApi(error) {
    return error instanceof Error && error.message.includes('node:fs/promises');
}
