import { describe, expect, it } from 'vitest'
import { compile, expressionsMatch, numbersMatch, parseNumber } from './miniExpr'

describe('miniExpr', () => {
  it('evaluates arithmetic with precedence', () => {
    expect(parseNumber('1 + 2 * 3')).toBe(7)
    expect(parseNumber('(1 + 2) * 3')).toBe(9)
    expect(parseNumber('2^3^2')).toBe(512)
    expect(parseNumber('-2^2')).toBe(-4)
    expect(parseNumber('2^-1')).toBe(0.5)
    expect(parseNumber('3/4')).toBe(0.75)
  })

  it('reads typed maths notation', () => {
    expect(parseNumber('2π')).toBeCloseTo(2 * Math.PI)
    expect(parseNumber('π/2')).toBeCloseTo(Math.PI / 2)
    expect(parseNumber('√2')).toBeCloseTo(Math.SQRT2)
    expect(parseNumber('2√3')).toBeCloseTo(2 * Math.sqrt(3))
    expect(parseNumber('5²')).toBe(25)
    expect(parseNumber('−3 × 4')).toBe(-12)
    expect(parseNumber('1,000')).toBe(1000)
    expect(parseNumber('1e3')).toBe(1000)
    expect(parseNumber('sqrt(16)')).toBe(4)
    expect(parseNumber('ln(e)')).toBe(1)
  })

  it('rejects junk and free variables in plain numbers', () => {
    expect(parseNumber('2x')).toBeNaN()
    expect(parseNumber('2 +')).toBeNaN()
    expect(parseNumber('hello')).toBeNaN()
    expect(compile('').ok).toBe(false)
  })

  it('handles variables and implicit multiplication', () => {
    const c = compile('2x(x+1)')
    expect(c.ok && c.evaluate({ x: 3 })).toBe(24)
    expect(c.ok && [...c.vars]).toEqual(['x'])
    const d = compile('xy')
    expect(d.ok && [...d.vars].sort()).toEqual(['x', 'y'])
  })

  it('compares numbers with tolerance', () => {
    expect(numbersMatch(0.3333, 1 / 3, 0.001)).toBe(true)
    expect(numbersMatch(0.33, 1 / 3, 0.001)).toBe(false)
    expect(numbersMatch(NaN, 1)).toBe(false)
  })

  it('checks expression equivalence by sampling', () => {
    expect(expressionsMatch('2x', 'x + x')).toBe(true)
    expect(expressionsMatch('(x+1)^2', 'x^2 + 2x + 1')).toBe(true)
    expect(expressionsMatch('3x^2', '3*x*x')).toBe(true)
    expect(expressionsMatch('2x', 'x^2')).toBe(false)
    expect(expressionsMatch('1/x', 'x^-1')).toBe(true)
    expect(expressionsMatch('cos(x)', 'sin(x + pi/2)')).toBe(true)
    expect(expressionsMatch('y', 'y')).toBe(false) // y is not an allowed variable
  })
})
