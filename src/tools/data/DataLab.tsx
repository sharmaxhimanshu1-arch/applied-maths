import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatNumber, roundTo } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { linearRegression, mean, median, sse as sumSquares, std } from '@/math/stats'
import { Button } from '@/ui/Button'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { usePlot } from '@/viz/context'
import { InfiniteLine, Label, MovablePoint, Plot, Segment } from '@/viz'
import type { View } from '@/viz/scale'
import { SCATTER_DATASETS, VALUES_DATASETS } from './datasets'

export interface DataLabPreset {
  mode?: 'scatter' | 'dots'
  /** Dataset id from datasets.ts, or explicit data below. */
  dataset?: string
  points?: Vec2[]
  values?: number[]
  view?: View
  range?: [number, number]
  show?: Partial<
    Record<
      | 'fit'
      | 'residuals'
      | 'squares'
      | 'means'
      | 'quadrants'
      | 'userLine'
      | 'median'
      | 'deviations'
      | 'sdBand',
      boolean
    >
  >
  /** Which toggles appear (default: all relevant ones). */
  toggles?: boolean
  editable?: boolean
  height?: number
}

export interface DataLabState {
  mode: 'scatter' | 'dots'
  n: number
  points: Vec2[]
  values: number[]
  mean: number
  median: number
  sd: number
  r: number
  slope: number
  intercept: number
  sse: number
  userSlope?: number
  userIntercept?: number
  userSse?: number
}

const POINT = 'var(--c-orange)'
const FIT = 'var(--c-blue)'
const USER = 'var(--c-violet)'

export function DataLab({
  preset = {},
  onStateChange,
}: {
  preset?: DataLabPreset
  onStateChange?: (s: DataLabState) => void
}) {
  const mode = preset.mode ?? 'scatter'
  return mode === 'scatter' ? (
    <ScatterLab preset={preset} onStateChange={onStateChange} />
  ) : (
    <DotsLab preset={preset} onStateChange={onStateChange} />
  )
}

// ── Scatter (two variables) ───────────────────────────────────────────────

function ScatterLab({
  preset,
  onStateChange,
}: {
  preset: DataLabPreset
  onStateChange?: (s: DataLabState) => void
}) {
  const ds = SCATTER_DATASETS.find((d) => d.id === preset.dataset) ?? SCATTER_DATASETS[0]
  const [points, setPoints] = useState<Vec2[]>(preset.points ?? ds.points)
  const view = preset.view ?? ds.view
  const [show, setShow] = useState({
    fit: preset.show?.fit ?? true,
    residuals: preset.show?.residuals ?? false,
    squares: preset.show?.squares ?? false,
    means: preset.show?.means ?? false,
    quadrants: preset.show?.quadrants ?? false,
    userLine: preset.show?.userLine ?? false,
  })
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const fit = useMemo(() => linearRegression(xs, ys), [xs, ys])
  const mx = mean(xs)
  const my = mean(ys)
  // The learner's own line, defined by two draggable points.
  const span = view.xMax - view.xMin
  const [u1, setU1] = useState<Vec2>([view.xMin + span * 0.2, my || (view.yMin + view.yMax) / 2])
  const [u2, setU2] = useState<Vec2>([view.xMin + span * 0.8, my || (view.yMin + view.yMax) / 2])
  const userSlope = (u2[1] - u1[1]) / (u2[0] - u1[0] || 1e-9)
  const userIntercept = u1[1] - userSlope * u1[0]
  const userSse = sumSquares(xs, ys, userSlope, userIntercept)
  const editable = preset.editable ?? true
  const line =
    show.userLine && !show.fit
      ? { m: userSlope, b: userIntercept }
      : { m: fit.slope, b: fit.intercept }

  useEffect(() => {
    onStateChange?.({
      mode: 'scatter',
      n: points.length,
      points,
      values: ys,
      mean: my,
      median: median(ys),
      sd: std(ys),
      r: fit.r,
      slope: fit.slope,
      intercept: fit.intercept,
      sse: fit.sse,
      userSlope: show.userLine ? userSlope : undefined,
      userIntercept: show.userLine ? userIntercept : undefined,
      userSse: show.userLine ? userSse : undefined,
    })
  }, [onStateChange, points, ys, my, fit, show.userLine, userSlope, userIntercept, userSse])

  const snap = (v: number) => roundTo(v, 1)

  return (
    <div className="grid">
      <Plot
        view={view}
        height={preset.height ?? 380}
        ariaLabel={`Scatter plot of ${points.length} points. Correlation ${formatNumber(fit.r, 2)}.`}
        xLabel={ds.xLabel}
        yLabel={ds.yLabel}
        onBackgroundPointerDown={
          editable ? ([x, y]) => setPoints((ps) => [...ps, [snap(x), snap(y)]]) : undefined
        }
      >
        {show.quadrants && points.length > 1 && <Quadrants mx={mx} my={my} points={points} />}
        {show.means && points.length > 0 && (
          <>
            <Segment
              from={[mx, view.yMin - 1000]}
              to={[mx, view.yMax + 1000]}
              color="var(--ink-3)"
              dashed
              width={1.5}
            />
            <Segment
              from={[view.xMin - 1000, my]}
              to={[view.xMax + 1000, my]}
              color="var(--ink-3)"
              dashed
              width={1.5}
            />
            <Label
              at={[mx, view.yMax]}
              anchor="top-left"
              offset={[4, 4]}
              className="text-xs text-ink-2"
            >
              <Tex>{'\\bar x'}</Tex>
            </Label>
            <Label
              at={[view.xMax, my]}
              anchor="bottom-right"
              offset={[-4, -2]}
              className="text-xs text-ink-2"
            >
              <Tex>{'\\bar y'}</Tex>
            </Label>
          </>
        )}
        {(show.squares || show.residuals) && points.length > 1 && (
          <Residuals
            points={points}
            m={line.m}
            b={line.b}
            squares={show.squares}
            color={show.userLine && !show.fit ? USER : FIT}
          />
        )}
        {show.fit && points.length > 1 && (
          <InfiniteLine
            through={[0, fit.intercept]}
            direction={[1, fit.slope]}
            color={FIT}
            width={2.5}
          />
        )}
        {show.userLine && (
          <>
            <InfiniteLine
              through={u1}
              direction={[u2[0] - u1[0], u2[1] - u1[1]]}
              color={USER}
              width={2.5}
              dashed={show.fit}
            />
            <MovablePoint
              x={u1[0]}
              y={u1[1]}
              onMove={(x, y) => setU1([x, y])}
              color={USER}
              size={6}
              label="Your line, first handle"
            />
            <MovablePoint
              x={u2[0]}
              y={u2[1]}
              onMove={(x, y) => setU2([x, y])}
              color={USER}
              size={6}
              label="Your line, second handle"
            />
          </>
        )}
        {points.map((p, i) => (
          <MovablePoint
            key={i}
            x={p[0]}
            y={p[1]}
            size={5.5}
            color={POINT}
            label={`Data point ${i + 1}`}
            step={(view.xMax - view.xMin) / 100}
            onMove={(x, y) =>
              setPoints((ps) => ps.map((q, k) => (k === i ? [snap(x), snap(y)] : q)))
            }
            onRemove={editable ? () => setPoints((ps) => ps.filter((_, k) => k !== i)) : undefined}
          />
        ))}
      </Plot>

      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <dl className="flex flex-wrap gap-2 text-sm" aria-live="polite">
          <Stat label="n" value={String(points.length)} />
          <Stat label="r" value={points.length > 1 ? formatNumber(fit.r, 3) : '–'} />
          {show.fit && points.length > 1 && (
            <Stat
              label="best fit"
              value={`y = ${formatNumber(fit.slope, 2)}x ${fit.intercept < 0 ? '−' : '+'} ${formatNumber(Math.abs(fit.intercept), 2)}`}
              color={FIT}
            />
          )}
          {(show.squares || show.residuals) && points.length > 1 && (
            <Stat
              label="squared error"
              value={formatNumber(show.userLine && !show.fit ? userSse : fit.sse, 1)}
            />
          )}
          {show.userLine && (
            <Stat label="your line's error" value={formatNumber(userSse, 1)} color={USER} />
          )}
        </dl>
        {(preset.toggles ?? true) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Switch
              label="Best-fit line"
              checked={show.fit}
              onChange={(v) => setShow((s) => ({ ...s, fit: v }))}
            />
            <Switch
              label="Your own line"
              checked={show.userLine}
              onChange={(v) => setShow((s) => ({ ...s, userLine: v }))}
            />
            <Switch
              label="Residuals"
              checked={show.residuals}
              onChange={(v) => setShow((s) => ({ ...s, residuals: v }))}
            />
            <Switch
              label="Squares"
              checked={show.squares}
              onChange={(v) => setShow((s) => ({ ...s, squares: v }))}
            />
            <Switch
              label="Means"
              checked={show.means}
              onChange={(v) => setShow((s) => ({ ...s, means: v }))}
            />
            <Switch
              label="Quadrants"
              checked={show.quadrants}
              onChange={(v) => setShow((s) => ({ ...s, quadrants: v }))}
            />
          </div>
        )}
        {editable && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
            <span>
              Click empty space to add a point; double-click or press Delete to remove one.
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              onClick={() => setPoints(preset.points ?? ds.points)}
            >
              Reset data
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPoints([])}>
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Residuals as vertical segments, optionally with their squares (true squares in pixels). */
function Residuals({
  points,
  m,
  b,
  squares,
  color,
}: {
  points: Vec2[]
  m: number
  b: number
  squares: boolean
  color: string
}) {
  const t = usePlot()
  return (
    <g aria-hidden>
      {points.map(([x, y], i) => {
        const yHat = m * x + b
        const px = t.sx(x)
        const py = t.sy(y)
        const ph = t.sy(yHat)
        const side = Math.abs(ph - py)
        return (
          <g key={i}>
            {squares && (
              <rect
                x={px}
                y={Math.min(py, ph)}
                width={side}
                height={side}
                fill={color}
                fillOpacity={0.12}
                stroke={color}
                strokeOpacity={0.45}
              />
            )}
            <line
              x1={px}
              x2={px}
              y1={py}
              y2={ph}
              stroke={color}
              strokeWidth={1.75}
              strokeDasharray="4 3"
            />
          </g>
        )
      })}
    </g>
  )
}

/** Shade points by the sign of (x − x̄)(y − ȳ): the building block of covariance. */
function Quadrants({ mx, my, points }: { mx: number; my: number; points: Vec2[] }) {
  const t = usePlot()
  return (
    <g aria-hidden>
      {points.map(([x, y], i) => {
        const positive = (x - mx) * (y - my) >= 0
        return (
          <rect
            key={i}
            x={Math.min(t.sx(x), t.sx(mx))}
            y={Math.min(t.sy(y), t.sy(my))}
            width={Math.abs(t.sx(x) - t.sx(mx))}
            height={Math.abs(t.sy(y) - t.sy(my))}
            fill={positive ? 'var(--c-blue)' : 'var(--c-red)'}
            fillOpacity={0.08}
            stroke={positive ? 'var(--c-blue)' : 'var(--c-red)'}
            strokeOpacity={0.25}
          />
        )
      })}
    </g>
  )
}

// ── Dot plot (one variable) ───────────────────────────────────────────────

function DotsLab({
  preset,
  onStateChange,
}: {
  preset: DataLabPreset
  onStateChange?: (s: DataLabState) => void
}) {
  const ds = VALUES_DATASETS.find((d) => d.id === preset.dataset) ?? VALUES_DATASETS[0]
  const [values, setValues] = useState<number[]>(preset.values ?? ds.values)
  const range = preset.range ?? ds.range
  const [show, setShow] = useState({
    mean: true,
    median: preset.show?.median ?? true,
    deviations: preset.show?.deviations ?? false,
    sdBand: preset.show?.sdBand ?? false,
  })
  const m = mean(values)
  const med = median(values)
  const sd = std(values)
  const pad = (range[1] - range[0]) * 0.05
  const step = (range[1] - range[0]) / 100

  // Stack equal values so every dot stays visible.
  const stacks = new Map<number, number>()
  const placed = values.map((v) => {
    const key = roundTo(v, 6)
    const level = stacks.get(key) ?? 0
    stacks.set(key, level + 1)
    return level
  })
  const unit = (range[1] - range[0]) / 18

  useEffect(() => {
    onStateChange?.({
      mode: 'dots',
      n: values.length,
      points: [],
      values,
      mean: m,
      median: med,
      sd,
      r: NaN,
      slope: NaN,
      intercept: NaN,
      sse: NaN,
    })
  }, [onStateChange, values, m, med, sd])

  return (
    <div className="grid">
      <Plot
        view={{ xMin: range[0] - pad, xMax: range[1] + pad, yMin: -unit * 2.2, yMax: unit * 6 }}
        height={preset.height ?? 240}
        ariaLabel={`Dot plot of ${values.length} values. Mean ${formatNumber(m, 2)}, median ${formatNumber(med, 2)}.`}
        grid={false}
        onBackgroundPointerDown={
          (preset.editable ?? true) ? ([x]) => setValues((vs) => [...vs, roundTo(x, 1)]) : undefined
        }
      >
        <Segment from={[range[0], 0]} to={[range[1], 0]} color="var(--axis)" width={2} />
        {show.sdBand && values.length > 1 && <SdBand mean={m} sd={sd} height={unit * 5} />}
        {show.deviations && values.length > 0 && (
          <Deviations values={values} levels={placed} unit={unit} mean={m} />
        )}
        {values.map((v, i) => (
          <MovablePoint
            key={i}
            x={v}
            y={unit * (0.7 + placed[i] * 0.9)}
            size={6}
            color={POINT}
            step={step}
            label={`Value ${i + 1}`}
            constrain={([x]) => [
              roundTo(Math.min(range[1], Math.max(range[0], x)), 1),
              unit * (0.7 + placed[i] * 0.9),
            ]}
            onMove={(x) => setValues((vs) => vs.map((w, k) => (k === i ? x : w)))}
            onRemove={
              (preset.editable ?? true)
                ? () => setValues((vs) => vs.filter((_, k) => k !== i))
                : undefined
            }
          />
        ))}
        {show.mean && values.length > 0 && <Fulcrum x={m} unit={unit} />}
        {show.median && values.length > 0 && (
          <>
            <Segment
              from={[med, -unit * 0.1]}
              to={[med, unit * 5.6]}
              color="var(--c-aqua)"
              width={2}
              dashed
            />
            <Label
              at={[med, unit * 5.6]}
              anchor="bottom"
              offset={[0, -2]}
              color="var(--c-aqua)"
              className="text-xs font-semibold"
            >
              median
            </Label>
          </>
        )}
      </Plot>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <dl className="flex flex-wrap gap-2 text-sm" aria-live="polite">
          <Stat label="n" value={String(values.length)} />
          <Stat label="mean" value={formatNumber(m, 2)} color="var(--ink)" />
          <Stat label="median" value={formatNumber(med, 2)} color="var(--c-aqua)" />
          <Stat label="std dev" value={values.length > 1 ? formatNumber(sd, 2) : '–'} />
        </dl>
        {(preset.toggles ?? true) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Switch
              label="Mean (balance point)"
              checked={show.mean}
              onChange={(v) => setShow((s) => ({ ...s, mean: v }))}
            />
            <Switch
              label="Median"
              checked={show.median}
              onChange={(v) => setShow((s) => ({ ...s, median: v }))}
            />
            <Switch
              label="Deviations²"
              checked={show.deviations}
              onChange={(v) => setShow((s) => ({ ...s, deviations: v }))}
            />
            <Switch
              label="±1 std dev"
              checked={show.sdBand}
              onChange={(v) => setShow((s) => ({ ...s, sdBand: v }))}
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <span>Drag dots along the line. Click the line to add a value; Delete removes one.</span>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => setValues(preset.values ?? ds.values)}
          >
            Reset data
          </Button>
        </div>
      </div>
    </div>
  )
}

/** A seesaw fulcrum under the mean: the data balances there. */
function Fulcrum({ x, unit }: { x: number; unit: number }) {
  const t = usePlot()
  const px = t.sx(x)
  const py = t.sy(0)
  const s = 13
  return (
    <g aria-hidden>
      <polygon
        points={`${px},${py + 2} ${px - s},${py + s * 1.5} ${px + s},${py + s * 1.5}`}
        fill="var(--ink)"
      />
      <Label at={[x, -unit * 1.5]} anchor="top" offset={[0, 4]} className="text-xs font-semibold">
        mean
      </Label>
    </g>
  )
}

function Deviations({
  values,
  levels,
  unit,
  mean: m,
}: {
  values: number[]
  levels: number[]
  unit: number
  mean: number
}) {
  const t = usePlot()
  return (
    <g aria-hidden>
      {values.map((v, i) => {
        const y = unit * (0.7 + levels[i] * 0.9)
        const x0 = t.sx(m)
        const x1 = t.sx(v)
        const side = Math.abs(x1 - x0)
        return (
          <g key={i}>
            <rect
              x={Math.min(x0, x1)}
              y={t.sy(y)}
              width={side}
              height={side}
              fill="var(--c-violet)"
              fillOpacity={0.1}
              stroke="var(--c-violet)"
              strokeOpacity={0.4}
            />
            <line
              x1={x0}
              x2={x1}
              y1={t.sy(y)}
              y2={t.sy(y)}
              stroke="var(--c-violet)"
              strokeWidth={2}
            />
          </g>
        )
      })}
    </g>
  )
}

function SdBand({ mean: m, sd, height }: { mean: number; sd: number; height: number }) {
  const t = usePlot()
  return (
    <g aria-hidden>
      <rect
        x={t.sx(m - sd)}
        y={t.sy(height)}
        width={t.sx(m + sd) - t.sx(m - sd)}
        height={t.sy(0) - t.sy(height)}
        fill="var(--c-violet)"
        fillOpacity={0.09}
      />
      <Label
        at={[m + sd, height]}
        anchor="top-right"
        offset={[-4, 4]}
        className="text-xs text-ink-2"
      >
        ±1σ
      </Label>
    </g>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1">
      {color && (
        <span
          aria-hidden
          className="inline-block size-2 rounded-full"
          style={{ background: color }}
        />
      )}
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular font-mono font-medium">{value}</dd>
    </div>
  )
}
