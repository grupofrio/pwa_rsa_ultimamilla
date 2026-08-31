import { beforeEach, describe, expect, it } from 'vitest'
import { MockApiAdapter } from '@/services/api/adapters/mock'
import { HttpApiAdapter } from '@/services/api/adapters/http'
import { ApiError } from '@/services/api/errors'

describe('MockApiAdapter', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })
  it('blocks exit when load differs', async () => {
    const api = new MockApiAdapter()
    await api.login('ana.despacho@viaagil.example')
    await expect(
      api.confirmExit({ routeId: 'rt_2402', capability: 'route.confirm_exit', idempotencyKey: 'k1' }),
    ).rejects.toMatchObject({ code: 'load_difference' })
  })

  it('blocks exit without Mercado Libre authorization', async () => {
    const api = new MockApiAdapter()
    await api.login('ana.despacho@viaagil.example')
    api.resolveLoadDifference('rt_2402')
    await expect(
      api.confirmExit({ routeId: 'rt_2402', capability: 'route.confirm_exit', idempotencyKey: 'k2' }),
    ).rejects.toMatchObject({ code: 'ml_exit_missing' })
  })

  it('rejects fuel authorization without capability', async () => {
    const api = new MockApiAdapter()
    await api.login('ana.despacho@viaagil.example')
    await expect(
      api.authorizeFuel({
        routeId: 'rt_2404',
        amount: 100,
        liters: 10,
        station: 'x',
        reason: 'n',
        capability: 'fuel.authorize',
        idempotencyKey: 'k3',
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('records CSC tenant switch in audit', async () => {
    const api = new MockApiAdapter()
    await api.login('fabio.csc@viaagil.example')
    const user = await api.switchTenant({
      tenantId: 'co_demo',
      capability: 'csc.tenant.switch',
      idempotencyKey: 'k4',
      reason: 'Acompañamiento',
    })
    expect(user.tenantBanner).toMatch(/banner|tenant|CSC/i)
    const audit = await api.listAudit()
    expect(audit.items[0]?.action).toBe('csc.tenant.switch')
  })
})

describe('HttpApiAdapter', () => {
  it('exposes the same surface and fails closed without contract', async () => {
    const api = new HttpApiAdapter()
    expect(api.kind).toBe('http')
    await expect(api.listRoutes()).rejects.toMatchObject({ status: 501 })
  })

  it('does not talk to Odoo and returns null session without public API base URL', async () => {
    const api = new HttpApiAdapter()
    await expect(api.getSession()).resolves.toBeNull()
    expect(JSON.stringify(api)).not.toMatch(/ODOO/i)
  })
})

describe('settlement eligibility source', () => {
  it('lists a closed operational route that is not liquidatable regardless of the tentative ML field', async () => {
    const api = new MockApiAdapter()
    await api.login('diego.admin@viaagil.example')
    const route = await api.getRoute('rt_2406')
    expect(route.state).toBe('closed_operationally')
    expect(route.mlLiquidationState).toBe('pending')
  })

  it('exposes fuel estimates from the backend mock instead of a UI constant', async () => {
    const api = new MockApiAdapter()
    await api.login('diego.admin@viaagil.example')
    const routes = await api.listRoutes()
    const inRoute = routes.items.find((item) => item.id === 'rt_2404')
    expect(inRoute?.fuelEstimate?.liters).toBeTypeOf('number')
    expect(inRoute?.fuelEstimate?.amount?.kind).toBe('estimate')
  })
})
