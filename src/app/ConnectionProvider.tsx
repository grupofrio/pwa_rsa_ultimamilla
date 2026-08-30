import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'

interface ConnectionState {
  online: boolean
  stale: boolean
}

const ConnectionContext = createContext<ConnectionState>({ online: true, stale: false })

function readOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('va.mock.offline') === '1') return false
  return navigator.onLine
}

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  window.addEventListener('va-connection', callback)
  const timer = window.setInterval(callback, 2000)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
    window.removeEventListener('va-connection', callback)
    window.clearInterval(timer)
  }
}

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, () => String(readOnline()), () => 'true')
  const value = useMemo<ConnectionState>(
    () => ({ online: snapshot === 'true', stale: snapshot !== 'true' }),
    [snapshot],
  )
  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

export function useConnection(): ConnectionState {
  return useContext(ConnectionContext)
}
