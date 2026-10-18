import { createValkeyMock } from 'js-valkey-server'
import type { RedisMock } from './types.js'

export function createValkeyTestEnvironment(externalUrl?: string) {
  let server: RedisMock | undefined

  return {
    async start() {
      if (!externalUrl) {
        server = await createValkeyMock()
      }
    },
    async reset() {
      await server?.flush()
    },
    async stop() {
      await server?.close()
      server = undefined
    },
    get url() {
      if (externalUrl) {
        return externalUrl
      }
      if (!server) {
        throw new Error('Valkey test server has not started')
      }
      return server.url
    },
  }
}
