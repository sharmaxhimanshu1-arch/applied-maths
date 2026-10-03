import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import type { SidesKind, TriangleKind } from './types'

export const fmt = (v: number, d = 2) => formatNumber(Math.abs(v) < 1e-9 ? 0 : v, d)
export const dist = (p: Vec2, q: Vec2) => Math.hypot(p[0] - q[0], p[1] - q[1])
export const deg = (rad: number) => (rad * 180) / Math.PI
export const rad = (d: number) => (d * Math.PI) / 180
/** Direction of q seen from p, in radians. */
export const heading = (p: Vec2, q: Vec2) => Math.atan2(q[1] - p[1], q[0] - p[0])

/** Interior angle at p between the rays to q and r, in degrees. */
export function angleAt(p: Vec2, q: Vec2, r: Vec2) {
  const a = heading(p, q)
  const b = heading(p, r)
  let d = Math.abs(a - b)
  if (d > Math.PI) d = 2 * Math.PI - d
  return deg(d)
}

/**
 * Sides opposite each vertex (a = |BC|, b = |CA|, c = |AB|) and angles at A, B, C.
 * Angles are rounded to whole degrees, nudged so they always add to exactly 180.
 */
export function measureTriangle([A, B, C]: [Vec2, Vec2, Vec2]) {
  const sides: [number, number, number] = [dist(B, C), dist(C, A), dist(A, B)]
  const raw = [angleAt(A, B, C), angleAt(B, C, A), angleAt(C, A, B)]
  const angles = raw.map(Math.round) as [number, number, number]
  const drift = 180 - angles.reduce((s, x) => s + x, 0)
  if (drift !== 0) {
    // Give the rounding error to the angle that was rounded the most.
    const i = raw
      .map((x, j) => (x - angles[j]) * Math.sign(drift))
      .reduce((best, x, j, all) => (x > all[best] ? j : best), 0)
    angles[i] += drift
  }
  return { sides, angles, raw }
}

export function triangleKind(raw: number[]): TriangleKind {
  const big = Math.max(...raw)
  if (Math.abs(big - 90) < 0.6) return 'right'
  return big > 90 ? 'obtuse' : 'acute'
}

export function sidesKind([a, b, c]: number[]): SidesKind {
  const eq = (x: number, y: number) => Math.abs(x - y) < 0.05 * Math.max(x, y)
  if (eq(a, b) && eq(b, c)) return 'equilateral'
  return eq(a, b) || eq(b, c) || eq(a, c) ? 'isosceles' : 'scalene'
}

/** Signed area of a triangle (positive when A, B, C run anticlockwise). */
export const signedArea = ([A, B, C]: [Vec2, Vec2, Vec2]) =>
  ((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2

/** Snap to a half-unit grid inside a box. */
export const snapHalf =
  (lo: number, hi: number, loY = lo, hiY = hi) =>
  ([x, y]: Vec2): Vec2 => [
    Math.min(hi, Math.max(lo, Math.round(x * 2) / 2)),
    Math.min(hiY, Math.max(loY, Math.round(y * 2) / 2)),
  ]

export const COLORS = {
  a: 'var(--c-blue)',
  b: 'var(--c-orange)',
  c: 'var(--c-aqua)',
  d: 'var(--c-violet)',
}
