import * as math from 'mathjs'
import { describe, expect, it } from 'vitest'
import { compileExpression, preprocess, taylorCoefficients } from './expr'

describe('preprocess', () => {
  it('splits implicit products and maps notation', () => {
    expect(preprocess('ax^2+bx+c')).toBe('a x^2+b x+c')
    expect(preprocess('sin(x)')).toBe('sin(x)')
    expect(preprocess('pix')).toBe('pi x')
    expect(preprocess('ln(x)')).toBe('log(x)')
    expect(preprocess('log(x)')).toBe('log10(x)')
    expect(preprocess('2πx')).toBe('2 pi x')
    expect(preprocess('√x')).toBe(' sqrt x')
    expect(preprocess('x (10 - 2x)^2')).toBe('x*(10 - 2x)^2')
    expect(preprocess('f(x) = a(x+1)')).toBe('f(x) = a*(x+1)')
  })
})

describe('compileExpression', () => {
  it('compiles functions with parameters and a symbolic derivative', () => {
    const r = compileExpression(math, 'y = ax^2 + b')
    if (!r.ok) throw new Error(r.error)
    expect(r.expr.kind).toBe('function')
    expect(r.expr.params).toEqual(['a', 'b'])
    expect(r.expr.evaluate(3, { a: 2, b: 1 })).toBe(19)
    expect(r.expr.derivative!.evaluate(3, { a: 2, b: 1 })).toBe(12)
  })

  it('reads a variable before a bracket as multiplication', () => {
    const r = compileExpression(math, 'x (10 - 2x)^2')
    if (!r.ok) throw new Error(r.error)
    expect(r.expr.evaluate(1, {})).toBe(64)
  })

  it('recognises polar curves, vertical lines and points', () => {
    const polar = compileExpression(math, 'r = 1 + cos(θ)')
    expect(polar.ok && polar.expr.kind).toBe('polar')
    if (polar.ok) expect(polar.expr.evaluate(0, {})).toBe(2)

    const vertical = compileExpression(math, 'x = 2')
    expect(vertical.ok && vertical.expr.kind).toBe('vertical')

    const point = compileExpression(math, '(a, 2a)')
    if (!point.ok) throw new Error(point.error)
    expect(point.expr.kind).toBe('point')
    expect(point.expr.point!({ a: 3 })).toEqual([3, 6])
  })

  it('reports errors instead of throwing', () => {
    expect(compileExpression(math, '2 +').ok).toBe(false)
    expect(compileExpression(math, 'z = x').ok).toBe(false)
    expect(compileExpression(math, '').ok).toBe(false)
  })

  it('builds Taylor coefficients', () => {
    const r = compileExpression(math, 'e^x')
    if (!r.ok) throw new Error(r.error)
    const c = taylorCoefficients(math, r.expr.node, 0, 4, {})
    expect(c.map((v) => +v.toFixed(6))).toEqual([1, 1, 0.5, 0.166667, 0.041667])
  })
})
