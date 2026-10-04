import { describe, expect, it } from 'vitest'
import { after, nextState, spread, startAt, stationary2, stepDist, twoState } from './markov'

describe('markov helpers', () => {
  it('steps a distribution by the transition matrix', () => {
    const P = twoState(0.3, 0.4)
    expect(stepDist([1, 0], P)).toEqual([0.7, 0.3])
    const two = after([1, 0], P, 2)
    expect(two[0]).toBeCloseTo(0.61, 12)
  })

  it('converges to b / (a + b) from any start', () => {
    const P = twoState(0.2, 0.5)
    const pi = stationary2(0.2, 0.5)!
    expect(pi).toBeCloseTo(5 / 7, 12)
    expect(after([1, 0], P, 60)[0]).toBeCloseTo(pi, 9)
    expect(after([0, 1], P, 60)[0]).toBeCloseTo(pi, 9)
    expect(stationary2(0, 0)).toBeNull()
  })

  it('a cycle never settles', () => {
    const cycle = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ]
    const starts = [0, 1, 2].map((i) => after(startAt(i, 3), cycle, 50))
    expect(spread(starts)).toBe(1)
  })

  it('samples the next state from a row', () => {
    expect(nextState([0.2, 0.8], 0.1)).toBe(0)
    expect(nextState([0.2, 0.8], 0.5)).toBe(1)
    expect(nextState([0.5, 0.5], 0.9999)).toBe(1)
  })
})
