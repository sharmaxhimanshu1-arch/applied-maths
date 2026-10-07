import { useState } from 'react'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  PredictReveal,
  Prose,
  Readouts,
  RealWorld,
  Takeaways,
  TryThis,
  TryThisList,
} from '@/learn/blocks'
import {
  ChallengeSet,
  InteractiveChallenge,
  McqChallenge,
  NumericChallenge,
} from '@/learn/challenges'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, ParametricCurve, Plot, Point, Segment } from '@/viz'
import { num } from '../_shared/tex'

const F = 'var(--c-blue)'
const G = 'var(--c-orange)'
const MIRROR = 'var(--ink-3)'
const VIEW = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 }

type MachineId = 'add3' | 'sub3' | 'double' | 'halve' | 'square'

const MACHINES: Record<
  MachineId,
  { label: string; tex: (v: string) => string; f: (x: number) => number }
> = {
  add3: { label: '+ 3', tex: (v) => `${v} + 3`, f: (x) => x + 3 },
  sub3: { label: '− 3', tex: (v) => `${v} - 3`, f: (x) => x - 3 },
  double: { label: '× 2', tex: (v) => `2${v}`, f: (x) => 2 * x },
  halve: { label: '÷ 2', tex: (v) => `\\tfrac{${v}}{2}`, f: (x) => x / 2 },
  square: { label: 'square', tex: (v) => `${v}^2`, f: (x) => x * x },
}

const UNDOES: Partial<Record<MachineId, MachineId>> = {
  add3: 'sub3',
  sub3: 'add3',
  double: 'halve',
  halve: 'double',
}

const machineOptions = (Object.keys(MACHINES) as MachineId[]).map((id) => ({
  value: id,
  label: MACHINES[id].label,
}))

type CurveId = 'linear' | 'cube' | 'square'

const CURVES: Record<
  CurveId,
  {
    tex: string
    inverseTex: string | null
    f: (x: number) => number
    inverse: ((x: number) => number) | null
    range: number
  }
> = {
  linear: {
    tex: 'f(x) = 2x + 1',
    inverseTex: 'f^{-1}(x) = \\tfrac{x - 1}{2}',
    f: (x) => 2 * x + 1,
    inverse: (x) => (x - 1) / 2,
    range: 2.5,
  },
  cube: {
    tex: 'f(x) = x^3',
    inverseTex: 'f^{-1}(x) = \\sqrt[3]{x}',
    f: (x) => x ** 3,
    inverse: (x) => Math.cbrt(x),
    range: 1.5,
  },
  square: { tex: 'f(x) = x^2', inverseTex: null, f: (x) => x * x, inverse: null, range: 2 },
}

function Pipeline({
  x,
  first,
  second,
  color,
}: {
  x: number
  first: MachineId
  second: MachineId
  color: string
}) {
  const mid = MACHINES[first].f(x)
  const out = MACHINES[second].f(mid)
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
      <span className="rounded-lg border border-line px-2 py-1 tabular-nums">{x}</span>
      <span aria-hidden>→</span>
      <span className="rounded-lg bg-surface-2 px-2 py-1">{MACHINES[first].label}</span>
      <span aria-hidden>→</span>
      <span className="rounded-lg border border-line px-2 py-1 tabular-nums">{num(mid)}</span>
      <span aria-hidden>→</span>
      <span className="rounded-lg bg-surface-2 px-2 py-1">{MACHINES[second].label}</span>
      <span aria-hidden>→</span>
      <span
        className="rounded-lg border-2 px-2 py-1 font-semibold tabular-nums"
        style={{ borderColor: color }}
      >
        {num(out)}
      </span>
    </div>
  )
}

export default function CompositionInversesLab() {
  return (
    <div className="space-y-16">
      <LabSection
        id="idea"
        eyebrow="The big idea"
        title="Chaining machines, and running them backwards"
      >
        <Prose>
          <p>
            Feed the output of one function straight into another and you get a new function: the{' '}
            <strong>composition</strong>. Put on socks, then shoes. Add VAT, then a discount. Order
            usually matters: shoes then socks is a very different result.
          </p>
          <p>
            An <strong>inverse</strong> runs a function backwards: it takes each output back to the
            input it came from. Doubling is undone by halving; adding 3 by subtracting 3. On a
            graph, an inverse is a mirror image in the line <Tex>{'y = x'}</Tex>.
          </p>
        </Prose>
      </LabSection>
      <ChainExplorer />
      <MirrorExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Notation and how to find an inverse">
        <Formula
          tex={'(g \\circ f)(x) = g\\big(f(x)\\big) \\qquad f^{-1}\\big(f(x)\\big) = x'}
          caption="g ∘ f means “do f first, then g”. The inverse f⁻¹ undoes f."
        />
        <Prose>
          <ul>
            <li>
              <strong>Composition:</strong> if <Tex>{'f(x) = x + 1'}</Tex> and{' '}
              <Tex>{'g(x) = 2x'}</Tex>, then <Tex>{'g(f(x)) = 2(x + 1)'}</Tex> but{' '}
              <Tex>{'f(g(x)) = 2x + 1'}</Tex>.
            </li>
            <li>
              <strong>Finding an inverse:</strong> write <Tex>{'y = f(x)'}</Tex>, solve for{' '}
              <Tex>{'x'}</Tex>, then swap names. From <Tex>{'y = 2x + 1'}</Tex>:{' '}
              <Tex>{'x = \\tfrac{y - 1}{2}'}</Tex>, so <Tex>{'f^{-1}(x) = \\tfrac{x - 1}{2}'}</Tex>.
            </li>
            <li>
              The inverse undoes the steps in reverse order: “double, then add 1” is undone by
              “subtract 1, then halve”.
            </li>
            <li>
              Only <strong>one-to-one</strong> functions (no two inputs sharing an output) have an
              inverse. <Tex>{'x^2'}</Tex> sends 2 and −2 to 4, so it needs a restricted domain.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="f⁻¹(x) is not 1/f(x)">
          <p>
            The −1 means “inverse function”, not a reciprocal. For <Tex>{'f(x) = 2x + 1'}</Tex>,{' '}
            <Tex>{'f^{-1}(3) = 1'}</Tex> (because <Tex>{'f(1) = 3'}</Tex>), while{' '}
            <Tex>{'\\tfrac{1}{f(3)} = \\tfrac{1}{7}'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection
        id="real-world"
        eyebrow="Real world"
        title="Where composition and inverses show up"
      >
        <RealWorld
          items={[
            {
              title: 'Unit conversions',
              body: 'Miles → km → m chains conversions; converting back runs the inverses in reverse order.',
            },
            {
              title: 'Encryption',
              body: 'Decryption is the inverse of encryption: it must take every scrambled message back to exactly one original.',
            },
            {
              title: 'Image editing',
              body: 'Filters are composed one after another, and their order changes the result. Undo applies inverses.',
            },
            {
              title: 'Logarithms',
              body: '$\\log_{10}$ is the inverse of $10^x$: it answers “what power gives this number?”',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$g(f(x))$: apply $f$ first, then $g$. Order usually matters.',
            'An inverse undoes a function: $f^{-1}(f(x)) = x$.',
            'Undo the steps in reverse order; graphically, reflect in $y = x$.',
            'Only one-to-one functions have inverses.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ChainExplorer() {
  const [f, setF] = useState<MachineId>('add3')
  const [g, setG] = useState<MachineId>('add3')
  const [x, setX] = useState(1)
  const gf = MACHINES[g].f(MACHINES[f].f(x))
  const fg = MACHINES[f].f(MACHINES[g].f(x))
  const pair = new Set([f, g])
  return (
    <LabSection id="explore" eyebrow="Explore" title="Order matters">
      <Prose>
        <p>
          Choose two machines, <Tex>{'f'}</Tex> and <Tex>{'g'}</Tex>, and an input. The blue chain
          does <Tex>{'f'}</Tex> first, then <Tex>{'g'}</Tex>; the orange chain does them the other
          way round. When do the answers agree?
        </p>
      </Prose>
      <PredictReveal
        question="Start with 5. Is “double, then add 3” the same as “add 3, then double”?"
        options={['Yes, both give 13', 'No: 13 and 16']}
        answer={1}
        explanation="$2 \cdot 5 + 3 = 13$ but $2 \cdot (5 + 3) = 16$. Composition depends on order."
      />
      <Figure>
        <div className="grid gap-3 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <div className="grid min-w-0 gap-1">
            <span className="text-sm text-ink-2">Machine f</span>
            <Segmented
              label="Machine f"
              value={f}
              onChange={setF}
              options={machineOptions}
              size="sm"
            />
          </div>
          <div className="grid min-w-0 gap-1">
            <span className="text-sm text-ink-2">Machine g</span>
            <Segmented
              label="Machine g"
              value={g}
              onChange={setG}
              options={machineOptions}
              size="sm"
            />
          </div>
        </div>
        <div className="grid gap-3 px-3 pt-4 sm:px-4">
          <div className="grid gap-1">
            <span className="text-center text-sm text-ink-2">
              <Tex>{`g(f(x)) = ${MACHINES[g].tex(`(${MACHINES[f].tex('x')})`)}`}</Tex>
            </span>
            <Pipeline x={x} first={f} second={g} color={F} />
          </div>
          <div className="grid gap-1">
            <span className="text-center text-sm text-ink-2">
              <Tex>{`f(g(x)) = ${MACHINES[f].tex(`(${MACHINES[g].tex('x')})`)}`}</Tex>
            </span>
            <Pipeline x={x} first={g} second={f} color={G} />
          </div>
        </div>
        <div className="mt-3 border-t border-line px-3 pt-3 sm:px-4">
          <Slider label="Input x" value={x} min={-4} max={4} step={1} onChange={setX} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'g(f(x))', value: num(gf), color: F },
              { label: 'f(g(x))', value: num(fg), color: G },
              { label: 'same?', value: gf === fg ? 'yes' : 'no' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-order-changes" when={gf !== fg}>
          Find two machines and an input where the order changes the answer.
        </TryThis>
        <TryThis id="t-undo-pair" when={UNDOES[f] === g}>
          Choose a <Tex>{'g'}</Tex> that undoes <Tex>{'f'}</Tex>, so <Tex>{'g(f(x)) = x'}</Tex> for
          every input.
        </TryThis>
        <TryThis id="t-rare-agreement" when={pair.has('square') && pair.has('add3') && x === -1}>
          With “square” and “+ 3”, find the one input where both orders agree.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function MirrorExplorer() {
  const [curve, setCurve] = useState<CurveId>('linear')
  const [rawA, setA] = useState(1)
  const c = CURVES[curve]
  const a = Math.max(-c.range, Math.min(c.range, rawA))
  const fa = c.f(a)
  const fixed = Math.abs(fa - a) < 1e-9
  return (
    <LabSection id="mirror" eyebrow="Explore" title="An inverse is a mirror image">
      <Prose>
        <p>
          The point <Tex>{'(a, f(a))'}</Tex> on the blue graph has a twin <Tex>{'(f(a), a)'}</Tex>:
          the same numbers swapped. Every twin lands on the orange graph, the inverse, which is the
          reflection of the blue one in the dashed line <Tex>{'y = x'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Function"
            value={curve}
            onChange={setCurve}
            options={[
              { value: 'linear', label: <Tex>{'2x + 1'}</Tex>, ariaLabel: '2x + 1' },
              { value: 'cube', label: <Tex>{'x^3'}</Tex>, ariaLabel: 'x cubed' },
              { value: 'square', label: <Tex>{'x^2'}</Tex>, ariaLabel: 'x squared' },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-lg px-3 pt-3 sm:px-4">
          <Plot
            view={VIEW}
            aspect="equal"
            ariaLabel={`${c.tex} and its reflection in y = x; the point (${num(a)}, ${num(fa)}) and its twin (${num(fa)}, ${num(a)})`}
          >
            <FunctionGraph fn={(x) => x} color={MIRROR} width={1.5} dashed />
            <FunctionGraph fn={c.f} color={F} />
            {c.inverse ? (
              <FunctionGraph fn={c.inverse} color={G} />
            ) : (
              <ParametricCurve x={(t) => t * t} y={(t) => t} tMin={-3} tMax={3} color={G} />
            )}
            {!fixed && <Segment from={[a, fa]} to={[fa, a]} color={MIRROR} width={1.5} dashed />}
            <Point at={[a, fa]} r={6} color={F} />
            <Point at={[fa, a]} r={6} color={G} />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Input a"
            value={a}
            min={-c.range}
            max={c.range}
            step={0.5}
            onChange={setA}
            color={F}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'point', value: `(${num(a)}, ${num(fa)})`, color: F },
              { label: 'twin', value: `(${num(fa)}, ${num(a)})`, color: G },
              {
                label: 'inverse',
                value: c.inverseTex ? (
                  <Tex>{c.inverseTex}</Tex>
                ) : (
                  'none: the mirror image fails the vertical line test'
                ),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-fixed-point" when={fixed}>
          Find a point that is its own twin. Where does it sit?
        </TryThis>
        <TryThis id="t-no-inverse" when={curve === 'square' && a !== 0}>
          Choose <Tex>{'x^2'}</Tex>. Why is its mirror image not the graph of a function?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const g = (x: number) => (x - b) / a
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-f-of-g"
          index={1}
          prompt="$f(x) = x + 1$ and $g(x) = 2x$. What is $f(g(3))$?"
          answer={7}
          explanation="$g(3) = 6$, then $f(6) = 7$."
        />
        <McqChallenge
          id="c-g-of-f"
          index={2}
          prompt="With the same $f$ and $g$, what is $g(f(3))$?"
          options={[
            { text: '8', correct: true },
            { text: '7', why: 'That is $f(g(3))$: the other order.' },
            { text: '6', why: '$f(3) = 4$ comes first, then double it.' },
            { text: '9', why: '$f(3) = 4$, and $g(4) = 8$.' },
          ]}
          explanation="$f(3) = 4$ first, then $g(4) = 8$."
        />
        <NumericChallenge
          id="c-inverse-at-zero"
          index={3}
          prompt="$f(x) = 3x - 6$. What is $f^{-1}(0)$?"
          answer={2}
          explanation="$f^{-1}(0)$ is the input that gives 0: $3x - 6 = 0$, so $x = 2$."
        />
        <McqChallenge
          id="c-mirror-line"
          index={4}
          prompt="The graph of $f^{-1}$ is the graph of $f$ reflected in…"
          options={[
            { text: 'the line $y = x$', correct: true },
            { text: 'the $x$-axis', why: 'That gives $-f(x)$.' },
            { text: 'the $y$-axis', why: 'That gives $f(-x)$.' },
          ]}
          explanation="Swapping $x$ and $y$ in every point is a reflection in $y = x$."
        />
        <NumericChallenge
          id="c-undo-temperature"
          index={5}
          prompt="$F = 1.8C + 32$ converts Celsius to Fahrenheit. Which Celsius temperature gives $F = 212$?"
          answer={100}
          explanation="Undo in reverse order: $212 - 32 = 180$, and $180 \div 1.8 = 100$."
        />
        <InteractiveChallenge
          id="c-build-inverse"
          index={6}
          prompt="$f(x) = 2x + 1$. Set $g(x) = \tfrac{x - b}{a}$ so that $g$ is the inverse of $f$."
          solved={a === 2 && b === 1}
          hint="Undo “double, then add 1” in reverse order."
          explanation="Subtract 1, then halve: $g(x) = \tfrac{x - 1}{2}$, so $a = 2$, $b = 1$."
          onReset={() => {
            setA(1)
            setB(0)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`g(f(3)) = g(7) = ${num(g(7))}`}</Tex>
            </p>
            <div className="mx-auto w-full max-w-sm">
              <Plot
                view={VIEW}
                aspect="equal"
                ariaLabel={`f(x) = 2x + 1 and g(x) = (x − ${b}) / ${a}`}
              >
                <FunctionGraph fn={(x) => x} color={MIRROR} width={1.5} dashed />
                <FunctionGraph fn={(x) => 2 * x + 1} color={F} />
                <FunctionGraph fn={g} color={G} />
              </Plot>
            </div>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider label="a" value={a} min={1} max={4} step={1} onChange={setA} color={G} />
              <Slider label="b" value={b} min={-3} max={3} step={1} onChange={setB} color={G} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
