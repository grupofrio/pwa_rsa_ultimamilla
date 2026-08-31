import { describe, expect, it } from 'vitest'
import { formatKm, formatMxn, qualityFromAge } from '@/format'
import { PACKAGE_STATE_LABELS, ROUTE_STATE_LABELS } from '@/entities/states'

describe('formatters', () => {
  it('formats MXN and marks estimates', () => {
    expect(formatMxn(60)).toMatch(/\$60\.00/)
    expect(formatMxn(60, { estimate: true })).toContain('estimación')
    expect(formatMxn(null)).toBe('—')
  })

  it('formats kilometers', () => {
    expect(formatKm(99)).toContain('99')
    expect(formatKm(null)).toBe('—')
  })

  it('derives stale quality from age', () => {
    const now = Date.parse('2026-08-30T12:00:00Z')
    expect(qualityFromAge('2026-08-30T11:59:50Z', 120_000, now)).toBe('ok')
    expect(qualityFromAge('2026-08-30T11:50:00Z', 120_000, now)).toBe('stale')
    expect(qualityFromAge(null)).toBe('missing')
  })
})

describe('state machines', () => {
  it('does not treat assigned, completed and liquidatable as synonyms', () => {
    expect(ROUTE_STATE_LABELS.assigned).toBe('Asignada')
    expect(ROUTE_STATE_LABELS.closed_operationally).toBe('Cerrada operativamente')
    expect(ROUTE_STATE_LABELS.liquidatable).toBe('Liquidable (fuente oficial)')
    expect(PACKAGE_STATE_LABELS.delivered).toBe('Entregado')
    expect(PACKAGE_STATE_LABELS.pending_return).toBe('Pendiente de devolución')
  })
})
