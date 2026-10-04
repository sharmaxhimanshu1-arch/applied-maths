import { describe, expect, it } from 'vitest'
import { TARGET, partial, peak, rmsError, sineCoefficient, term } from './fourier'
import {
  gcd,
  modInverse,
  modPow,
  order,
  powers,
  rsaKey,
  trialDivisions,
  validExponents,
} from './numberTheory'

describe('fourier helpers', () => {
  it('partial sums close in on the target', () => {
    for (const wave of ['square', 'sawtooth', 'triangle'] as const) {
      expect(rmsError(wave, 20)).toBeLessThan(rmsError(wave, 3))
    }
    expect(Math.abs(partial('triangle', 10)(1) - TARGET.triangle(1))).toBeLessThan(0.01)
  })

  it('the square wave overshoots by about 9% of its jump', () => {
    const over = peak('square', 40) - 1
    expect(over).toBeGreaterThan(0.15)
    expect(over).toBeLessThan(0.2)
  })

  it('numerical coefficients match the formula', () => {
    expect(sineCoefficient(TARGET.square, 1)).toBeCloseTo(term('square', 0).amp, 4)
    expect(sineCoefficient(TARGET.square, 3)).toBeCloseTo(term('square', 1).amp, 4)
    expect(sineCoefficient(TARGET.square, 2)).toBeCloseTo(0, 4)
  })
})

describe('number theory helpers', () => {
  it('computes powers, inverses and orders', () => {
    expect(gcd(12, 18)).toBe(6)
    expect(modPow(3, 4, 5)).toBe(1)
    expect(modPow(7, 560, 561)).toBe(1)
    expect(modInverse(3, 40)).toBe(27)
    expect(modInverse(4, 40)).toBeNull()
    expect(powers(2, 7)).toEqual([2, 4, 1, 2, 4, 1, 2])
    expect(order(3, 7)).toBe(6)
    expect(order(2, 6)).toBeNull()
  })

  it('a toy RSA key round-trips every message', () => {
    const [e] = validExponents(120)
    const { n, d } = rsaKey(11, 13, e)
    expect(e).toBe(7)
    expect(d).toBe(103)
    for (let m = 0; m < n; m++) expect(modPow(modPow(m, e, n), d!, n)).toBe(m)
  })

  it('trial division finds the smaller prime', () => {
    expect(trialDivisions(143)).toEqual({ factor: 11, tries: 6 })
    expect(trialDivisions(97).factor).toBe(97)
  })
})
