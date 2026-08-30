import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { getApiClient } from '@/services/api/client'

interface ConnectionState {
  online: boolean
  stale: boolean
}

const ConnectionContext = createContext<ConnectionState>({ online: true, stale: false })

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  const timer = window.setInterval(callback, 5000)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
    window.clearInterval(timer)
  }
}

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => `${navigator.onLine}`,
    () => 'true',
  )
  const value = useMemo<ConnectionState>(() => {
    void snapshot
    let stale = false
    void getApiClient()
      .then((api) => {
        stale = api.getNetwork().stale
      })
      .catch(() => undefined)
    return { online: navigator.onLine, stale }
  }, [snapshot])

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

export function useConnection(): ConnectionState {
  return useContext(ConnectionContext)
}
