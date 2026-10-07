import { describe, expect, it } from 'vitest'
import {
  cabs,
  cadd,
  cargDeg,
  cmul,
  compare,
  complexTex,
  fibonacciLike,
  GOLDEN_RATIO,
  sequenceTerms,
  flip,
  halfPlane,
  lineMeet,
  linearTex,
  paren,
  polyDegree,
  polyEval,
  polyMul,
  polyTex,
  quadrant,
  zeroPairs,
} from './algebra'

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

describe('polynomial and line helpers', () => {
  it('evaluates, multiplies and writes polynomials', () => {
    expect(polyEval([-2, 0, 1], 3)).toBe(7)
    expect(polyDegree([1, 0, 0])).toBe(0)
    expect(polyDegree([0, 0])).toBe(-1)
    expect(polyMul([2, 1], [3, 1])).toEqual([6, 5, 1])
    expect(polyMul([-3, 1], [3, 1])).toEqual([-9, 0, 1])
    expect(polyTex([4, -1, 0, 2])).toBe('2x^{3} - x + 4')
    expect(polyTex([0, 0, -1])).toBe('-x^{2}')
    expect(polyTex([0])).toBe('0')
  })

  it('intersects lines', () => {
    expect(lineMeet(1, 0, -1, 4)).toEqual({ kind: 'one', x: 2, y: 2 })
    expect(lineMeet(2, 1, 2, -3)).toEqual({ kind: 'none' })
    expect(lineMeet(2, 1, 2, 1)).toEqual({ kind: 'same' })
  })
})

describe('sequences and complex numbers', () => {
  it('lists terms', () => {
    expect(sequenceTerms('arithmetic', 2, 3, 4)).toEqual([2, 5, 8, 11])
    expect(sequenceTerms('geometric', 3, -2, 4)).toEqual([3, -6, 12, -24])
    expect(fibonacciLike(1, 1, 7)).toEqual([1, 1, 2, 3, 5, 8, 13])
    const f = fibonacciLike(2, 5, 30)
    expect(f[29] / f[28]).toBeCloseTo(GOLDEN_RATIO, 9)
  })

  it('does complex arithmetic', () => {
    expect(cadd([3, 2], [1, -5])).toEqual([4, -3])
    expect(cmul([2, 1], [1, 3])).toEqual([-1, 7])
    expect(cmul([0, 1], [0, 1])).toEqual([-1, 0])
    expect(cabs([3, 4])).toBe(5)
    expect(cargDeg([0, 1])).toBeCloseTo(90)
    expect(cargDeg([0, -1])).toBeCloseTo(270)
    expect(complexTex([3, -2])).toBe('3 - 2i')
    expect(complexTex([0, 1])).toBe('i')
    expect(complexTex([0, -1])).toBe('-i')
    expect(complexTex([-4, 0])).toBe('-4')
  })
})
