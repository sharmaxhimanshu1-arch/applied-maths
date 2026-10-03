import { useState, type ReactNode } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  CanvasLayer,
  Circle,
  FunctionGraph,
  InfiniteLine,
  MovablePoint,
  Plot,
  Point,
  Polygon,
  Polyline,
  Vector,
  constraints,
  cssColor,
} from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

type F2 = (x: number, y: number) => number

/** Ready-made surfaces z = f(x, y), each with its gradient. */
const SURFACES = {
  bowl: {
    tex: 'x^2 + y^2',
    f: (x: number, y: number) => x * x + y * y,
    grad: (x: number, y: number): Vec2 => [2 * x, 2 * y],
  },
  saddle: {
    tex: 'x^2 - y^2',
    f: (x: number, y: number) => x * x - y * y,
    grad: (x: number, y: number): Vec2 => [2 * x, -2 * y],
  },
  hill: {
    tex: '4e^{-(x^2 + y^2)/4}',
    f: (x: number, y: number) => 4 * Math.exp(-(x * x + y * y) / 4),
    grad: (x: number, y: number): Vec2 => {
      const e = Math.exp(-(x * x + y * y) / 4)
      return [-2 * x * e, -2 * y * e]
    },
  },
  waves: {
    tex: '\\sin x \\cos y',
    f: (x: number, y: number) => Math.sin(x) * Math.cos(y),
    grad: (x: number, y: number): Vec2 => [Math.cos(x) * Math.cos(y), -Math.sin(x) * Math.sin(y)],
  },
  plane: {
    tex: 'x + 2y',
    f: (x: number, y: number) => x + 2 * y,
    grad: (): Vec2 => [1, 2],
  },
  /** Two hills of different heights: gradient ascent can get stuck on the smaller one. */
  hills: {
    tex: '3e^{-((x-1.5)^2 + (y-1)^2)} + 2e^{-((x+1.5)^2 + (y+1)^2)/1.5}',
    f: (x: number, y: number) =>
      3 * Math.exp(-((x - 1.5) ** 2 + (y - 1) ** 2)) +
      2 * Math.exp(-((x + 1.5) ** 2 + (y + 1) ** 2) / 1.5),
    grad: (x: number, y: number): Vec2 => {
      const a = 3 * Math.exp(-((x - 1.5) ** 2 + (y - 1) ** 2))
      const b = 2 * Math.exp(-((x + 1.5) ** 2 + (y + 1) ** 2) / 1.5)
      return [
        -2 * (x - 1.5) * a - (2 / 1.5) * (x + 1.5) * b,
        -2 * (y - 1) * a - (2 / 1.5) * (y + 1) * b,
      ]
    },
  },
} satisfies Record<string, { tex: string; f: F2; grad: (x: number, y: number) => Vec2 }>

export type SurfaceId = keyof typeof SURFACES

export type ContourPlotPreset =
  | { mode: 'surface'; fn: SurfaceId; start?: Vec2 }
  | { mode: 'partials'; fn: SurfaceId; start?: Vec2 }
  | { mode: 'gradient'; fn: SurfaceId; start?: Vec2 }
  | { mode: 'riemann2d'; fn: SurfaceId; n?: number }
  | { mode: 'constraint'; fn: SurfaceId; radius?: number; start?: number }

export type ContourPlotState =
  | { mode: 'surface'; fn: SurfaceId; x: number; y: number; z: number; slice: 'x' | 'y' }
  | { mode: 'partials'; fn: SurfaceId; x: number; y: number; fx: number; fy: number }
  | {
      mode: 'gradient'
      fn: SurfaceId
      x: number
      y: number
      gx: number
      gy: number
      magnitude: number
      /** Number of uphill steps taken from the current start. */
      climbed: number
    }
  | { mode: 'riemann2d'; fn: SurfaceId; n: number; sum: number; exact: number; error: number }
  | {
      mode: 'constraint'
      fn: SurfaceId
      x: number
      y: number
      value: number
      /** Angle between ∇f and ∇g in degrees (0 or 180 means parallel). */
      angle: number
    }

const R = 3.2
const VIEW = { xMin: -R, xMax: R, yMin: -R, yMax: R }
const P_COLOR = 'var(--c-orange)'
const fmt = (v: number, d = 2) => formatNumber(Math.abs(v) < 1e-9 ? 0 : v, d)

/** Trace the level curve f = level across a grid of samples (marching squares), as line segments. */
function strokeLevel(
  ctx: CanvasRenderingContext2D,
  z: Float64Array,
  cols: number,
  rows: number,
  g: number,
  level: number,
) {
  const at = (i: number, j: number) => z[j * (cols + 1) + i]
  // Where along an edge from value a (at 0) to value b (at 1) the level is crossed.
  const cut = (a: number, b: number) => (level - a) / (b - a)
  ctx.beginPath()
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const tl = at(i, j)
      const tr = at(i + 1, j)
      const br = at(i + 1, j + 1)
      const bl = at(i, j + 1)
      const pts: [number, number][] = []
      if (tl < level !== tr < level) pts.push([(i + cut(tl, tr)) * g, j * g])
      if (tr < level !== br < level) pts.push([(i + 1) * g, (j + cut(tr, br)) * g])
      if (bl < level !== br < level) pts.push([(i + cut(bl, br)) * g, (j + 1) * g])
      if (tl < level !== bl < level) pts.push([i * g, (j + cut(tl, bl)) * g])
      for (let k = 0; k + 1 < pts.length; k += 2) {
        ctx.moveTo(pts[k][0], pts[k][1])
        ctx.lineTo(pts[k + 1][0], pts[k + 1][1])
      }
    }
  ctx.stroke()
}

/** Shaded height map with evenly spaced contour lines, plus an optional highlighted level. */
function Heatmap({ f, level, steps = 12 }: { f: F2; level?: number; steps?: number }) {
  return (
    <CanvasLayer
      deps={[f, level, steps]}
      draw={(ctx, t) => {
        const g = 4
        const cols = Math.ceil(t.width / g)
        const rows = Math.ceil(t.height / g)
        // Heights at grid corners.
        const z = new Float64Array((cols + 1) * (rows + 1))
        let lo = Infinity
        let hi = -Infinity
        for (let j = 0; j <= rows; j++)
          for (let i = 0; i <= cols; i++) {
            const v = f(t.ix(i * g), t.iy(j * g))
            z[j * (cols + 1) + i] = v
            if (v < lo) lo = v
            if (v > hi) hi = v
          }
        const span = hi - lo || 1
        const low = cssColor('var(--c-blue)')
        const high = cssColor('var(--c-orange)')
        for (let j = 0; j < rows; j++)
          for (let i = 0; i < cols; i++) {
            const u = (z[j * (cols + 1) + i] - lo) / span
            ctx.globalAlpha = 0.06 + 0.36 * Math.abs(u - 0.5) * 2
            ctx.fillStyle = u < 0.5 ? low : high
            ctx.fillRect(i * g, j * g, g, g)
          }
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = cssColor('var(--ink-2)')
        ctx.lineWidth = 1
        for (let k = 1; k < steps; k++) strokeLevel(ctx, z, cols, rows, g, lo + (span * k) / steps)
        if (level !== undefined) {
          ctx.globalAlpha = 1
          ctx.strokeStyle = cssColor('var(--c-violet)')
          ctx.lineWidth = 2.5
          strokeLevel(ctx, z, cols, rows, g, level)
        }
        ctx.globalAlpha = 1
      }}
    />
  )
}

/** A small side view: the height along one straight line through the point. */
function Slice({
  fn,
  at,
  slope,
  label,
  color,
}: {
  fn: (t: number) => number
  at: number
  slope?: number
  label: string
  color: string
}) {
  const ys = Array.from({ length: 41 }, (_, i) => fn(-R + (2 * R * i) / 40))
  const lo = Math.min(...ys)
  const hi = Math.max(...ys)
  const pad = (hi - lo) * 0.15 || 1
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium text-ink-2">{label}</span>
      <Plot
        view={{ xMin: -R, xMax: R, yMin: lo - pad, yMax: hi + pad }}
        height={130}
        ariaLabel={label}
      >
        <FunctionGraph fn={fn} color={color} />
        {slope !== undefined && (
          <InfiniteLine
            through={[at, fn(at)]}
            direction={[1, slope]}
            color="var(--ink)"
            width={1.5}
            dashed
          />
        )}
        <Point at={[at, fn(at)]} r={5} color={P_COLOR} />
      </Plot>
    </div>
  )
}

function MapPlot({
  children,
  label,
  f,
  level,
}: {
  children: ReactNode
  label: string
  f: F2
  level?: number
}) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Plot view={VIEW} aspect="equal" maxHeight={576} ariaLabel={label}>
        <Heatmap f={f} level={level} />
        {children}
      </Plot>
    </div>
  )
}

const keepIn = constraints.within(-R + 0.1, R - 0.1, -R + 0.1, R - 0.1)
const round2 = (v: number) => Math.round(v * 100) / 100

function SurfaceMode({
  fn,
  start = [1.5, 1],
  onState,
}: {
  fn: SurfaceId
  start?: Vec2
  onState: (s: ContourPlotState) => void
}) {
  const S = SURFACES[fn]
  const [[x, y], setP] = useState<Vec2>(start)
  const [slice, setSlice] = useState<'x' | 'y'>('x')
  const z = S.f(x, y)
  useReport<ContourPlotState>({ mode: 'surface', fn, x, y, z, slice }, onState)
  return (
    <>
      <MapPlot
        f={S.f}
        level={z}
        label={`Contour map of z = ${S.tex}; the point is at height ${fmt(z)}`}
      >
        {slice === 'x' ? (
          <InfiniteLine through={[0, y]} direction={[1, 0]} color={P_COLOR} dashed width={1.5} />
        ) : (
          <InfiniteLine through={[x, 0]} direction={[0, 1]} color={P_COLOR} dashed width={1.5} />
        )}
        <MovablePoint
          x={x}
          y={y}
          onMove={(a, b) => setP([round2(a), round2(b)])}
          constrain={keepIn}
          color={P_COLOR}
          label="Point on the map"
        />
      </MapPlot>
      <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-4">
        {slice === 'x' ? (
          <Slice
            fn={(t) => S.f(t, y)}
            at={x}
            label={`Side view along the dashed line y = ${fmt(y)}`}
            color="var(--c-blue)"
          />
        ) : (
          <Slice
            fn={(t) => S.f(x, t)}
            at={y}
            label={`Side view along the dashed line x = ${fmt(x)}`}
            color="var(--c-aqua)"
          />
        )}
        <Segmented
          label="Slice direction"
          size="sm"
          value={slice}
          onChange={setSlice}
          options={[
            { value: 'x', label: 'Across' },
            { value: 'y', label: 'Up' },
          ]}
        />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'point', value: `(${fmt(x)}, ${fmt(y)})`, color: P_COLOR },
            { label: <Tex>{`z = ${S.tex}`}</Tex>, value: fmt(z, 3) },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Shading shows height (blue low, orange high). Thin lines are contours; the purple one
          passes through your point: every spot on it is at the same height.
        </p>
      </div>
    </>
  )
}

function PartialsMode({
  fn,
  start = [1, 0.5],
  onState,
}: {
  fn: SurfaceId
  start?: Vec2
  onState: (s: ContourPlotState) => void
}) {
  const S = SURFACES[fn]
  const [[x, y], setP] = useState<Vec2>(start)
  const [fx, fy] = S.grad(x, y)
  useReport<ContourPlotState>({ mode: 'partials', fn, x, y, fx, fy }, onState)
  return (
    <>
      <MapPlot f={S.f} label={`Contour map of z = ${S.tex}`}>
        <InfiniteLine
          through={[0, y]}
          direction={[1, 0]}
          color="var(--c-blue)"
          dashed
          width={1.5}
        />
        <InfiniteLine
          through={[x, 0]}
          direction={[0, 1]}
          color="var(--c-aqua)"
          dashed
          width={1.5}
        />
        <MovablePoint
          x={x}
          y={y}
          onMove={(a, b) => setP([round2(a), round2(b)])}
          constrain={keepIn}
          color={P_COLOR}
          label="Point on the map"
        />
      </MapPlot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slice
          fn={(t) => S.f(t, y)}
          at={x}
          slope={fx}
          label="Walking across (y held fixed)"
          color="var(--c-blue)"
        />
        <Slice
          fn={(t) => S.f(x, t)}
          at={y}
          slope={fy}
          label="Walking up (x held fixed)"
          color="var(--c-aqua)"
        />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: <Tex>{'\\partial f/\\partial x'}</Tex>,
              value: fmt(fx, 3),
              color: 'var(--c-blue)',
            },
            {
              label: <Tex>{'\\partial f/\\partial y'}</Tex>,
              value: fmt(fy, 3),
              color: 'var(--c-aqua)',
            },
          ]}
        />
      </div>
    </>
  )
}

function GradientMode({
  fn,
  start = [-2, -1.5],
  onState,
}: {
  fn: SurfaceId
  start?: Vec2
  onState: (s: ContourPlotState) => void
}) {
  const S = SURFACES[fn]
  const [path, setPath] = useState<Vec2[]>([start])
  const [x, y] = path[path.length - 1]
  const [gx, gy] = S.grad(x, y)
  const magnitude = Math.hypot(gx, gy)
  useReport<ContourPlotState>(
    { mode: 'gradient', fn, x, y, gx, gy, magnitude, climbed: path.length - 1 },
    onState,
  )
  // Draw the arrow at a readable length that still grows with the steepness.
  const scale = magnitude > 0 ? Math.min(1.4, 0.35 + magnitude * 0.35) / magnitude : 0
  const climb = () =>
    setPath((p) => {
      const out = [...p]
      for (let i = 0; i < 10; i++) {
        const [cx, cy] = out[out.length - 1]
        const [a, b] = S.grad(cx, cy)
        const m = Math.hypot(a, b)
        if (m < 1e-3) break
        out.push(keepIn([cx + (0.15 * a) / Math.max(1, m), cy + (0.15 * b) / Math.max(1, m)]))
      }
      return out
    })
  return (
    <>
      <MapPlot
        f={S.f}
        level={S.f(x, y)}
        label={`Contour map of z = ${S.tex} with the gradient at the point`}
      >
        {path.length > 1 && <Polyline points={path} color={P_COLOR} width={2.5} />}
        {magnitude > 1e-6 && (
          <Vector
            from={[x, y]}
            to={[x + gx * scale, y + gy * scale]}
            color="var(--ink)"
            width={3}
          />
        )}
        <MovablePoint
          x={x}
          y={y}
          onMove={(a, b) => setPath([[round2(a), round2(b)]])}
          constrain={keepIn}
          color={P_COLOR}
          label="Starting point"
        />
      </MapPlot>
      <div className="flex flex-wrap items-center gap-3 border-t border-line p-3 sm:p-4">
        <Button size="sm" onClick={climb}>
          Climb 10 steps uphill
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPath([path[0]])}
          disabled={path.length < 2}
        >
          Back to start
        </Button>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: <Tex>{'\\nabla f'}</Tex>, value: `(${fmt(gx)}, ${fmt(gy)})` },
            { label: 'steepness', value: <Tex>{`|\\nabla f| = ${fmt(magnitude, 3)}`}</Tex> },
            { label: 'height', value: fmt(S.f(x, y), 3), color: P_COLOR },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          The arrow is the gradient: it points straight uphill, at right angles to the purple
          contour through the point.
        </p>
      </div>
    </>
  )
}

const RIEMANN_BOX = { a: -2, b: 2, c: -2, d: 2 }

function exactIntegral(f: F2) {
  const { a, b, c, d } = RIEMANN_BOX
  const n = 200
  const h = (b - a) / n
  const k = (d - c) / n
  let s = 0
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) s += f(a + (i + 0.5) * h, c + (j + 0.5) * k)
  return s * h * k
}

function Riemann2dMode({
  fn,
  n: n0 = 4,
  onState,
}: {
  fn: SurfaceId
  n?: number
  onState: (s: ContourPlotState) => void
}) {
  const S = SURFACES[fn]
  const [n, setN] = useState(n0)
  const { a, b, c, d } = RIEMANN_BOX
  const h = (b - a) / n
  const k = (d - c) / n
  const cells = Array.from({ length: n * n }, (_, idx) => {
    const i = idx % n
    const j = Math.floor(idx / n)
    const cx = a + (i + 0.5) * h
    const cy = c + (j + 0.5) * k
    return { x0: a + i * h, y0: c + j * k, z: S.f(cx, cy) }
  })
  const sum = cells.reduce((s, cell) => s + cell.z * h * k, 0)
  const [exact] = useState(() => exactIntegral(S.f))
  useReport<ContourPlotState>({ mode: 'riemann2d', fn, n, sum, exact, error: sum - exact }, onState)
  const zMax = Math.max(...cells.map((cell) => Math.abs(cell.z))) || 1
  return (
    <>
      <MapPlot f={S.f} label={`The square from -2 to 2 cut into ${n * n} cells`}>
        {cells.map((cell, i) => (
          <Polygon
            key={i}
            points={[
              [cell.x0, cell.y0],
              [cell.x0 + h, cell.y0],
              [cell.x0 + h, cell.y0 + k],
              [cell.x0, cell.y0 + k],
            ]}
            fill={cell.z >= 0 ? 'var(--c-violet)' : 'var(--c-red)'}
            fillOpacity={0.12 + 0.5 * (Math.abs(cell.z) / zMax)}
            stroke="var(--surface)"
            strokeWidth={1}
          />
        ))}
      </MapPlot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label="Cells along each side"
          value={n}
          min={1}
          max={24}
          step={1}
          onChange={setN}
          color="var(--c-violet)"
        />
        <p className="self-end text-sm text-ink-2">
          Each cell is a column: its base area times the height at its centre. Darker cells are
          taller.
        </p>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'sum of columns', value: fmt(sum, 4), color: 'var(--c-violet)' },
            { label: 'exact volume', value: fmt(exact, 4) },
            { label: 'error', value: fmt(sum - exact, 4) },
          ]}
        />
      </div>
    </>
  )
}

function ConstraintMode({
  fn,
  radius = 2,
  start = 2.4,
  onState,
}: {
  fn: SurfaceId
  radius?: number
  start?: number
  onState: (s: ContourPlotState) => void
}) {
  const S = SURFACES[fn]
  const [theta, setTheta] = useState(start)
  const x = radius * Math.cos(theta)
  const y = radius * Math.sin(theta)
  const value = S.f(x, y)
  const [gx, gy] = S.grad(x, y)
  const g: Vec2 = [2 * x, 2 * y]
  const cross = gx * g[1] - gy * g[0]
  const dot = gx * g[0] + gy * g[1]
  const angle = (Math.atan2(Math.abs(cross), dot) * 180) / Math.PI
  useReport<ContourPlotState>({ mode: 'constraint', fn, x, y, value, angle }, onState)
  const unit = (v: Vec2, len: number): Vec2 => {
    const m = Math.hypot(v[0], v[1]) || 1
    return [x + (v[0] / m) * len, y + (v[1] / m) * len]
  }
  const parallel = angle < 3 || angle > 177
  return (
    <>
      <MapPlot
        f={S.f}
        level={value}
        label={`Contours of f with the constraint circle of radius ${radius}`}
      >
        <Circle center={[0, 0]} r={radius} stroke="var(--ink)" strokeWidth={2.5} />
        <Vector from={[x, y]} to={unit([gx, gy], 0.9)} color={P_COLOR} width={2.5} />
        <Vector from={[x, y]} to={unit(g, 0.9)} color="var(--c-aqua)" width={2.5} />
        <MovablePoint
          x={x}
          y={y}
          onMove={(a, b) => setTheta(Math.atan2(b, a))}
          constrain={constraints.onCircle([0, 0], radius)}
          color={P_COLOR}
          label="Point on the circle"
        />
      </MapPlot>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: <Tex>{`f = ${S.tex}`}</Tex>, value: fmt(value, 3), color: P_COLOR },
            { label: 'angle between the arrows', value: `${fmt(angle, 0)}°` },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2" aria-live="polite">
          You may only move along the circle <Tex>{`x^2 + y^2 = ${radius * radius}`}</Tex>. Orange
          arrow: <Tex>{'\\nabla f'}</Tex>. Teal arrow: the circle’s own gradient.{' '}
          {parallel
            ? 'They line up: the contour just touches the circle, so this is a highest or lowest point on it.'
            : 'They point different ways, so sliding along the circle can still change f.'}
        </p>
      </div>
    </>
  )
}

export default function ContourPlotWidget({
  preset: p,
  onStateChange: on,
}: WidgetComponentProps<'contourPlot'>) {
  switch (p.mode) {
    case 'surface':
      return <SurfaceMode fn={p.fn} start={p.start} onState={on} />
    case 'partials':
      return <PartialsMode fn={p.fn} start={p.start} onState={on} />
    case 'gradient':
      return <GradientMode fn={p.fn} start={p.start} onState={on} />
    case 'riemann2d':
      return <Riemann2dMode fn={p.fn} n={p.n} onState={on} />
    case 'constraint':
      return <ConstraintMode fn={p.fn} radius={p.radius} start={p.start} onState={on} />
  }
}
