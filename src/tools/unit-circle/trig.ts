import { formatNumber } from '@/math/core'

/** Exact values for the special angles (multiples of 30° and 45°). */
const EXACT: Record<number, [string, string]> = {
  0: ['1', '0'],
  30: ['\\tfrac{\\sqrt3}{2}', '\\tfrac12'],
  45: ['\\tfrac{\\sqrt2}{2}', '\\tfrac{\\sqrt2}{2}'],
  60: ['\\tfrac12', '\\tfrac{\\sqrt3}{2}'],
  90: ['0', '1'],
}

export function exactValues(deg: number): [string, string] | null {
  const d = ((Math.round(deg) % 360) + 360) % 360
  if (Math.abs(deg - Math.round(deg)) > 1e-6) return null
  const ref =
    d % 180 === 0
      ? 0
      : d % 90 === 0
        ? 90
        : d <= 90
          ? d
          : d <= 180
            ? 180 - d
            : d <= 270
              ? d - 180
              : 360 - d
  const base = EXACT[ref]
  if (!base) return null
  const sx = d > 90 && d < 270 ? -1 : 1
  const sy = d > 180 && d < 360 ? -1 : 1
  const sign = (s: number, v: string) => (v === '0' ? '0' : s < 0 ? `-${v}` : v)
  return [sign(sx, base[0]), sign(sy, base[1])]
}

export function radToNice(theta: number): string {
  const q = theta / (Math.PI / 12)
  if (Math.abs(q - Math.round(q)) > 1e-6) return formatNumber(theta, 2)
  const n = Math.round(q)
  if (n === 0) return '0'
  const g = gcd(Math.abs(n), 12)
  const num = n / g
  const den = 12 / g
  const top = Math.abs(num) === 1 ? (num < 0 ? '-\\pi' : '\\pi') : `${num}\\pi`
  return den === 1 ? top : `\\tfrac{${top}}{${den}}`
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
