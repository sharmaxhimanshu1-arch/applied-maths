import { RotateCcw } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { formatNumber, TAU } from '@/math/core'
import { createRng } from '@/math/random'
import { prefersReducedMotion } from '@/app/theme'
import { Button } from '@/ui/Button'
import { BarChart, RunButtons } from './charts'
import { Readout } from './CoinExperiment'

export interface SpinnerPreset {
  weights?: number[]
  labels?: string[]
  editable?: boolean
}

export interface SpinnerState {
  kind: 'spinner'
  spins: number
  counts: number[]
  weights: number[]
}

const COLORS = [
  'var(--c-blue)',
  'var(--c-orange)',
  'var(--c-aqua)',
  'var(--c-magenta)',
  'var(--c-green)',
  'var(--c-violet)',
]

export function SpinnerExperiment({
  preset = {},
  onStateChange,
}: {
  preset?: SpinnerPreset
  onStateChange?: (s: SpinnerState) => void
}) {
  const [rng] = useState(() => createRng())
  const [weights, setWeights] = useState(preset.weights ?? [3, 2, 1])
  const labels = preset.labels ?? weights.map((_, i) => String.fromCharCode(65 + i))
  const [counts, setCounts] = useState<number[]>(() => weights.map(() => 0))
  const [spins, setSpins] = useState(0)
  const [rotation, setRotation] = useState(0)
  const total = weights.reduce((a, b) => a + b, 0)

  useEffect(() => {
    onStateChange?.({ kind: 'spinner', spins, counts, weights })
  }, [onStateChange, spins, counts, weights])

  function run(n: number) {
    const next = [...counts]
    let last = 0
    for (let i = 0; i < n; i++) {
      last = rng.weighted(weights)
      next[last]++
    }
    setCounts(next)
    setSpins((s) => s + n)
    // Point the arrow into the middle of the last outcome's sector, after a few whole turns.
    const before = weights.slice(0, last).reduce((a, b) => a + b, 0)
    const mid = ((before + weights[last] / 2) / total) * 360
    setRotation((r) => r - (r % 360) + 360 * (prefersReducedMotion() ? 0 : 3) + mid)
  }

  function reset(w = weights) {
    setWeights(w)
    setCounts(w.map(() => 0))
    setSpins(0)
  }

  const starts = weights.map((_, i) => weights.slice(0, i).reduce((a, b) => a + b, 0))
  const sectors = weights.map((w, i) => ({
    a0: (starts[i] / total) * TAU,
    a1: ((starts[i] + w) / total) * TAU,
    color: COLORS[i % COLORS.length],
    label: labels[i],
  }))

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 p-3 sm:p-4 md:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox="-110 -110 220 220"
          className="size-52"
          role="img"
          aria-label="Spinner with weighted sectors"
        >
          {sectors.map((s) => {
            // Angles measured clockwise from 12 o'clock.
            const p0 = [100 * Math.sin(s.a0), -100 * Math.cos(s.a0)]
            const p1 = [100 * Math.sin(s.a1), -100 * Math.cos(s.a1)]
            const large = s.a1 - s.a0 > Math.PI ? 1 : 0
            const mid = (s.a0 + s.a1) / 2
            return (
              <g key={s.label}>
                <path
                  d={`M0,0L${p0[0]},${p0[1]}A100,100 0 ${large} 1 ${p1[0]},${p1[1]}Z`}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
                <text
                  x={62 * Math.sin(mid)}
                  y={-62 * Math.cos(mid) + 6}
                  textAnchor="middle"
                  fontSize={18}
                  fontWeight={700}
                  fill="#fff"
                >
                  {s.label}
                </text>
              </g>
            )
          })}
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 1.2s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            <path d="M0,-88 L7,0 L-7,0 Z" fill="var(--ink)" />
            <circle r={9} fill="var(--ink)" />
          </g>
        </svg>
        {(preset.editable ?? true) && (
          <div className="grid w-full gap-1.5">
            {weights.map((w, i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block size-3 rounded-sm"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="w-4 font-semibold">{labels[i]}</span>
                <input
                  type="range"
                  className="range flex-1"
                  min={0}
                  max={10}
                  step={1}
                  value={w}
                  aria-label={`Size of sector ${labels[i]}`}
                  onChange={(e) =>
                    reset(weights.map((x, k) => (k === i ? Number(e.target.value) : x)))
                  }
                  style={
                    {
                      '--fill': `${w * 10}%`,
                      '--range-color': COLORS[i % COLORS.length],
                    } as CSSProperties
                  }
                />
                <span className="tabular w-12 text-right font-mono text-xs">
                  {formatNumber((w / total) * 100, 0)}%
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <RunButtons counts={[1, 10, 100, 1000]} onRun={run} label="Spin" disabled={total === 0} />
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => reset()}
          >
            Reset
          </Button>
        </div>
        <BarChart
          ariaLabel={`Outcomes after ${spins} spins`}
          color="var(--c-blue)"
          data={weights.map((w, i) => ({
            label: labels[i],
            value: spins ? counts[i] / spins : 0,
            expected: total ? w / total : 0,
          }))}
          format={(v) => `${formatNumber(v * 100, 1)}%`}
          yMax={1}
        />
        <dl className="flex flex-wrap gap-2 text-sm">
          <Readout label="Spins" value={spins.toLocaleString()} />
        </dl>
      </div>
    </div>
  )
}
