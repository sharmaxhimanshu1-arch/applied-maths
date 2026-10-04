import { integrate } from '@/math/calculus'

export type Wave = 'square' | 'sawtooth' | 'triangle'

export const TAU = 2 * Math.PI

/** The target waves, period 2π, height ±1. */
export const TARGET: Record<Wave, (x: number) => number> = {
  square: (x) => (((x % TAU) + TAU) % TAU < Math.PI ? 1 : -1),
  sawtooth: (x) => {
    const t = (((x + Math.PI) % TAU) + TAU) % TAU
    return t / Math.PI - 1
  },
  triangle: (x) => {
    const t = (((x + Math.PI / 2) % TAU) + TAU) % TAU
    return t < Math.PI ? (2 * t) / Math.PI - 1 : 3 - (2 * t) / Math.PI
  },
}

/** The i-th nonzero sine term (frequency and amplitude) of each wave's Fourier series. */
export function term(wave: Wave, i: number): { freq: number; amp: number } {
  if (wave === 'square') {
    const k = 2 * i + 1
    return { freq: k, amp: 4 / (Math.PI * k) }
  }
  if (wave === 'sawtooth') {
    const k = i + 1
    return { freq: k, amp: ((k % 2 ? 1 : -1) * 2) / (Math.PI * k) }
  }
  const k = 2 * i + 1
  return { freq: k, amp: ((i % 2 ? -1 : 1) * 8) / (Math.PI * Math.PI * k * k) }
}

export const terms = (wave: Wave, n: number) => Array.from({ length: n }, (_, i) => term(wave, i))

/** The sum of the first n nonzero terms. */
export function partial(wave: Wave, n: number) {
  const ts = terms(wave, n)
  return (x: number) => ts.reduce((s, t) => s + t.amp * Math.sin(t.freq * x), 0)
}

/** Root-mean-square gap between the partial sum and the target over one period. */
export function rmsError(wave: Wave, n: number) {
  const f = partial(wave, n)
  const samples = 800
  let s = 0
  for (let i = 0; i < samples; i++) {
    const x = ((i + 0.5) / samples) * TAU
    s += (f(x) - TARGET[wave](x)) ** 2
  }
  return Math.sqrt(s / samples)
}

/** Highest point of the partial sum (the Gibbs overshoot shows up as a peak above 1). */
export function peak(wave: Wave, n: number) {
  const f = partial(wave, n)
  let best = -Infinity
  for (let i = 0; i <= 2000; i++) best = Math.max(best, f((i / 2000) * TAU))
  return best
}

/** b_k = (1/π) ∫₀^{2π} f(x) sin(kx) dx, computed numerically on each smooth half. */
export function sineCoefficient(f: (x: number) => number, k: number): number {
  const g = (x: number) => f(x) * Math.sin(k * x)
  const eps = 1e-9
  const b =
    (integrate(g, eps, Math.PI - eps, 2000) + integrate(g, Math.PI + eps, TAU - eps, 2000)) /
    Math.PI
  // Even harmonics cancel exactly; don't let rounding noise show up as 1e-17.
  return Math.abs(b) < 1e-9 ? 0 : b
}
