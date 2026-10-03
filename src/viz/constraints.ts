import { clamp, snap } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import type { Fn } from '@/math/calculus'

/** Building blocks for MovablePoint's `constrain` prop. */
export type Constraint = (p: Vec2) => Vec2

export const snapToGrid =
  (step: number): Constraint =>
  ([x, y]) => [snap(x, step), snap(y, step)]

export const within =
  (xMin: number, xMax: number, yMin: number, yMax: number): Constraint =>
  ([x, y]) => [clamp(x, xMin, xMax), clamp(y, yMin, yMax)]

export const onCircle =
  (center: Vec2, r: number): Constraint =>
  ([x, y]) => {
    const a = Math.atan2(y - center[1], x - center[0])
    return [center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]
  }

/** Slide along a graph: x is free, y follows the function. */
export const onGraph =
  (f: Fn, xMin = -Infinity, xMax = Infinity): Constraint =>
  ([x]) => {
    const cx = clamp(x, xMin, xMax)
    return [cx, f(cx)]
  }

export const horizontal =
  (y: number): Constraint =>
  ([x]) => [x, y]

export const vertical =
  (x: number): Constraint =>
  ([, y]) => [x, y]

/** Apply constraints left to right. */
export const compose =
  (...cs: Constraint[]): Constraint =>
  (p) =>
    cs.reduce((acc, c) => c(acc), p)

/** Snap to special values when close (e.g. integers, a target), otherwise leave it free. */
export const magnet =
  (targets: readonly Vec2[], radius: number): Constraint =>
  (p) => {
    for (const q of targets) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < radius) return q
    return p
  }
