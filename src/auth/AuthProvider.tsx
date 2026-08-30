import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Capability } from '@/auth/capabilities'
import { can, canAny } from '@/auth/can'
import type { SessionState, SessionUser } from '@/auth/types'
import { getApiClient } from '@/services/api/client'
import { isUnauthorized } from '@/services/api/errors'

interface AuthApi {
  session: SessionState
  user: SessionUser | null
  loading: boolean
  login: (email: string) => Promise<void>
  logout: () => Promise<void>
  switchScope: (scopeId: string) => Promise<void>
  switchTenant: (tenantId: string, reason: string) => Promise<void>
  can: (capability: Capability) => boolean
  canAny: (capabilities: Capability[]) => boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthApi | null>(null)

const RETURN_TO_KEY = 'va.returnTo'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<SessionState['status']>('anonymous')
  const [loading, setLoading] = useState(true)
  const [adapter, setAdapter] = useState<'mock' | 'http'>('http')

  const hydrate = useCallback(async () => {
    const api = await getApiClient()
    setAdapter(api.kind)
    try {
      const session = await api.getSession()
      setUser(session)
      setStatus(session ? 'authenticated' : 'anonymous')
    } catch (error) {
      if (isUnauthorized(error)) setStatus('expired')
      else setStatus('anonymous')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const api = useMemo<AuthApi>(
    () => ({
      session: {
        status,
        user,
        correlationId: 'session',
        adapter,
        returnTo: sessionStorage.getItem(RETURN_TO_KEY),
      },
      user,
      loading,
      login: async (email: string) => {
        const client = await getApiClient()
        const next = await client.login(email)
        setUser(next)
        setStatus('authenticated')
      },
      logout: async () => {
        const client = await getApiClient()
        await client.logout()
        setUser(null)
        setStatus('anonymous')
        sessionStorage.removeItem(RETURN_TO_KEY)
      },
      switchScope: async (scopeId: string) => {
        const client = await getApiClient()
        const next = await client.switchScope(scopeId)
        setUser({ ...next })
      },
      switchTenant: async (tenantId: string, reason: string) => {
        const client = await getApiClient()
        const next = await client.switchTenant({
          tenantId,
          reason,
          capability: 'csc.tenant.switch',
          idempotencyKey: crypto.randomUUID(),
        })
        setUser({ ...next })
      },
      can: (capability) => (user ? can(user.capabilities, capability) : false),
      canAny: (capabilities) => (user ? canAny(user.capabilities, capabilities) : false),
      refresh: hydrate,
    }),
    [adapter, hydrate, loading, status, user],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthApi {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth fuera de AuthProvider')
  return value
}

export function rememberReturnTo(path: string): void {
  if (path.startsWith('/login')) return
  sessionStorage.setItem(RETURN_TO_KEY, path)
}

export function consumeReturnTo(): string | null {
  const value = sessionStorage.getItem(RETURN_TO_KEY)
  sessionStorage.removeItem(RETURN_TO_KEY)
  return value
}
