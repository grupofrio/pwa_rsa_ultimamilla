import type { Capability, Profile } from './capabilities'

export interface OperatingScope {
  id: string
  companyId: string
  companyName: string
  plazaId: string
  plazaName: string
  cedisId: string
  cedisName: string
  shiftId: string
  shiftName: string
  fleetId: string
  fleetName: string
  timezone: string
  currency: 'MXN'
}

export interface SessionUser {
  id: string
  email: string
  displayName: string
  profile: Profile
  capabilities: Capability[]
  allowedScopes: OperatingScope[]
  activeScope: OperatingScope
  tenantBanner: string | null
}

export interface SessionState {
  status: 'anonymous' | 'authenticated' | 'expired'
  user: SessionUser | null
  correlationId: string
  adapter: 'mock' | 'http'
  returnTo: string | null
}
