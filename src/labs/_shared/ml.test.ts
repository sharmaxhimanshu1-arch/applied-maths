import { describe, expect, it } from 'vitest'
import {
  STUDY,
  chain,
  descend1,
  forward,
  initNet,
  lineModel,
  loss1,
  makeData,
  score,
  sigmoid,
  trainNet,
} from './ml'

describe('logistic helpers', () => {
  it('sigmoid is ½ at 0 and symmetric', () => {
    expect(sigmoid(0)).toBe(0.5)
    expect(sigmoid(2) + sigmoid(-2)).toBeCloseTo(1, 12)
  })

  it('gradient descent lowers the study-data loss', () => {
    const before = loss1(STUDY, 0.5, -2)
    const [w, b] = descend1(STUDY, 0.5, -2, 3000, 0.2)
    expect(loss1(STUDY, w, b)).toBeLessThan(before)
    expect(-b / w).toBeGreaterThan(3)
    expect(-b / w).toBeLessThan(5.5)
  })

  it('a line through the gap separates the split data well', () => {
    const data = makeData('split')
    const { accuracy } = score(data, lineModel([-2, 2], [2, -2], 2))
    expect(accuracy).toBeGreaterThan(0.8)
    expect(score(data, lineModel([2, -2], [-2, 2], 2)).accuracy).toBeLessThan(0.2)
  })
})

describe('tiny network', () => {
  it('learns XOR with a few hidden units', () => {
    const data = makeData('xor')
    const net = trainNet(initNet(4, 7), data, 1500)
    expect(score(data, (p) => forward(net, p).out).accuracy).toBeGreaterThan(0.9)
  })

  it('chain-rule gradients match finite differences', () => {
    const eps = 1e-5
    for (const [w1, w2] of [
      [0.5, -1],
      [1.5, 2],
      [-0.7, 0.3],
    ]) {
      const c = chain(w1, w2)
      const n1 = (chain(w1 + eps, w2).loss - chain(w1 - eps, w2).loss) / (2 * eps)
      const n2 = (chain(w1, w2 + eps).loss - chain(w1, w2 - eps).loss) / (2 * eps)
      expect(c.dLdw1).toBeCloseTo(n1, 6)
      expect(c.dLdw2).toBeCloseTo(n2, 6)
    }
  })
})
