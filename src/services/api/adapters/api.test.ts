import { describe, expect, it } from 'vitest'
import { MockApiAdapter } from '@/services/api/adapters/mock'
import { HttpApiAdapter } from '@/services/api/adapters/http'
import { ApiError } from '@/services/api/errors'

describe('MockApiAdapter', () => {
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
})
