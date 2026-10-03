import { useState, type ReactNode } from 'react'
import { clamp, formatNumber, snap } from '@/math/core'
import { Readouts } from '@/learn/blocks'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, ParametricCurve, Plot, Point, Segment, Vector } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

type Ineq = '<' | '<=' | '>' | '>='

export type NumberLinePreset =
  | { mode: 'point'; start?: number }
  | { mode: 'jump'; a?: number; b?: number; op?: 'add' | 'multiply' }
  | { mode: 'inequality'; op?: Ineq; bound?: number }
  | { mode: 'approximate'; target?: 'sqrt2' | 'pi' | 'e' }

export type NumberLineState =
  | { mode: 'point'; value: number; opposite: number; abs: number }
  | { mode: 'jump'; a: number; b: number; op: 'add' | 'multiply'; result: number }
  | { mode: 'inequality'; test: number; op: Ineq; bound: number; inSet: boolean }
  | { mode: 'approximate'; p: number; q: number; value: number; target: number; error: number }

const MAIN = 'var(--c-blue)'
const ALT = 'var(--c-orange)'
const fmt = (v: number, d = 2) => formatNumber(v, d)

function LinePlot({
  view,
  height = 150,
  children,
  ariaLabel,
}: {
  view: [number, number]
  height?: number
  children: ReactNode
  ariaLabel: string
}) {
  return (
    <Plot
      view={{ xMin: view[0], xMax: view[1], yMin: -0.9, yMax: 1.5 }}
      height={height}
      grid={false}
      axes="x"
      xIntegers={view[1] - view[0] > 4}
      ariaLabel={ariaLabel}
    >
      {children}
    </Plot>
  )
}

function PointMode({
  start = 3,
  onState,
}: {
  start?: number
  onState: (s: NumberLineState) => void
}) {
  const [v, setV] = useState(start)
  useReport<NumberLineState>({ mode: 'point', value: v, opposite: -v, abs: Math.abs(v) }, onState)
  return (
    <>
      <LinePlot
        view={[-10.5, 10.5]}
        ariaLabel={`The number ${v} on the number line, ${Math.abs(v)} from zero`}
      >
        {v !== 0 && (
          <>
            <Segment from={[0, 0.55]} to={[v, 0.55]} color={ALT} width={2.5} />
            <Label
              at={[v / 2, 0.55]}
              anchor="bottom"
              offset={[0, -4]}
              color={ALT}
              className="text-xs font-semibold"
            >
              distance {Math.abs(v)}
            </Label>
            <Point at={[-v, 0]} r={7} color="var(--ink-3)" hollow />
            <Label at={[-v, 0]} anchor="bottom" offset={[0, -10]} className="text-xs text-ink-2">
              opposite
            </Label>
          </>
        )}
        <MovablePoint
          x={v}
          y={0}
          onMove={(x) => setV(x)}
          constrain={([x]) => [snap(clamp(x, -10, 10), 1), 0]}
          step={1}
          color={MAIN}
          label="A number on the line"
        />
      </LinePlot>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'number', value: String(v), color: MAIN },
            { label: 'opposite', value: String(-v || 0) },
            { label: 'absolute value', value: <Tex>{`|${v}| = ${Math.abs(v)}`}</Tex>, color: ALT },
          ]}
        />
      </div>
    </>
  )
}

function JumpMode({
  a: a0 = 2,
  b: b0 = 3,
  op: op0 = 'add',
  onState,
}: {
  a?: number
  b?: number
  op?: 'add' | 'multiply'
  onState: (s: NumberLineState) => void
}) {
  const [a, setA] = useState(a0)
  const [b, setB] = useState(b0)
  const [op, setOp] = useState(op0)
  const result = op === 'add' ? a + b : a * b
  useReport<NumberLineState>({ mode: 'jump', a, b, op, result }, onState)
  const safeA = op === 'multiply' ? clamp(a, -5, 5) : a
  return (
    <>
      <LinePlot
        view={[-12.5, 12.5]}
        height={170}
        ariaLabel={`${a} ${op === 'add' ? 'plus' : 'times'} ${b} equals ${result}`}
      >
        {op === 'add' ? (
          <>
            {b !== 0 && (
              <ParametricCurve
                x={(t) => a + b * t}
                y={(t) => 0.15 + Math.min(1.1, 0.25 + Math.abs(b) * 0.12) * Math.sin(Math.PI * t)}
                tMin={0}
                tMax={1}
                color={ALT}
                width={2.5}
              />
            )}
            {b !== 0 && (
              <Label
                at={[a + b / 2, 0.15 + Math.min(1.1, 0.25 + Math.abs(b) * 0.12)]}
                anchor="bottom"
                offset={[0, -2]}
                color={ALT}
                className="text-sm font-semibold"
              >
                {b > 0 ? `+${b}` : `−${-b}`}
              </Label>
            )}
            <Point at={[result, 0]} r={7} color={ALT} />
          </>
        ) : (
          <>
            <Vector from={[0, 0.4]} to={[safeA, 0.4]} color={MAIN} width={2} />
            <Vector from={[0, 0.95]} to={[safeA * b, 0.95]} color={ALT} width={3} />
            <Label
              at={[safeA * b, 0.95]}
              anchor={safeA * b >= 0 ? 'left' : 'right'}
              offset={[safeA * b >= 0 ? 8 : -8, 0]}
              color={ALT}
              className="text-sm font-semibold"
            >
              ×{fmt(b)}
            </Label>
            <Point at={[result, 0]} r={7} color={ALT} />
          </>
        )}
        <MovablePoint
          x={safeA}
          y={0}
          onMove={(x) => setA(x)}
          constrain={([x]) => [
            snap(clamp(x, op === 'multiply' ? -5 : -10, op === 'multiply' ? 5 : 10), 1),
            0,
          ]}
          step={1}
          color={MAIN}
          label="Starting number"
        />
      </LinePlot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Segmented
          label="Operation"
          value={op}
          onChange={(o) => {
            setOp(o)
            if (o === 'multiply') {
              setA((x) => clamp(x, -5, 5))
              setB((x) => clamp(Math.round(x * 2) / 2, -2, 2))
            }
          }}
          options={[
            { value: 'add', label: 'Add (a jump)' },
            { value: 'multiply', label: 'Multiply (a stretch)' },
          ]}
        />
        <Slider
          label={op === 'add' ? 'Jump size b' : 'Stretch factor b'}
          value={b}
          min={op === 'add' ? -8 : -2}
          max={op === 'add' ? 8 : 2}
          step={op === 'add' ? 1 : 0.5}
          onChange={setB}
          color={ALT}
        />
      </div>
      <p className="border-t border-line px-3 py-2 text-[1.05rem] sm:px-4">
        <Tex>{`${a} ${op === 'add' ? '+' : '\\times'} ${b < 0 ? `(${fmt(b)})` : fmt(b)} = ${fmt(result)}`}</Tex>
      </p>
    </>
  )
}

const INEQ_TEX: Record<Ineq, string> = { '<': '<', '<=': '\\le', '>': '>', '>=': '\\ge' }
const holds = (x: number, op: Ineq, bound: number) =>
  op === '<' ? x < bound : op === '<=' ? x <= bound : op === '>' ? x > bound : x >= bound

function InequalityMode({
  op: op0 = '>',
  bound: bound0 = 2,
  onState,
}: {
  op?: Ineq
  bound?: number
  onState: (s: NumberLineState) => void
}) {
  const [op, setOp] = useState<Ineq>(op0)
  const [bound, setBound] = useState(bound0)
  const [test, setTest] = useState(-3)
  const inSet = holds(test, op, bound)
  useReport<NumberLineState>({ mode: 'inequality', test, op, bound, inSet }, onState)
  const right = op === '>' || op === '>='
  const closed = op === '<=' || op === '>='
  return (
    <>
      <LinePlot
        view={[-10.5, 10.5]}
        ariaLabel={`Solution set of x ${op} ${bound}; the test point ${test} is ${inSet ? 'inside' : 'outside'} it`}
      >
        <Segment from={[bound, 0.3]} to={[right ? 10.5 : -10.5, 0.3]} color={MAIN} width={6} />
        <Point at={[bound, 0.3]} r={7} color={MAIN} hollow={!closed} />
        <MovablePoint
          x={test}
          y={0}
          onMove={(x) => setTest(x)}
          constrain={([x]) => [snap(clamp(x, -10, 10), 0.5), 0]}
          step={0.5}
          color={inSet ? 'var(--good)' : 'var(--c-red)'}
          label="A number to test"
        />
        <Label at={[test, 0]} anchor="top" offset={[0, 12]} className="text-xs font-semibold">
          test {fmt(test, 1)}
        </Label>
      </LinePlot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Segmented
          label="Inequality"
          value={op}
          onChange={setOp}
          options={(['<', '<=', '>', '>='] as Ineq[]).map((o) => ({
            value: o,
            label: <Tex>{`x ${INEQ_TEX[o]}`}</Tex>,
          }))}
        />
        <Slider
          label="Boundary"
          value={bound}
          min={-8}
          max={8}
          step={1}
          onChange={setBound}
          color={MAIN}
        />
      </div>
      <p className="border-t border-line px-3 py-2 text-[0.95rem] sm:px-4">
        <Tex>{`x ${INEQ_TEX[op]} ${bound}`}</Tex>: is <Tex>{fmt(test, 1)}</Tex> in the set?{' '}
        <strong className={inSet ? 'text-good-ink' : 'text-bad-ink'}>{inSet ? 'yes' : 'no'}</strong>
      </p>
    </>
  )
}

const TARGETS = {
  sqrt2: { value: Math.SQRT2, tex: '\\sqrt{2}' },
  pi: { value: Math.PI, tex: '\\pi' },
  e: { value: Math.E, tex: 'e' },
}

function ApproximateMode({
  target = 'sqrt2',
  onState,
}: {
  target?: 'sqrt2' | 'pi' | 'e'
  onState: (s: NumberLineState) => void
}) {
  const T = TARGETS[target]
  const [q, setQ] = useState(2)
  const [p, setP] = useState(Math.round(T.value * 2))
  const value = p / q
  const error = Math.abs(value - T.value)
  useReport<NumberLineState>({ mode: 'approximate', p, q, value, target: T.value, error }, onState)
  // Zoom in by factors of ten while the fraction still fits comfortably on the line.
  const half = [6, 0.6, 0.06, 0.006].findLast((h) => error < h * 0.85) ?? 6
  const view: [number, number] = [T.value - half, T.value + half]
  return (
    <>
      <Plot
        view={{ xMin: view[0], xMax: view[1], yMin: -0.9, yMax: 1.5 }}
        height={150}
        grid={false}
        axes="x"
        ariaLabel={`The fraction ${p}/${q} is ${fmt(error, 4)} away from the target`}
      >
        <Segment from={[T.value, -0.2]} to={[T.value, 1.2]} color={ALT} width={2} />
        <Label
          at={[T.value, 1.2]}
          anchor="bottom"
          offset={[0, -2]}
          color={ALT}
          className="font-semibold"
        >
          <Tex>{T.tex}</Tex>
        </Label>
        {value >= view[0] && value <= view[1] && (
          <>
            <Point at={[value, 0]} r={7} color={MAIN} />
            <Label
              at={[value, 0]}
              anchor="bottom"
              offset={[0, -10]}
              color={MAIN}
              className="font-semibold"
            >
              <Tex>{`\\tfrac{${p}}{${q}}`}</Tex>
            </Label>
          </>
        )}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label="Numerator p"
          value={p}
          min={1}
          max={100}
          step={1}
          onChange={setP}
          color={MAIN}
        />
        <Slider
          label="Denominator q"
          value={q}
          min={1}
          max={40}
          step={1}
          onChange={setQ}
          color={MAIN}
        />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'your fraction', value: `${p}/${q} = ${formatNumber(value, 6)}`, color: MAIN },
            { label: 'target', value: formatNumber(T.value, 6), color: ALT },
            { label: 'gap', value: formatNumber(error, 6) },
            { label: 'zoom', value: `±${half}` },
          ]}
        />
      </div>
    </>
  )
}

export default function NumberLineWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'numberLine'>) {
  switch (preset.mode) {
    case 'point':
      return <PointMode start={preset.start} onState={onStateChange} />
    case 'jump':
      return <JumpMode a={preset.a} b={preset.b} op={preset.op} onState={onStateChange} />
    case 'inequality':
      return <InequalityMode op={preset.op} bound={preset.bound} onState={onStateChange} />
    case 'approximate':
      return <ApproximateMode target={preset.target} onState={onStateChange} />
  }
}
