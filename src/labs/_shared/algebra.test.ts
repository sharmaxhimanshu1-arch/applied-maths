import { describe, expect, it } from 'vitest'
import { compare, flip, halfPlane, linearTex, paren, quadrant, zeroPairs } from './algebra'

describe('algebra helpers', () => {
  it('writes linear expressions', () => {
    expect(linearTex(3, 2)).toBe('3x + 2')
    expect(linearTex(1, -4)).toBe('x - 4')
    expect(linearTex(-1, 0)).toBe('-x')
    expect(linearTex(0, -3)).toBe('-3')
    expect(linearTex(0, 0)).toBe('0')
    expect(paren(-3)).toBe('(-3)')
    expect(paren(2)).toBe('2')
  })

  it('counts zero pairs', () => {
    expect(zeroPairs(3, -2)).toBe(2)
    expect(zeroPairs(-1, 4)).toBe(1)
    expect(zeroPairs(2, 3)).toBe(0)
  })

  it('finds quadrants', () => {
    expect([quadrant(1, 1), quadrant(-1, 1), quadrant(-1, -1), quadrant(1, -1)]).toEqual([
      1, 2, 3, 4,
    ])
    expect(quadrant(0, 5)).toBe(0)
  })

  it('compares and flips', () => {
    expect(compare(3, '<', 3)).toBe(false)
    expect(compare(3, '<=', 3)).toBe(true)
    expect(flip('<')).toBe('>')
    expect(flip('>=')).toBe('<=')
  })

  it('builds the shaded half-plane along the line', () => {
    const view = { xMin: -6, xMax: 6, yMin: -5, yMax: 5 }
    for (const [m, b, above] of [
      [0, 1, false],
      [3, 0, true],
      [-2, 4, false],
    ] as const) {
      const [[xa, ya], [xb, yb], [, edgeB], [, edgeA]] = halfPlane(m, b, above, view)
      // The first edge lies on the line itself.
      expect(ya).toBeCloseTo(m * xa + b)
      expect(yb).toBeCloseTo(m * xb + b)
      expect(xa).toBeLessThan(view.xMin)
      expect(xb).toBeGreaterThan(view.xMax)
      // The far edge is beyond the window on the shaded side.
      if (above) expect(Math.min(edgeA, edgeB)).toBeGreaterThan(Math.max(ya, yb, view.yMax))
      else expect(Math.max(edgeA, edgeB)).toBeLessThan(Math.min(ya, yb, view.yMin))
    }
  })
})
