/** Small numeric helpers shared by visualizations, labs and tools. */

export const TAU = Math.PI * 2

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Inverse of lerp: where `value` sits between a and b (0 at a, 1 at b). */
export function invLerp(a: number, b: number, value: number): number {
  return a === b ? 0 : (value - a) / (b - a)
}

/** Round to a number of decimal places, avoiding `-0` in output. */
export function roundTo(value: number, decimals = 2): number {
  const f = 10 ** decimals
  const r = Math.round(value * f) / f
  return Object.is(r, -0) ? 0 : r
}

/** Snap a value to the nearest multiple of `step` (measured from `origin`). */
export function snap(value: number, step: number, origin = 0): number {
  if (step <= 0) return value
  return origin + Math.round((value - origin) / step) * step
}

export function approxEqual(a: number, b: number, tolerance = 1e-9): boolean {
  return Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b))
}

/** `count` evenly spaced values from start to end inclusive. */
export function linspace(start: number, end: number, count: number): number[] {
  if (count <= 1) return [start]
  const step = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, i) => start + i * step)
}

/** Integers from start (inclusive) to end (exclusive). */
export function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i)
}

/**
 * Human-friendly number formatting for readouts: trims trailing zeros, uses a real minus sign,
 * and switches to scientific notation for very large/small magnitudes.
 */
export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return Number.isNaN(value) ? 'undefined' : value > 0 ? '∞' : '−∞'
  const abs = Math.abs(value)
  let text: string
  if (abs !== 0 && (abs >= 1e7 || abs < 10 ** -decimals / 2)) {
    text = value.toExponential(Math.max(1, decimals - 1)).replace(/\.?0+e/, 'e')
  } else {
    text = roundTo(value, decimals).toFixed(decimals)
    if (text.includes('.')) text = text.replace(/\.?0+$/, '')
  }
  return text.replace(/^-/, '−')
}
