import { BaseFileIoInstance } from './provider-base.js';
import { coerceFileIoData } from './data.js';
import { globMatch } from './glob.js';
import { writeResult } from './local-provider.js';
export class MockFileIoProvider extends BaseFileIoInstance {
    options;
    deletes = [];
    deleteManyCalls = [];
    gets = [];
    hasChecks = [];
    hasManyChecks = [];
    moves = [];
    puts = [];
    searches = [];
    files = new Map();
    constructor(options = {}) {
        super({ bufferOptions: options.bufferOptions ?? { maxBufferSize: 1 } });
        this.options = options;
        for (const [path, data] of Object.entries(options.files ?? {})) {
            this.files.set(path, this.normalizeInput(path, data));
        }
    }
    async handleDelete(request) {
        try {
            this.deletes.push(request.path);
            if (this.options.onDelete) {
                await this.options.onDelete(request.path);
                this.respond(request, { ok: true });
                return;
            }
            this.files.delete(request.path);
            this.respond(request, { ok: true });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleDeleteMany(request) {
        try {
            this.deleteManyCalls.push({ globString: request.globString });
            if (this.options.onDeleteMany) {
                await this.options.onDeleteMany(request.globString);
                this.respond(request, { ok: true });
                return;
            }
            for (const path of Array.from(this.files.keys()).filter((path) => globMatch(request.globString, path))) {
                this.files.delete(path);
            }
            this.respond(request, { ok: true });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleGet(request) {
        try {
            this.gets.push(request.path);
            const callbackData = await this.options.onGet?.(request.path);
            this.respondGet(request, callbackData);
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleHas(request) {
        try {
            this.hasChecks.push(request.path);
            this.respond(request, { ok: true, output: this.files.has(request.path) });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleHasMany(request) {
        try {
            this.hasManyChecks.push(request.paths);
            this.respond(request, {
                ok: true,
                output: new Map(request.paths.map((path) => [path, this.files.has(path)])),
            });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleMap(request) {
        try {
            const data = this.files.get(request.path);
            if (!data) {
                this.fail(request, new Error(`Mock file not found: ${request.path}`));
                return;
            }
            const file = coerceFileIoData(data, request.path);
            const delta = await request.updateFn(file);
            this.applyDeltaResponse(request, { in: [file], out: delta.out });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleMaps(request) {
        try {
            const inputs = this.matchFiles(request.globString);
            const delta = await request.updateFn(inputs);
            this.applyDeltaResponse(request, delta);
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleMove(request) {
        try {
            this.moves.push({ fromPath: request.fromPath, toPath: request.toPath });
            const callbackData = await this.options.onMove?.(request.fromPath, request.toPath);
            this.respondMove(request, callbackData);
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handlePut(request) {
        try {
            const normalized = coerceFileIoData(request.data, request.path);
            const input = {
                mediaType: normalized.mediaType,
                name: normalized.name,
                storedAt: normalized.storedAt,
                value: normalized.value,
            };
            this.puts.push({ data: input, path: request.path });
            this.files.set(request.path, input);
            const result = await this.options.onPut?.(request.path, input);
            this.respond(request, {
                ok: true,
                output: result ?? writeResult(normalized),
            });
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    async handleSearch(request) {
        try {
            this.searches.push({ globString: request.globString });
            const callbackData = await this.options.onSearch?.(request.globString);
            this.respondSearch(request, callbackData);
        }
        catch (error) {
            this.fail(request, error);
        }
    }
    readStored(path) {
        const file = this.files.get(path);
        return file ? coerceFileIoData(file, path) : null;
    }
    readStoredText(path) {
        const file = this.readStored(path);
        return file ? new TextDecoder().decode(file.value) : null;
    }
    applyDeltaResponse(request, delta) {
        for (const file of delta.in ?? []) {
            this.files.delete(file.storedAt);
        }
        for (const file of delta.out) {
            this.files.set(file.storedAt, {
                mediaType: file.mediaType,
                name: file.name,
                storedAt: file.storedAt,
                value: file.value,
            });
        }
        this.respond(request, { ok: true, output: delta.out });
    }
    matchFiles(globString) {
        return Array.from(this.files.entries())
            .filter(([path]) => globMatch(globString, path))
            .map(([path, data]) => coerceFileIoData(data, path));
    }
    respondGet(request, data) {
        const file = data ?? this.files.get(request.path);
        if (!file) {
            this.fail(request, new Error(`Mock file not found: ${request.path}`));
            return;
        }
        this.respond(request, {
            ok: true,
            output: coerceFileIoData(file, request.path),
        });
    }
    respondMove(request, callbackData) {
        if (callbackData) {
            this.files.set(request.toPath, this.normalizeInput(request.toPath, callbackData));
            this.respond(request, {
                ok: true,
                output: coerceFileIoData(callbackData, request.toPath),
            });
            return;
        }
        const data = this.files.get(request.fromPath);
        if (!data) {
            this.fail(request, new Error(`Mock file not found: ${request.fromPath}`));
            return;
        }
        this.files.delete(request.fromPath);
        this.files.set(request.toPath, this.normalizeInput(request.toPath, data));
        this.respond(request, {
            ok: true,
            output: coerceFileIoData(data, request.toPath),
        });
    }
    respondSearch(request, data) {
        this.respond(request, {
            ok: true,
            output: data
                ? data.map((file) => coerceFileIoData(file, file.storedAt ?? request.globString))
                : this.matchFiles(request.globString),
        });
    }
    normalizeInput(path, data) {
        const normalized = coerceFileIoData(data, path);
        return {
            mediaType: normalized.mediaType,
            name: normalized.name,
            storedAt: normalized.storedAt,
            value: normalized.value,
        };
    }
}
