import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  Circle,
  FunctionGraph,
  InfiniteLine,
  Plot,
  Point,
  Polyline,
  Segment,
  useAnimationFrame,
} from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

type Wave = 'square' | 'sawtooth' | 'triangle'

export interface FourierPreset {
  wave?: Wave
  terms?: number
}

export interface FourierState {
  wave: Wave
  terms: number
  /** Root-mean-square gap between the partial sum and the target wave. */
  error: number
  playing: boolean
}

const TAU = 2 * Math.PI

/** The k-th nonzero sine term (frequency and amplitude) of each wave's Fourier series. */
function term(wave: Wave, i: number): { freq: number; amp: number } {
  if (wave === 'square') {
    const k = 2 * i + 1
    return { freq: k, amp: 4 / (Math.PI * k) }
  }
  if (wave === 'sawtooth') {
    const k = i + 1
    return { freq: k, amp: ((k % 2 ? 1 : -1) * 2) / (Math.PI * k) }
  }
  const k = 2 * i + 1
  return { freq: k, amp: ((i % 2 ? -1 : 1) * 8) / (Math.PI * Math.PI * k * k) }
}

/** The target waves, period 2π, height ±1. */
const TARGET: Record<Wave, (x: number) => number> = {
  square: (x) => (((x % TAU) + TAU) % TAU < Math.PI ? 1 : -1),
  sawtooth: (x) => {
    const t = (((x + Math.PI) % TAU) + TAU) % TAU
    return t / Math.PI - 1
  },
  triangle: (x) => {
    const t = (((x + Math.PI / 2) % TAU) + TAU) % TAU
    return t < Math.PI ? (2 * t) / Math.PI - 1 : 3 - (2 * t) / Math.PI
  },
}

const TEX: Record<Wave, string> = {
  square:
    '\\frac{4}{\\pi}\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots\\right)',
  sawtooth:
    '\\frac{2}{\\pi}\\left(\\sin x - \\frac{\\sin 2x}{2} + \\frac{\\sin 3x}{3} - \\cdots\\right)',
  triangle:
    '\\frac{8}{\\pi^2}\\left(\\sin x - \\frac{\\sin 3x}{9} + \\frac{\\sin 5x}{25} - \\cdots\\right)',
}

function partial(wave: Wave, terms: number) {
  const ts = Array.from({ length: terms }, (_, i) => term(wave, i))
  return (x: number) => ts.reduce((s, t) => s + t.amp * Math.sin(t.freq * x), 0)
}

function rmsError(wave: Wave, terms: number) {
  const f = partial(wave, terms)
  const n = 400
  let s = 0
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * TAU
    s += (f(x) - TARGET[wave](x)) ** 2
  }
  return Math.sqrt(s / n)
}

export default function FourierWidget({ preset, onStateChange }: WidgetComponentProps<'fourier'>) {
  const [wave, setWave] = useState<Wave>(preset.wave ?? 'square')
  const [terms, setTerms] = useState(preset.terms ?? 1)
  const [t, setT] = useState(0.9)
  const [playing, setPlaying] = useState(false)
  useAnimationFrame((dt) => setT((x) => (x + dt * 0.8) % TAU), playing)
  const error = rmsError(wave, terms)
  useReport<FourierState>(
    { wave, terms, error: Math.round(error * 1e4) / 1e4, playing },
    onStateChange,
  )
  const f = partial(wave, terms)
  // Epicycles: each term is a circle of radius |amp| spinning at its frequency.
  const centres: Vec2[] = [[0, 0]]
  for (let i = 0; i < terms; i++) {
    const { freq, amp } = term(wave, i)
    const [cx, cy] = centres[centres.length - 1]
    centres.push([cx + amp * Math.cos(freq * t), cy + amp * Math.sin(freq * t)])
  }
  const tip = centres[centres.length - 1]
  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Plot
          view={{ xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 }}
          aspect="equal"
          grid={false}
          axes={false}
          maxHeight={280}
          ariaLabel={`${terms} rotating circles; their tip is at height ${formatNumber(tip[1], 2)}`}
        >
          {centres.slice(0, -1).map((c, i) => (
            <Circle
              key={i}
              center={c}
              r={Math.abs(term(wave, i).amp)}
              stroke="var(--ink-3)"
              strokeWidth={1}
            />
          ))}
          <Polyline points={centres} color="var(--c-blue)" width={2} />
          <Point at={tip} r={5} color="var(--c-orange)" />
          <InfiniteLine
            through={tip}
            direction={[1, 0]}
            color="var(--c-orange)"
            dashed
            width={1}
            opacity={0.6}
          />
        </Plot>
        <Plot
          view={{ xMin: 0, xMax: TAU, yMin: -1.5, yMax: 1.5 }}
          maxHeight={280}
          piTicks
          ariaLabel={`The sum of ${terms} sine waves next to the target ${wave} wave`}
        >
          <FunctionGraph fn={TARGET[wave]} color="var(--ink-3)" width={1.5} dashed />
          <FunctionGraph fn={f} color="var(--c-blue)" width={2.5} />
          <Segment from={[t, -1.5]} to={[t, 1.5]} color="var(--c-orange)" width={1} dashed />
          <Point at={[t, f(t)]} r={5} color="var(--c-orange)" />
        </Plot>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-4">
        <Slider
          label="Number of sine waves"
          value={terms}
          min={1}
          max={30}
          step={1}
          onChange={setTerms}
          color="var(--c-blue)"
        />
        <Button size="sm" variant="secondary" onClick={() => setPlaying((p) => !p)}>
          {playing ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          {playing ? 'Pause' : 'Spin the circles'}
        </Button>
      </div>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <Segmented
          label="Target wave"
          size="sm"
          value={wave}
          onChange={setWave}
          options={[
            { value: 'square', label: 'Square' },
            { value: 'sawtooth', label: 'Sawtooth' },
            { value: 'triangle', label: 'Triangle' },
          ]}
        />
        <div className="overflow-x-auto overflow-y-hidden">
          <Tex>{TEX[wave]}</Tex>
        </div>
        <Readouts
          items={[
            {
              label: 'average gap to the target',
              value: formatNumber(error, 3),
              color: 'var(--c-blue)',
            },
          ]}
        />
      </div>
    </>
  )
}
