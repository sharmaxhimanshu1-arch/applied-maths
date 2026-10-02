import { formatNumber } from '@/math/core'

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y) [x, y] = [y, x % y]
  return x || 1
}

/** k/n in lowest terms as TeX, e.g. 6/36 → \frac{1}{6}; whole numbers stay whole. */
export function fracTex(k: number, n: number): string {
  if (n === 0) return '\\text{–}'
  const g = gcd(k, n)
  const [a, b] = [k / g, n / g]
  return b === 1 ? String(a) : `\\tfrac{${a}}{${b}}`
}

/** 0.4567 → "45.7%". */
export function percent(x: number, decimals = 1): string {
  return `${formatNumber(x * 100, decimals)}%`
}
