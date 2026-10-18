import { firstValueFrom } from 'rxjs'
import type { FileIoRequestOutput, FileIoResponseStream } from './types.js'

export async function firstOutput<T = FileIoRequestOutput>(
  stream: FileIoResponseStream,
): Promise<T> {
  const [response] = await firstValueFrom(stream)

  if (!response.ok) {
    throw response.error
  }

  return response.output as T
}
