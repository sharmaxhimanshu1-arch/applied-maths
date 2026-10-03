import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatNumber } from '@/math/core'
import { compile } from '@/math/miniExpr'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { FunctionGraph, InfiniteLine, Label, MovablePoint, Plot, Point, constraints } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

/** A rule the machine can run. More than one expression = one input gives several outputs. */
export interface MachineRule {
  id: string
  /** TeX shown on the machine, e.g. '3x + 2'. */
  tex: string
  /** miniExpr source(s) in x. */
  exprs: string[]
}

/** A function and its inverse, for the compose mode. */
export interface ComposeFn {
  id: string
  tex: string
  expr: string
  inverse?: { tex: string; expr: string }
}

export type FunctionMachinePreset =
  | {
      mode: 'machine'
      rules: MachineRule[]
      /** Hide the rule until "Reveal" is pressed (guess-my-rule). */
      mystery?: boolean
      /** Draw the input → output pairs as points. */
      plot?: boolean
      range?: [number, number]
      start?: number
    }
  | { mode: 'compose'; fns: ComposeFn[]; f?: string; g?: string; start?: number }

export type FunctionMachineState =
  | {
      mode: 'machine'
      rule: string
      x: number
      outputs: number[]
      /** Distinct inputs tried with this rule. */
      tried: number
      /** Two different inputs gave the same output (with this rule). */
      sharedOutput: boolean
      revealed: boolean
    }
  | {
      mode: 'compose'
      f: string
      g: string
      x: number
      /** f(g(x)) and g(f(x)). */
      fg: number
      gf: number
      showInverse: boolean
    }

const IN = 'var(--c-blue)'
const OUT = 'var(--c-orange)'
const fmt = (v: number) => (Number.isFinite(v) ? formatNumber(v, 3) : 'undefined')

function evaluator(src: string) {
  const c = compile(src)
  return (x: number) => (c.ok ? c.evaluate({ x }) : NaN)
}

function Box({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="grid min-w-16 justify-items-center gap-0.5 rounded-xl border-2 bg-surface px-3 py-2"
      style={{ borderColor: color }}
    >
      <span className="text-xs text-ink-2">{label}</span>
      <span className="font-mono text-lg font-semibold">{value}</span>
    </div>
  )
}

function Machine({ tex, hidden }: { tex: string; hidden: boolean }) {
  return (
    <div className="grid min-w-28 justify-items-center gap-0.5 rounded-2xl bg-ink px-4 py-3 text-surface shadow-md">
      <span className="text-[0.7rem] tracking-[0.08em] uppercase opacity-70">rule</span>
      <span className="text-lg">{hidden ? '?' : <Tex>{tex}</Tex>}</span>
    </div>
  )
}

const Arrow = () => <ArrowRight aria-hidden className="size-5 shrink-0 text-ink-3" />

/** All outputs of a rule for x, dropping undefined ones (e.g. √ of a negative). */
function outputsOf(rule: MachineRule, x: number) {
  return rule.exprs.map((e) => evaluator(e)(x)).filter(Number.isFinite)
}

function MachineMode({
  rules,
  mystery = false,
  plot = true,
  range = [-5, 5],
  start = 2,
  onState,
}: Extract<FunctionMachinePreset, { mode: 'machine' }> & {
  onState: (s: FunctionMachineState) => void
}) {
  const [ruleId, setRuleId] = useState(rules[0].id)
  const [x, setX] = useState(start)
  const [history, setHistory] = useState<Record<string, number[]>>({ [rules[0].id]: [start] })
  const [revealed, setRevealed] = useState(!mystery)
  const rule = rules.find((r) => r.id === ruleId) ?? rules[0]
  const outputs = outputsOf(rule, x)
  const tried = history[rule.id] ?? []
  const seen = tried.flatMap((t) => outputsOf(rule, t).map((y) => ({ x: t, y })))
  const sharedOutput = seen.some((p, i) => seen.some((q, j) => j < i && q.x !== p.x && q.y === p.y))
  useReport<FunctionMachineState>(
    { mode: 'machine', rule: rule.id, x, outputs, tried: tried.length, sharedOutput, revealed },
    onState,
  )
  const feed = (v: number) => {
    setX(v)
    setHistory((h) => {
      const list = h[ruleId] ?? []
      return list.includes(v) ? h : { ...h, [ruleId]: [...list, v] }
    })
  }
  const chooseRule = (id: string) => {
    setRuleId(id)
    setHistory((h) => (h[id]?.includes(x) ? h : { ...h, [id]: [...(h[id] ?? []), x] }))
    if (mystery) setRevealed(false)
  }
  const ys = seen.map((p) => p.y)
  const yMax = Math.max(6, ...ys.map(Math.abs)) * 1.15
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:gap-3 sm:p-5">
        <Box label="input x" value={fmt(x)} color={IN} />
        <Arrow />
        <Machine tex={rule.tex} hidden={!revealed} />
        <Arrow />
        <Box
          label={outputs.length > 1 ? 'outputs' : 'output'}
          value={outputs.length ? outputs.map(fmt).join(' or ') : 'none'}
          color={OUT}
        />
      </div>
      {plot && (
        <div className="border-t border-line">
          <Plot
            view={{ xMin: range[0] - 0.8, xMax: range[1] + 0.8, yMin: -yMax, yMax }}
            height={240}
            ariaLabel={`${seen.length} input-output pairs plotted`}
          >
            {revealed &&
              rule.exprs.map((e) => (
                <FunctionGraph key={e} fn={evaluator(e)} color={OUT} opacity={0.35} />
              ))}
            {seen.map((p) => (
              <Point key={`${p.x},${p.y}`} at={[p.x, p.y]} r={4.5} color={OUT} />
            ))}
            {outputs.map((y) => (
              <Point key={`now${y}`} at={[x, y]} r={7} color={IN} />
            ))}
          </Plot>
        </div>
      )}
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-4">
        <Slider
          label="Input x"
          value={x}
          min={range[0]}
          max={range[1]}
          step={1}
          onChange={feed}
          color={IN}
        />
        <div className="flex flex-wrap gap-2">
          {rules.length > 1 && (
            <Segmented
              label="Rule"
              size="sm"
              value={ruleId}
              onChange={chooseRule}
              options={rules.map((r, i) => ({
                value: r.id,
                label: mystery ? `Rule ${i + 1}` : <Tex>{r.tex}</Tex>,
                ariaLabel: r.exprs.join(' or '),
              }))}
            />
          )}
          {mystery && (
            <Button size="sm" variant="secondary" onClick={() => setRevealed((v) => !v)}>
              {revealed ? 'Hide the rule' : 'Reveal the rule'}
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto border-t border-line px-3 py-3 sm:px-4">
        <table className="text-sm tabular-nums">
          <tbody>
            <tr>
              <th scope="row" className="pr-3 text-left font-medium text-ink-2">
                <Tex>x</Tex>
              </th>
              {tried.map((t) => (
                <td key={t} className="min-w-10 px-2 text-center">
                  {fmt(t)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="pr-3 text-left font-medium text-ink-2">
                output
              </th>
              {tried.map((t) => (
                <td key={t} className="min-w-10 px-2 text-center font-semibold">
                  {outputsOf(rule, t).map(fmt).join(', ') || '–'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

function ComposeMode({
  fns,
  f: f0,
  g: g0,
  start = 1,
  onState,
}: Extract<FunctionMachinePreset, { mode: 'compose' }> & {
  onState: (s: FunctionMachineState) => void
}) {
  const [fId, setF] = useState(f0 ?? fns[0].id)
  const [gId, setG] = useState(g0 ?? fns[1 % fns.length].id)
  const [x, setX] = useState(start)
  const [showInverse, setShowInverse] = useState(false)
  const F = fns.find((d) => d.id === fId) ?? fns[0]
  const G = fns.find((d) => d.id === gId) ?? fns[0]
  const f = useMemo(() => evaluator(F.expr), [F.expr])
  const g = useMemo(() => evaluator(G.expr), [G.expr])
  const fInv = useMemo(() => (F.inverse ? evaluator(F.inverse.expr) : null), [F.inverse])
  const fg = f(g(x))
  const gf = g(f(x))
  useReport<FunctionMachineState>(
    { mode: 'compose', f: F.id, g: G.id, x, fg, gf, showInverse },
    onState,
  )
  const pick = (label: string, value: string, set: (v: string) => void) => (
    <Segmented
      label={label}
      size="sm"
      value={value}
      onChange={set}
      options={fns.map((d) => ({ value: d.id, label: <Tex>{d.tex}</Tex>, ariaLabel: d.expr }))}
    />
  )
  const chain = (first: 'f' | 'g') => {
    const a = first === 'g' ? g(x) : f(x)
    const b = first === 'g' ? fg : gf
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Box label="x" value={fmt(x)} color={IN} />
        <Arrow />
        <Machine tex={first === 'g' ? `g(x) = ${G.tex}` : `f(x) = ${F.tex}`} hidden={false} />
        <Arrow />
        <Box label={first} value={fmt(a)} color="var(--ink-3)" />
        <Arrow />
        <Machine tex={first === 'g' ? `f(x) = ${F.tex}` : `g(x) = ${G.tex}`} hidden={false} />
        <Arrow />
        <Box label={first === 'g' ? 'f(g(x))' : 'g(f(x))'} value={fmt(b)} color={OUT} />
      </div>
    )
  }
  const fx = f(x)
  return (
    <>
      <div className="grid gap-4 p-3 sm:p-4">
        <div className="grid gap-1">
          <span className="text-sm font-medium text-ink-2">
            <Tex>{'f(g(x))'}</Tex>: g first, then f
          </span>
          {chain('g')}
        </div>
        <div className="grid gap-1">
          <span className="text-sm font-medium text-ink-2">
            <Tex>{'g(f(x))'}</Tex>: f first, then g
          </span>
          {chain('f')}
        </div>
        <p
          className={cn('text-sm font-medium', fg === gf ? 'text-good-ink' : 'text-ink-2')}
          aria-live="polite"
        >
          {fg === gf
            ? 'Same answer both ways for this x.'
            : 'Different answers: the order matters.'}
        </p>
      </div>
      {showInverse && fInv && (
        <div className="border-t border-line">
          <Plot
            view={{ xMin: -6, xMax: 6, yMin: -6, yMax: 6 }}
            aspect="equal"
            height={300}
            ariaLabel={`f and its inverse mirror each other across the line y equals x`}
          >
            <InfiniteLine
              through={[0, 0]}
              direction={[1, 1]}
              color="var(--ink-3)"
              dashed
              width={1.5}
            />
            <FunctionGraph fn={f} color={IN} />
            <FunctionGraph fn={fInv} color={OUT} />
            {Number.isFinite(fx) && Math.abs(fx) < 6 && (
              <>
                <Point at={[fx, x]} r={6} color={OUT} />
                <Label
                  at={[fx, x]}
                  anchor="left"
                  offset={[10, 0]}
                  color={OUT}
                  className="text-xs font-semibold"
                >
                  ({fmt(fx)}, {fmt(x)})
                </Label>
              </>
            )}
            <MovablePoint
              x={x}
              y={fx}
              onMove={(nx) => setX(Math.round(nx * 2) / 2)}
              constrain={constraints.onGraph(f, -5, 5)}
              color={IN}
              label="A point on f"
            />
          </Plot>
          <p className="px-3 pb-3 text-sm text-ink-2 sm:px-4">
            <Tex>{`f^{-1}(x) = ${F.inverse!.tex}`}</Tex> swaps every input and output, so its graph
            is f mirrored in the dashed line <Tex>y = x</Tex>.
          </p>
        </div>
      )}
      <div className="grid gap-x-8 gap-y-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider label="Input x" value={x} min={-5} max={5} step={0.5} onChange={setX} color={IN} />
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Tex>f =</Tex>
            {pick('Function f', F.id, setF)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tex>g =</Tex>
            {pick('Function g', G.id, setG)}
          </div>
          {F.inverse && (
            <Switch
              label="Show f and its inverse"
              checked={showInverse}
              onChange={setShowInverse}
            />
          )}
        </div>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: <Tex>{'f(g(x))'}</Tex>, value: fmt(fg), color: OUT },
            { label: <Tex>{'g(f(x))'}</Tex>, value: fmt(gf) },
          ]}
        />
      </div>
    </>
  )
}

export default function FunctionMachineWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'functionMachine'>) {
  return preset.mode === 'machine' ? (
    <MachineMode {...preset} onState={onStateChange} />
  ) : (
    <ComposeMode {...preset} onState={onStateChange} />
  )
}
