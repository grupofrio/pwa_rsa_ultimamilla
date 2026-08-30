import { describe, expect, it } from 'vitest'
import { can, canAll, canAny, canInScope } from '@/auth/can'
import { capabilitiesFor } from '@/auth/capabilities'
import type { OperatingScope } from '@/auth/types'

const scope: OperatingScope = {
  id: 's1',
  companyId: 'co_rsa',
  companyName: 'RSA',
  plazaId: 'pl_gdlr',
  plazaName: 'GDL R',
  cedisId: 'cd1',
  cedisName: 'CEDIS',
  shiftId: 'am',
  shiftName: 'AM',
  fleetId: 'f1',
  fleetName: 'Flota',
  timezone: 'America/Mexico_City',
  currency: 'MXN',
}

describe('capabilities', () => {
  it('dispatcher can assign but cannot authorize fuel', () => {
    const caps = capabilitiesFor('dispatcher')
    expect(can(caps, 'route.assign')).toBe(true)
    expect(can(caps, 'fuel.authorize')).toBe(false)
    expect(can(caps, 'settlement.force_liquidatable')).toBe(false)
  })

  it('manager cannot force liquidation by title alone', () => {
    const caps = capabilitiesFor('manager')
    expect(can(caps, 'management.view')).toBe(true)
    expect(can(caps, 'settlement.force_liquidatable')).toBe(false)
  })

  it('csc can prepare but not authorize fuel', () => {
    const caps = capabilitiesFor('csc_operator')
    expect(can(caps, 'settlement.prepare')).toBe(true)
    expect(can(caps, 'fuel.authorize')).toBe(false)
    expect(canAny(caps, ['csc.tenant.switch'])).toBe(true)
  })

  it('canInScope rejects other company', () => {
    const caps = capabilitiesFor('dispatcher')
    expect(canInScope(caps, 'route.assign', scope, { companyId: 'co_rsa' })).toBe(true)
    expect(canInScope(caps, 'route.assign', scope, { companyId: 'other' })).toBe(false)
    expect(canAll(caps, ['route.view', 'route.assign'])).toBe(true)
  })
})
