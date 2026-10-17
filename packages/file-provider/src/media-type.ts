export const MEDIA_KEYS = {
  amd: 'amd',
  docx: 'docx',
  gif: 'gif',
  jpeg: 'jpeg',
  jpg: 'jpg',
  json: 'json',
  markdown: 'markdown',
  md: 'md',
  originalMarkdown: 'originalMarkdown',
  pdf: 'pdf',
  png: 'png',
  txt: 'txt',
  webp: 'webp',
  yaml: 'yaml',
  yml: 'yml',
  zip: 'zip',
} as const

export type MediaMapKey = (typeof MEDIA_KEYS)[keyof typeof MEDIA_KEYS]

export const MEDIA_EXTENSIONS = {
  amd: 'amd',
  docx: 'docx',
  gif: 'gif',
  jpeg: 'jpeg',
  jpg: 'jpg',
  json: 'json',
  markdown: 'markdown',
  md: 'md',
  originalMarkdown: 'original.md',
  pdf: 'pdf',
  png: 'png',
  txt: 'txt',
  webp: 'webp',
  yaml: 'yaml',
  yml: 'yml',
  zip: 'zip',
} as const

export const BINARY_MEDIA_TYPE = 'application/octet-stream'
type MediaMapRecord = {
  asciiPrefixes?: string[]
  bytePrefix?: number[]
  extension: string
  magic?: (value: Uint8Array) => boolean
  mediaType: string
}

export const mediaMap = new Map<MediaMapKey, MediaMapRecord>([
  [
    MEDIA_KEYS.amd,
    { extension: MEDIA_EXTENSIONS.amd, mediaType: 'text/markdown' },
  ],
  [
    MEDIA_KEYS.docx,
    {
      extension: MEDIA_EXTENSIONS.docx,
      mediaType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ],
  [
    MEDIA_KEYS.gif,
    {
      asciiPrefixes: ['GIF87a', 'GIF89a'],
      extension: MEDIA_EXTENSIONS.gif,
      mediaType: 'image/gif',
    },
  ],
  [
    MEDIA_KEYS.jpeg,
    {
      bytePrefix: [0xff, 0xd8, 0xff],
      extension: MEDIA_EXTENSIONS.jpeg,
      mediaType: 'image/jpeg',
    },
  ],
  [
    MEDIA_KEYS.jpg,
    { extension: MEDIA_EXTENSIONS.jpg, mediaType: 'image/jpeg' },
  ],
  [
    MEDIA_KEYS.json,
    { extension: MEDIA_EXTENSIONS.json, mediaType: 'application/json' },
  ],
  [
    MEDIA_KEYS.markdown,
    { extension: MEDIA_EXTENSIONS.markdown, mediaType: 'text/markdown' },
  ],
  [
    MEDIA_KEYS.md,
    { extension: MEDIA_EXTENSIONS.md, mediaType: 'text/markdown' },
  ],
  [
    MEDIA_KEYS.originalMarkdown,
    {
      extension: MEDIA_EXTENSIONS.originalMarkdown,
      mediaType: 'text/markdown',
    },
  ],
  [
    MEDIA_KEYS.pdf,
    {
      asciiPrefixes: ['%PDF-'],
      extension: MEDIA_EXTENSIONS.pdf,
      mediaType: 'application/pdf',
    },
  ],
  [
    MEDIA_KEYS.png,
    {
      bytePrefix: [0x89, 0x50, 0x4e, 0x47],
      extension: MEDIA_EXTENSIONS.png,
      mediaType: 'image/png',
    },
  ],
  [
    MEDIA_KEYS.txt,
    { extension: MEDIA_EXTENSIONS.txt, mediaType: 'text/plain' },
  ],
  [
    MEDIA_KEYS.webp,
    {
      extension: MEDIA_EXTENSIONS.webp,
      magic: (value) =>
        value.length >= 12 &&
        startsWithAscii(value.subarray(0, 4), 'RIFF') &&
        startsWithAscii(value.subarray(8, 12), 'WEBP'),
      mediaType: 'image/webp',
    },
  ],
  [
    MEDIA_KEYS.yaml,
    { extension: MEDIA_EXTENSIONS.yaml, mediaType: 'application/yaml' },
  ],
  [
    MEDIA_KEYS.yml,
    { extension: MEDIA_EXTENSIONS.yml, mediaType: 'application/yaml' },
  ],
  [
    MEDIA_KEYS.zip,
    {
      bytePrefix: [0x50, 0x4b, 0x03, 0x04],
      extension: MEDIA_EXTENSIONS.zip,
      mediaType: 'application/zip',
    },
  ],
])

const mediaByExtension = new Map(
  [...mediaMap.values()].map((value) => [value.extension, value]),
)
const extensionPattern = [...mediaMap.values()]
  .map((value) => value.extension.replace(/\./g, '\\.'))
  .reduce((pattern, extension) => `${pattern}|${extension}`)

export function mediaTypeFor(path: string, value: Uint8Array) {
  return mediaTypeFromMagicBytes(value) ?? mediaTypeFromPath(path)
}

export function mediaTypeFromPath(path: string) {
  const extension = getExtension(path)

  return mediaByExtension.get(extension)?.mediaType ?? BINARY_MEDIA_TYPE
}

export function mediaTypeForExtension(extension: string) {
  const normalized = normalizeExtension(extension)

  return mediaByExtension.get(normalized)?.mediaType
}

export function getExtension(path: string) {
  const match = path
    .toLowerCase()
    .match(new RegExp(`\\.(${extensionPattern})$`, 'i'))

  return normalizeExtension(match?.[1] ?? '')
}

function normalizeExtension(extension: string) {
  const normalized = extension.toLowerCase().replace(/^\./, '')
  return mediaByExtension.has(normalized) ? normalized : ''
}

function mediaTypeFromMagicBytes(value: Uint8Array) {
  return (
    [...mediaMap.values()].find((record) => matchesMagicBytes(record, value))
      ?.mediaType ?? null
  )
}

function matchesMagicBytes(record: MediaMapRecord, value: Uint8Array) {
  const starts = record.bytePrefix && startsWith(value, record.bytePrefix)
  const hasAscii =
    Array.isArray(record.asciiPrefixes) &&
    record.asciiPrefixes.some((prefix) => startsWithAscii(value, prefix))
  return Boolean(starts || hasAscii || record.magic?.(value))
}

function startsWith(value: Uint8Array, prefix: number[]) {
  return prefix.every((byte, index) => value[index] === byte)
}

function startsWithAscii(value: Uint8Array, prefix: string) {
  return startsWith(
    value,
    Array.from(prefix).map((char) => char.charCodeAt(0)),
  )
}
