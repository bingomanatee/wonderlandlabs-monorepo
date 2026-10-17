import { basename } from 'node:path';
import { mediaTypeFor } from './media-type.js';
export class BinaryFileIoData {
    name;
    storedAt;
    value;
    constructor(input, fallbackPath) {
        this.storedAt = input.storedAt ?? fallbackPath;
        this.name = input.name ?? basename(this.storedAt);
        this.value = binaryToUint8Array(input.value);
        this.mediaTypeOverride = input.mediaType ?? null;
    }
    get mediaType() {
        return this.mediaTypeOverride ?? mediaTypeFor(this.name, this.value);
    }
    mediaTypeOverride;
}
export function coerceFileIoData(input, path) {
    if (isDataInput(input)) {
        return new BinaryFileIoData(input, path);
    }
    return new BinaryFileIoData({ value: input }, path);
}
export function binaryToUint8Array(input) {
    if (typeof input === 'string') {
        return new TextEncoder().encode(input);
    }
    if (input instanceof Uint8Array) {
        return input;
    }
    if (ArrayBuffer.isView(input)) {
        return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    return new Uint8Array(input);
}
function isDataInput(input) {
    return typeof input === 'object' && input !== null && 'value' in input;
}
