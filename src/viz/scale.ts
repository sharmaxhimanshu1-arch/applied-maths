/** Coordinate-system maths for plots: windows, aspect, ticks. */

export interface View {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface Transform {
  view: View
  width: number
  height: number
  /** Pixels per unit along each axis. */
  kx: number
  ky: number
  sx(x: number): number
  sy(y: number): number
  ix(px: number): number
  iy(py: number): number
}

/** Expand the shorter side of the window so one unit is the same length on both axes. */
export function equalAspect(view: View, width: number, height: number): View {
  const upp = Math.max((view.xMax - view.xMin) / width, (view.yMax - view.yMin) / height)
  const cx = (view.xMin + view.xMax) / 2
  const cy = (view.yMin + view.yMax) / 2
  const hw = (upp * width) / 2
  const hh = (upp * height) / 2
  return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh }
}

export function makeTransform(view: View, width: number, height: number): Transform {
  const kx = width / (view.xMax - view.xMin)
  const ky = height / (view.yMax - view.yMin)
  return {
    view,
    width,
    height,
    kx,
    ky,
    sx: (x) => (x - view.xMin) * kx,
    sy: (y) => height - (y - view.yMin) * ky,
    ix: (px) => view.xMin + px / kx,
    iy: (py) => view.yMin + (height - py) / ky,
  }
}

/** A "nice" step (1, 2 or 5 × 10ⁿ) giving roughly `target` intervals across `span`. */
export function niceStep(span: number, target: number): number {
  const raw = span / Math.max(1, target)
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag
}

export function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = []
  const start = Math.ceil(min / step - 1e-9) * step
  for (let v = start; v <= max + 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  return out
}

/** Label for multiples of π: π/2, π, 3π/2, −π … */
export function piLabel(value: number, step: number): string {
  const q = Math.round(value / step)
  const denom = Math.round(Math.PI / step)
  if (q === 0) return '0'
  const g = gcd(Math.abs(q), denom)
  const num = q / g
  const den = denom / g
  const n = Math.abs(num) === 1 ? (num < 0 ? '−π' : 'π') : `${num < 0 ? '−' : ''}${Math.abs(num)}π`
  return den === 1 ? n : `${n}/${den}`
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/** Pan a window by a delta in math units. */
export function panView(v: View, dx: number, dy: number): View {
  return { xMin: v.xMin + dx, xMax: v.xMax + dx, yMin: v.yMin + dy, yMax: v.yMax + dy }
}

/** Zoom a window by `factor` (<1 zooms in) keeping the point (cx, cy) fixed. */
export function zoomView(v: View, factor: number, cx: number, cy: number): View {
  return {
    xMin: cx + (v.xMin - cx) * factor,
    xMax: cx + (v.xMax - cx) * factor,
    yMin: cy + (v.yMin - cy) * factor,
    yMax: cy + (v.yMax - cy) * factor,
  }
}
