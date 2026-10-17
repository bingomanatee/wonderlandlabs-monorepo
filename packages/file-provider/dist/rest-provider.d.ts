import { BaseFileIoInstance } from './provider-base.js';
import type { FileIoDeleteManyRequest, FileIoDeleteRequest, FileIoGetRequest, FileIoHasRequest, FileIoHasManyRequest, FileIoMapRequest, FileIoMapsRequest, FileIoMoveRequest, FileIoPutRequest, FileIoSearchRequest, RestFileIoProviderOptions } from './types.js';
export declare class RestFileIoProvider extends BaseFileIoInstance {
    private readonly options;
    constructor(options: RestFileIoProviderOptions);
    protected handleGet(request: FileIoGetRequest): Promise<void>;
    protected handleHas(request: FileIoHasRequest): Promise<void>;
    protected handleHasMany(request: FileIoHasManyRequest): Promise<void>;
    protected handleDelete(request: FileIoDeleteRequest): Promise<void>;
    protected handleDeleteMany(request: FileIoDeleteManyRequest): Promise<void>;
    protected handleMap(request: FileIoMapRequest): Promise<void>;
    protected handleMaps(request: FileIoMapsRequest): Promise<void>;
    protected handleMove(request: FileIoMoveRequest): Promise<void>;
    protected handlePut(request: FileIoPutRequest): Promise<void>;
    protected handleSearch(request: FileIoSearchRequest): Promise<void>;
    private readPath;
    private hasPath;
    private fetchUrl;
    private writeRemotePath;
    private readLocalPath;
    private writeLocalPath;
    private headersForPath;
    private requestOptionsForPath;
    private localPath;
    private urlForPath;
}
//# sourceMappingURL=rest-provider.d.ts.map