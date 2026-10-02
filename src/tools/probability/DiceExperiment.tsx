import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatNumber } from '@/math/core'
import { createRng } from '@/math/random'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { BarChart, RunButtons } from './charts'
import { diceSumDistribution } from './dist'
import { Readout } from './CoinExperiment'

export interface DicePreset {
  dice?: 1 | 2 | 3
  adjustable?: boolean
}

export interface DiceState {
  kind: 'dice'
  rolls: number
  dice: number
  /** counts[s] = number of rolls with sum s */
  counts: number[]
  /** Sum with the most rolls so far. */
  mostCommon: number | null
}

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
}

function Die({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 30 30" className="size-8" role="img" aria-label={`Die showing ${value}`}>
      <rect
        x={1}
        y={1}
        width={28}
        height={28}
        rx={6}
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth={1.5}
      />
      {PIPS[value].map(([cx, cy], i) => (
        <circle key={i} cx={8 + cx * 7} cy={8 + cy * 7} r={2.4} fill="var(--ink)" />
      ))}
    </svg>
  )
}

export function DiceExperiment({
  preset = {},
  onStateChange,
}: {
  preset?: DicePreset
  onStateChange?: (s: DiceState) => void
}) {
  const [rng] = useState(() => createRng())
  const [dice, setDice] = useState<1 | 2 | 3>(preset.dice ?? 2)
  const [counts, setCounts] = useState<number[]>(() => Array.from({ length: 19 }, () => 0))
  const [rolls, setRolls] = useState(0)
  const [last, setLast] = useState<number[]>([])
  const theory = useMemo(() => diceSumDistribution(dice), [dice])

  const mostCommon = rolls ? counts.indexOf(Math.max(...counts)) : null
  useEffect(() => {
    onStateChange?.({ kind: 'dice', rolls, dice, counts, mostCommon })
  }, [onStateChange, rolls, dice, counts, mostCommon])

  function run(n: number) {
    const next = [...counts]
    let lastRoll: number[] = []
    for (let i = 0; i < n; i++) {
      lastRoll = Array.from({ length: dice }, () => rng.int(1, 6))
      next[lastRoll.reduce((a, b) => a + b, 0)]++
    }
    setCounts(next)
    setRolls((r) => r + n)
    setLast(lastRoll)
  }

  function reset(k = dice) {
    setDice(k)
    setCounts(Array.from({ length: 19 }, () => 0))
    setRolls(0)
    setLast([])
  }

  const data = []
  for (let s = dice; s <= dice * 6; s++)
    data.push({ label: String(s), value: rolls ? counts[s] / rolls : 0, expected: theory[s] })

  return (
    <div className="grid gap-4 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <RunButtons counts={[1, 10, 100, 1000]} onRun={run} label="Roll" />
        {(preset.adjustable ?? true) && (
          <Segmented
            label="Number of dice"
            size="sm"
            value={String(dice) as '1' | '2' | '3'}
            onChange={(v) => reset(Number(v) as 1 | 2 | 3)}
            options={[
              { value: '1', label: '1 die' },
              { value: '2', label: '2 dice' },
              { value: '3', label: '3 dice' },
            ]}
          />
        )}
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw className="size-4" />}
          onClick={() => reset()}
        >
          Reset
        </Button>
      </div>
      <div className="flex min-h-9 items-center gap-2" aria-live="polite">
        {last.length ? (
          <>
            {last.map((v, i) => (
              <Die key={i} value={v} />
            ))}
            <span className="ml-1 text-sm text-ink-2">
              sum = <strong className="text-ink">{last.reduce((a, b) => a + b, 0)}</strong>
            </span>
          </>
        ) : (
          <span className="text-sm text-ink-3">Roll to start…</span>
        )}
      </div>
      <div>
        <div className="mb-1 text-sm font-medium">
          How often each sum comes up{' '}
          <span className="font-normal text-ink-2">(share of rolls)</span>
        </div>
        <BarChart
          ariaLabel={`Distribution of the sum of ${dice} dice after ${rolls} rolls`}
          data={data}
          color="var(--c-green)"
          format={(v) => `${formatNumber(v * 100, 1)}%`}
          valueLabel="Observed"
          expectedLabel="Theory"
        />
      </div>
      <dl className="flex flex-wrap gap-2 text-sm">
        <Readout label="Rolls" value={rolls.toLocaleString()} />
        {mostCommon !== null && <Readout label="Most common sum" value={String(mostCommon)} />}
      </dl>
    </div>
  )
}
