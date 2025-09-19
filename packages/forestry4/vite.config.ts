import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    // Temporarily disable DTS plugin due to TypeScript resolution issues
    // dts({
    //   insertTypesEntry: true,
    //   include: ['src/**/*'],
    //   exclude: ['src/**/*.$test.ts', 'src/**/*.spec.ts'],
    // }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Forestry4',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['@wonderlandlabs/walrus', 'immer', 'lodash-es', 'rxjs'],
      output: {
        // Don't preserve modules - bundle everything into single files
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    target: 'es2022',
    minify: false, // Keep readable for debugging
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
