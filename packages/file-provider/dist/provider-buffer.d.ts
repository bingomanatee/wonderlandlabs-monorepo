import { Subject } from 'rxjs';
import type { FileIoRequest, FileIoResponse } from './types.js';
export type BufferOptions = {
    maxBufferSize?: number;
    maxDelay?: number;
};
export declare class ProviderBuffer {
    #private;
    readonly batchStream: Subject<FileIoRequest[]>;
    readonly resultStream: Subject<FileIoResponse>;
    constructor(options: BufferOptions);
    complete(): void;
    input(request: FileIoRequest): string;
    private flush;
    private watchRequests;
    private clearFlushTimer;
}
//# sourceMappingURL=provider-buffer.d.ts.map