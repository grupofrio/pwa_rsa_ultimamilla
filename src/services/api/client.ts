import type { ApiClient } from './types'

let client: ApiClient | null = null

export async function getApiClient(): Promise<ApiClient> {
  if (client) return client
  const mod = await import('virtual:api-adapter')
  client = mod.createApiAdapter()
  return client
}

export function resetApiClient(): void {
  client = null
}
