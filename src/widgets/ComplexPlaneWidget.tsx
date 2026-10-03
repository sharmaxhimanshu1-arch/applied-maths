import { useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  Circle,
  Label,
  MovablePoint,
  Plot,
  Point,
  Polyline,
  Segment,
  Vector,
  constraints,
} from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export type ComplexPlanePreset =
  | { mode: 'arithmetic'; z?: Vec2; w?: Vec2; op?: 'add' | 'multiply' }
  | { mode: 'euler'; theta?: number; n?: number }

export type ComplexPlaneState =
  | {
      mode: 'arithmetic'
      op: 'add' | 'multiply'
      z: Vec2
      w: Vec2
      result: Vec2
      /** Lengths and angles (degrees, 0–360). */
      zAbs: number
      wAbs: number
      resultAbs: number
      zArg: number
      wArg: number
      resultArg: number
    }
  | { mode: 'euler'; theta: number; n: number; point: Vec2; approx: Vec2; error: number }

const Z = 'var(--c-blue)'
const W = 'var(--c-aqua)'
const R = 'var(--c-orange)'
const fmt = (v: number, d = 2) => formatNumber(Math.abs(v) < 1e-9 ? 0 : v, d)
const mul = (a: Vec2, b: Vec2): Vec2 => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const abs = (a: Vec2) => Math.hypot(a[0], a[1])
/** Angle in degrees, 0 ≤ arg < 360 (0 for the origin). */
const argDeg = (a: Vec2) => {
  if (abs(a) < 1e-9) return 0
  const d = (Math.atan2(a[1], a[0]) * 180) / Math.PI
  return (Math.round((((d % 360) + 360) % 360) * 10) / 10) % 360
}
/** a + bi as TeX. */
function complexTex([a, b]: Vec2) {
  const re = fmt(a)
  if (Math.abs(b) < 1e-9) return re
  const im = Math.abs(b) === 1 ? 'i' : `${fmt(Math.abs(b))}i`
  if (Math.abs(a) < 1e-9) return b < 0 ? `-${im}` : im
  return `${re} ${b < 0 ? '-' : '+'} ${im}`
}

const MAX_LEN = 2.5
/** Snap to the half-grid and keep the point within MAX_LEN of the origin. */
const keep = ([x, y]: Vec2): Vec2 => {
  const s: Vec2 = [Math.round(x * 2) / 2, Math.round(y * 2) / 2]
  const r = abs(s)
  if (r <= MAX_LEN) return s
  return [Math.round((s[0] / r) * MAX_LEN * 2) / 2, Math.round((s[1] / r) * MAX_LEN * 2) / 2]
}

function ArithmeticMode({
  z: z0 = [2, 1],
  w: w0 = [1, 1.5],
  op: op0 = 'add',
  onState,
}: {
  z?: Vec2
  w?: Vec2
  op?: 'add' | 'multiply'
  onState: (s: ComplexPlaneState) => void
}) {
  const [z, setZ] = useState<Vec2>(z0)
  const [w, setW] = useState<Vec2>(w0)
  const [op, setOp] = useState(op0)
  const result: Vec2 = op === 'add' ? [z[0] + w[0], z[1] + w[1]] : mul(z, w)
  const zArg = argDeg(z)
  const wArg = argDeg(w)
  const resultArg = argDeg(result)
  useReport<ComplexPlaneState>(
    {
      mode: 'arithmetic',
      op,
      z,
      w,
      result,
      zAbs: abs(z),
      wAbs: abs(w),
      resultAbs: abs(result),
      zArg,
      wArg,
      resultArg,
    },
    onState,
  )
  const rad = (d: number) => (d * Math.PI) / 180
  return (
    <>
      <Plot
        view={{ xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 6.5 }}
        narrowView={{ xMin: -4.5, xMax: 4.5, yMin: -6.5, yMax: 6.5 }}
        aspect="equal"
        ariaLabel={`z = ${complexTex(z)}, w = ${complexTex(w)}, result ${complexTex(result)}`}
      >
        <Label at={[6.2, 0]} anchor="bottom" offset={[0, -4]} className="text-xs text-ink-2">
          real
        </Label>
        <Label at={[0, 6.2]} anchor="left" offset={[6, 0]} className="text-xs text-ink-2">
          imaginary
        </Label>
        {op === 'add' ? (
          <>
            <Segment from={z} to={result} color={W} dashed width={1.5} />
            <Segment from={w} to={result} color={Z} dashed width={1.5} />
          </>
        ) : (
          <>
            {zArg > 0 && <AngleArc center={[0, 0]} from={0} to={rad(zArg)} radius={26} color={Z} />}
            {/* w's angle stacked on top of z's: together they make the product's angle. */}
            {wArg > 0 && (
              <AngleArc
                center={[0, 0]}
                from={rad(zArg)}
                to={rad(zArg + wArg)}
                radius={34}
                color={W}
              />
            )}
            {resultArg > 0 && (
              <AngleArc center={[0, 0]} from={0} to={rad(resultArg)} radius={42} color={R} />
            )}
          </>
        )}
        <Vector from={[0, 0]} to={result} color={R} width={3} />
        <Vector from={[0, 0]} to={z} color={Z} />
        <Vector from={[0, 0]} to={w} color={W} />
        <Point at={result} r={6} color={R} />
        <Label
          at={result}
          anchor="bottom-left"
          offset={[8, -6]}
          color={R}
          className="text-sm font-semibold"
        >
          {op === 'add' ? 'z + w' : 'z · w'}
        </Label>
        <MovablePoint
          x={z[0]}
          y={z[1]}
          onMove={(x, y) => setZ(keep([x, y]))}
          color={Z}
          label="z"
          step={0.5}
        />
        <MovablePoint
          x={w[0]}
          y={w[1]}
          onMove={(x, y) => setW(keep([x, y]))}
          color={W}
          label="w"
          step={0.5}
        />
        <Label
          at={z}
          anchor="bottom-right"
          offset={[-8, -6]}
          color={Z}
          className="text-sm font-semibold"
        >
          z
        </Label>
        <Label
          at={w}
          anchor="bottom-right"
          offset={[-8, -6]}
          color={W}
          className="text-sm font-semibold"
        >
          w
        </Label>
      </Plot>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <Segmented
          label="Operation"
          value={op}
          onChange={setOp}
          options={[
            { value: 'add', label: 'Add: z + w' },
            { value: 'multiply', label: 'Multiply: z · w' },
          ]}
        />
        <p className="text-[1.05rem]" aria-live="polite">
          <Tex>{`(${complexTex(z)}) ${op === 'add' ? '+' : '\\cdot'} (${complexTex(w)}) = ${complexTex(result)}`}</Tex>
        </p>
        <Readouts
          items={
            op === 'add'
              ? [
                  { label: 'z', value: <Tex>{complexTex(z)}</Tex>, color: Z },
                  { label: 'w', value: <Tex>{complexTex(w)}</Tex>, color: W },
                  { label: 'z + w', value: <Tex>{complexTex(result)}</Tex>, color: R },
                ]
              : [
                  {
                    label: 'lengths',
                    value: `${fmt(abs(z))} × ${fmt(abs(w))} = ${fmt(abs(result))}`,
                  },
                  {
                    label: 'angles',
                    value: `${fmt(zArg, 1)}° + ${fmt(wArg, 1)}° → ${fmt(resultArg, 1)}°`,
                    color: R,
                  },
                ]
          }
        />
      </div>
    </>
  )
}

function EulerMode({
  theta: t0 = Math.PI / 3,
  n: n0 = 4,
  onState,
}: {
  theta?: number
  n?: number
  onState: (s: ComplexPlaneState) => void
}) {
  const [theta, setTheta] = useState(t0)
  const [n, setN] = useState(n0)
  const point: Vec2 = [Math.cos(theta), Math.sin(theta)]
  // (1 + iθ/n)^k for k = 0…n: n small turns, each a little too long, spiral towards e^{iθ}.
  const step: Vec2 = [1, theta / n]
  const path: Vec2[] = [[1, 0]]
  for (let k = 0; k < n; k++) path.push(mul(path[path.length - 1], step))
  const approx = path[path.length - 1]
  const error = Math.hypot(approx[0] - point[0], approx[1] - point[1])
  useReport<ComplexPlaneState>({ mode: 'euler', theta, n, point, approx, error }, onState)
  return (
    <>
      <Plot
        view={{ xMin: -2.2, xMax: 2.2, yMin: -2.2, yMax: 2.2 }}
        aspect="equal"
        ariaLabel={`e to the i theta with theta ${fmt(theta)} lands at ${complexTex(point)}`}
      >
        <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1.5} />
        {theta > 0 && <AngleArc center={[0, 0]} from={0} to={theta} radius={24} color={Z} />}
        <Polyline points={path} color={R} width={2} />
        {path.map((p, i) => (
          <Point key={i} at={p} r={i === path.length - 1 ? 5 : 3} color={R} />
        ))}
        <Vector from={[0, 0]} to={point} color={Z} width={2.5} />
        <MovablePoint
          x={point[0]}
          y={point[1]}
          onMove={(x, y) => {
            const a = Math.atan2(y, x)
            setTheta(Math.round((((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) * 100) / 100)
          }}
          constrain={constraints.onCircle([0, 0], 1)}
          color={Z}
          label="e to the i theta"
        />
        <Label
          at={point}
          anchor="bottom-left"
          offset={[8, -8]}
          color={Z}
          className="text-sm font-semibold"
        >
          <Tex>{'e^{i\\theta}'}</Tex>
        </Label>
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label={<Tex>\theta</Tex>}
          name="theta"
          value={theta}
          min={0}
          max={6.28}
          step={0.01}
          onChange={setTheta}
          color={Z}
        />
        <Slider label="Steps n" value={n} min={1} max={60} step={1} onChange={setN} color={R} />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: <Tex>{'e^{i\\theta}'}</Tex>,
              value: <Tex>{complexTex([+point[0].toFixed(3), +point[1].toFixed(3)])}</Tex>,
              color: Z,
            },
            {
              label: <Tex>{`(1 + i\\theta/${n})^{${n}}`}</Tex>,
              value: <Tex>{complexTex([+approx[0].toFixed(3), +approx[1].toFixed(3)])}</Tex>,
              color: R,
            },
            { label: 'gap', value: fmt(error, 3) },
          ]}
        />
      </div>
    </>
  )
}

export default function ComplexPlaneWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'complexPlane'>) {
  return preset.mode === 'arithmetic' ? (
    <ArithmeticMode {...preset} onState={onStateChange} />
  ) : (
    <EulerMode {...preset} onState={onStateChange} />
  )
}
