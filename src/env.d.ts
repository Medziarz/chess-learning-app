/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STOCKFISH_URL: string
  readonly VITE_TEST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}