/** Small exact helpers for the algebra and functions labs. */

/** A number ready to substitute into TeX: negatives get brackets, e.g. (-3). */
export const paren = (x: number) => (x < 0 ? `(${x})` : `${x}`)

/** ax + b written the way a person would: 'x', '-2x + 3', '4', '0'. */
export function linearTex(a: number, b: number, v = 'x'): string {
  const xTerm = a === 0 ? '' : a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`
  if (!xTerm) return `${b}`
  if (b === 0) return xTerm
  return `${xTerm} ${b > 0 ? '+' : '-'} ${Math.abs(b)}`
}

/** How many tiles cancel when p and q tiles of the same kind are pooled (p, q may be negative). */
export const zeroPairs = (p: number, q: number) =>
  p * q < 0 ? Math.min(Math.abs(p), Math.abs(q)) : 0

/** The quadrant (1–4) a point lies in, or 0 on an axis. */
export function quadrant(x: number, y: number): 0 | 1 | 2 | 3 | 4 {
  if (x === 0 || y === 0) return 0
  if (x > 0) return y > 0 ? 1 : 4
  return y > 0 ? 2 : 3
}

export type Comparison = '<' | '<=' | '>' | '>='

export function compare(a: number, op: Comparison, b: number): boolean {
  switch (op) {
    case '<':
      return a < b
    case '<=':
      return a <= b
    case '>':
      return a > b
    case '>=':
      return a >= b
  }
}

/** The comparison you get after multiplying both sides by a negative number. */
const FLIPPED: Record<Comparison, Comparison> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }

export const flip = (op: Comparison): Comparison => FLIPPED[op]

export const COMPARISON_TEX: Record<Comparison, string> = {
  '<': '<',
  '<=': '\\le',
  '>': '>',
  '>=': '\\ge',
}

/**
 * The part of the plane above (or below) the line y = mx + b, as a polygon to shade. It runs well
 * past the window on every side (the plot clips it), so the shaded edge always follows the line.
 */
export function halfPlane(
  m: number,
  b: number,
  above: boolean,
  view: { xMin: number; xMax: number; yMin: number; yMax: number },
): [number, number][] {
  const pad = 2 * (view.xMax - view.xMin + view.yMax - view.yMin)
  const [x0, x1] = [view.xMin - pad, view.xMax + pad]
  const [y0, y1] = [m * x0 + b, m * x1 + b]
  const edge = above ? Math.max(y0, y1, view.yMax) + pad : Math.min(y0, y1, view.yMin) - pad
  return [
    [x0, y0],
    [x1, y1],
    [x1, edge],
    [x0, edge],
  ]
}

/** A polynomial as coefficients, lowest power first: [c0, c1, c2] is c0 + c1·x + c2·x². */
export type Poly = readonly number[]

export const polyEval = (p: Poly, x: number) => p.reduceRight((acc, c) => acc * x + c, 0)

/** The degree, ignoring zero leading coefficients (the zero polynomial has degree −1). */
export function polyDegree(p: Poly): number {
  for (let i = p.length - 1; i >= 0; i--) if (p[i] !== 0) return i
  return -1
}

export function polyMul(p: Poly, q: Poly): number[] {
  const out = Array<number>(Math.max(0, p.length + q.length - 1)).fill(0)
  p.forEach((a, i) => q.forEach((b, j) => (out[i + j] += a * b)))
  return out
}

/** A polynomial in TeX, highest power first: '2x^{3} - x + 4'. */
export function polyTex(p: Poly, v = 'x'): string {
  const terms: string[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]
    if (c === 0) continue
    const mag = Math.abs(c)
    const power = i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`
    const coeff = i > 0 && mag === 1 ? '' : `${mag}`
    const sign = c < 0 ? '-' : '+'
    terms.push(
      terms.length === 0 ? `${c < 0 ? '-' : ''}${coeff}${power}` : `${sign} ${coeff}${power}`,
    )
  }
  return terms.length ? terms.join(' ') : '0'
}

/** Where y = m1·x + b1 meets y = m2·x + b2: one point, none (parallel), or the same line. */
export function lineMeet(
  m1: number,
  b1: number,
  m2: number,
  b2: number,
): { kind: 'one'; x: number; y: number } | { kind: 'none' } | { kind: 'same' } {
  if (m1 === m2) return b1 === b2 ? { kind: 'same' } : { kind: 'none' }
  const x = (b2 - b1) / (m1 - m2)
  return { kind: 'one', x, y: m1 * x + b1 }
}
