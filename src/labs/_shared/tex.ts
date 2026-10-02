import { formatNumber } from '@/math/core'
import type { Mat2, Vec2 } from '@/math/linalg'

/** Number for KaTeX: ASCII minus, trimmed decimals. */
export function num(x: number, decimals = 2): string {
  return formatNumber(x, decimals).replace('−', '-')
}

/** Column vector in KaTeX. */
export function vec(v: Vec2, decimals = 2): string {
  return `\\begin{bmatrix} ${num(v[0], decimals)} \\\\ ${num(v[1], decimals)} \\end{bmatrix}`
}

/** 2×2 matrix in KaTeX. */
export function mat(m: Mat2, decimals = 2): string {
  return `\\begin{bmatrix} ${num(m[0], decimals)} & ${num(m[1], decimals)} \\\\ ${num(m[2], decimals)} & ${num(m[3], decimals)} \\end{bmatrix}`
}

/** "+ 3" / "− 3" for building expressions like y = 2x + 3. */
export function signed(x: number, decimals = 2): string {
  return x < 0 ? `- ${num(-x, decimals)}` : `+ ${num(x, decimals)}`
}

/** Shared colours so every lab speaks the same visual language. */
export const COLORS = {
  u: 'var(--c-blue)',
  v: 'var(--c-orange)',
  w: 'var(--c-aqua)',
  result: 'var(--c-magenta)',
  i: 'var(--c-green)',
  j: 'var(--c-red)',
  target: 'var(--c-violet)',
} as const
