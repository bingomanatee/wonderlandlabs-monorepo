import { BaseFileIoInstance } from './provider-base.js';
import type { FileIoDataInput, FileIoDeleteManyRequest, FileIoDeleteRequest, FileIoGetRequest, FileIoHasRequest, FileIoHasManyRequest, FileIoMapRequest, FileIoMapsRequest, FileIoMoveRequest, FileIoPutRequest, FileIoSearchRequest, MockFileIoProviderGlobCall, MockFileIoProviderOptions, MockFileIoProviderPutCall } from './types.js';
export declare class MockFileIoProvider extends BaseFileIoInstance {
    private readonly options;
    readonly deletes: string[];
    readonly deleteManyCalls: MockFileIoProviderGlobCall[];
    readonly gets: string[];
    readonly hasChecks: string[];
    readonly hasManyChecks: string[][];
    readonly moves: {
        fromPath: string;
        toPath: string;
    }[];
    readonly puts: MockFileIoProviderPutCall[];
    readonly searches: MockFileIoProviderGlobCall[];
    readonly files: Map<string, FileIoDataInput>;
    constructor(options?: MockFileIoProviderOptions);
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
    readStored(path: string): import("./data.js").BinaryFileIoData | null;
    readStoredText(path: string): string | null;
    private applyDeltaResponse;
    private matchFiles;
    private respondGet;
    private respondMove;
    private respondSearch;
    private normalizeInput;
}
//# sourceMappingURL=mock-provider.d.ts.map