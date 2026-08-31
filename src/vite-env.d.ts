/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_ADAPTER: string
  readonly VITE_APP_ENV: string
  readonly VITE_DEFAULT_TIMEZONE: string
  readonly VITE_DEFAULT_CURRENCY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:api-adapter' {
  import type { ApiClient } from '@/services/api/types'
  export function createApiAdapter(): ApiClient
}

declare module 'virtual:simulator-dock' {
  import type { ComponentType } from 'react'
  export const SimulatorDock: ComponentType
}
