import { Navigate, useLocation } from 'react-router-dom'
import type { Capability } from '@/auth/capabilities'
import { rememberReturnTo, useAuth } from '@/auth/AuthProvider'
import { ForbiddenState, Skeleton } from '@/design-system/components/ui'
import type { ReactNode } from 'react'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth()
  const location = useLocation()

  if (loading) return <Skeleton rows={6} />
  if (session.status !== 'authenticated' || !session.user) {
    rememberReturnTo(location.pathname + location.search)
    return <Navigate to="/login" replace />
  }
  return children
}

export function RequireCapability({
  capability,
  children,
}: {
  capability: Capability
  children: ReactNode
}) {
  const { can, loading } = useAuth()
  if (loading) return <Skeleton />
  if (!can(capability)) return <ForbiddenState />
  return children
}
