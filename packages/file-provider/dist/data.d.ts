import type { FileIoBinary, FileIoData, FileIoDataInput } from './types.js';
export declare class BinaryFileIoData implements FileIoData {
    readonly name: string;
    readonly storedAt: string;
    readonly value: Uint8Array;
    constructor(input: FileIoDataInput, fallbackPath: string);
    get mediaType(): string;
    private readonly mediaTypeOverride;
}
export declare function coerceFileIoData(input: FileIoBinary | FileIoDataInput, path: string): BinaryFileIoData;
export declare function binaryToUint8Array(input: FileIoBinary): Uint8Array<ArrayBufferLike>;
//# sourceMappingURL=data.d.ts.map