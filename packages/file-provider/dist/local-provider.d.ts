import { BaseFileIoInstance } from './provider-base.js';
import type { FileIoDeleteManyRequest, FileIoDeleteRequest, FileIoGetRequest, FileIoHasRequest, FileIoHasManyRequest, FileIoMapRequest, FileIoMapsRequest, FileIoMoveRequest, FileIoPutRequest, FileIoSearchRequest, FileIoWriteResult, LocalFileIoProviderOptions } from './types.js';
export declare class LocalFileIoProvider extends BaseFileIoInstance {
    private readonly options;
    constructor(options: LocalFileIoProviderOptions);
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
    private filesForGlob;
    private fileExists;
    private listPaths;
    private localPath;
}
export declare function writeResult(data: {
    mediaType: string;
    name: string;
    storedAt: string;
    value: Uint8Array;
}): FileIoWriteResult;
//# sourceMappingURL=local-provider.d.ts.map