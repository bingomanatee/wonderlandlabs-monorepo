import { BaseFileIoInstance } from './provider-base.js';
import type { BufferOptions } from './provider-buffer.js';
import type { FileIoDeleteManyRequest, FileIoDeleteRequest, FileIoGetRequest, FileIoHasRequest, FileIoHasManyRequest, FileIoObservationStream, FileIoMapRequest, FileIoMapsRequest, FileIoMoveRequest, FileIoPutRequest, FileIoSearchRequest, KeyValueFileIoProviderOptions } from './types.js';
export declare class KeyValueFileIoProvider extends BaseFileIoInstance {
    private readonly options;
    readonly providerType: 'redis' | 'valkey';
    private readonly keyPrefix;
    private readonly url;
    constructor(options: KeyValueFileIoProviderOptions);
    protected handleDelete(request: FileIoDeleteRequest): Promise<void>;
    protected handleDeleteMany(request: FileIoDeleteManyRequest): Promise<void>;
    protected handleGet(request: FileIoGetRequest): Promise<void>;
    protected handleHas(request: FileIoHasRequest): Promise<void>;
    protected handleHasMany(request: FileIoHasManyRequest): Promise<void>;
    protected handleMap(request: FileIoMapRequest): Promise<void>;
    protected handleMaps(request: FileIoMapsRequest): Promise<void>;
    protected handleMove(request: FileIoMoveRequest): Promise<void>;
    protected handlePut(request: FileIoPutRequest): Promise<void>;
    protected handleSearch(request: FileIoSearchRequest): Promise<void>;
    private applyDeltaResponse;
    subscribe(path: string, options?: BufferOptions): FileIoObservationStream;
    private readObservation;
    private filesForGlob;
    private pathsForGlob;
    private fileKey;
    private channel;
    private publishPath;
    private storagePath;
    private command;
    private connectionCommands;
    private runCommands;
}
//# sourceMappingURL=key-value-provider.d.ts.map