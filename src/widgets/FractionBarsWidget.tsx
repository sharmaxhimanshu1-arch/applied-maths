import { useState } from 'react'
import { formatNumber } from '@/math/core'
import { Readouts } from '@/learn/blocks'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export type FractionBarsPreset =
  | { mode: 'compare'; a?: [number, number]; b?: [number, number] }
  | { mode: 'percent'; n?: number; d?: number }

export type FractionBarsState =
  | {
      mode: 'compare'
      a: [number, number]
      b: [number, number]
      aValue: number
      bValue: number
      relation: '<' | '=' | '>'
    }
  | { mode: 'percent'; n: number; d: number; value: number; percent: number }

const A = 'var(--c-blue)'
const B = 'var(--c-orange)'

/** A bar cut into d equal parts with the first n shaded. */
function Bar({
  n,
  d,
  color,
  y,
  label,
}: {
  n: number
  d: number
  color: string
  y: number
  label: string
}) {
  const W = 560
  const x0 = 20
  const h = 46
  const part = W / d
  return (
    <g role="img" aria-label={label}>
      {Array.from({ length: d }, (_, i) => (
        <rect
          key={i}
          x={x0 + i * part}
          y={y}
          width={part}
          height={h}
          fill={i < n ? color : 'var(--surface)'}
          fillOpacity={i < n ? 0.75 : 1}
          stroke="var(--ink-2)"
          strokeWidth={1.5}
        />
      ))}
    </g>
  )
}

function CompareMode({
  a: a0 = [1, 2],
  b: b0 = [2, 4],
  onState,
}: {
  a?: [number, number]
  b?: [number, number]
  onState: (s: FractionBarsState) => void
}) {
  const [a, setA] = useState<[number, number]>(a0)
  const [b, setB] = useState<[number, number]>(b0)
  const av = a[0] / a[1]
  const bv = b[0] / b[1]
  const relation = Math.abs(av - bv) < 1e-12 ? '=' : av < bv ? '<' : '>'
  useReport<FractionBarsState>({ mode: 'compare', a, b, aValue: av, bValue: bv, relation }, onState)
  const rel = relation === '=' ? '=' : relation
  return (
    <>
      <div className="p-3 sm:p-4">
        <svg
          viewBox="0 0 600 130"
          className="block h-auto w-full"
          role="img"
          aria-label={`${a[0]}/${a[1]} ${relation} ${b[0]}/${b[1]}`}
        >
          <Bar n={a[0]} d={a[1]} color={A} y={10} label={`${a[0]} of ${a[1]} parts`} />
          <Bar n={b[0]} d={b[1]} color={B} y={72} label={`${b[0]} of ${b[1]} parts`} />
        </svg>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <div className="grid gap-3">
          <Slider
            label="Blue: parts shaded"
            value={a[0]}
            min={0}
            max={a[1]}
            step={1}
            onChange={(n) => setA([n, a[1]])}
            color={A}
          />
          <Slider
            label="Blue: parts in the whole"
            value={a[1]}
            min={1}
            max={12}
            step={1}
            onChange={(d) => setA([Math.min(a[0], d), d])}
            color={A}
          />
        </div>
        <div className="grid gap-3">
          <Slider
            label="Orange: parts shaded"
            value={b[0]}
            min={0}
            max={b[1]}
            step={1}
            onChange={(n) => setB([n, b[1]])}
            color={B}
          />
          <Slider
            label="Orange: parts in the whole"
            value={b[1]}
            min={1}
            max={12}
            step={1}
            onChange={(d) => setB([Math.min(b[0], d), d])}
            color={B}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-3 py-3 text-[1.15rem] sm:px-4">
        <Tex>{`\\tfrac{${a[0]}}{${a[1]}} \\;${rel}\\; \\tfrac{${b[0]}}{${b[1]}}`}</Tex>
        <span className="text-sm text-ink-2">
          {formatNumber(av, 3)} {rel} {formatNumber(bv, 3)}
          {relation === '=' && ' · equivalent fractions!'}
        </span>
      </div>
    </>
  )
}

function PercentMode({
  n: n0 = 3,
  d: d0 = 8,
  onState,
}: {
  n?: number
  d?: number
  onState: (s: FractionBarsState) => void
}) {
  const [n, setN] = useState(n0)
  const [d, setD] = useState(d0)
  const value = n / d
  const percent = value * 100
  useReport<FractionBarsState>({ mode: 'percent', n, d, value, percent }, onState)
  const full = Math.floor(percent + 1e-9)
  const partial = percent - full
  return (
    <>
      <div className="grid gap-4 p-3 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:items-center sm:p-4">
        <svg
          viewBox="0 0 220 220"
          className="mx-auto block h-auto w-full max-w-[16rem]"
          role="img"
          aria-label={`${formatNumber(percent, 1)} of 100 squares shaded`}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const x = (i % 10) * 22
            const y = Math.floor(i / 10) * 22
            const fill = i < full ? 1 : i === full ? partial : 0
            return (
              <g key={i}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={20}
                  height={20}
                  rx={3}
                  fill="var(--surface-2)"
                  stroke="var(--line)"
                />
                {fill > 0 && (
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={20 * fill}
                    height={20}
                    rx={3}
                    fill={A}
                    fillOpacity={0.8}
                  />
                )}
              </g>
            )
          })}
        </svg>
        <div className="grid gap-4">
          <Slider label="Numerator" value={n} min={0} max={d} step={1} onChange={setN} color={A} />
          <Slider
            label="Denominator"
            value={d}
            min={1}
            max={20}
            step={1}
            onChange={(v) => {
              setD(v)
              setN((x) => Math.min(x, v))
            }}
            color={A}
          />
          <p className="text-[1.15rem]">
            <Tex>{`\\tfrac{${n}}{${d}} = ${formatNumber(value, 4)} = ${formatNumber(percent, 2)}\\%`}</Tex>
          </p>
        </div>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'fraction', value: `${n}/${d}` },
            { label: 'decimal', value: formatNumber(value, 4) },
            { label: 'percent', value: `${formatNumber(percent, 2)}%`, color: A },
          ]}
        />
      </div>
    </>
  )
}

export default function FractionBarsWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'fractionBars'>) {
  return preset.mode === 'compare' ? (
    <CompareMode a={preset.a} b={preset.b} onState={onStateChange} />
  ) : (
    <PercentMode n={preset.n} d={preset.d} onState={onStateChange} />
  )
}
