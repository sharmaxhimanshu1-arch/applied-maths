import { describe, expect, it } from 'vitest'
import { clamp, formatNumber, invLerp, lerp, linspace, range, roundTo, snap } from './core'

describe('core helpers', () => {
  it('clamps', () => {
    expect(clamp(5, 0, 3)).toBe(3)
    expect(clamp(-1, 0, 3)).toBe(0)
    expect(clamp(2, 0, 3)).toBe(2)
  })

  it('interpolates and inverts', () => {
    expect(lerp(2, 6, 0.25)).toBe(3)
    expect(invLerp(2, 6, 3)).toBe(0.25)
    expect(invLerp(1, 1, 5)).toBe(0)
  })

  it('rounds without negative zero', () => {
    expect(roundTo(1.23456, 2)).toBe(1.23)
    expect(Object.is(roundTo(-0.0001, 2), 0)).toBe(true)
  })

  it('snaps to a step', () => {
    expect(snap(1.26, 0.25)).toBe(1.25)
    expect(snap(7, 5, 1)).toBe(6)
    expect(snap(3.3, 0)).toBe(3.3)
  })

  it('builds ranges', () => {
    expect(linspace(0, 1, 5)).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(range(2, 5)).toEqual([2, 3, 4])
    expect(range(5, 2)).toEqual([])
  })

  it('formats numbers for readouts', () => {
    expect(formatNumber(2)).toBe('2')
    expect(formatNumber(2.5)).toBe('2.5')
    expect(formatNumber(-1.256)).toBe('−1.26')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(Infinity)).toBe('∞')
    expect(formatNumber(NaN)).toBe('undefined')
    expect(formatNumber(123456789)).toBe('1.2e+8')
  })
})
