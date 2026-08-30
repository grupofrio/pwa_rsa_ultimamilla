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
    expect(can(caps, 'maintenance.manage')).toBe(true)
    expect(can(caps, 'expense.reconcile')).toBe(true)
    expect(can(caps, 'claim.manage')).toBe(true)
    expect(can(caps, 'fuel.authorize')).toBe(false)
    expect(can(caps, 'invoice.approve')).toBe(false)
    expect(can(caps, 'payroll.incident.approve')).toBe(false)
    expect(canAny(caps, ['csc.tenant.switch'])).toBe(true)
  })

  it('assigns the agreed operational responsibilities by profile', () => {
    const dispatcher = capabilitiesFor('dispatcher')
    expect(canAll(dispatcher, ['route.assign', 'route.reconcile_load', 'package.return.manage', 'claim.manage'])).toBe(true)

    const supervisor = capabilitiesFor('supervisor')
    expect(canAll(supervisor, ['supervision.view', 'alert.resolve', 'talent.manage', 'payroll.incident.view'])).toBe(true)
    expect(can(supervisor, 'payroll.incident.approve')).toBe(false)

    const fleet = capabilitiesFor('fleet_coordinator')
    expect(canAll(fleet, ['fleet.manage', 'maintenance.manage', 'fuel.view'])).toBe(true)

    const admin = capabilitiesFor('admin_finance')
    expect(canAll(admin, ['fuel.authorize', 'maintenance.manage', 'expense.reconcile', 'payroll.incident.approve', 'invoice.approve'])).toBe(true)

    const manager = capabilitiesFor('manager')
    expect(canAll(manager, ['supervision.view', 'alert.view', 'expense.view', 'talent.incident.view', 'pnl.view'])).toBe(true)
    expect(can(manager, 'expense.reconcile')).toBe(false)
  })

  it('keeps platform administration isolated from client operations', () => {
    const caps = capabilitiesFor('platform_admin')
    expect(canAll(caps, ['config.view', 'config.manage', 'support.view', 'audit.view'])).toBe(true)
    expect(canAny(caps, ['route.view', 'fleet.view', 'expense.view', 'management.view', 'pnl.view'])).toBe(false)
  })

  it('canInScope rejects other company', () => {
    const caps = capabilitiesFor('dispatcher')
    expect(canInScope(caps, 'route.assign', scope, { companyId: 'co_rsa' })).toBe(true)
    expect(canInScope(caps, 'route.assign', scope, { companyId: 'other' })).toBe(false)
    expect(canAll(caps, ['route.view', 'route.assign'])).toBe(true)
  })
})
