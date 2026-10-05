/** Two-set Venn geometry and region helpers (regions are keyed by membership bits: '10' = A only). */

export type Region = '10' | '11' | '01' | '00'
export const REGIONS: Region[] = ['10', '11', '01', '00']

export const VENN = {
  w: 400,
  h: 250,
  universe: { x: 8, y: 8, w: 384, h: 234 },
  a: { cx: 155, cy: 125, r: 92 },
  b: { cx: 245, cy: 125, r: 92 },
}

const inside = (c: { cx: number; cy: number; r: number }, x: number, y: number) =>
  (x - c.cx) ** 2 + (y - c.cy) ** 2 < (c.r - 9) ** 2
const outside = (c: { cx: number; cy: number; r: number }, x: number, y: number) =>
  (x - c.cx) ** 2 + (y - c.cy) ** 2 > (c.r + 9) ** 2

/** The region a point is in, or null when it is too close to a circle's edge to place a dot. */
export function regionAt(x: number, y: number): Region | null {
  const inA = inside(VENN.a, x, y)
  const inB = inside(VENN.b, x, y)
  const outA = outside(VENN.a, x, y)
  const outB = outside(VENN.b, x, y)
  if (inA && inB) return '11'
  if (inA && outB) return '10'
  if (inB && outA) return '01'
  if (outA && outB) return '00'
  return null
}

const CENTRES: Record<Region, [number, number]> = {
  '10': [108, 125],
  '11': [200, 125],
  '01': [292, 125],
  '00': [40, 40],
}

/** Dot positions in each region, nearest the region's centre first. */
export const SLOTS: Record<Region, [number, number][]> = (() => {
  const out: Record<Region, [number, number][]> = { '10': [], '11': [], '01': [], '00': [] }
  for (let y = 22; y <= 230; y += 15)
    for (let x = 22; x <= 380; x += 15) {
      const r = regionAt(x, y)
      if (r) out[r].push([x, y])
    }
  for (const r of REGIONS) {
    const [cx, cy] = CENTRES[r]
    out[r].sort(
      (p, q) => (p[0] - cx) ** 2 + (p[1] - cy) ** 2 - ((q[0] - cx) ** 2 + (q[1] - cy) ** 2),
    )
  }
  return out
})()

export type SetOp = 'A' | 'B' | 'and' | 'or' | 'notA' | 'aMinusB'

/** Which regions an operation shades. */
export const OP_REGIONS: Record<SetOp, Region[]> = {
  A: ['10', '11'],
  B: ['11', '01'],
  and: ['11'],
  or: ['10', '11', '01'],
  notA: ['01', '00'],
  aMinusB: ['10'],
}
