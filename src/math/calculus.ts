/** Numerical calculus used by visualizations (not symbolic). */

export type Fn = (x: number) => number

/** Central-difference derivative. */
export function derivative(f: Fn, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h)
}

export function secondDerivative(f: Fn, x: number, h = 1e-3): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h)
}

/** Composite Simpson's rule (n is rounded up to an even number). */
export function integrate(f: Fn, a: number, b: number, n = 400): number {
  if (a === b) return 0
  const m = n % 2 === 0 ? n : n + 1
  const h = (b - a) / m
  let sum = f(a) + f(b)
  for (let i = 1; i < m; i++) sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4)
  return (sum * h) / 3
}

export type RiemannMethod = 'left' | 'right' | 'mid' | 'trap'

export interface RiemannSlice {
  x0: number
  x1: number
  /** Height used for the rectangle (for 'trap', the two edge heights). */
  y0: number
  y1: number
}

/** Riemann sum plus the slices used, so they can be drawn. */
export function riemann(f: Fn, a: number, b: number, n: number, method: RiemannMethod) {
  const slices: RiemannSlice[] = []
  const dx = (b - a) / n
  let sum = 0
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx
    const x1 = x0 + dx
    if (method === 'trap') {
      const y0 = f(x0)
      const y1 = f(x1)
      sum += ((y0 + y1) / 2) * dx
      slices.push({ x0, x1, y0, y1 })
    } else {
      const x = method === 'left' ? x0 : method === 'right' ? x1 : (x0 + x1) / 2
      const y = f(x)
      sum += y * dx
      slices.push({ x0, x1, y0: y, y1: y })
    }
  }
  return { sum, slices }
}

/** Refine a bracketed root with bisection. */
export function bisect(f: Fn, a: number, b: number, iterations = 60): number {
  let lo = a
  let hi = b
  let flo = f(lo)
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2
    const fm = f(mid)
    if (fm === 0) return mid
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid
      flo = fm
    } else hi = mid
  }
  return (lo + hi) / 2
}

/** Roots on [a, b]: sign changes refined by bisection, plus touching roots (local |f| minima ≈ 0). */
export function findRoots(f: Fn, a: number, b: number, samples = 600): number[] {
  const roots: number[] = []
  const dx = (b - a) / samples
  let x0 = a
  let y0 = f(x0)
  for (let i = 1; i <= samples; i++) {
    const x1 = a + i * dx
    const y1 = f(x1)
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0) roots.push(x0)
      else if (Math.sign(y0) !== Math.sign(y1) && y1 !== 0) {
        // Skip sign flips across a vertical asymptote (values blow up instead of crossing).
        const r = bisect(f, x0, x1)
        if (Math.abs(f(r)) < 1e-6 * Math.max(1, Math.abs(y0), Math.abs(y1))) roots.push(r)
      }
    }
    x0 = x1
    y0 = y1
  }
  if (y0 === 0) roots.push(x0)
  // Touching roots such as x² at 0 never change sign.
  for (const m of findExtrema(f, a, b, samples)) {
    if (Math.abs(f(m.x)) < 1e-7 && !roots.some((r) => Math.abs(r - m.x) < dx)) roots.push(m.x)
  }
  return dedupe(
    roots.sort((p, q) => p - q),
    dx / 2,
  )
}

export interface Extremum {
  x: number
  y: number
  kind: 'max' | 'min'
}

/** Local maxima and minima on (a, b), found where the derivative changes sign. */
export function findExtrema(f: Fn, a: number, b: number, samples = 600): Extremum[] {
  const out: Extremum[] = []
  const dx = (b - a) / samples
  const df = (x: number) => derivative(f, x, dx / 10)
  let x0 = a + dx
  let d0 = df(x0)
  for (let i = 2; i < samples; i++) {
    const x1 = a + i * dx
    const d1 = df(x1)
    if (Number.isFinite(d0) && Number.isFinite(d1) && Math.sign(d0) !== Math.sign(d1)) {
      const x = bisect(df, x0, x1, 50)
      const y = f(x)
      if (Number.isFinite(y)) out.push({ x, y, kind: d0 > 0 ? 'max' : 'min' })
    }
    x0 = x1
    d0 = d1
  }
  return out
}

export function newtonStep(f: Fn, x: number): number {
  return x - f(x) / derivative(f, x)
}

function dedupe(xs: number[], eps: number): number[] {
  const out: number[] = []
  for (const x of xs) if (!out.length || Math.abs(x - out[out.length - 1]) > eps) out.push(x)
  return out
}
