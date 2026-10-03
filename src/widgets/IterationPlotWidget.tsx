import { RotateCcw, StepForward } from 'lucide-react'
import { useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, MovablePoint, Plot, Point, Polygon, Segment } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

type SeriesId = 'geometric' | 'harmonic' | 'alternating' | 'basel'
type NewtonFn = 'sqrt2' | 'cosx' | 'cubic'

export type IterationPlotPreset =
  | { mode: 'sequence'; kind?: 'arithmetic' | 'geometric'; a?: number; d?: number; r?: number }
  | { mode: 'series'; series?: SeriesId; r?: number }
  | { mode: 'newton'; fn?: NewtonFn; x0?: number }
  | { mode: 'sums'; n?: number }

export type IterationPlotState =
  | {
      mode: 'sequence'
      kind: 'arithmetic' | 'geometric'
      a: number
      d: number
      r: number
      terms: number[]
    }
  | {
      mode: 'series'
      series: SeriesId
      r: number
      n: number
      partial: number
      limit: number | null
    }
  | { mode: 'newton'; fn: NewtonFn; steps: number; x: number; residual: number }
  | { mode: 'sums'; n: number; sum: number }

const BAR = 'var(--c-blue)'
const ALT = 'var(--c-orange)'
const fmt = (v: number, d = 3) => formatNumber(v, d)

function Bars({ values, color }: { values: number[]; color: string }) {
  return (
    <>
      {values.map((v, i) => (
        <Polygon
          key={i}
          points={[
            [i + 0.62, 0],
            [i + 1.38, 0],
            [i + 1.38, v],
            [i + 0.62, v],
          ]}
          fill={color}
          fillOpacity={0.7}
          stroke={color}
          strokeWidth={1}
        />
      ))}
    </>
  )
}

function SequenceMode(p: {
  kind?: 'arithmetic' | 'geometric'
  a?: number
  d?: number
  r?: number
  onState: (s: IterationPlotState) => void
}) {
  const [kind, setKind] = useState(p.kind ?? 'arithmetic')
  const [a, setA] = useState(p.a ?? 2)
  const [d, setD] = useState(p.d ?? 3)
  const [r, setR] = useState(p.r ?? 1.5)
  const terms = Array.from({ length: 12 }, (_, i) =>
    kind === 'arithmetic' ? a + d * i : a * r ** i,
  )
  useReport<IterationPlotState>({ mode: 'sequence', kind, a, d, r, terms }, p.onState)
  const lo = Math.min(0, ...terms)
  const hi = Math.max(1, ...terms)
  const pad = (hi - lo) * 0.1
  return (
    <>
      <Plot
        view={{ xMin: 0, xMax: 12.8, yMin: lo - pad, yMax: hi + pad }}
        height={260}
        xIntegers
        xLabel="term number n"
        ariaLabel={`First terms: ${terms
          .slice(0, 6)
          .map((t) => fmt(t, 2))
          .join(', ')}…`}
      >
        <Bars values={terms} color={BAR} />
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
        <Segmented
          label="Kind of sequence"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'arithmetic', label: 'Add d each time' },
            { value: 'geometric', label: 'Multiply by r' },
          ]}
        />
        <Slider
          label="First term a"
          value={a}
          min={-5}
          max={5}
          step={0.5}
          onChange={setA}
          color={BAR}
        />
        {kind === 'arithmetic' ? (
          <Slider
            label="Common difference d"
            value={d}
            min={-3}
            max={3}
            step={0.5}
            onChange={setD}
            color={BAR}
          />
        ) : (
          <Slider
            label="Common ratio r"
            value={r}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={setR}
            color={BAR}
          />
        )}
      </div>
      <p className="border-t border-line px-3 py-2 text-[1.05rem] sm:px-4">
        <Tex>
          {kind === 'arithmetic'
            ? `a_n = ${fmt(a, 2)} + ${fmt(d, 2)}(n - 1)`
            : `a_n = ${fmt(a, 2)} \\cdot ${fmt(r, 2)}^{\\,n - 1}`}
        </Tex>
        <span className="ml-3 text-sm text-ink-2">
          {terms
            .slice(0, 6)
            .map((t) => fmt(t, 2))
            .join(', ')}
          , …
        </span>
      </p>
    </>
  )
}

const SERIES: Record<
  SeriesId,
  {
    label: string
    tex: (r: number) => string
    term: (k: number, r: number) => number
    limit: (r: number) => number | null
  }
> = {
  geometric: {
    label: 'Geometric',
    tex: (r) => `1 + ${fmt(r, 2)} + ${fmt(r, 2)}^2 + \\cdots`,
    term: (k, r) => r ** (k - 1),
    limit: (r) => (Math.abs(r) < 1 ? 1 / (1 - r) : null),
  },
  harmonic: {
    label: 'Harmonic',
    tex: () => '1 + \\tfrac12 + \\tfrac13 + \\tfrac14 + \\cdots',
    term: (k) => 1 / k,
    limit: () => null,
  },
  alternating: {
    label: 'Alternating',
    tex: () => '1 - \\tfrac12 + \\tfrac13 - \\tfrac14 + \\cdots',
    term: (k) => (k % 2 ? 1 : -1) / k,
    limit: () => Math.LN2,
  },
  basel: {
    label: 'Squares',
    tex: () => '1 + \\tfrac14 + \\tfrac19 + \\tfrac1{16} + \\cdots',
    term: (k) => 1 / (k * k),
    limit: () => (Math.PI * Math.PI) / 6,
  },
}

function SeriesMode(p: {
  series?: SeriesId
  r?: number
  onState: (s: IterationPlotState) => void
}) {
  const [series, setSeries] = useState<SeriesId>(p.series ?? 'geometric')
  const [r, setR] = useState(p.r ?? 0.5)
  const [n, setN] = useState(10)
  const S = SERIES[series]
  const partials = Array.from({ length: n }, (_, i) => i + 1).reduce<number[]>(
    (acc, k) => [...acc, (acc[acc.length - 1] ?? 0) + S.term(k, r)],
    [],
  )
  const limit = S.limit(r)
  const partial = partials[partials.length - 1]
  useReport<IterationPlotState>({ mode: 'series', series, r, n, partial, limit }, p.onState)
  const hi = Math.max(2, limit ?? 0, ...partials) * 1.1
  const lo = Math.min(0, ...partials)
  const pts: Vec2[] = partials.map((s, i) => [i + 1, s])
  return (
    <>
      <Plot
        view={{ xMin: 0, xMax: n + 1, yMin: lo - hi * 0.05, yMax: hi }}
        height={260}
        xIntegers
        xLabel="terms added"
        ariaLabel={`Sum of the first ${n} terms is ${fmt(partial)}`}
      >
        {limit !== null && (
          <Segment from={[0, limit]} to={[n + 1, limit]} color={ALT} dashed width={1.75} />
        )}
        {pts.map((q, i) => (
          <Point key={i} at={q} r={n > 50 ? 2.5 : 4} color={BAR} />
        ))}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-ink-2">Series</span>
          <select
            value={series}
            onChange={(e) => setSeries(e.target.value as SeriesId)}
            className="h-10 rounded-xl border border-line-strong bg-surface px-3"
          >
            {(Object.keys(SERIES) as SeriesId[]).map((id) => (
              <option key={id} value={id}>
                {SERIES[id].label}
              </option>
            ))}
          </select>
        </label>
        <Slider
          label="Terms added n"
          value={n}
          min={1}
          max={100}
          step={1}
          onChange={setN}
          color={BAR}
        />
        {series === 'geometric' && (
          <Slider
            label="Ratio r"
            value={r}
            min={-1.2}
            max={1.2}
            step={0.05}
            onChange={setR}
            color={BAR}
          />
        )}
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <p className="pt-2 text-[1.05rem]">
          <Tex>{S.tex(r)}</Tex>
        </p>
        <Readouts
          items={[
            { label: `sum of ${n} terms`, value: fmt(partial, 5), color: BAR },
            {
              label: 'adds up to',
              value: limit === null ? 'no limit: it keeps growing' : fmt(limit, 5),
              color: ALT,
            },
          ]}
        />
      </div>
    </>
  )
}

const NEWTON: Record<
  NewtonFn,
  {
    label: string
    tex: string
    f: (x: number) => number
    df: (x: number) => number
    view: [number, number, number, number]
  }
> = {
  sqrt2: {
    label: 'x² − 2',
    tex: 'f(x) = x^2 - 2',
    f: (x) => x * x - 2,
    df: (x) => 2 * x,
    view: [-0.5, 4, -3, 8],
  },
  cosx: {
    label: 'cos x − x',
    tex: 'f(x) = \\cos x - x',
    f: (x) => Math.cos(x) - x,
    df: (x) => -Math.sin(x) - 1,
    view: [-1.5, 3, -3.5, 2],
  },
  cubic: {
    label: 'x³ − 2x − 5',
    tex: 'f(x) = x^3 - 2x - 5',
    f: (x) => x ** 3 - 2 * x - 5,
    df: (x) => 3 * x * x - 2,
    view: [-0.5, 4, -10, 30],
  },
}

function NewtonMode(p: { fn?: NewtonFn; x0?: number; onState: (s: IterationPlotState) => void }) {
  const [fn, setFn] = useState<NewtonFn>(p.fn ?? 'sqrt2')
  const [xs, setXs] = useState<number[]>([p.x0 ?? 3])
  const F = NEWTON[fn]
  const x = xs[xs.length - 1]
  useReport<IterationPlotState>(
    { mode: 'newton', fn, steps: xs.length - 1, x, residual: Math.abs(F.f(x)) },
    p.onState,
  )
  const step = () => {
    const slope = F.df(x)
    if (Math.abs(slope) < 1e-12) return
    setXs([...xs, x - F.f(x) / slope])
  }
  const [x0, x1, y0, y1] = F.view
  return (
    <>
      <Plot
        view={{ xMin: x0, xMax: x1, yMin: y0, yMax: y1 }}
        height={300}
        ariaLabel={`Newton's method on ${F.label}: after ${xs.length - 1} steps x = ${fmt(x, 6)}`}
      >
        <FunctionGraph fn={F.f} color={BAR} width={2.5} />
        {xs.slice(0, -1).map((xi, i) => (
          <g key={i}>
            <Segment from={[xi, 0]} to={[xi, F.f(xi)]} color="var(--ink-3)" dashed width={1} />
            <Segment from={[xi, F.f(xi)]} to={[xs[i + 1], 0]} color={ALT} width={1.75} />
            <Point at={[xi, F.f(xi)]} r={3.5} color={ALT} />
          </g>
        ))}
        <MovablePoint
          x={xs[0]}
          y={0}
          onMove={(nx) => setXs([nx])}
          constrain={([nx]) => [Math.min(x1, Math.max(x0, nx)), 0]}
          step={0.1}
          color={ALT}
          label="Starting guess"
        />
        {xs.length > 1 && <Point at={[x, 0]} r={6} color="var(--good)" />}
      </Plot>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Function"
            value={fn}
            onChange={(v) => {
              setFn(v)
              setXs([NEWTON[v].view[1] - 1])
            }}
            options={(Object.keys(NEWTON) as NewtonFn[]).map((id) => ({
              value: id,
              label: NEWTON[id].label,
            }))}
          />
          <Button
            size="sm"
            variant="primary"
            icon={<StepForward className="size-4" />}
            disabled={xs.length > 12}
            onClick={step}
          >
            Newton step
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            disabled={xs.length === 1}
            onClick={() => setXs([xs[0]])}
          >
            Restart
          </Button>
        </div>
        <ol className="grid gap-0.5 font-mono text-sm">
          {xs.map((xi, i) => (
            <li key={i}>
              x<sub>{i}</sub> = {formatNumber(xi, 10)}{' '}
              <span className="text-ink-3">f = {formatNumber(F.f(xi), 10)}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}

function SumsMode(p: { n?: number; onState: (s: IterationPlotState) => void }) {
  const [n, setN] = useState(p.n ?? 5)
  const sum = (n * (n + 1)) / 2
  useReport<IterationPlotState>({ mode: 'sums', n, sum }, p.onState)
  const cells: { x: number; y: number; copy: boolean }[] = []
  for (let col = 1; col <= n; col++) {
    for (let row = 0; row < col; row++) cells.push({ x: col - 1, y: row, copy: false })
    for (let row = col; row < n + 1; row++) cells.push({ x: col - 1, y: row, copy: true })
  }
  const size = Math.min(34, 300 / (n + 1))
  return (
    <>
      <div className="flex justify-center p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${n * size + 4} ${(n + 1) * size + 4}`}
          className="block h-auto w-full"
          style={{ maxWidth: Math.min(384, 44 * n + 40) }}
          role="img"
          aria-label={`Two staircases of 1 + 2 + … + ${n} make a ${n} by ${n + 1} rectangle`}
        >
          {cells.map((c, i) => (
            <rect
              key={i}
              x={2 + c.x * size}
              y={2 + (n - c.y) * size}
              width={size - 2}
              height={size - 2}
              rx={3}
              fill={c.copy ? ALT : BAR}
              fillOpacity={c.copy ? 0.35 : 0.8}
            />
          ))}
        </svg>
      </div>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <Slider label="n" value={n} min={1} max={12} step={1} onChange={setN} color={BAR} />
        <p className="text-[1.05rem]">
          <Tex>{`1 + 2 + \\cdots + ${n} = ${sum} = \\frac{${n} \\times ${n + 1}}{2}`}</Tex>
        </p>
        <p className="text-sm text-ink-2">
          Blue: the staircase 1 + 2 + … + n. Orange: a copy turned upside down. Together they make
          an n by (n + 1) rectangle.
        </p>
      </div>
    </>
  )
}

export default function IterationPlotWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'iterationPlot'>) {
  switch (preset.mode) {
    case 'sequence':
      return <SequenceMode {...preset} onState={onStateChange} />
    case 'series':
      return <SeriesMode {...preset} onState={onStateChange} />
    case 'newton':
      return <NewtonMode {...preset} onState={onStateChange} />
    case 'sums':
      return <SumsMode {...preset} onState={onStateChange} />
  }
}
