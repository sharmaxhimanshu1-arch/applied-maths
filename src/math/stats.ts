/** Descriptive statistics, regression and common distributions. */

export function sum(xs: readonly number[]): number {
  let s = 0
  for (const x of xs) s += x
  return s
}

export function mean(xs: readonly number[]): number {
  return xs.length ? sum(xs) / xs.length : NaN
}

export function median(xs: readonly number[]): number {
  if (!xs.length) return NaN
  const s = [...xs].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** All most-frequent values (after rounding to `decimals`). Empty if every value is unique. */
export function modes(xs: readonly number[], decimals = 6): number[] {
  const counts = new Map<number, number>()
  for (const x of xs) {
    const k = Number(x.toFixed(decimals))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const max = Math.max(0, ...counts.values())
  if (max <= 1) return []
  return [...counts.entries()]
    .filter(([, c]) => c === max)
    .map(([v]) => v)
    .sort((a, b) => a - b)
}

/** Population variance (divide by n); pass `sample` for n − 1. */
export function variance(xs: readonly number[], sample = false): number {
  const n = xs.length
  if (n < (sample ? 2 : 1)) return NaN
  const m = mean(xs)
  let s = 0
  for (const x of xs) s += (x - m) ** 2
  return s / (sample ? n - 1 : n)
}

export function std(xs: readonly number[], sample = false): number {
  return Math.sqrt(variance(xs, sample))
}

export function covariance(xs: readonly number[], ys: readonly number[], sample = false): number {
  const n = Math.min(xs.length, ys.length)
  if (n < (sample ? 2 : 1)) return NaN
  const mx = mean(xs.slice(0, n))
  const my = mean(ys.slice(0, n))
  let s = 0
  for (let i = 0; i < n; i++) s += (xs[i] - mx) * (ys[i] - my)
  return s / (sample ? n - 1 : n)
}

export function correlation(xs: readonly number[], ys: readonly number[]): number {
  return covariance(xs, ys) / (std(xs) * std(ys))
}

export interface LinearFit {
  slope: number
  intercept: number
  r: number
  r2: number
  /** Sum of squared residuals. */
  sse: number
}

/** Ordinary least squares fit y ≈ slope·x + intercept. */
export function linearRegression(xs: readonly number[], ys: readonly number[]): LinearFit {
  const vx = variance(xs)
  const slope = vx === 0 ? 0 : covariance(xs, ys) / vx
  const intercept = mean(ys) - slope * mean(xs)
  const r = vx === 0 || variance(ys) === 0 ? 0 : correlation(xs, ys)
  return { slope, intercept, r, r2: r * r, sse: sse(xs, ys, slope, intercept) }
}

export function sse(
  xs: readonly number[],
  ys: readonly number[],
  slope: number,
  intercept: number,
) {
  let s = 0
  for (let i = 0; i < xs.length; i++) s += (ys[i] - (slope * xs[i] + intercept)) ** 2
  return s
}

/** Counts of values in equal-width bins over [min, max]. */
export function histogram(xs: readonly number[], min: number, max: number, bins: number) {
  const counts = Array.from({ length: bins }, () => 0)
  const w = (max - min) / bins
  for (const x of xs) {
    if (x < min || x > max) continue
    counts[Math.min(bins - 1, Math.floor((x - min) / w))]++
  }
  return { counts, width: w, edges: counts.map((_, i) => min + i * w) }
}

// ── Distributions ────────────────────────────────────────────────────────

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}

/** Error function (Abramowitz–Stegun 7.1.26, |error| < 1.5e-7). */
export function erf(x: number): number {
  const sign = Math.sign(x)
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x)
  return sign * y
}

export function normalCdf(x: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)))
}

export function factorial(n: number): number {
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}

/** n choose k, computed multiplicatively to stay exact for moderate n. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  const kk = Math.min(k, n - k)
  let c = 1
  for (let i = 1; i <= kk; i++) c = (c * (n - kk + i)) / i
  return Math.round(c)
}

export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0
  // Work in logs so large n does not overflow.
  const logC = logChoose(n, k)
  const logP = k === 0 ? 0 : k * Math.log(p)
  const logQ = n - k === 0 ? 0 : (n - k) * Math.log(1 - p)
  if (p === 0) return k === 0 ? 1 : 0
  if (p === 1) return k === n ? 1 : 0
  return Math.exp(logC + logP + logQ)
}

function logChoose(n: number, k: number): number {
  let s = 0
  const kk = Math.min(k, n - k)
  for (let i = 1; i <= kk; i++) s += Math.log(n - kk + i) - Math.log(i)
  return s
}

/** Shannon entropy in bits of a probability vector. */
export function entropyBits(ps: readonly number[]): number {
  let h = 0
  for (const p of ps) if (p > 0) h -= p * Math.log2(p)
  return h
}
