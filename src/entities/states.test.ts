import { describe, expect, it } from 'vitest'
import { isOfficiallyLiquidatable, type RouteState } from './states'

describe('isOfficiallyLiquidatable', () => {
  it('accepts only backend-declared liquidatable or settled states', () => {
    expect(isOfficiallyLiquidatable('liquidatable')).toBe(true)
    expect(isOfficiallyLiquidatable('settled')).toBe(true)
  })

  it('does not treat operational completion as billable', () => {
    const notBillable: RouteState[] = [
      'scheduled',
      'assigned',
      'arrived_cedis',
      'loading',
      'load_reconciled',
      'exit_authorized',
      'in_route',
      'completed_returns_pending',
      'returns_closed',
      'closed_operationally',
      'cancelled',
      'reversed',
    ]
    for (const state of notBillable) {
      expect(isOfficiallyLiquidatable(state)).toBe(false)
    }
  })
})
