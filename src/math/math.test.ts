import { describe, expect, it } from 'vitest'
import { derivative, findExtrema, findRoots, integrate, riemann } from './calculus'
import { apply, det, eigen2, inverse, mul, project, solve, svd2, type Mat2 } from './linalg'
import { createRng } from './random'
import {
  binomialPmf,
  choose,
  correlation,
  entropyBits,
  histogram,
  linearRegression,
  mean,
  median,
  modes,
  normalCdf,
  std,
  variance,
} from './stats'

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('calculus', () => {
  it('differentiates numerically', () => {
    close(derivative(Math.sin, 0), 1)
    close(
      derivative((x) => x ** 3, 2),
      12,
      1e-5,
    )
  })

  it('integrates with Simpson accuracy', () => {
    close(
      integrate((x) => x * x, 0, 3),
      9,
    )
    close(integrate(Math.sin, 0, Math.PI), 2)
  })

  it('computes Riemann sums the textbook way', () => {
    expect(riemann((x) => x, 0, 1, 4, 'left').sum).toBeCloseTo(0.375)
    expect(riemann((x) => x, 0, 1, 4, 'right').sum).toBeCloseTo(0.625)
    expect(riemann((x) => x, 0, 1, 4, 'mid').sum).toBeCloseTo(0.5)
    expect(riemann((x) => x * x, 0, 1, 2, 'trap').sum).toBeCloseTo(0.375)
    expect(riemann((x) => x, 0, 1, 4, 'left').slices).toHaveLength(4)
  })

  it('finds crossing and touching roots', () => {
    const r = findRoots((x) => x * x - 2, -3, 3)
    expect(r).toHaveLength(2)
    close(r[1], Math.SQRT2)
    const touch = findRoots((x) => (x - 1) ** 2, -3, 3)
    expect(touch).toHaveLength(1)
    close(touch[0], 1, 1e-3)
  })

  it('ignores sign flips across asymptotes', () => {
    expect(findRoots((x) => 1 / x, -2, 2)).toEqual([])
  })

  it('classifies extrema', () => {
    const e = findExtrema((x) => x ** 3 - 3 * x, -3, 3)
    expect(e.map((p) => p.kind)).toEqual(['max', 'min'])
    close(e[0].x, -1, 1e-4)
  })
})

describe('linear algebra', () => {
  const A: Mat2 = [2, 1, 1, 3]

  it('multiplies, inverts and takes determinants', () => {
    expect(det(A)).toBe(5)
    const inv = inverse(A)!
    const id = mul(A, inv)
    id.forEach((v, i) => close(v, [1, 0, 0, 1][i]))
    expect(inverse([1, 2, 2, 4])).toBeNull()
  })

  it('applies a matrix to a vector (columns are images of the basis)', () => {
    expect(apply(A, [1, 0])).toEqual([2, 1])
    expect(apply(A, [0, 1])).toEqual([1, 3])
  })

  it('finds real, complex and repeated eigenvalues', () => {
    const diag = eigen2([2, 0, 0, 3])
    expect(diag.kind === 'real' && diag.values).toEqual([3, 2])

    const rot = eigen2([0, -1, 1, 0])
    expect(rot.kind).toBe('complex')
    if (rot.kind === 'complex') close(rot.im, 1)

    const shear = eigen2([1, 1, 0, 1])
    expect(shear.kind === 'real' && shear.vectors[1]).toBeNull()

    const sym = eigen2(A)
    if (sym.kind !== 'real') throw new Error('expected real')
    // A v = λ v for each eigenpair
    sym.vectors.forEach((v, i) => {
      const av = apply(A, v!)
      close(av[0], sym.values[i] * v![0])
      close(av[1], sym.values[i] * v![1])
    })
  })

  it('decomposes with SVD and reconstructs', () => {
    const M: Mat2 = [3, 1, -1, 2]
    const { u, sigma, v } = svd2(M)
    expect(sigma[0]).toBeGreaterThanOrEqual(sigma[1])
    const s: Mat2 = [sigma[0], 0, 0, sigma[1]]
    const back = mul(mul(u, s), [v[0], v[2], v[1], v[3]])
    back.forEach((x, i) => close(x, M[i], 1e-9))
  })

  it('projects and solves systems', () => {
    expect(project([2, 3], [1, 0])).toEqual([2, 0])
    const x = solve(
      [
        [2, 1],
        [1, 3],
      ],
      [3, 5],
    )!
    close(x[0], 0.8)
    close(x[1], 1.4)
    expect(
      solve(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2],
      ),
    ).toBeNull()
  })
})

describe('random', () => {
  it('is repeatable for a seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)])
  })

  it('produces sensible distributions', () => {
    const rng = createRng(7)
    const normals = Array.from({ length: 20000 }, () => rng.normal(10, 2))
    close(mean(normals), 10, 0.06)
    close(std(normals), 2, 0.06)
    const dice = Array.from({ length: 6000 }, () => rng.int(1, 6))
    expect(Math.min(...dice)).toBe(1)
    expect(Math.max(...dice)).toBe(6)
    close(mean(dice), 3.5, 0.08)
  })
})

describe('statistics', () => {
  it('describes data', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5)
    expect(median([5, 1, 3])).toBe(3)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(modes([1, 2, 2, 3, 3])).toEqual([2, 3])
    expect(modes([1, 2, 3])).toEqual([])
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBe(4)
    expect(std([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
  })

  it('fits a regression line', () => {
    const xs = [0, 1, 2, 3]
    const fit = linearRegression(
      xs,
      xs.map((x) => 2 * x + 1),
    )
    close(fit.slope, 2)
    close(fit.intercept, 1)
    close(fit.r, 1)
    close(fit.sse, 0)
    close(correlation([1, 2, 3], [3, 2, 1]), -1)
  })

  it('bins histograms', () => {
    const h = histogram([0, 0.5, 1, 1.5, 2], 0, 2, 2)
    expect(h.counts).toEqual([2, 3])
  })

  it('computes distribution values', () => {
    close(normalCdf(1.96), 0.975, 1e-3)
    close(normalCdf(0), 0.5)
    expect(choose(10, 3)).toBe(120)
    const total = Array.from({ length: 21 }, (_, k) => binomialPmf(k, 20, 0.3)).reduce(
      (a, b) => a + b,
    )
    close(total, 1)
    close(binomialPmf(0, 5, 0), 1)
    expect(entropyBits([0.5, 0.5])).toBe(1)
    expect(entropyBits([1, 0])).toBe(0)
  })
})
