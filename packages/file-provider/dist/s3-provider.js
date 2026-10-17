import { createHash, createHmac } from 'node:crypto';
import { coerceFileIoData } from './data.js';
import { globMatch } from './glob.js';
import { writeResult } from './local-provider.js';
import { BaseFileIoInstance } from './provider-base.js';
export class S3FileIoProvider extends BaseFileIoInstance {
    options;
    constructor(options) {
        super();
        this.options = options;
    }
    async handleDelete(request) {
        try {
            await this.request(request.path, { method: 'DELETE' });
            this.respond(request, { ok: true });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleDeleteMany(request) {
        try {
            const paths = await this.pathsForGlob(request.globString);
            await Promise.all(paths.map((path) => this.request(path, { method: 'DELETE' })));
            this.respond(request, { ok: true });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleGet(request) {
        try {
            this.respond(request, {
                ok: true,
                output: await this.readPath(request.path),
            });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleHas(request) {
        try {
            const response = await this.request(request.path, {
                allowNotFound: true,
                method: 'HEAD',
            });
            this.respond(request, { ok: true, output: response.status !== 404 });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleHasMany(request) {
        try {
            const entries = await Promise.all(request.paths.map(async (path) => {
                const response = await this.request(path, {
                    allowNotFound: true,
                    method: 'HEAD',
                });
                return [path, response.status !== 404];
            }));
            this.respond(request, { ok: true, output: new Map(entries) });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleMap(request) {
        try {
            const file = await this.readPath(request.path);
            const delta = await request.updateFn(file);
            await this.applyDeltaResponse(request, {
                in: delta.in ?? [file],
                out: delta.out,
            });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleMaps(request) {
        try {
            const files = await this.filesForGlob(request.globString);
            const delta = await request.updateFn(files);
            await this.applyDeltaResponse(request, delta);
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleMove(request) {
        try {
            const data = await this.readPath(request.fromPath);
            const moved = coerceFileIoData({
                mediaType: data.mediaType,
                storedAt: request.toPath,
                value: data.value,
            }, request.toPath);
            await this.writePath(request.toPath, moved);
            await this.request(request.fromPath, { method: 'DELETE' });
            this.respond(request, { ok: true, output: moved });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handlePut(request) {
        try {
            const normalized = coerceFileIoData(request.data, request.path);
            await this.writePath(request.path, normalized);
            this.respond(request, { ok: true, output: writeResult(normalized) });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleSearch(request) {
        try {
            this.respond(request, {
                ok: true,
                output: await this.filesForGlob(request.globString),
            });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async applyDeltaResponse(request, delta) {
        await Promise.all([
            ...(delta.in ?? []).map((file) => this.request(file.storedAt, { method: 'DELETE' })),
            ...delta.out.map((file) => this.writePath(file.storedAt, file)),
        ]);
        this.respond(request, { ok: true, output: delta.out });
    }
    async readPath(path) {
        const response = await this.request(path, { method: 'GET' });
        return coerceFileIoData({
            mediaType: response.headers.get('content-type'),
            storedAt: path,
            value: await response.arrayBuffer(),
        }, path);
    }
    async writePath(path, data) {
        await this.request(path, {
            body: data.value,
            bodyBytes: data.value,
            headers: { 'content-type': data.mediaType },
            method: 'PUT',
        });
    }
    async filesForGlob(globString) {
        const paths = await this.pathsForGlob(globString);
        return Promise.all(paths.map((path) => this.readPath(path)));
    }
    async pathsForGlob(globString) {
        const prefix = prefixForGlob(globString);
        const paths = [];
        let continuationToken;
        do {
            const query = new URLSearchParams({ 'list-type': '2' });
            if (prefix) {
                query.set('prefix', prefix);
            }
            if (continuationToken) {
                query.set('continuation-token', continuationToken);
            }
            const response = await this.request('', { method: 'GET', query });
            const list = parseListObjects(await response.text());
            paths.push(...list.keys);
            continuationToken = list.nextContinuationToken;
        } while (continuationToken);
        return paths.filter((path) => globMatch(globString, path)).sort();
    }
    async request(storagePath, init) {
        const { allowNotFound, bodyBytes, query, ...requestInit } = init;
        const path = storagePath ? safeStoragePath(storagePath) : '';
        const bodyHash = sha256Hex(bodyBytes ?? new Uint8Array());
        const date = new Date();
        const amzDate = awsDate(date);
        const url = this.url(path);
        const canonicalQuery = canonicalQueryString(query);
        if (canonicalQuery) {
            url.search = canonicalQuery;
        }
        const headers = new Headers(init.headers);
        headers.set('host', url.host);
        headers.set('x-amz-content-sha256', bodyHash);
        headers.set('x-amz-date', amzDate);
        if (this.options.sessionToken) {
            headers.set('x-amz-security-token', this.options.sessionToken);
        }
        headers.set('authorization', this.authorization({
            amzDate,
            bodyHash,
            canonicalQuery,
            date,
            headers,
            method: init.method ?? 'GET',
            pathname: url.pathname,
        }));
        const fetchFn = this.options.fetch;
        if (!fetchFn) {
            throw new Error('Fetch is not available in this runtime');
        }
        const response = await fetchFn(url, { ...requestInit, headers });
        if (allowNotFound && response.status === 404) {
            return response;
        }
        if (!response.ok) {
            throw new Error(`S3 object request failed for ${storagePath}: ` +
                `${response.status} ${await response.text()}`);
        }
        return response;
    }
    authorization(input) {
        const scope = `${awsShortDate(input.date)}/${this.options.region}` +
            '/s3/aws4_request';
        const signedHeaders = [...input.headers.keys()]
            .map((key) => key.toLowerCase())
            .sort()
            .join(';');
        const canonicalHeaders = signedHeaders
            .split(';')
            .map((key) => `${key}:${input.headers.get(key)?.trim() ?? ''}\n`)
            .join('');
        const canonicalRequest = [
            input.method,
            input.pathname,
            input.canonicalQuery,
            canonicalHeaders,
            signedHeaders,
            input.bodyHash,
        ].join('\n');
        const stringToSign = [
            'AWS4-HMAC-SHA256',
            input.amzDate,
            scope,
            sha256Hex(canonicalRequest),
        ].join('\n');
        const signature = hmacHex(signingKey({
            date: awsShortDate(input.date),
            region: this.options.region,
            secretAccessKey: this.options.secretAccessKey,
        }), stringToSign);
        return (`AWS4-HMAC-SHA256 Credential=${this.options.accessKeyId}/${scope}, ` +
            `SignedHeaders=${signedHeaders}, Signature=${signature}`);
    }
    url(path) {
        const encodedPath = path ? `/${encodeStoragePath(path)}` : '';
        if (this.options.endpoint) {
            const endpoint = this.options.endpoint.replace(/\/$/, '');
            return new URL(this.options.forcePathStyle
                ? `${endpoint}/${this.options.bucket}${encodedPath}`
                : `${endpoint}${encodedPath}`);
        }
        return new URL(`https://${this.options.bucket}.s3.${this.options.region}` +
            `.amazonaws.com${encodedPath}`);
    }
}
function awsDate(date) {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}
function awsShortDate(date) {
    return awsDate(date).slice(0, 8);
}
function canonicalQueryString(query) {
    return [...(query?.entries() ?? [])]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${awsEncodeURIComponent(key)}=${awsEncodeURIComponent(value)}`)
        .join('&');
}
function encodeStoragePath(storagePath) {
    return storagePath
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
function prefixForGlob(globString) {
    const wildcardIndex = globString.search(/[*?[\]{}]/);
    const staticPath = wildcardIndex === -1 ? globString : globString.slice(0, wildcardIndex);
    const slashIndex = staticPath.lastIndexOf('/');
    if (wildcardIndex === -1) {
        return staticPath;
    }
    return slashIndex === -1 ? '' : staticPath.slice(0, slashIndex + 1);
}
function parseListObjects(xml) {
    return {
        keys: tagValues(xml, 'Key').map(decodeXml),
        nextContinuationToken: tagValues(xml, 'NextContinuationToken')
            .map(decodeXml)
            .at(0),
    };
}
function tagValues(xml, tag) {
    const pattern = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
    return [...xml.matchAll(pattern)].map((match) => match[1] ?? '');
}
function decodeXml(value) {
    return value
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
}
function sha256Hex(value) {
    return createHash('sha256').update(value).digest('hex');
}
function hmac(key, value) {
    return createHmac('sha256', key).update(value).digest();
}
function hmacHex(key, value) {
    return createHmac('sha256', key).update(value).digest('hex');
}
function signingKey(input) {
    const dateKey = hmac(`AWS4${input.secretAccessKey}`, input.date);
    const regionKey = hmac(dateKey, input.region);
    const serviceKey = hmac(regionKey, 's3');
    return hmac(serviceKey, 'aws4_request');
}
function awsEncodeURIComponent(value) {
    return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
