import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { createRng } from '@/math/random'
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { cn } from '@/ui/cn'
import { Label, Plot, Polyline, Segment } from '@/viz'
import { BarChart, RunButtons } from './charts'

export interface CoinPreset {
  /** Probability of heads. */
  p?: number
  adjustableP?: boolean
}

export interface CoinState {
  kind: 'coin'
  flips: number
  heads: number
  proportion: number
  p: number
}

/** Record every flip early on, then thin out so the path stays ~1,000 points. */
function shouldRecord(n: number) {
  return n <= 500 || (n <= 5000 && n % 10 === 0) || n % 100 === 0
}

export function CoinExperiment({
  preset = {},
  onStateChange,
}: {
  preset?: CoinPreset
  onStateChange?: (s: CoinState) => void
}) {
  const [rng] = useState(() => createRng())
  const [p, setP] = useState(preset.p ?? 0.5)
  const [heads, setHeads] = useState(0)
  const [flips, setFlips] = useState(0)
  const [recent, setRecent] = useState<number[]>([])
  const [path, setPath] = useState<Vec2[]>([])

  useEffect(() => {
    onStateChange?.({ kind: 'coin', flips, heads, proportion: flips ? heads / flips : 0, p })
  }, [onStateChange, flips, heads, p])

  function run(n: number) {
    let h = heads
    let f = flips
    const nextPath = [...path]
    const nextRecent = [...recent]
    for (let i = 0; i < n; i++) {
      const r = rng.bernoulli(p) ? 1 : 0
      h += r
      f++
      nextRecent.push(r)
      if (shouldRecord(f)) nextPath.push([Math.log10(f), h / f])
    }
    setHeads(h)
    setFlips(f)
    setRecent(nextRecent.slice(-24))
    setPath(nextPath)
  }

  function reset() {
    setHeads(0)
    setFlips(0)
    setRecent([])
    setPath([])
  }

  const xMax = Math.max(2, Math.log10(Math.max(flips, 1)) + 0.15)
  const decades = Array.from({ length: Math.floor(xMax) + 1 }, (_, k) => k)

  return (
    <div className="grid gap-4 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <RunButtons counts={[1, 10, 100, 1000]} onRun={run} label="Flip" />
        <Button size="sm" variant="ghost" icon={<RotateCcw className="size-4" />} onClick={reset}>
          Reset
        </Button>
      </div>

      <div className="flex min-h-10 flex-wrap items-center gap-1.5" aria-label="Most recent flips">
        {recent.length === 0 && <span className="text-sm text-ink-3">Flip to start…</span>}
        {recent.map((r, i) => (
          <span
            key={`${flips}-${i}`}
            className={cn(
              'flex size-7 items-center justify-center rounded-full border text-xs font-bold',
              i === recent.length - 1 && 'animate-[pop_250ms_ease]',
            )}
            style={
              r
                ? {
                    background: 'var(--c-yellow)',
                    borderColor: 'var(--c-yellow)',
                    color: '#1a1300',
                  }
                : {
                    background: 'var(--surface-3)',
                    borderColor: 'var(--line-strong)',
                    color: 'var(--ink-2)',
                  }
            }
          >
            {r ? 'H' : 'T'}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div>
          <div className="mb-1 text-sm font-medium">Counts</div>
          <BarChart
            ariaLabel="Heads and tails counts"
            color="var(--c-yellow)"
            height={200}
            format={(v) => formatNumber(v, 0)}
            data={[
              { label: 'Heads', value: heads, expected: flips * p },
              { label: 'Tails', value: flips - heads, expected: flips * (1 - p) },
            ]}
            expectedLabel="Expected"
          />
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">
            Proportion of heads so far{' '}
            <span className="font-normal text-ink-2">(flips on a log scale)</span>
          </div>
          <Plot
            view={{ xMin: 0, xMax, yMin: 0, yMax: 1 }}
            height={200}
            tickLabels={false}
            ariaLabel={`Running proportion of heads: ${formatNumber(flips ? heads / flips : 0, 3)} after ${flips} flips`}
          >
            <Segment from={[0, p]} to={[xMax, p]} color="var(--ink-2)" dashed width={1.5} />
            <Label
              at={[xMax, p]}
              anchor="bottom-right"
              offset={[-4, -4]}
              className="text-xs text-ink-2"
            >
              p = {formatNumber(p, 2)}
            </Label>
            {path.length > 1 && <Polyline points={path} color="var(--c-yellow)" width={2.5} />}
            {decades.map((k) => (
              <Label
                key={k}
                at={[k, 0]}
                anchor="bottom"
                offset={[0, -2]}
                className="text-[11px] text-ink-3"
              >
                {10 ** k}
              </Label>
            ))}
            <Label at={[0, 1]} anchor="top-left" offset={[4, 2]} className="text-[11px] text-ink-3">
              100%
            </Label>
          </Plot>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <dl className="flex flex-wrap gap-2 text-sm">
          <Readout label="Flips" value={flips.toLocaleString()} />
          <Readout label="Heads" value={heads.toLocaleString()} />
          <Readout label="Proportion" value={flips ? formatNumber(heads / flips, 4) : '–'} />
        </dl>
        {(preset.adjustableP ?? true) && (
          <Slider
            className="w-56"
            label="Chance of heads p"
            value={p}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => {
              setP(v)
              reset()
            }}
            color="var(--c-yellow)"
          />
        )}
      </div>
    </div>
  )
}

export function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1">
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular font-mono font-medium">{value}</dd>
    </div>
  )
}
