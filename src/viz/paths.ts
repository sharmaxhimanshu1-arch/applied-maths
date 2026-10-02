import type { Fn } from '@/math/calculus'
import type { Transform } from './scale'

/** Pixel coordinate as a short string (clamped so huge values never break the path). */
export const f1 = (n: number) => (Math.abs(n) > 1e5 ? Math.sign(n) * 1e5 : n).toFixed(1)

/**
 * Sample a function across the visible window (about one point per 1.5 px), lifting the pen at
 * non-finite values and at jumps bigger than twice the window height (vertical asymptotes).
 */
export function functionPath(
  f: Fn,
  t: Transform,
  domain?: readonly [number, number],
  samples?: number,
): string {
  const a = Math.max(t.view.xMin, domain?.[0] ?? -Infinity)
  const b = Math.min(t.view.xMax, domain?.[1] ?? Infinity)
  if (!(b > a)) return ''
  const n = samples ?? Math.max(60, Math.ceil(((b - a) * t.kx) / 1.5))
  const span = t.view.yMax - t.view.yMin
  const lo = t.view.yMin - span * 3
  const hi = t.view.yMax + span * 3
  let d = ''
  let pen = false
  let prev = 0
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n
    const y = f(x)
    if (!Number.isFinite(y)) {
      pen = false
      continue
    }
    if (pen && Math.abs(y - prev) > span * 2 && (y > hi || y < lo || prev > hi || prev < lo))
      pen = false
    const yc = Math.min(hi, Math.max(lo, y))
    d += `${pen ? 'L' : 'M'}${f1(t.sx(x))},${f1(t.sy(yc))}`
    pen = true
    prev = y
  }
  return d
}
