import { memo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Fn, RiemannSlice } from '@/math/calculus'
import type { Vec2 } from '@/math/linalg'
import { cn } from '@/ui/cn'
import { usePlot } from './context'
import { f1, functionPath } from './paths'

type StrokeProps = {
  color?: string
  width?: number
  dashed?: boolean
  opacity?: number
}

const dash = (dashed?: boolean) => (dashed ? '7 6' : undefined)

export const FunctionGraph = memo(function FunctionGraph({
  fn,
  domain,
  samples,
  color = 'var(--c-blue)',
  width = 2.5,
  dashed,
  opacity = 1,
}: StrokeProps & { fn: Fn; domain?: readonly [number, number]; samples?: number }) {
  const t = usePlot()
  return (
    <path
      aria-hidden
      d={functionPath(fn, t, domain, samples)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash(dashed)}
      strokeLinejoin="round"
      strokeLinecap="round"
      opacity={opacity}
    />
  )
})

export function ParametricCurve({
  x,
  y,
  tMin,
  tMax,
  samples = 400,
  color = 'var(--c-blue)',
  width = 2.5,
  dashed,
  opacity = 1,
  fill,
}: StrokeProps & {
  x: Fn
  y: Fn
  tMin: number
  tMax: number
  samples?: number
  fill?: string
}) {
  const t = usePlot()
  let d = ''
  let pen = false
  for (let i = 0; i <= samples; i++) {
    const s = tMin + ((tMax - tMin) * i) / samples
    const px = x(s)
    const py = y(s)
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${f1(t.sx(px))},${f1(t.sy(py))}`
    pen = true
  }
  return (
    <path
      aria-hidden
      d={d}
      fill={fill ?? 'none'}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash(dashed)}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}

export function Polyline({
  points,
  color = 'var(--ink-2)',
  width = 2,
  dashed,
  opacity = 1,
}: StrokeProps & { points: readonly Vec2[] }) {
  const t = usePlot()
  return (
    <polyline
      aria-hidden
      points={points.map(([x, y]) => `${f1(t.sx(x))},${f1(t.sy(y))}`).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash(dashed)}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}

export function Segment({
  from,
  to,
  color = 'var(--ink-2)',
  width = 2,
  dashed,
  opacity = 1,
}: StrokeProps & { from: Vec2; to: Vec2 }) {
  const t = usePlot()
  return (
    <line
      aria-hidden
      x1={t.sx(from[0])}
      y1={t.sy(from[1])}
      x2={t.sx(to[0])}
      y2={t.sy(to[1])}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash(dashed)}
      strokeLinecap="round"
      opacity={opacity}
    />
  )
}

/** Infinite line through `through` in direction `direction`, clipped to the plot. */
export function InfiniteLine({
  through,
  direction,
  ...stroke
}: StrokeProps & { through: Vec2; direction: Vec2 }) {
  const t = usePlot()
  const len = Math.hypot(direction[0], direction[1])
  if (len === 0) return null
  const reach =
    2 * Math.hypot(t.view.xMax - t.view.xMin, t.view.yMax - t.view.yMin) +
    Math.hypot(through[0], through[1])
  const k = reach / len
  return (
    <Segment
      from={[through[0] - direction[0] * k, through[1] - direction[1] * k]}
      to={[through[0] + direction[0] * k, through[1] + direction[1] * k]}
      {...stroke}
    />
  )
}

export function Polygon({
  points,
  fill = 'var(--c-blue)',
  fillOpacity = 0.15,
  stroke,
  strokeWidth = 2,
  dashed,
}: {
  points: readonly Vec2[]
  fill?: string
  fillOpacity?: number
  stroke?: string
  strokeWidth?: number
  dashed?: boolean
}) {
  const t = usePlot()
  return (
    <polygon
      aria-hidden
      points={points.map(([x, y]) => `${f1(t.sx(x))},${f1(t.sy(y))}`).join(' ')}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke ?? 'none'}
      strokeWidth={strokeWidth}
      strokeDasharray={dash(dashed)}
      strokeLinejoin="round"
    />
  )
}

export function Circle({
  center,
  r,
  fill = 'none',
  fillOpacity = 0.15,
  stroke = 'var(--ink-2)',
  strokeWidth = 2,
  dashed,
}: {
  center: Vec2
  /** Radius in math units. */
  r: number
  fill?: string
  fillOpacity?: number
  stroke?: string
  strokeWidth?: number
  dashed?: boolean
}) {
  const t = usePlot()
  return (
    <ellipse
      aria-hidden
      cx={t.sx(center[0])}
      cy={t.sy(center[1])}
      rx={Math.abs(r * t.kx)}
      ry={Math.abs(r * t.ky)}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dash(dashed)}
    />
  )
}

/** A static dot. */
export function Point({
  at,
  r = 5,
  color = 'var(--ink)',
  hollow = false,
}: {
  at: Vec2
  r?: number
  color?: string
  hollow?: boolean
}) {
  const t = usePlot()
  if (!Number.isFinite(at[0]) || !Number.isFinite(at[1])) return null
  return (
    <circle
      aria-hidden
      cx={t.sx(at[0])}
      cy={t.sy(at[1])}
      r={r}
      fill={hollow ? 'var(--surface)' : color}
      stroke={color}
      strokeWidth={hollow ? 2 : 1.5}
    />
  )
}

/** Arrow from `from` to `to` with a solid head (computed in pixels so it never distorts). */
export function Vector({
  from = [0, 0],
  to,
  color = 'var(--c-blue)',
  width = 2.75,
  head = 11,
  dashed,
  opacity = 1,
}: StrokeProps & { from?: Vec2; to: Vec2; head?: number }) {
  const t = usePlot()
  const x1 = t.sx(from[0])
  const y1 = t.sy(from[1])
  const x2 = t.sx(to[0])
  const y2 = t.sy(to[1])
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 0.5)
    return <circle aria-hidden cx={x2} cy={y2} r={width} fill={color} opacity={opacity} />
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const h = Math.min(head, len * 0.6)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const w = h * 0.55
  return (
    <g aria-hidden opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={bx + ux * 0.5}
        y2={by + uy * 0.5}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash(dashed)}
      />
      <polygon
        points={`${x2},${y2} ${bx - uy * w},${by + ux * w} ${bx + uy * w},${by - ux * w}`}
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** Shaded region between a function and the x-axis (or another function) over [a, b]. */
export function AreaUnder({
  fn,
  lower,
  a,
  b,
  color = 'var(--c-blue)',
  opacity = 0.2,
}: {
  fn: Fn
  lower?: Fn
  a: number
  b: number
  color?: string
  opacity?: number
}) {
  const t = usePlot()
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const n = Math.max(40, Math.ceil(((hi - lo) * t.kx) / 2))
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n
    const y = fn(x)
    const yb = lower ? lower(x) : 0
    if (!Number.isFinite(y) || !Number.isFinite(yb)) continue
    top.push(`${f1(t.sx(x))},${f1(t.sy(y))}`)
    bottom.push(`${f1(t.sx(x))},${f1(t.sy(yb))}`)
  }
  if (!top.length) return null
  return (
    <path
      aria-hidden
      d={`M${top.join('L')}L${bottom.reverse().join('L')}Z`}
      fill={color}
      fillOpacity={opacity}
      stroke="none"
    />
  )
}

/** Riemann rectangles (or trapezoids), coloured by sign. */
export function RiemannRects({
  slices,
  color = 'var(--c-blue)',
  negativeColor = 'var(--c-red)',
  opacity = 0.22,
}: {
  slices: readonly RiemannSlice[]
  color?: string
  negativeColor?: string
  opacity?: number
}) {
  const t = usePlot()
  return (
    <g aria-hidden>
      {slices.map((s, i) => {
        const avg = (s.y0 + s.y1) / 2
        const c = avg < 0 ? negativeColor : color
        const pts = [
          [s.x0, 0],
          [s.x0, s.y0],
          [s.x1, s.y1],
          [s.x1, 0],
        ]
          .map(([x, y]) => `${f1(t.sx(x))},${f1(t.sy(y))}`)
          .join(' ')
        return (
          <polygon
            key={i}
            points={pts}
            fill={c}
            fillOpacity={opacity}
            stroke={c}
            strokeOpacity={0.8}
            strokeWidth={1.25}
          />
        )
      })}
    </g>
  )
}

/** Arc marking an angle at `center` from angle `from` to `to` (radians, counter-clockwise). */
export function AngleArc({
  center,
  from,
  to,
  radius = 28,
  color = 'var(--c-orange)',
  fill = true,
}: {
  center: Vec2
  from: number
  to: number
  /** Radius in pixels. */
  radius?: number
  color?: string
  fill?: boolean
}) {
  const t = usePlot()
  const cx = t.sx(center[0])
  const cy = t.sy(center[1])
  let sweep = to - from
  while (sweep < 0) sweep += Math.PI * 2
  while (sweep > Math.PI * 2) sweep -= Math.PI * 2
  // SVG y points down, so negate the angles.
  const x0 = cx + radius * Math.cos(from)
  const y0 = cy - radius * Math.sin(from)
  const x1 = cx + radius * Math.cos(from + sweep)
  const y1 = cy - radius * Math.sin(from + sweep)
  const large = sweep > Math.PI ? 1 : 0
  const arc = `M${f1(x0)},${f1(y0)}A${radius},${radius} 0 ${large} 0 ${f1(x1)},${f1(y1)}`
  return (
    <g aria-hidden>
      {fill && <path d={`M${f1(cx)},${f1(cy)}L${arc.slice(1)}Z`} fill={color} fillOpacity={0.14} />}
      <path d={arc} fill="none" stroke={color} strokeWidth={2} />
    </g>
  )
}

type Anchor =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

const ANCHOR: Record<Anchor, string> = {
  center: 'translate(-50%, -50%)',
  top: 'translate(-50%, 0)',
  bottom: 'translate(-50%, -100%)',
  left: 'translate(0, -50%)',
  right: 'translate(-100%, -50%)',
  'top-left': 'translate(0, 0)',
  'top-right': 'translate(-100%, 0)',
  'bottom-left': 'translate(0, -100%)',
  'bottom-right': 'translate(-100%, -100%)',
}

/**
 * HTML label pinned to math coordinates (can hold <Tex>). `anchor` is which side of the label
 * sits on the point; `offset` nudges it in pixels.
 */
export function Label({
  at,
  children,
  anchor = 'bottom-left',
  offset = [6, -6],
  className,
  color,
}: {
  at: Vec2
  children: ReactNode
  anchor?: Anchor
  offset?: readonly [number, number]
  className?: string
  color?: string
}) {
  const t = usePlot()
  if (!t.overlay || !Number.isFinite(at[0]) || !Number.isFinite(at[1])) return null
  const left = t.sx(at[0]) + offset[0]
  const top = t.sy(at[1]) + offset[1]
  if (left < -60 || top < -40 || left > t.width + 60 || top > t.height + 40) return null
  return createPortal(
    <div
      className={cn(
        'absolute rounded-md px-1 text-sm leading-tight font-medium whitespace-nowrap text-ink',
        className,
      )}
      style={{ left, top, transform: ANCHOR[anchor], color }}
    >
      {children}
    </div>,
    t.overlay,
  )
}
