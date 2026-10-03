import { useId, useState, type ReactNode } from 'react'
import { Button } from '@/ui/Button'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export interface VennPreset {
  /** Set names, 2 or 3 of them. */
  sets: string[]
  /** Items in each region, keyed by membership bits ('10' = in A only, '11' = in both, …). */
  counts: Record<string, number>
}

export interface VennState {
  shaded: string[]
  total: number
  /** Name of the standard operation the shading matches, if any. */
  op: string | null
}

type Circle = { cx: number; cy: number; r: number }
const LAYOUT: Record<
  2 | 3,
  { circles: Circle[]; labels: Record<string, [number, number]>; w: number; h: number }
> = {
  2: {
    w: 400,
    h: 250,
    circles: [
      { cx: 155, cy: 128, r: 92 },
      { cx: 245, cy: 128, r: 92 },
    ],
    labels: { '10': [110, 128], '11': [200, 128], '01': [290, 128], '00': [36, 32] },
  },
  3: {
    w: 400,
    h: 290,
    circles: [
      { cx: 163, cy: 112, r: 82 },
      { cx: 237, cy: 112, r: 82 },
      { cx: 200, cy: 178, r: 82 },
    ],
    labels: {
      '100': [128, 88],
      '010': [272, 88],
      '001': [200, 232],
      '110': [200, 74],
      '101': [160, 162],
      '011': [240, 162],
      '111': [200, 132],
      '000': [36, 32],
    },
  },
}
const COLORS = ['var(--c-blue)', 'var(--c-orange)', 'var(--c-aqua)']

function opsFor(sets: string[]): { name: string; tex: string; test: (bits: string) => boolean }[] {
  const [A, B] = sets
  const base = [
    { name: `${A} or ${B}`, tex: 'A \\cup B', test: (b: string) => b[0] === '1' || b[1] === '1' },
    { name: `${A} and ${B}`, tex: 'A \\cap B', test: (b: string) => b[0] === '1' && b[1] === '1' },
    {
      name: `${A} but not ${B}`,
      tex: 'A \\setminus B',
      test: (b: string) => b[0] === '1' && b[1] === '0',
    },
    { name: `not ${A}`, tex: "A'", test: (b: string) => b[0] === '0' },
  ]
  if (sets.length === 3)
    base.push({ name: 'all three', tex: 'A \\cap B \\cap C', test: (b: string) => b === '111' })
  return base
}

export default function VennWidget({ preset, onStateChange }: WidgetComponentProps<'venn'>) {
  const n = (preset.sets.length === 3 ? 3 : 2) as 2 | 3
  const layout = LAYOUT[n]
  const regions = Object.keys(layout.labels)
  const [shaded, setShaded] = useState<string[]>([])
  const uid = useId().replace(/:/g, '')
  const ops = opsFor(preset.sets)
  const sameSet = (want: string[]) =>
    want.length === shaded.length && want.every((r) => shaded.includes(r))
  const match = ops.find((o) => sameSet(regions.filter(o.test)))
  const total = shaded.reduce((s, r) => s + (preset.counts[r] ?? 0), 0)
  useReport<VennState>(
    { shaded: [...shaded].sort(), total, op: match?.name ?? null },
    onStateChange,
  )
  const toggle = (r: string) =>
    setShaded((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]))
  const regionName = (bits: string) =>
    bits.includes('1')
      ? preset.sets
          .map((name, i) => (bits[i] === '1' ? name : null))
          .filter(Boolean)
          .join(' & ') + (bits.split('').filter((b) => b === '1').length < n ? ' only' : '')
      : 'neither'

  return (
    <div className="grid">
      <div className="p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${layout.w} ${layout.h}`}
          className="mx-auto block h-auto w-full max-w-xl"
          role="img"
          aria-label={`Venn diagram; shaded regions hold ${total} items`}
        >
          <defs>
            {layout.circles.map((c, i) => (
              <clipPath key={i} id={`${uid}-c${i}`}>
                <circle cx={c.cx} cy={c.cy} r={c.r} />
              </clipPath>
            ))}
            {regions.map((bits) => (
              <mask key={bits} id={`${uid}-m${bits}`}>
                <rect x={0} y={0} width={layout.w} height={layout.h} fill="white" />
                {layout.circles.map((c, i) =>
                  bits[i] === '0' ? (
                    <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="black" />
                  ) : null,
                )}
              </mask>
            ))}
          </defs>
          <rect
            x={4}
            y={4}
            width={layout.w - 8}
            height={layout.h - 8}
            rx={14}
            fill="var(--surface)"
            stroke="var(--line-strong)"
          />
          {regions.map((bits) => {
            const inside = layout.circles.map((_, i) => i).filter((i) => bits[i] === '1')
            const shape = (
              <rect
                x={4}
                y={4}
                width={layout.w - 8}
                height={layout.h - 8}
                rx={14}
                fill="var(--accent)"
                fillOpacity={shaded.includes(bits) ? 0.38 : 0}
                mask={`url(#${uid}-m${bits})`}
                onClick={() => toggle(bits)}
                className="cursor-pointer"
              />
            )
            return (
              <g key={bits}>
                {inside.reduceRight<ReactNode>(
                  (acc, i) => (
                    <g clipPath={`url(#${uid}-c${i})`}>{acc}</g>
                  ),
                  shape,
                )}
              </g>
            )
          })}
          {layout.circles.map((c, i) => (
            <circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill="none"
              stroke={COLORS[i]}
              strokeWidth={2.5}
              pointerEvents="none"
            />
          ))}
          {preset.sets.map((name, i) => {
            const c = layout.circles[i]
            const y = i === 2 ? c.cy + c.r + 4 : c.cy - c.r - 8
            return (
              <text
                key={name}
                x={i === 0 ? c.cx - c.r * 0.45 : i === 1 ? c.cx + c.r * 0.45 : c.cx}
                y={Math.min(layout.h - 8, Math.max(16, y))}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                fill={COLORS[i]}
                pointerEvents="none"
              >
                {name}
              </text>
            )
          })}
          {regions.map((bits) => {
            const [x, y] = layout.labels[bits]
            return (
              <text
                key={bits}
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize={15}
                fontWeight={600}
                fill="var(--ink)"
                pointerEvents="none"
              >
                {preset.counts[bits] ?? 0}
              </text>
            )
          })}
        </svg>
      </div>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Regions">
          {regions.map((bits) => (
            <button
              key={bits}
              type="button"
              aria-pressed={shaded.includes(bits)}
              onClick={() => toggle(bits)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                shaded.includes(bits)
                  ? 'border-transparent bg-accent text-accent-ink'
                  : 'border-line bg-surface hover:bg-surface-2',
              )}
            >
              {regionName(bits)} ({preset.counts[bits] ?? 0})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-2">Shade:</span>
          {ops.map((o) => (
            <Button
              key={o.name}
              size="sm"
              variant={match?.name === o.name ? 'soft' : 'ghost'}
              onClick={() => setShaded(regions.filter(o.test))}
            >
              <Tex>{o.tex}</Tex>
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setShaded([])}>
            Clear
          </Button>
        </div>
        <p className="text-[0.95rem]" aria-live="polite">
          Shaded: <strong>{total}</strong> {total === 1 ? 'item' : 'items'}
          {match ? (
            <>
              {' '}
              = <Tex>{match.tex}</Tex> ({match.name})
            </>
          ) : null}
        </p>
      </div>
    </div>
  )
}
