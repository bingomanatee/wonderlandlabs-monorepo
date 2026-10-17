import { basename } from 'node:path'
import { mediaTypeFor } from './media-type.js'
import type { FileIoBinary, FileIoData, FileIoDataInput } from './types.js'

export class BinaryFileIoData implements FileIoData {
  readonly name: string
  readonly storedAt: string
  readonly value: Uint8Array

  constructor(input: FileIoDataInput, fallbackPath: string) {
    this.storedAt = input.storedAt ?? fallbackPath
    this.name = input.name ?? basename(this.storedAt)
    this.value = binaryToUint8Array(input.value)
    this.mediaTypeOverride = input.mediaType ?? null
  }

  get mediaType() {
    return this.mediaTypeOverride ?? mediaTypeFor(this.name, this.value)
  }

  private readonly mediaTypeOverride: string | null
}

export function coerceFileIoData(
  input: FileIoBinary | FileIoDataInput,
  path: string,
) {
  if (isDataInput(input)) {
    return new BinaryFileIoData(input, path)
  }

  return new BinaryFileIoData({ value: input }, path)
}

export function binaryToUint8Array(input: FileIoBinary) {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input)
  }
  if (input instanceof Uint8Array) {
    return input
  }
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
  }

  return new Uint8Array(input)
}

function isDataInput(
  input: FileIoBinary | FileIoDataInput,
): input is FileIoDataInput {
  return typeof input === 'object' && input !== null && 'value' in input
}
