import { useEffect, useState } from 'react'
import { getApiClient } from '@/services/api/client'
import type { ApiClient } from '@/services/api/types'

export function useApi(): ApiClient | null {
  const [api, setApi] = useState<ApiClient | null>(null)
  useEffect(() => {
    void getApiClient().then(setApi)
  }, [])
  return api
}
