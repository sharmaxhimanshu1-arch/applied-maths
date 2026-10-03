import { useState } from 'react'
import { formatNumber } from '@/math/core'
import { createRng } from '@/math/random'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { cn } from '@/ui/cn'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export interface MarkovPreset {
  /** Names of the 2 or 3 states. */
  states: string[]
  /** Row-stochastic transition matrix: P[i][j] = chance of moving from i to j. */
  P: number[][]
}

export interface MarkovState {
  steps: number
  current: number
  /** Share of time spent in each state so far. */
  visits: number[]
  /** Long-run share of time in each state. */
  stationary: number[]
  /** Largest gap between the visit shares and the stationary distribution. */
  gap: number
  P: number[][]
}

const rng = createRng(Date.now())
const COLORS = ['var(--c-blue)', 'var(--c-orange)', 'var(--c-aqua)']
const fmt = (v: number, d = 2) => formatNumber(v, d)

/** Long-run distribution by repeatedly applying P (power iteration). */
function stationaryOf(P: number[][]) {
  let pi = P.map(() => 1 / P.length)
  for (let k = 0; k < 500; k++) pi = pi.map((_, j) => pi.reduce((s, p, i) => s + p * P[i][j], 0))
  return pi
}

/** Rebuild row i after the learner moves one off-diagonal probability; the diagonal absorbs the rest. */
function setEntry(P: number[][], i: number, j: number, v: number) {
  const row = [...P[i]]
  row[j] = v
  const others = row.reduce((s, p, k) => (k === i ? s : s + p), 0)
  if (others > 1) {
    // Scale the other off-diagonal entries down so the row still adds to 1.
    const spare = 1 - v
    const rest = others - v
    for (let k = 0; k < row.length; k++)
      if (k !== i && k !== j) row[k] = rest > 0 ? (row[k] / rest) * spare : 0
  }
  row[i] = Math.max(0, 1 - row.reduce((s, p, k) => (k === i ? s : s + p), 0))
  return P.map((r, k) => (k === i ? row.map((x) => Math.round(x * 100) / 100) : r))
}

const POS2 = [
  [90, 110],
  [310, 110],
]
const POS3 = [
  [200, 50],
  [70, 210],
  [330, 210],
]

function Diagram({ states, P, current }: { states: string[]; P: number[][]; current: number }) {
  const pos = states.length === 2 ? POS2 : POS3
  const R = 30
  return (
    <svg
      viewBox={`0 0 400 ${states.length === 2 ? 220 : 270}`}
      className="mx-auto block h-auto w-full max-w-md"
      role="img"
      aria-label={`State diagram; currently in ${states[current]}`}
    >
      <defs>
        <marker
          id="mk-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" />
        </marker>
      </defs>
      {P.map((row, i) =>
        row.map((p, j) => {
          if (i === j || p <= 0) return null
          const [x1, y1] = pos[i]
          const [x2, y2] = pos[j]
          const dx = x2 - x1
          const dy = y2 - y1
          const len = Math.hypot(dx, dy)
          const nx = -dy / len
          const ny = dx / len
          // Bend each arrow to its left so the two directions between a pair don't overlap.
          const bend = 28
          const mx = (x1 + x2) / 2 + nx * bend
          const my = (y1 + y2) / 2 + ny * bend
          const sx = x1 + (dx / len) * R + nx * 8
          const sy = y1 + (dy / len) * R + ny * 8
          const ex = x2 - (dx / len) * R + nx * 8
          const ey = y2 - (dy / len) * R + ny * 8
          return (
            <g key={`${i}${j}`}>
              <path
                d={`M${sx},${sy} Q${mx},${my} ${ex},${ey}`}
                fill="none"
                stroke="var(--ink-2)"
                strokeWidth={1 + p * 4}
                markerEnd="url(#mk-arrow)"
                opacity={0.8}
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={600}
                fill="var(--ink)"
                paintOrder="stroke"
                stroke="var(--surface)"
                strokeWidth={4}
              >
                {fmt(p)}
              </text>
            </g>
          )
        }),
      )}
      {states.map((name, i) => {
        const [x, y] = pos[i]
        // Self-loop drawn above (or below) the state.
        const up = states.length === 2 || i === 0 ? -1 : 1
        return (
          <g key={name}>
            {P[i][i] > 0 && (
              <>
                <circle
                  cx={x}
                  cy={y + up * (R + 14)}
                  r={16}
                  fill="none"
                  stroke="var(--ink-3)"
                  strokeWidth={1 + P[i][i] * 3}
                />
                <text
                  x={x + 24}
                  y={y + up * (R + 22)}
                  fontSize={12}
                  fill="var(--ink-2)"
                  paintOrder="stroke"
                  stroke="var(--surface)"
                  strokeWidth={4}
                >
                  {fmt(P[i][i])}
                </text>
              </>
            )}
            <circle
              cx={x}
              cy={y}
              r={R}
              fill={COLORS[i]}
              fillOpacity={i === current ? 0.9 : 0.2}
              stroke={COLORS[i]}
              strokeWidth={i === current ? 4 : 2}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill={i === current ? 'var(--surface)' : 'var(--ink)'}
            >
              {name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function MarkovWidget({ preset, onStateChange }: WidgetComponentProps<'markov'>) {
  const { states } = preset
  const [P, setP] = useState(preset.P)
  const [walk, setWalk] = useState(() => ({ current: 0, counts: states.map(() => 0), steps: 0 }))
  const stationary = stationaryOf(P)
  const visits = walk.steps ? walk.counts.map((c) => c / walk.steps) : walk.counts.map(() => 0)
  const gap = walk.steps ? Math.max(...visits.map((v, i) => Math.abs(v - stationary[i]))) : 1
  useReport<MarkovState>(
    { steps: walk.steps, current: walk.current, visits, stationary, gap, P },
    onStateChange,
  )
  const step = (n: number) =>
    setWalk((w) => {
      let cur = w.current
      const counts = [...w.counts]
      for (let k = 0; k < n; k++) {
        cur = rng.weighted(P[cur])
        counts[cur]++
      }
      return { current: cur, counts, steps: w.steps + n }
    })
  return (
    <div className="grid">
      <div className="p-3 sm:p-4">
        <Diagram states={states} P={P} current={walk.current} />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-3 sm:p-4">
        <Button size="sm" onClick={() => step(1)}>
          Take 1 step
        </Button>
        <Button size="sm" variant="secondary" onClick={() => step(100)}>
          100 steps
        </Button>
        <Button size="sm" variant="secondary" onClick={() => step(1000)}>
          1,000 steps
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setWalk({ current: 0, counts: states.map(() => 0), steps: 0 })}
          disabled={!walk.steps}
        >
          Reset
        </Button>
      </div>
      <div
        className="grid gap-2 border-t border-line p-3 sm:p-4"
        aria-label="Time spent in each state"
      >
        {states.map((name, i) => (
          <div
            key={name}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_7rem] items-center gap-2 text-sm"
          >
            <span className="font-semibold" style={{ color: COLORS[i] }}>
              {name}
            </span>
            <div className="relative h-4 overflow-hidden rounded-full bg-surface-2">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${visits[i] * 100}%`, background: COLORS[i], opacity: 0.75 }}
              />
              <div
                className="absolute inset-y-[-2px] w-0.5 bg-ink"
                style={{ left: `${stationary[i] * 100}%` }}
                title="long-run share"
              />
            </div>
            <span className={cn('tabular-nums text-ink-2')}>
              {walk.steps ? `${fmt(visits[i] * 100, 1)}%` : '–'} / {fmt(stationary[i] * 100, 1)}%
            </span>
          </div>
        ))}
        <p className="text-xs text-ink-3">
          Bars: share of time so far. Black tick: the long-run share.
        </p>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        {P.flatMap((row, i) =>
          row.map((p, j) =>
            i === j ? null : (
              <Slider
                key={`${i}${j}`}
                label={`${states[i]} → ${states[j]}`}
                value={p}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setP((m) => setEntry(m, i, j, v))}
                color={COLORS[j]}
              />
            ),
          ),
        )}
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'steps', value: walk.steps.toLocaleString() },
            { label: 'now in', value: states[walk.current], color: COLORS[walk.current] },
            { label: 'largest gap to long run', value: walk.steps ? fmt(gap, 3) : '–' },
          ]}
        />
      </div>
    </div>
  )
}
