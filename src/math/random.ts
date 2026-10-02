/** Seeded pseudo-random numbers (mulberry32): simulations are repeatable and testable. */
export interface Rng {
  /** Uniform in [0, 1). */
  next(): number
  uniform(min: number, max: number): number
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number
  bernoulli(p: number): boolean
  /** Standard normal via Box–Muller (scaled to mean/sd). */
  normal(mean?: number, sd?: number): number
  /** Index drawn with probability proportional to its weight. */
  weighted(weights: readonly number[]): number
  shuffle<T>(items: T[]): T[]
}

export function createRng(seed = Date.now()): Rng {
  let state = seed >>> 0 || 0x9e3779b9
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  let spare: number | null = null
  const rng: Rng = {
    next,
    uniform: (min, max) => min + (max - min) * next(),
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    bernoulli: (p) => next() < p,
    normal(mean = 0, sd = 1) {
      if (spare !== null) {
        const z = spare
        spare = null
        return mean + sd * z
      }
      let u = 0
      while (u === 0) u = next()
      const v = next()
      const r = Math.sqrt(-2 * Math.log(u))
      spare = r * Math.sin(2 * Math.PI * v)
      return mean + sd * r * Math.cos(2 * Math.PI * v)
    },
    weighted(weights) {
      const total = weights.reduce((a, b) => a + b, 0)
      let x = next() * total
      for (let i = 0; i < weights.length; i++) {
        x -= weights[i]
        if (x < 0) return i
      }
      return weights.length - 1
    },
    shuffle(items) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[items[i], items[j]] = [items[j], items[i]]
      }
      return items
    },
  }
  return rng
}
