import { useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  CanvasLayer,
  MovablePoint,
  Plot,
  Point,
  Polyline,
  constraints,
  cssColor,
  type View,
} from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

/** First-order equations y′ = F(x, y) with up to two parameters k and c. */
const EQUATIONS = {
  growth: {
    tex: "y' = ky",
    F: (_x: number, y: number, k: number) => k * y,
    view: { xMin: -1, xMax: 6, yMin: -4, yMax: 8 },
    params: { k: [-1, 1, 0.1] },
  },
  logistic: {
    tex: "y' = ky\\left(1 - \\frac{y}{c}\\right)",
    F: (_x: number, y: number, k: number, c: number) => k * y * (1 - y / c),
    view: { xMin: 0, xMax: 12, yMin: -1, yMax: 10 },
    params: { k: [0.1, 1.5, 0.1], c: [2, 9, 1] },
  },
  cooling: {
    tex: "y' = -k(y - c)",
    F: (_x: number, y: number, k: number, c: number) => -k * (y - c),
    view: { xMin: 0, xMax: 10, yMin: 0, yMax: 100 },
    params: { k: [0.1, 1, 0.1], c: [0, 40, 5] },
  },
  linear: {
    tex: "y' = x - y",
    F: (x: number, y: number) => x - y,
    view: { xMin: -3, xMax: 5, yMin: -4, yMax: 5 },
    params: {},
  },
} satisfies Record<
  string,
  {
    tex: string
    F: (x: number, y: number, k: number, c: number) => number
    view: View
    params: Partial<Record<'k' | 'c', [number, number, number]>>
  }
>

export type EquationId = keyof typeof EQUATIONS

/** Planar vector fields (x, y) ↦ (P, Q). */
const FIELDS = {
  rotation: { tex: '(-y,\\ x)', F: (x: number, y: number): Vec2 => [-y, x] },
  source: { tex: '(x,\\ y)', F: (x: number, y: number): Vec2 => [x, y] },
  sink: { tex: '(-x,\\ -y)', F: (x: number, y: number): Vec2 => [-x, -y] },
  shear: { tex: '(y,\\ 0)', F: (_x: number, y: number): Vec2 => [y, 0] },
  saddle: { tex: '(x,\\ -y)', F: (x: number, y: number): Vec2 => [x, -y] },
  whirlpool: {
    tex: '(-y - 0.3x,\\ x - 0.3y)',
    F: (x: number, y: number): Vec2 => [-y - 0.3 * x, x - 0.3 * y],
  },
}

export type FieldId = keyof typeof FIELDS

export type SlopeFieldPreset =
  | { mode: 'slope'; eq: EquationId; k?: number; c?: number; start?: Vec2 }
  | {
      mode: 'euler'
      eq: EquationId
      k?: number
      c?: number
      start?: Vec2
      h?: number
      span?: number
    }
  | { mode: 'vector'; field?: FieldId; start?: Vec2 }
  | { mode: 'phase'; a?: number; b?: number; c?: number; d?: number }

export type PhaseKind = 'saddle' | 'node' | 'spiral' | 'center' | 'degenerate'

export type SlopeFieldState =
  | {
      mode: 'slope'
      eq: EquationId
      k: number
      c: number
      x0: number
      y0: number
      /** Slope at the starting point (0 = an equilibrium if it stays flat). */
      slope: number
      /** Value of the solution at the right edge of the window. */
      yEnd: number
    }
  | {
      mode: 'euler'
      eq: EquationId
      k: number
      c: number
      h: number
      steps: number
      eulerEnd: number
      trueEnd: number
      error: number
    }
  | {
      mode: 'vector'
      field: FieldId
      x: number
      y: number
      fx: number
      fy: number
      divergence: number
      curl: number
    }
  | {
      mode: 'phase'
      a: number
      b: number
      c: number
      d: number
      trace: number
      det: number
      kind: PhaseKind
      stable: boolean
    }

const fmt = (v: number, d = 2) => formatNumber(Math.abs(v) < 1e-9 ? 0 : v, d)
const SOL = 'var(--c-orange)'

/** Classic fourth-order Runge–Kutta step for y′ = F(x, y). */
function rk4(F: (x: number, y: number) => number, x: number, y: number, h: number) {
  const k1 = F(x, y)
  const k2 = F(x + h / 2, y + (h / 2) * k1)
  const k3 = F(x + h / 2, y + (h / 2) * k2)
  const k4 = F(x + h, y + h * k3)
  return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
}

/** The solution through (x0, y0), traced both ways across the window. */
function solve(F: (x: number, y: number) => number, x0: number, y0: number, view: View): Vec2[] {
  const h = (view.xMax - view.xMin) / 300
  const limit = (view.yMax - view.yMin) * 3
  const trace = (dir: 1 | -1) => {
    const pts: Vec2[] = []
    let x = x0
    let y = y0
    while ((dir > 0 ? x < view.xMax : x > view.xMin) && Math.abs(y) < limit && Number.isFinite(y)) {
      y = rk4(F, x, y, dir * h)
      x += dir * h
      pts.push([x, y])
    }
    return pts
  }
  return [...trace(-1).reverse(), [x0, y0], ...trace(1)]
}

/** Short line segments (slope field) or arrows (vector field) on a grid, drawn on canvas. */
function FieldLayer({
  dir,
  arrows,
  deps,
  density = 20,
}: {
  dir: (x: number, y: number) => Vec2
  arrows: boolean
  deps: unknown[]
  density?: number
}) {
  return (
    <CanvasLayer
      deps={deps}
      draw={(ctx, t) => {
        const step = Math.max(t.width, t.height) / density
        const ink = cssColor('var(--ink-3)')
        ctx.strokeStyle = ink
        ctx.fillStyle = ink
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        for (let px = step / 2; px < t.width; px += step)
          for (let py = step / 2; py < t.height; py += step) {
            const [u, v] = dir(t.ix(px), t.iy(py))
            // Directions in screen space (y flipped, unequal axis scales).
            const sx = u * t.kx
            const sy = -v * t.ky
            const m = Math.hypot(sx, sy)
            if (!Number.isFinite(m) || m < 1e-9) {
              ctx.beginPath()
              ctx.arc(px, py, 1.5, 0, Math.PI * 2)
              ctx.fill()
              continue
            }
            const len = step * 0.38
            const dx = (sx / m) * len
            const dy = (sy / m) * len
            ctx.beginPath()
            ctx.moveTo(px - (arrows ? 0 : dx), py - (arrows ? 0 : dy))
            ctx.lineTo(px + dx, py + dy)
            ctx.stroke()
            if (arrows) {
              const hx = dx * 0.4
              const hy = dy * 0.4
              ctx.beginPath()
              ctx.moveTo(px + dx, py + dy)
              ctx.lineTo(px + dx - hx - hy * 0.6, py + dy - hy + hx * 0.6)
              ctx.lineTo(px + dx - hx + hy * 0.6, py + dy - hy - hx * 0.6)
              ctx.closePath()
              ctx.fill()
            }
          }
      }}
    />
  )
}

function useEquation(eq: EquationId, k0?: number, c0?: number) {
  const E = EQUATIONS[eq]
  const params = E.params as Partial<Record<'k' | 'c', [number, number, number]>>
  const [k, setK] = useState(k0 ?? (params.k ? (params.k[0] + params.k[1]) / 2 : 1))
  const [c, setC] = useState(c0 ?? (params.c ? params.c[1] : 0))
  const F = (x: number, y: number) => E.F(x, y, k, c)
  const sliders = (
    <>
      {params.k && (
        <Slider
          label={<Tex>k</Tex>}
          name="k"
          value={k}
          min={params.k[0]}
          max={params.k[1]}
          step={params.k[2]}
          onChange={setK}
          color={SOL}
        />
      )}
      {params.c && (
        <Slider
          label={<Tex>c</Tex>}
          name="c"
          value={c}
          min={params.c[0]}
          max={params.c[1]}
          step={params.c[2]}
          onChange={setC}
          color="var(--c-violet)"
        />
      )}
    </>
  )
  return { E, k, c, F, sliders }
}

const snapTo = (view: View) => {
  const sx = (view.xMax - view.xMin) / 40
  const sy = (view.yMax - view.yMin) / 40
  return ([x, y]: Vec2): Vec2 => [
    Math.min(view.xMax, Math.max(view.xMin, Math.round(x / sx) * sx)),
    Math.min(view.yMax, Math.max(view.yMin, Math.round(y / sy) * sy)),
  ]
}
const clean = (v: number) => Math.round(v * 1e6) / 1e6

function SlopeMode({
  eq,
  k: k0,
  c: c0,
  start,
  onState,
}: {
  eq: EquationId
  k?: number
  c?: number
  start?: Vec2
  onState: (s: SlopeFieldState) => void
}) {
  const { E, k, c, F, sliders } = useEquation(eq, k0, c0)
  const [[x0, y0], setStart] = useState<Vec2>(
    start ?? [E.view.xMin, (E.view.yMin + E.view.yMax) / 4],
  )
  const path = solve(F, x0, y0, E.view)
  const yEnd = path[path.length - 1][1]
  useReport<SlopeFieldState>({ mode: 'slope', eq, k, c, x0, y0, slope: F(x0, y0), yEnd }, onState)
  return (
    <>
      <Plot
        view={E.view}
        height={340}
        ariaLabel={`Slope field of ${E.tex} with the solution through (${fmt(x0)}, ${fmt(y0)})`}
      >
        <FieldLayer dir={(x, y) => [1, F(x, y)]} arrows={false} deps={[eq, k, c]} />
        <Polyline points={path} color={SOL} width={3} />
        <MovablePoint
          x={x0}
          y={y0}
          onMove={(x, y) => setStart([clean(x), clean(y)])}
          constrain={snapTo(E.view)}
          color={SOL}
          label="Starting value"
        />
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">{sliders}</div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'equation', value: <Tex>{E.tex}</Tex> },
            { label: 'start', value: `(${fmt(x0)}, ${fmt(y0)})`, color: SOL },
            { label: 'slope there', value: fmt(F(x0, y0), 3) },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Each little line shows the slope the equation demands at that spot. Drag the orange point:
          the solution follows the lines.
        </p>
      </div>
    </>
  )
}

function EulerMode({
  eq,
  k: k0,
  c: c0,
  start,
  h: h0 = 1,
  span,
  onState,
}: {
  eq: EquationId
  k?: number
  c?: number
  start?: Vec2
  h?: number
  span?: number
  onState: (s: SlopeFieldState) => void
}) {
  const { E, k, c, F, sliders } = useEquation(eq, k0, c0)
  const [h, setH] = useState(h0)
  const [x0, y0] = start ?? [E.view.xMin, (E.view.yMin + E.view.yMax) / 4]
  const xEnd = x0 + (span ?? E.view.xMax - x0)
  const steps = Math.max(1, Math.round((xEnd - x0) / h))
  const euler: Vec2[] = [[x0, y0]]
  for (let i = 0; i < steps; i++) {
    const [x, y] = euler[euler.length - 1]
    euler.push([x + h, y + h * F(x, y)])
  }
  const truePath = solve(F, x0, y0, { ...E.view, xMin: x0, xMax: euler[euler.length - 1][0] })
  const trueEnd = truePath[truePath.length - 1][1]
  const eulerEnd = euler[euler.length - 1][1]
  useReport<SlopeFieldState>(
    { mode: 'euler', eq, k, c, h, steps, eulerEnd, trueEnd, error: eulerEnd - trueEnd },
    onState,
  )
  return (
    <>
      <Plot
        view={E.view}
        height={340}
        ariaLabel={`Euler's method with step ${h} against the true solution`}
      >
        <FieldLayer dir={(x, y) => [1, F(x, y)]} arrows={false} deps={[eq, k, c]} />
        <Polyline points={truePath} color="var(--c-blue)" width={2.5} />
        <Polyline points={euler} color={SOL} width={2.5} />
        {euler.map((p, i) => (
          <Point key={i} at={p} r={3.5} color={SOL} />
        ))}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label="Step size h"
          value={h}
          min={0.1}
          max={2}
          step={0.1}
          onChange={setH}
          color={SOL}
        />
        {sliders}
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'steps', value: String(steps) },
            { label: 'Euler ends at', value: fmt(eulerEnd, 3), color: SOL },
            { label: 'true value', value: fmt(trueEnd, 3), color: 'var(--c-blue)' },
            { label: 'error', value: fmt(eulerEnd - trueEnd, 3) },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Euler’s method walks in straight steps, each following the slope where it starts. Blue is
          the exact solution.
        </p>
      </div>
    </>
  )
}

const FIELD_VIEW = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 }

/** Follow the flow from a point for a while (RK4 on a 2-D system). */
function flow(F: (x: number, y: number) => Vec2, start: Vec2, T = 6, dt = 0.02): Vec2[] {
  const pts: Vec2[] = [start]
  for (let t = 0; t < T; t += dt) {
    const [x, y] = pts[pts.length - 1]
    const k1 = F(x, y)
    const k2 = F(x + (dt / 2) * k1[0], y + (dt / 2) * k1[1])
    const k3 = F(x + (dt / 2) * k2[0], y + (dt / 2) * k2[1])
    const k4 = F(x + dt * k3[0], y + dt * k3[1])
    const next: Vec2 = [
      x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ]
    if (Math.abs(next[0]) > 8 || Math.abs(next[1]) > 8) break
    pts.push(next)
  }
  return pts
}

/** Divergence and curl by central differences. */
function divCurl(F: (x: number, y: number) => Vec2, x: number, y: number) {
  const e = 1e-4
  const dPdx = (F(x + e, y)[0] - F(x - e, y)[0]) / (2 * e)
  const dQdy = (F(x, y + e)[1] - F(x, y - e)[1]) / (2 * e)
  const dQdx = (F(x + e, y)[1] - F(x - e, y)[1]) / (2 * e)
  const dPdy = (F(x, y + e)[0] - F(x, y - e)[0]) / (2 * e)
  return { divergence: dPdx + dQdy, curl: dQdx - dPdy }
}

function VectorMode({
  field: f0 = 'rotation',
  start = [1.5, 0.5],
  onState,
}: {
  field?: FieldId
  start?: Vec2
  onState: (s: SlopeFieldState) => void
}) {
  const [field, setField] = useState<FieldId>(f0)
  const [[x, y], setP] = useState<Vec2>(start)
  const F = FIELDS[field].F
  const [fx, fy] = F(x, y)
  const { divergence, curl } = divCurl(F, x, y)
  useReport<SlopeFieldState>(
    { mode: 'vector', field, x, y, fx, fy, divergence: clean(divergence), curl: clean(curl) },
    onState,
  )
  return (
    <>
      <Plot
        view={FIELD_VIEW}
        aspect="equal"
        maxHeight={400}
        ariaLabel={`Vector field ${field}; a particle released at (${fmt(x)}, ${fmt(y)})`}
      >
        <FieldLayer dir={F} arrows deps={[field]} density={16} />
        <Polyline points={flow(F, [x, y])} color={SOL} width={3} />
        <MovablePoint
          x={x}
          y={y}
          onMove={(a, b) => setP([Math.round(a * 4) / 4, Math.round(b * 4) / 4])}
          constrain={constraints.within(-2.9, 2.9, -2.9, 2.9)}
          color={SOL}
          label="Where the particle starts"
        />
      </Plot>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <Segmented
          label="Vector field"
          size="sm"
          value={field}
          onChange={setField}
          options={(Object.keys(FIELDS) as FieldId[]).map((id) => ({ value: id, label: id }))}
        />
        <Readouts
          items={[
            { label: <Tex>{'\\mathbf F(x, y)'}</Tex>, value: <Tex>{FIELDS[field].tex}</Tex> },
            { label: 'arrow here', value: `(${fmt(fx)}, ${fmt(fy)})`, color: SOL },
            { label: 'spreading out (divergence)', value: fmt(divergence) },
            { label: 'spin (curl)', value: fmt(curl) },
          ]}
        />
      </div>
    </>
  )
}

function classify(
  a: number,
  b: number,
  c: number,
  d: number,
): { kind: PhaseKind; stable: boolean; trace: number; det: number } {
  const trace = a + d
  const det = a * d - b * c
  const disc = trace * trace - 4 * det
  if (Math.abs(det) < 1e-9) return { kind: 'degenerate', stable: false, trace, det }
  if (det < 0) return { kind: 'saddle', stable: false, trace, det }
  if (disc < 0)
    return Math.abs(trace) < 1e-9
      ? { kind: 'center', stable: false, trace, det }
      : { kind: 'spiral', stable: trace < 0, trace, det }
  return { kind: 'node', stable: trace < 0, trace, det }
}

const PHASE_TEXT: Record<PhaseKind, string> = {
  saddle: 'saddle: paths come in along one direction and leave along another',
  node: 'node: paths flow straight in or out',
  spiral: 'spiral: paths wind round the origin',
  center: 'centre: paths go round in closed loops forever',
  degenerate: 'degenerate: a whole line of resting points',
}

const STARTS: Vec2[] = Array.from({ length: 8 }, (_, i) => [
  2.6 * Math.cos((i * Math.PI) / 4 + 0.2),
  2.6 * Math.sin((i * Math.PI) / 4 + 0.2),
])

function PhaseMode({
  a: a0 = 0,
  b: b0 = 1,
  c: c0 = -1,
  d: d0 = -0.5,
  onState,
}: {
  a?: number
  b?: number
  c?: number
  d?: number
  onState: (s: SlopeFieldState) => void
}) {
  const [m, setM] = useState({ a: a0, b: b0, c: c0, d: d0 })
  const { a, b, c, d } = m
  const F = (x: number, y: number): Vec2 => [a * x + b * y, c * x + d * y]
  const info = classify(a, b, c, d)
  useReport<SlopeFieldState>({ mode: 'phase', a, b, c, d, ...info }, onState)
  const set = (key: 'a' | 'b' | 'c' | 'd') => (v: number) => setM((s) => ({ ...s, [key]: v }))
  return (
    <>
      <Plot
        view={FIELD_VIEW}
        aspect="equal"
        maxHeight={400}
        ariaLabel={`Phase portrait: ${info.kind}`}
      >
        <FieldLayer dir={F} arrows deps={[a, b, c, d]} density={16} />
        {STARTS.map((s, i) => (
          <Polyline key={i} points={flow(F, s, 8)} color={SOL} width={2} opacity={0.85} />
        ))}
        <Point at={[0, 0]} r={5} color="var(--ink)" />
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-4">
        <div className="text-[1.05rem]">
          <Tex>{`\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = \\begin{pmatrix} ${fmt(a, 1)} & ${fmt(b, 1)} \\\\ ${fmt(c, 1)} & ${fmt(d, 1)} \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix}`}</Tex>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider
            label={<Tex>a</Tex>}
            name="a"
            value={a}
            min={-2}
            max={2}
            step={0.5}
            onChange={set('a')}
          />
          <Slider
            label={<Tex>b</Tex>}
            name="b"
            value={b}
            min={-2}
            max={2}
            step={0.5}
            onChange={set('b')}
          />
          <Slider
            label={<Tex>c</Tex>}
            name="c"
            value={c}
            min={-2}
            max={2}
            step={0.5}
            onChange={set('c')}
          />
          <Slider
            label={<Tex>d</Tex>}
            name="d"
            value={d}
            min={-2}
            max={2}
            step={0.5}
            onChange={set('d')}
          />
        </div>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'trace', value: fmt(info.trace) },
            { label: 'determinant', value: fmt(info.det) },
            { label: 'picture', value: PHASE_TEXT[info.kind] },
            ...(info.kind === 'node' || info.kind === 'spiral'
              ? [
                  {
                    label: 'stability',
                    value: info.stable ? 'stable (flows in)' : 'unstable (flows out)',
                  },
                ]
              : []),
          ]}
        />
      </div>
    </>
  )
}

export default function SlopeFieldWidget({
  preset: p,
  onStateChange: on,
}: WidgetComponentProps<'slopeField'>) {
  switch (p.mode) {
    case 'slope':
      return <SlopeMode eq={p.eq} k={p.k} c={p.c} start={p.start} onState={on} />
    case 'euler':
      return (
        <EulerMode eq={p.eq} k={p.k} c={p.c} start={p.start} h={p.h} span={p.span} onState={on} />
      )
    case 'vector':
      return <VectorMode field={p.field} start={p.start} onState={on} />
    case 'phase':
      return <PhaseMode a={p.a} b={p.b} c={p.c} d={p.d} onState={on} />
  }
}
