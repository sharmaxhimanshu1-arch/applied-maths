import { useState } from 'react'
import { Segmented } from '@/ui/Segmented'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

type Op = 'and' | 'or' | 'not' | 'xor' | 'implies'

export interface TruthTablePreset {
  ops?: Op[]
  start?: Op
}

export interface TruthTableState {
  op: Op
  p: boolean
  q: boolean
  out: boolean
  /** Distinct input rows tried for the current operator. */
  rowsTried: number
}

const OPS: Record<
  Op,
  { label: string; tex: string; fn: (p: boolean, q: boolean) => boolean; unary?: boolean }
> = {
  and: { label: 'AND', tex: 'P \\land Q', fn: (p, q) => p && q },
  or: { label: 'OR', tex: 'P \\lor Q', fn: (p, q) => p || q },
  not: { label: 'NOT', tex: '\\lnot P', fn: (p) => !p, unary: true },
  xor: { label: 'XOR', tex: 'P \\oplus Q', fn: (p, q) => p !== q },
  implies: { label: 'IF…THEN', tex: 'P \\Rightarrow Q', fn: (p, q) => !p || q },
}
const TF = (b: boolean) => (b ? 'T' : 'F')

export default function TruthTableWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'truthTable'>) {
  const ops = preset.ops ?? (['and', 'or', 'not', 'xor', 'implies'] as Op[])
  const [op, setOp] = useState<Op>(preset.start ?? ops[0])
  const [p, setP] = useState(true)
  const [q, setQ] = useState(false)
  const [tried, setTried] = useState<string[]>(['TF'])
  const def = OPS[op]
  const out = def.fn(p, q)
  const key = def.unary ? TF(p) : TF(p) + TF(q)
  const seen = tried.filter((k) => k.length === (def.unary ? 1 : 2))
  useReport<TruthTableState>({ op, p, q, out, rowsTried: new Set(seen).size }, onStateChange)
  const remember = (np: boolean, nq: boolean) => {
    const k = def.unary ? TF(np) : TF(np) + TF(nq)
    setTried((t) => (t.includes(k) ? t : [...t, k]))
  }
  const rows = def.unary
    ? [[true], [false]].map(([a]) => ({ k: TF(a), ins: [a], out: def.fn(a, false) }))
    : [
        [true, true],
        [true, false],
        [false, true],
        [false, false],
      ].map(([a, b]) => ({ k: TF(a) + TF(b), ins: [a, b], out: def.fn(a, b) }))
  return (
    <div className="grid">
      <div className="border-b border-line p-3 sm:px-4">
        <Segmented
          label="Operator"
          value={op}
          onChange={(o) => {
            setOp(o)
            setTried([OPS[o].unary ? TF(p) : TF(p) + TF(q)])
          }}
          options={ops.map((o) => ({ value: o, label: OPS[o].label }))}
        />
      </div>
      <div className="grid gap-4 p-3 sm:grid-cols-2 sm:p-4">
        <div className="grid content-start gap-3">
          <Switch
            label="P is true"
            checked={p}
            onChange={(v) => {
              setP(v)
              remember(v, q)
            }}
          />
          {!def.unary && (
            <Switch
              label="Q is true"
              checked={q}
              onChange={(v) => {
                setQ(v)
                remember(p, v)
              }}
            />
          )}
          <div className="mt-2 flex items-center gap-3">
            <span
              aria-hidden
              className="size-10 rounded-full border-2 transition-colors"
              style={{
                background: out ? 'var(--c-yellow)' : 'var(--surface-3)',
                borderColor: out ? 'var(--c-yellow)' : 'var(--line-strong)',
              }}
            />
            <span className="text-[1.05rem]">
              <Tex>{def.tex}</Tex> is <strong>{out ? 'TRUE' : 'FALSE'}</strong>
            </span>
          </div>
        </div>
        <table className="w-full text-center text-sm">
          <caption className="sr-only">Truth table for {def.label}</caption>
          <thead>
            <tr className="text-ink-2">
              <th scope="col" className="py-1.5">
                P
              </th>
              {!def.unary && (
                <th scope="col" className="py-1.5">
                  Q
                </th>
              )}
              <th scope="col" className="py-1.5">
                <Tex>{def.tex}</Tex>
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <tr
                key={r.k}
                className={cn(
                  'border-t border-line',
                  r.k === key &&
                    'bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))] font-bold',
                )}
              >
                {r.ins.map((b, i) => (
                  <td key={i} className="py-1.5">
                    {TF(b)}
                  </td>
                ))}
                <td className={cn('py-1.5', seen.includes(r.k) ? '' : 'text-ink-3')}>
                  {seen.includes(r.k) ? TF(r.out) : '?'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
        Flip the switches to fill in the table: each row you try reveals its output.
      </p>
    </div>
  )
}
