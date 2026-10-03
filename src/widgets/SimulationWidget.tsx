import { useState } from 'react'
import { formatNumber } from '@/math/core'
import { createRng } from '@/math/random'
import { binomialPmf } from '@/math/stats'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { InfiniteLine, Label, Plot, Polygon, Segment } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export type SimulationPreset =
  { mode: 'ci'; n?: number; level?: Level } | { mode: 'test'; n?: number; k?: number }

type Level = '80' | '90' | '95' | '99'

export type SimulationState =
  | {
      mode: 'ci'
      n: number
      level: number
      drawn: number
      captured: number
      /** Share of intervals that contain the true mean (0–1). */
      rate: number
      width: number
    }
  | {
      mode: 'test'
      n: number
      k: number
      simulations: number
      /** Share of simulated fair-coin runs at least as extreme as k (NaN before any run). */
      simulatedP: number
      exactP: number
      reject: boolean
    }

const rng = createRng(Date.now())
const fmt = (v: number, d = 2) => formatNumber(v, d)
const Z: Record<Level, number> = { '80': 1.2816, '90': 1.6449, '95': 1.96, '99': 2.5758 }
const MU = 50
const SIGMA = 10
const SHOWN = 40
const IN = 'var(--c-blue)'
const OUT = 'var(--c-red)'

type Interval = { lo: number; hi: number; mean: number }

function sampleMean(n: number) {
  let s = 0
  for (let i = 0; i < n; i++) s += rng.normal(MU, SIGMA)
  return s / n
}

function CiMode({
  n: n0 = 25,
  level: l0 = '95',
  onState,
}: {
  n?: number
  level?: Level
  onState: (s: SimulationState) => void
}) {
  const [n, setN] = useState(n0)
  const [level, setLevel] = useState<Level>(l0)
  const [intervals, setIntervals] = useState<Interval[]>([])
  const half = (Z[level] * SIGMA) / Math.sqrt(n)
  const captured = intervals.filter((iv) => iv.lo <= MU && MU <= iv.hi).length
  const rate = intervals.length ? captured / intervals.length : 0
  useReport<SimulationState>(
    {
      mode: 'ci',
      n,
      level: Number(level),
      drawn: intervals.length,
      captured,
      rate,
      width: 2 * half,
    },
    onState,
  )
  const draw = (count: number) =>
    setIntervals((all) => [
      ...all,
      ...Array.from({ length: count }, () => {
        const m = sampleMean(n)
        return { lo: m - half, hi: m + half, mean: m }
      }),
    ])
  const shown = intervals.slice(-SHOWN)
  return (
    <>
      <Plot
        view={{ xMin: 35, xMax: 65, yMin: -1, yMax: SHOWN + 1 }}
        height={340}
        grid={false}
        axes="x"
        ariaLabel={`${intervals.length} confidence intervals, ${captured} contain the true mean`}
      >
        <InfiniteLine through={[MU, 0]} direction={[0, 1]} color="var(--ink)" width={2} />
        <Label at={[MU, SHOWN + 0.6]} anchor="bottom" className="text-xs font-semibold">
          true mean μ = 50
        </Label>
        {shown.map((iv, i) => {
          const hit = iv.lo <= MU && MU <= iv.hi
          return (
            <g key={intervals.length - shown.length + i}>
              <Segment
                from={[iv.lo, i + 0.5]}
                to={[iv.hi, i + 0.5]}
                color={hit ? IN : OUT}
                width={hit ? 2.5 : 3.5}
              />
              <Segment
                from={[iv.mean, i + 0.2]}
                to={[iv.mean, i + 0.8]}
                color={hit ? IN : OUT}
                width={2}
              />
            </g>
          )
        })}
        {intervals.length === 0 && (
          <Label at={[MU, SHOWN / 2]} className="text-sm text-ink-2">
            Draw a sample to make its interval
          </Label>
        )}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label="Sample size n"
          value={n}
          min={5}
          max={100}
          step={5}
          onChange={setN}
          color={IN}
        />
        <Segmented
          label="Confidence level"
          value={level}
          onChange={setLevel}
          options={(['80', '90', '95', '99'] as Level[]).map((l) => ({ value: l, label: `${l}%` }))}
        />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-3 sm:p-4">
        <Button size="sm" onClick={() => draw(1)}>
          Draw 1 sample
        </Button>
        <Button size="sm" variant="secondary" onClick={() => draw(20)}>
          Draw 20
        </Button>
        <Button size="sm" variant="secondary" onClick={() => draw(100)}>
          Draw 100
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIntervals([])}
          disabled={!intervals.length}
        >
          Clear
        </Button>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'intervals', value: String(intervals.length) },
            {
              label: 'contain μ',
              value: intervals.length ? `${captured} (${fmt(rate * 100, 1)}%)` : '–',
              color: IN,
            },
            { label: 'each interval', value: <Tex>{`\\bar x \\pm ${fmt(half, 2)}`}</Tex> },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Each line is one sample’s interval{' '}
          <Tex>{`\\bar x \\pm ${Z[level]}\\,\\sigma/\\sqrt n`}</Tex>; the tick is its sample mean.
          Red intervals missed the true mean.
        </p>
      </div>
    </>
  )
}

/** Two-sided p-value for k heads in n fair flips: P(at least as far from n/2 as k). */
function exactPValue(n: number, k: number) {
  const d = Math.abs(k - n / 2)
  let p = 0
  for (let j = 0; j <= n; j++) if (Math.abs(j - n / 2) >= d - 1e-9) p += binomialPmf(j, n, 0.5)
  return Math.min(1, p)
}

function TestMode({
  n = 50,
  k: k0 = 31,
  onState,
}: {
  n?: number
  k?: number
  onState: (s: SimulationState) => void
}) {
  const [k, setK] = useState(k0)
  const [counts, setCounts] = useState<number[]>(() => Array(n + 1).fill(0))
  const simulations = counts.reduce((a, b) => a + b, 0)
  const d = Math.abs(k - n / 2)
  const extreme = (j: number) => Math.abs(j - n / 2) >= d - 1e-9
  const tail = counts.reduce((s, c, j) => s + (extreme(j) ? c : 0), 0)
  const simulatedP = simulations ? tail / simulations : NaN
  const exactP = exactPValue(n, k)
  const reject = exactP < 0.05
  useReport<SimulationState>(
    { mode: 'test', n, k, simulations, simulatedP, exactP, reject },
    onState,
  )
  const run = (times: number) =>
    setCounts((c) => {
      const next = [...c]
      for (let t = 0; t < times; t++) {
        let heads = 0
        for (let i = 0; i < n; i++) if (rng.next() < 0.5) heads++
        next[heads]++
      }
      return next
    })
  const top = Math.max(1, ...counts)
  const lo = Math.floor(n * 0.15)
  const hi = Math.ceil(n * 0.85)
  return (
    <>
      <Plot
        view={{ xMin: lo - 0.5, xMax: hi + 0.5, yMin: 0, yMax: top * 1.15 }}
        height={260}
        axes="x"
        xIntegers
        ariaLabel={`${simulations} simulated fair-coin experiments; ${tail} at least as extreme as ${k} heads`}
      >
        {counts.map((c, j) =>
          j >= lo && j <= hi && c > 0 ? (
            <Polygon
              key={j}
              points={[
                [j - 0.4, 0],
                [j + 0.4, 0],
                [j + 0.4, c],
                [j - 0.4, c],
              ]}
              fill={extreme(j) ? 'var(--c-orange)' : 'var(--c-blue)'}
              fillOpacity={extreme(j) ? 0.85 : 0.5}
              stroke="none"
            />
          ) : null,
        )}
        <InfiniteLine through={[k, 0]} direction={[0, 1]} color="var(--ink)" width={2} dashed />
        <Label at={[k, top * 1.08]} anchor="left" offset={[6, 0]} className="text-xs font-semibold">
          you saw {k}
        </Label>
        {simulations === 0 && (
          <Label at={[n / 2, top * 0.5]} className="text-sm text-ink-2">
            Simulate fair coins to see what chance alone does
          </Label>
        )}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-4">
        <Slider
          label={`Heads you observed (out of ${n} flips)`}
          value={k}
          min={0}
          max={n}
          step={1}
          onChange={setK}
          color="var(--ink-2)"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => run(100)}>
            Simulate 100
          </Button>
          <Button size="sm" variant="secondary" onClick={() => run(1000)}>
            Simulate 1,000
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCounts(Array(n + 1).fill(0))}
            disabled={!simulations}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'simulated runs', value: simulations.toLocaleString() },
            {
              label: 'as extreme as yours',
              value: simulations ? `${tail} (${fmt(simulatedP * 100, 1)}%)` : '–',
              color: 'var(--c-orange)',
            },
            { label: 'exact p-value', value: fmt(exactP, 4) },
            {
              label: 'at the 5% level',
              value: reject ? 'reject “fair coin”' : 'no strong evidence',
            },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          The bars show head counts from fair coins. Orange bars are at least as far from {n / 2} as
          your result: their share is the p-value.
        </p>
      </div>
    </>
  )
}

export default function SimulationWidget({
  preset: p,
  onStateChange: on,
}: WidgetComponentProps<'simulation'>) {
  return p.mode === 'ci' ? (
    <CiMode n={p.n} level={p.level} onState={on} />
  ) : (
    <TestMode n={p.n} k={p.k} onState={on} />
  )
}
