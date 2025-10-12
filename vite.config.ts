import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Headers required for SharedArrayBuffer and WASM
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    // Enable specific features for WASM
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    exclude: ['stockfish.wasm', 'stockfish', 'stockfish.js']
  },
  // Ensure WASM files are served correctly
  assetsInclude: ['**/*.wasm'],
  build: {
    target: 'es2020',
    rollupOptions: {
      external: ['stockfish.js']
    }
  },
  // Allow access to node_modules from public
  publicDir: 'public'
})