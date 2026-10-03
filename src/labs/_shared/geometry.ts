import type { Vec2 } from '@/math/linalg'

export const DEG = Math.PI / 180

export const dist = (p: Vec2, q: Vec2) => Math.hypot(q[0] - p[0], q[1] - p[1])

/** Direction of the vector p → q, in radians (−π, π]. */
export const heading = (p: Vec2, q: Vec2) => Math.atan2(q[1] - p[1], q[0] - p[0])

/** The (unsigned) angle at vertex q between rays q→p and q→r, in degrees, 0…180. */
export function angleAt(p: Vec2, q: Vec2, r: Vec2): number {
  const a: Vec2 = [p[0] - q[0], p[1] - q[1]]
  const b: Vec2 = [r[0] - q[0], r[1] - q[1]]
  const la = Math.hypot(a[0], a[1])
  const lb = Math.hypot(b[0], b[1])
  if (!la || !lb) return 0
  const c = (a[0] * b[0] + a[1] * b[1]) / (la * lb)
  return Math.acos(Math.max(-1, Math.min(1, c))) / DEG
}

/** Counter-clockwise angle from ray q→p to ray q→r, in degrees, 0…360. */
export function turnAngle(p: Vec2, q: Vec2, r: Vec2): number {
  const d = (heading(q, r) - heading(q, p)) / DEG
  return ((d % 360) + 360) % 360
}

/** Signed area by the shoelace formula (positive when counter-clockwise). */
export function signedArea(pts: readonly Vec2[]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    s += x1 * y2 - x2 * y1
  }
  return s / 2
}

/** Arc start/end (radians) for the interior angle at q, for drawing with AngleArc. */
export function interiorArc(p: Vec2, q: Vec2, r: Vec2): { from: number; to: number } {
  const a = heading(q, p)
  const b = heading(q, r)
  let sweep = b - a
  while (sweep <= -Math.PI) sweep += 2 * Math.PI
  while (sweep > Math.PI) sweep -= 2 * Math.PI
  return sweep >= 0 ? { from: a, to: b } : { from: b, to: a }
}

/** Round to a few decimals so snapped geometry compares exactly. */
export const tidy = (x: number, d = 6) => Math.round(x * 10 ** d) / 10 ** d
