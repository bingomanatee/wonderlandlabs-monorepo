import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      // Use the working configuration even if deprecated
      inline: ['@wonderlandlabs/forestry4'],
      external: ['rxjs'],
    },
  },
  resolve: {
    alias: {
      // Alias rxjs to the main node_modules version
      rxjs: path.resolve(__dirname, '../../node_modules/rxjs'),
    },
  },
});
