import { useId, useState } from 'react'
import { formatNumber } from '@/math/core'
import { cn } from '@/ui/cn'
import { useElementWidth } from '@/ui/useElementWidth'

export interface BarDatum {
  label: string
  value: number
  /** Theoretical/expected value drawn as a marker on the bar. */
  expected?: number
}

type BarChartProps = {
  data: BarDatum[]
  height?: number
  color?: string
  /** Fixed top of the y-axis (otherwise fits the data). */
  yMax?: number
  format?: (v: number) => string
  valueLabel?: string
  expectedLabel?: string
  ariaLabel: string
  /** Show every nth x label (dense charts). */
  labelEvery?: number
  className?: string
}

/**
 * Bars with rounded data-ends anchored to the baseline, 2px gaps, optional "expected" markers,
 * a hover readout, and a visually hidden table for screen readers.
 */
export function BarChart({
  data,
  height = 220,
  color = 'var(--c-green)',
  yMax,
  format = (v) => formatNumber(v, 3),
  valueLabel = 'Observed',
  expectedLabel = 'Theory',
  ariaLabel,
  labelEvery = 1,
  className,
}: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const id = useId()
  const [wrapRef, measured] = useElementWidth<HTMLElement>(640)
  const top = yMax ?? Math.max(1e-9, ...data.map((d) => Math.max(d.value, d.expected ?? 0))) * 1.12
  const padL = 40
  const padB = 22
  const padT = 8
  const width = Math.max(200, measured)
  const innerW = width - padL - 8
  const innerH = height - padB - padT
  const band = innerW / Math.max(1, data.length)
  const gap = Math.min(4, band * 0.18)
  const y = (v: number) => padT + innerH - (v / top) * innerH
  const ticks = [0, top / 2, top]
  const hasExpected = data.some((d) => d.expected !== undefined)

  return (
    <figure ref={wrapRef} className={cn('relative', className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        role="img"
        aria-labelledby={`${id}-cap`}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={width - 8} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
            <text
              x={padL - 6}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--ink-3)"
              className="tabular"
            >
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * band + gap / 2
          const w = Math.max(1, band - gap)
          const h = Math.max(0, innerH - (y(d.value) - padT))
          const r = Math.min(4, w / 2, h)
          const yTop = y(d.value)
          const base = padT + innerH
          // Rounded top corners only (data end), square at the baseline.
          const path = h
            ? `M${x},${base}V${yTop + r}Q${x},${yTop} ${x + r},${yTop}H${x + w - r}Q${x + w},${yTop} ${x + w},${yTop + r}V${base}Z`
            : ''
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)}>
              <rect x={padL + i * band} y={padT} width={band} height={innerH} fill="transparent" />
              {path && (
                <path d={path} fill={color} opacity={hover === null || hover === i ? 1 : 0.55} />
              )}
              {d.expected !== undefined && (
                <line
                  x1={x - 1}
                  x2={x + w + 1}
                  y1={y(d.expected)}
                  y2={y(d.expected)}
                  stroke="var(--ink)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )}
              {i % labelEvery === 0 && (
                <text
                  x={x + w / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--ink-3)"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
        <line x1={padL} x2={width - 8} y1={padT + innerH} y2={padT + innerH} stroke="var(--axis)" />
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute top-1 right-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-md"
          aria-hidden
        >
          <div className="font-semibold">{data[hover].label}</div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm" style={{ background: color }} />
            {valueLabel}: <span className="tabular font-mono">{format(data[hover].value)}</span>
          </div>
          {data[hover].expected !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-2 bg-ink" />
              {expectedLabel}:{' '}
              <span className="tabular font-mono">{format(data[hover].expected!)}</span>
            </div>
          )}
        </div>
      )}
      <figcaption id={`${id}-cap`} className="sr-only">
        {ariaLabel}
      </figcaption>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Outcome</th>
            <th scope="col">{valueLabel}</th>
            {hasExpected && <th scope="col">{expectedLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
              {hasExpected && <td>{d.expected === undefined ? '' : format(d.expected)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {hasExpected && (
        <div className="mt-1 flex items-center gap-4 text-xs text-ink-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
            {valueLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 bg-ink" />
            {expectedLabel}
          </span>
        </div>
      )}
    </figure>
  )
}

/** Small control row: run N trials. */
export function RunButtons({
  counts,
  onRun,
  disabled,
  label = 'Run',
}: {
  counts: number[]
  onRun: (n: number) => void
  disabled?: boolean
  label?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {counts.map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onRun(n)}
          className={cn(
            'h-9 rounded-xl border px-3 text-sm font-medium transition-colors disabled:opacity-50',
            n === counts[0]
              ? 'border-transparent bg-accent text-accent-ink hover:bg-accent-hover'
              : 'border-line-strong bg-surface hover:bg-surface-2',
          )}
        >
          {label} {n.toLocaleString()}
        </button>
      ))}
    </div>
  )
}
