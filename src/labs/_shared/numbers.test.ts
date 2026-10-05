import { describe, expect, it } from 'vitest'
import {
  decimalExpansion,
  divisorCount,
  factorPowers,
  factorTex,
  nearestFraction,
  primeFactors,
  squareSplit,
} from './numbers'

describe('number helpers', () => {
  it('factorises', () => {
    expect(primeFactors(60)).toEqual([2, 2, 3, 5])
    expect(primeFactors(97)).toEqual([97])
    expect(factorPowers(72)).toEqual([
      [2, 3],
      [3, 2],
    ])
    expect(factorTex(72)).toBe('2^{3} \\times 3^{2}')
    expect(divisorCount(60)).toBe(12)
  })

  it('pulls square factors out of a root', () => {
    expect(squareSplit(72)).toEqual({ k: 6, m: 2 })
    expect(squareSplit(49)).toEqual({ k: 7, m: 1 })
    expect(squareSplit(30)).toEqual({ k: 1, m: 30 })
  })

  it('finds terminating and repeating decimals', () => {
    expect(decimalExpansion(3, 8)).toMatchObject({ digits: [3, 7, 5], period: 0 })
    expect(decimalExpansion(1, 7)).toMatchObject({
      digits: [1, 4, 2, 8, 5, 7],
      repeatStart: 0,
      period: 6,
    })
    expect(decimalExpansion(1, 6)).toMatchObject({ digits: [1, 6], repeatStart: 1, period: 1 })
    expect(decimalExpansion(7, 4)).toMatchObject({ whole: 1, digits: [7, 5], period: 0 })
  })

  it('approximates with fractions', () => {
    expect(nearestFraction(Math.SQRT2, 12).p).toBe(17)
    expect(nearestFraction(Math.SQRT2, 29).error).toBeLessThan(0.001)
  })
})
