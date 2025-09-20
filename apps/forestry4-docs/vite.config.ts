/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle snippet requests
    {
      name: 'snippet-handler',
      configureServer(server) {
        server.middlewares.use('/snippets', (req, res, next) => {
          // If the request is for a snippet file that doesn't exist,
          // return 404 instead of falling back to index.html
          const publicDir = server.config.publicDir || path.join(process.cwd(), 'public')
          // req.url for /snippets/file.ts will be /file.ts, so we need to add snippets back
          const filePath = path.join(publicDir, 'snippets', req.url!)

          if (!fs.existsSync(filePath)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain')
            res.end(`Snippet not found: ${req.url}`)
            return
          }

          next()
        })
      }
    }
  ],
  server: {
    port: 3000,
    fs: {
      // Allow serving files from the public directory
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          forestry: ['@wonderlandlabs/forestry4']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
