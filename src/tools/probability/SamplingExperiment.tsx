import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { clamp, formatNumber } from '@/math/core'
import { createRng } from '@/math/random'
import { histogram, mean, normalPdf, std } from '@/math/stats'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { BarChart, RunButtons } from './charts'
import { Readout } from './CoinExperiment'

export type PopulationShape = 'uniform' | 'skewed' | 'bimodal' | 'custom'

export interface SamplingPreset {
  shape?: PopulationShape
  n?: number
  /** Let the learner choose shape and n. */
  adjustable?: boolean
}

export interface SamplingState {
  kind: 'sampling'
  samples: number
  n: number
  shape: PopulationShape
  mu: number
  sigma: number
  meanOfMeans: number
  sdOfMeans: number
}

const BINS = 20
const RANGE = 10
const BIN_W = RANGE / BINS
const centers = Array.from({ length: BINS }, (_, i) => (i + 0.5) * BIN_W)

function shapeWeights(shape: Exclude<PopulationShape, 'custom'>): number[] {
  switch (shape) {
    case 'uniform':
      return centers.map(() => 1)
    case 'skewed':
      return centers.map((x) => Math.exp(-x / 2.2))
    case 'bimodal':
      return centers.map((x) => normalPdf(x, 2.5, 1) + normalPdf(x, 7.5, 1))
  }
}

function populationStats(weights: number[]) {
  const total = weights.reduce((a, b) => a + b, 0) || 1
  const mu = weights.reduce((s, w, i) => s + w * centers[i], 0) / total
  // Values are spread uniformly within each bin, which adds w²/12 of variance.
  const v =
    weights.reduce((s, w, i) => s + w * ((centers[i] - mu) ** 2 + BIN_W ** 2 / 12), 0) / total
  return { mu, sigma: Math.sqrt(v) }
}

export function SamplingExperiment({
  preset = {},
  onStateChange,
}: {
  preset?: SamplingPreset
  onStateChange?: (s: SamplingState) => void
}) {
  const [rng] = useState(() => createRng())
  const [shape, setShape] = useState<PopulationShape>(preset.shape ?? 'skewed')
  const [weights, setWeights] = useState<number[]>(() =>
    shapeWeights(preset.shape && preset.shape !== 'custom' ? preset.shape : 'skewed'),
  )
  const [n, setN] = useState(preset.n ?? 5)
  const [means, setMeans] = useState<number[]>([])
  const [lastSample, setLastSample] = useState<number[]>([])
  const { mu, sigma } = useMemo(() => populationStats(weights), [weights])
  const adjustable = preset.adjustable ?? true

  const meanOfMeans = means.length ? mean(means) : NaN
  const sdOfMeans = means.length > 1 ? std(means) : NaN

  useEffect(() => {
    onStateChange?.({
      kind: 'sampling',
      samples: means.length,
      n,
      shape,
      mu,
      sigma,
      meanOfMeans,
      sdOfMeans,
    })
  }, [onStateChange, means.length, n, shape, mu, sigma, meanOfMeans, sdOfMeans])

  const draw = () => {
    const bin = rng.weighted(weights)
    return (bin + rng.next()) * BIN_W
  }

  function run(count: number) {
    const next = [...means]
    let sample: number[] = []
    for (let s = 0; s < count; s++) {
      sample = Array.from({ length: n }, draw)
      next.push(mean(sample))
    }
    setMeans(next)
    setLastSample(sample)
  }

  function reset() {
    setMeans([])
    setLastSample([])
  }

  const meanBins = 50
  const h = histogram(means, 0, RANGE, meanBins)
  const sem = sigma / Math.sqrt(n)
  const meansData = h.counts.map((c, i) => {
    const center = (i + 0.5) * h.width
    return {
      label: formatNumber(center, 1),
      value: c,
      expected: means.length ? means.length * normalPdf(center, mu, sem) * h.width : undefined,
    }
  })

  return (
    <div className="grid gap-5 p-3 sm:p-4">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm font-medium">
            <span>The population</span>
            <span className="font-normal text-ink-2">
              μ = {formatNumber(mu, 2)}, σ = {formatNumber(sigma, 2)}
            </span>
          </div>
          <PopulationChart
            weights={weights}
            sample={lastSample}
            sampleMean={lastSample.length ? mean(lastSample) : undefined}
            editable={shape === 'custom'}
            onChange={(w) => {
              setWeights(w)
              reset()
            }}
          />
          {adjustable && (
            <div className="mt-2">
              <Segmented
                label="Population shape"
                size="sm"
                value={shape}
                onChange={(s) => {
                  setShape(s)
                  if (s !== 'custom') setWeights(shapeWeights(s))
                  reset()
                }}
                options={[
                  { value: 'uniform', label: 'Flat' },
                  { value: 'skewed', label: 'Skewed' },
                  { value: 'bimodal', label: 'Two humps' },
                  { value: 'custom', label: 'Draw your own' },
                ]}
              />
              {shape === 'custom' && (
                <p className="mt-1.5 text-xs text-ink-2">
                  Drag across the chart to draw any population.
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">
            Averages of {means.length.toLocaleString()} samples (each of size n = {n})
          </div>
          <BarChart
            ariaLabel={`Histogram of ${means.length} sample means`}
            data={meansData}
            color="var(--c-violet)"
            height={210}
            format={(v) => formatNumber(v, 0)}
            labelEvery={10}
            valueLabel="Sample means"
            expectedLabel="Normal prediction"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <RunButtons counts={[1, 10, 100, 1000]} onRun={run} label="Take" />
        <Button size="sm" variant="ghost" icon={<RotateCcw className="size-4" />} onClick={reset}>
          Reset
        </Button>
        {adjustable && (
          <Slider
            className="w-56"
            label="Sample size n"
            value={n}
            min={1}
            max={50}
            step={1}
            onChange={(v) => {
              setN(v)
              reset()
            }}
            color="var(--c-violet)"
          />
        )}
      </div>

      <dl className="flex flex-wrap gap-2 text-sm">
        <Readout
          label="Mean of sample means"
          value={Number.isNaN(meanOfMeans) ? '–' : formatNumber(meanOfMeans, 3)}
        />
        <Readout label="μ" value={formatNumber(mu, 3)} />
        <Readout
          label="Spread of sample means"
          value={Number.isNaN(sdOfMeans) ? '–' : formatNumber(sdOfMeans, 3)}
        />
        <Readout label="σ/√n" value={formatNumber(sem, 3)} />
      </dl>
    </div>
  )
}

function PopulationChart({
  weights,
  sample,
  sampleMean,
  editable,
  onChange,
}: {
  weights: number[]
  sample: number[]
  sampleMean?: number
  editable: boolean
  onChange: (w: number[]) => void
}) {
  const ref = useRef<SVGSVGElement>(null)
  const W = 400
  const H = 190
  const pad = 8
  const base = H - 26
  const max = Math.max(1e-9, ...weights)
  const bw = (W - pad * 2) / BINS
  const x = (v: number) => pad + (v / RANGE) * (W - pad * 2)

  function paint(e: PointerEvent<SVGSVGElement>) {
    if (!editable || !ref.current || (e.type === 'pointermove' && e.buttons === 0)) return
    const rect = ref.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const py = ((e.clientY - rect.top) / rect.height) * H
    const i = clamp(Math.floor((px - pad) / bw), 0, BINS - 1)
    const level = clamp((base - py) / (base - 10), 0, 1)
    onChange(weights.map((w, k) => (k === i ? level * max || 0.02 : w)))
  }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full touch-none select-none"
      style={{
        cursor: editable ? 'crosshair' : 'default',
        touchAction: editable ? 'none' : 'pan-y',
      }}
      role="img"
      aria-label="Population distribution"
      onPointerDown={(e) => {
        if (editable) e.currentTarget.setPointerCapture(e.pointerId)
        paint(e)
      }}
      onPointerMove={paint}
    >
      {weights.map((w, i) => {
        const h = (w / max) * (base - 10)
        return (
          <rect
            key={i}
            x={pad + i * bw + 1}
            y={base - h}
            width={bw - 2}
            height={h}
            rx={3}
            fill="var(--c-aqua)"
            opacity={0.85}
          />
        )
      })}
      <line x1={pad} x2={W - pad} y1={base} y2={base} stroke="var(--axis)" />
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <text key={v} x={x(v)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--ink-3)">
          {v}
        </text>
      ))}
      {sample.map((v, i) => (
        <circle key={i} cx={x(v)} cy={base - 6} r={3.5} fill="var(--ink)" opacity={0.75} />
      ))}
      {sampleMean !== undefined && (
        <g>
          <line
            x1={x(sampleMean)}
            x2={x(sampleMean)}
            y1={14}
            y2={base}
            stroke="var(--c-violet)"
            strokeWidth={2.5}
          />
          <text
            x={x(sampleMean)}
            y={11}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="var(--c-violet)"
          >
            sample mean
          </text>
        </g>
      )}
    </svg>
  )
}
