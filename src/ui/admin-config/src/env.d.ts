/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_MODE: string
  readonly VITE_MOCK_AUTH: string
  readonly VITE_AUTO_MOCK_USER: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}