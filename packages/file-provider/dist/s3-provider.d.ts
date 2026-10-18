import { BaseFileIoInstance } from './provider-base.js';
import type { FileIoDeleteManyRequest, FileIoDeleteRequest, FileIoGetRequest, FileIoHasManyRequest, FileIoHasRequest, FileIoMapRequest, FileIoMapsRequest, FileIoMoveRequest, FileIoPutRequest, FileIoSearchRequest, S3FileIoProviderOptions } from './types.js';
export declare class S3FileIoProvider extends BaseFileIoInstance {
    private readonly options;
    constructor(options: S3FileIoProviderOptions);
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
    private readPath;
    private writePath;
    private filesForGlob;
    private pathsForGlob;
    private request;
    private authorization;
    private url;
}
//# sourceMappingURL=s3-provider.d.ts.map