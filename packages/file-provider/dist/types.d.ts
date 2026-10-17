import type { Observable } from 'rxjs';
export type RestFileIoHeadersInit = NonNullable<RequestInit['headers']>;
export type FileIoBinary = ArrayBuffer | ArrayBufferView | string;
export type FileIoWriteInputList = FileIoWriteInput | readonly FileIoWriteInputList[];
export interface FileIoDataInput {
    mediaType?: string | null;
    name?: string | null;
    storedAt?: string | null;
    value: FileIoBinary;
}
export interface FileIoWriteInput extends FileIoDataInput {
    path: string;
}
export interface FileIoData {
    readonly mediaType: string;
    readonly name: string;
    readonly storedAt: string;
    readonly value: Uint8Array;
}
export type FileIoPathInput = string | readonly FileIoPathInput[];
export interface FileIoWriteResult {
    byteSize: number;
    contentHash: string;
    mediaType: string;
    name: string;
    storedAt: string;
    writtenAt: string;
}
export interface FileIoRequestMeta {
    at?: number;
    batchId?: string;
    id?: string;
}
export interface FileIoDeleteRequest extends FileIoRequestMeta {
    op: 'delete';
    path: string;
}
export interface FileIoDeleteManyRequest extends FileIoRequestMeta {
    globString: string;
    op: 'deleteMany';
}
export interface FileIoGetRequest extends FileIoRequestMeta {
    op: 'get';
    path: string;
}
export interface FileIoHasRequest extends FileIoRequestMeta {
    op: 'has';
    path: string;
}
export interface FileIoHasManyRequest extends FileIoRequestMeta {
    op: 'hasMany';
    paths: string[];
}
export interface FileIoMapRequest extends FileIoRequestMeta {
    op: 'map';
    path: string;
    updateFn: FileIoMapFn;
}
export interface FileIoMapsRequest extends FileIoRequestMeta {
    globString: string;
    op: 'maps';
    updateFn: FileIoMapsFn;
}
export interface FileIoMoveRequest extends FileIoRequestMeta {
    fromPath: string;
    op: 'move';
    toPath: string;
}
export interface FileIoPutRequest extends FileIoRequestMeta {
    data: FileIoBinary | FileIoDataInput;
    op: 'put';
    path: string;
}
export interface FileIoSearchRequest extends FileIoRequestMeta {
    globString: string;
    op: 'search';
}
export type FileIoRequest = FileIoDeleteRequest | FileIoDeleteManyRequest | FileIoGetRequest | FileIoHasRequest | FileIoHasManyRequest | FileIoMapRequest | FileIoMapsRequest | FileIoMoveRequest | FileIoPutRequest | FileIoSearchRequest;
export type FileIoRequestOutput = FileIoData | FileIoData[] | FileIoWriteResult | Map<string, boolean> | boolean | void;
export interface FileIoResponse<TOutput = FileIoRequestOutput> {
    error?: unknown;
    id: string;
    input: FileIoRequest;
    ok: boolean;
    output?: TOutput;
}
export interface FileIoInputStream {
    complete(): void;
    next(input: FileIoWriteInputList): FileIoResponseStream<FileIoWriteResult>;
}
export interface FileIoSubscription {
    unsubscribe(): void;
}
export type FileIoResponseStream<TOutput = FileIoRequestOutput> = Observable<FileIoResponse<TOutput>[]> & {
    complete(): void;
};
export interface FileIoObservation {
    data?: FileIoData;
    error?: unknown;
    ok: boolean;
    path: string;
}
export type FileIoObservationStream = Observable<FileIoObservation> & {
    complete(): void;
};
export interface FileIoDataDelta {
    in?: FileIoData[];
    out: FileIoData[];
}
export type FileIoMapFn = (data: FileIoData) => Promise<FileIoDataDelta> | FileIoDataDelta;
export type FileIoMapsFn = (data: FileIoData[]) => Promise<FileIoDataDelta> | FileIoDataDelta;
export interface FileIoProvider {
    delete(path: string): FileIoResponseStream<void>;
    deleteMany(globString: string): FileIoResponseStream<void>;
    get(path: string): FileIoResponseStream<FileIoData>;
    getMany(...paths: FileIoPathInput[]): FileIoResponseStream<FileIoData>;
    has(path: string): FileIoResponseStream<boolean>;
    hasMany(...paths: FileIoPathInput[]): FileIoResponseStream<Map<string, boolean>>;
    hasAll(...paths: FileIoPathInput[]): Promise<boolean>;
    inputStream(): FileIoInputStream;
    map(path: string, updateFn: FileIoMapFn): FileIoResponseStream<FileIoData[]>;
    maps(globString: string, updateFn: FileIoMapsFn): FileIoResponseStream<FileIoData[]>;
    move(fromPath: string, toPath: string): FileIoResponseStream<FileIoData>;
    put(path: string, data: FileIoBinary | FileIoDataInput): FileIoResponseStream<FileIoWriteResult>;
    putMany(...inputs: FileIoWriteInputList[]): FileIoResponseStream<FileIoWriteResult>;
    read(path: string): Promise<FileIoData>;
    readMany(...paths: FileIoPathInput[]): Promise<Map<string, FileIoData>>;
    search(globString: string): FileIoResponseStream<FileIoData[]>;
    write(path: string, data: FileIoBinary | FileIoDataInput): Promise<FileIoWriteResult>;
    writeMany(...inputs: FileIoWriteInputList[]): Promise<Map<string, FileIoWriteResult>>;
}
export interface LocalFileIoProviderOptions {
    root: string;
}
export interface RestFileIoProviderOptions {
    defaultWriteMethod?: RestFileIoWriteMethod;
    fetch?: typeof fetch;
    headers?: RestFileIoHeadersInit | RestFileIoHeadersFn;
    urlPrefix: string;
}
export type RestFileIoWriteMethod = 'PATCH' | 'POST' | 'PUT';
export interface RestFileIoRequestOptions {
    headers?: RestFileIoHeadersInit;
    method?: RestFileIoWriteMethod;
}
export type RestFileIoHeadersFn = (path: string) => Promise<RestFileIoRequestOptions> | RestFileIoRequestOptions;
export interface S3FileIoProviderOptions {
    accessKeyId: string;
    bucket: string;
    endpoint?: string;
    fetch: typeof fetch;
    forcePathStyle?: boolean;
    region: string;
    secretAccessKey: string;
    sessionToken?: string;
}
export type KeyValueFileIoProviderType = 'redis' | 'valkey';
export interface KeyValueFileIoProviderOptions {
    keyPrefix?: string;
    providerType?: KeyValueFileIoProviderType;
    url: string;
}
export interface MockFileIoProviderCall {
    path: string;
}
export interface MockFileIoProviderGlobCall {
    globString: string;
}
export interface MockFileIoProviderPutCall extends MockFileIoProviderCall {
    data: FileIoDataInput;
}
export interface MockFileIoProviderOptions {
    bufferOptions?: {
        maxBufferSize?: number;
        maxDelay?: number;
    };
    files?: Record<string, FileIoBinary | FileIoDataInput>;
    onDelete?: (path: string) => Promise<void> | void;
    onDeleteMany?: (globString: string) => Promise<void> | void;
    onGet?: (path: string) => Promise<FileIoDataInput> | FileIoDataInput;
    onMove?: (fromPath: string, toPath: string) => Promise<FileIoDataInput> | FileIoDataInput;
    onPut?: (path: string, data: FileIoDataInput) => Promise<FileIoWriteResult | void> | FileIoWriteResult | void;
    onSearch?: (globString: string) => Promise<FileIoDataInput[]> | FileIoDataInput[];
}
//# sourceMappingURL=types.d.ts.map