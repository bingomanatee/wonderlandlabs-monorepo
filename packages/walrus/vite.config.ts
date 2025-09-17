import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.$test.ts', 'src/**/*.spec.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Walrus',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['lodash.isequal'],
      output: {
        // Preserve module structure instead of bundling
        preserveModules: true,
        // Ensure proper ES module format with .js extensions
        format: 'es',
        entryFileNames: '[$name].js',
        chunkFileNames: '[$name].js',
        assetFileNames: '[$name].[ext]',
        // This should add .js extensions to imports
        interop: 'auto',
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
