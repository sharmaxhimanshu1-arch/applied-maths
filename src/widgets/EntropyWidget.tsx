import { useState } from 'react'
import { formatNumber } from '@/math/core'
import { entropyBits } from '@/math/stats'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export interface EntropyPreset {
  /** Starting probabilities (normalised); their count is the number of outcomes. */
  probs?: number[]
}

export interface EntropyState {
  k: number
  probs: number[]
  entropy: number
  /** log2 k: the entropy of k equally likely outcomes. */
  max: number
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const fmt = (v: number, d = 2) => formatNumber(v, d)
const round = (v: number) => Math.round(v * 1000) / 1000

/** Set one probability and rescale the others so everything still adds to 1. */
function adjust(ps: number[], i: number, v: number) {
  const value = Math.min(1, Math.max(0, v))
  const rest = ps.reduce((s, p, j) => (j === i ? s : s + p), 0)
  return ps.map((p, j) => {
    if (j === i) return round(value)
    if (rest <= 1e-9) return round((1 - value) / (ps.length - 1))
    return round((p / rest) * (1 - value))
  })
}

export default function EntropyWidget({ preset, onStateChange }: WidgetComponentProps<'entropy'>) {
  const [probs, setProbs] = useState(() => {
    const ps = preset.probs ?? [0.5, 0.25, 0.25]
    const total = ps.reduce((a, b) => a + b, 0)
    return ps.map((p) => p / total)
  })
  const k = probs.length
  const entropy = entropyBits(probs)
  const max = Math.log2(k)
  useReport<EntropyState>({ k, probs, entropy, max }, onStateChange)
  const setK = (n: number) => setProbs(Array.from({ length: n }, () => 1 / n))
  return (
    <>
      <Plot
        view={{ xMin: 0.3, xMax: k + 0.7, yMin: -0.16, yMax: 1.14 }}
        height={260}
        grid={false}
        axes={false}
        ariaLabel={`Probabilities ${probs.map((p) => fmt(p)).join(', ')}; entropy ${fmt(entropy, 3)} bits`}
      >
        {probs.map((p, i) => (
          <g key={i}>
            <Polygon
              points={[
                [i + 0.65, 0],
                [i + 1.35, 0],
                [i + 1.35, p],
                [i + 0.65, p],
              ]}
              fill="var(--c-violet)"
              fillOpacity={0.55}
              stroke="none"
            />
            <Label at={[i + 1, 0]} anchor="top" offset={[0, 4]} className="text-sm font-semibold">
              {LETTERS[i]}
            </Label>
            <Label at={[i + 1, p]} anchor="bottom" offset={[0, -14]} className="text-xs">
              {fmt(p)}
              {p > 0 && (
                <span className="text-ink-3">
                  {' '}
                  · {fmt(-Math.log2(p), 1)} {Math.abs(-Math.log2(p) - 1) < 1e-9 ? 'bit' : 'bits'}
                </span>
              )}
            </Label>
            <MovablePoint
              x={i + 1}
              y={p}
              onMove={(_, y) => setProbs((ps) => adjust(ps, i, y))}
              constrain={([, y]) => [i + 1, Math.min(1, Math.max(0, Math.round(y * 100) / 100))]}
              step={0.01}
              color="var(--c-violet)"
              size={7}
              label={`Probability of ${LETTERS[i]}`}
            />
          </g>
        ))}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-4">
        <Slider
          label="Number of outcomes"
          value={k}
          min={2}
          max={8}
          step={1}
          onChange={setK}
          color="var(--c-violet)"
        />
        <Button size="sm" variant="secondary" onClick={() => setK(k)}>
          Make them equal
        </Button>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'entropy',
              value: <Tex>{`H = ${fmt(entropy, 3)}\\text{ bits}`}</Tex>,
              color: 'var(--c-violet)',
            },
            { label: 'most possible', value: <Tex>{`\\log_2 ${k} = ${fmt(max, 3)}`}</Tex> },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Drag the bar tops; the others adjust so the total stays 1. The small grey numbers are each
          outcome’s surprise, <Tex>{'-\\log_2 p'}</Tex>.
        </p>
      </div>
    </>
  )
}
