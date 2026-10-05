import { describe, expect, it } from 'vitest'
import { REGIONS, SLOTS, regionAt } from './venn'

describe('venn helpers', () => {
  it('classifies points by region', () => {
    expect(regionAt(200, 125)).toBe('11')
    expect(regionAt(100, 125)).toBe('10')
    expect(regionAt(300, 125)).toBe('01')
    expect(regionAt(20, 20)).toBe('00')
  })

  it('has room for at least 8 dots in every region', () => {
    for (const r of REGIONS) {
      expect(SLOTS[r].length, r).toBeGreaterThanOrEqual(8)
      for (const [x, y] of SLOTS[r]) expect(regionAt(x, y)).toBe(r)
    }
  })
})
