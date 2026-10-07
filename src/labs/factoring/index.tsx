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
import { FunctionGraph, Plot, Point } from '@/viz'
import { linearTex, polyTex } from '../_shared/algebra'

const CURVE = 'var(--c-blue)'
const ZERO = 'var(--c-orange)'
const PIECE_A = 'var(--c-blue)'
const PIECE_B = 'var(--c-orange)'

const TARGETS = [
  { b: 5, c: 6 },
  { b: 1, c: -12 },
  { b: -7, c: 10 },
  { b: 2, c: -15 },
] as const

const factorTex = (p: number) => `(${linearTex(1, p)})`

function PieceRects({ a, b, joined }: { a: number; b: number; joined: boolean }) {
  const u = 14
  const w = (joined ? a + b : a) * u
  const h = a * u
  // Piece A: the bottom a × (a − b) strip. Piece B: the top-left (a − b) × b block.
  const pieceB = joined
    ? { x: a * u, y: b * u, width: b * u, height: (a - b) * u }
    : { x: 0, y: 0, width: (a - b) * u, height: b * u }
  return (
    <svg
      viewBox={`-2 -2 ${w + 4} ${h + 4}`}
      className="h-auto w-full max-w-56"
      role="img"
      aria-label={
        joined
          ? `Rectangle ${a + b} by ${a - b}, area ${(a + b) * (a - b)}`
          : `Square of side ${a} with a ${b} by ${b} corner removed, area ${a * a - b * b}`
      }
    >
      {!joined && (
        <rect
          x={(a - b) * u}
          y={0}
          width={b * u}
          height={b * u}
          style={{ fill: 'none', stroke: 'var(--ink-3)', strokeDasharray: '4 3', strokeWidth: 1.5 }}
        />
      )}
      <rect
        x={0}
        y={b * u}
        width={a * u}
        height={(a - b) * u}
        rx={2}
        style={{
          fill: `color-mix(in oklab, ${PIECE_A} 30%, var(--surface))`,
          stroke: PIECE_A,
          strokeWidth: 2,
        }}
      />
      <rect
        {...pieceB}
        rx={2}
        style={{
          fill: `color-mix(in oklab, ${PIECE_B} 30%, var(--surface))`,
          stroke: PIECE_B,
          strokeWidth: 2,
        }}
      />
    </svg>
  )
}

export default function FactoringLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Multiplication, run backwards">
        <Prose>
          <p>
            Expanding turns <Tex>{'(x + 2)(x + 3)'}</Tex> into <Tex>{'x^2 + 5x + 6'}</Tex>.{' '}
            <strong>Factoring</strong> goes the other way: it splits an expression back into a
            product. Like writing 12 as <Tex>{'3 \\times 4'}</Tex>, it reveals the building blocks.
          </p>
          <p>
            Why bother? Because a product is zero only when one of its factors is zero. Once{' '}
            <Tex>{'x^2 + 5x + 6'}</Tex> is written as <Tex>{'(x + 2)(x + 3)'}</Tex>, you can see
            straight away that it is zero at <Tex>{'x = -2'}</Tex> and <Tex>{'x = -3'}</Tex>.
          </p>
        </Prose>
      </LabSection>
      <PairExplorer />
      <SquaresExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Patterns to look for">
        <Formula
          tex={'x^2 + bx + c = (x + p)(x + q) \\quad\\text{where}\\quad p + q = b,\\;\\; pq = c'}
          caption="Find two numbers that add to b and multiply to c."
        />
        <Prose>
          <ul>
            <li>
              <strong>Common factor first:</strong> <Tex>{'6x^2 + 9x = 3x(2x + 3)'}</Tex>.
            </li>
            <li>
              <strong>Difference of squares:</strong> <Tex>{'a^2 - b^2 = (a + b)(a - b)'}</Tex>, so{' '}
              <Tex>{'x^2 - 9 = (x + 3)(x - 3)'}</Tex>.
            </li>
            <li>
              <strong>Perfect squares:</strong> <Tex>{'x^2 + 6x + 9 = (x + 3)^2'}</Tex>.
            </li>
            <li>
              <strong>Zero-product rule:</strong> if <Tex>{'(x - r)(x - s) = 0'}</Tex>, then{' '}
              <Tex>{'x = r'}</Tex> or <Tex>{'x = s'}</Tex>. Factoring finds roots.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="x² + 9 doesn't factor like x² − 9">
          <p>
            <Tex>{'x^2 - 9 = (x + 3)(x - 3)'}</Tex>, but <Tex>{'x^2 + 9'}</Tex> has no real factors
            at all: it is never zero, since <Tex>{'x^2 \\ge 0'}</Tex>. Expand{' '}
            <Tex>{'(x + 3)(x + 3)'}</Tex> and you get <Tex>{'x^2 + 6x + 9'}</Tex>, not{' '}
            <Tex>{'x^2 + 9'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where factoring helps">
        <RealWorld
          items={[
            {
              title: 'Solving equations',
              body: 'Projectile landing times, break-even points and many design problems reduce to finding where a quadratic is zero.',
            },
            {
              title: 'Mental arithmetic',
              body: '$51 \\times 49 = (50 + 1)(50 - 1) = 2500 - 1 = 2499$.',
            },
            {
              title: 'Simplifying fractions',
              body: '$\\tfrac{x^2 - 9}{x - 3} = x + 3$ (for $x \\ne 3$) once the top is factored.',
            },
            {
              title: 'Cryptography',
              body: 'Factoring huge whole numbers is hard, and RSA encryption relies on exactly that.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Factoring writes an expression as a product; it undoes expanding.',
            'For $x^2 + bx + c$, find $p, q$ with $p + q = b$ and $pq = c$.',
            '$a^2 - b^2 = (a + b)(a - b)$.',
            'A product is zero when a factor is zero: factors give roots.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PairExplorer() {
  const [t, setT] = useState('0')
  const [p, setP] = useState(1)
  const [q, setQ] = useState(1)
  const target = TARGETS[Number(t)]
  const sumOk = p + q === target.b
  const productOk = p * q === target.c
  const solved = sumOk && productOk
  return (
    <LabSection id="explore" eyebrow="Explore" title="Two numbers: a sum and a product">
      <Prose>
        <p>
          Pick a target. Then choose <Tex>{'p'}</Tex> and <Tex>{'q'}</Tex> so that{' '}
          <Tex>{'(x + p)(x + q)'}</Tex> expands to it. On the graph, the orange dots mark where each
          factor is zero (<Tex>{'x = -p'}</Tex> and <Tex>{'x = -q'}</Tex>); when you've got it, they
          sit exactly on the curve's roots.
        </p>
      </Prose>
      <PredictReveal
        question="Which pair of numbers adds to 5 and multiplies to 6?"
        options={['1 and 6', '2 and 3', '−2 and −3', '5 and 1']}
        answer={1}
        explanation="$2 + 3 = 5$ and $2 \times 3 = 6$, so $x^2 + 5x + 6 = (x + 2)(x + 3)$."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Target"
            value={t}
            onChange={setT}
            options={TARGETS.map((tg, i) => ({
              value: `${i}`,
              label: <Tex>{polyTex([tg.c, tg.b, 1])}</Tex>,
              ariaLabel: polyTex([tg.c, tg.b, 1]),
            }))}
          />
        </div>
        <p className="px-3 pt-3 text-center sm:px-4">
          <Tex>{`${factorTex(p)}${factorTex(q)} = ${polyTex([p * q, p + q, 1])}`}</Tex>
        </p>
        <div className="mx-auto w-full max-w-xl px-3 pt-2 sm:px-4">
          <Plot
            view={{ xMin: -8, xMax: 8, yMin: -18, yMax: 14 }}
            ratio={1.4}
            ariaLabel={`Graph of y = ${polyTex([target.c, target.b, 1])}, with the factors zero at x = ${-p} and x = ${-q}`}
          >
            <FunctionGraph fn={(x) => x * x + target.b * x + target.c} color={CURVE} />
            <Point at={[-p, 0]} r={6} color={ZERO} />
            <Point at={[-q, 0]} r={6} color={ZERO} />
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="p" value={p} min={-8} max={8} step={1} onChange={setP} color={ZERO} />
          <Slider label="q" value={q} min={-8} max={8} step={1} onChange={setQ} color={ZERO} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'p + q', value: `${p + q} ${sumOk ? '✓' : `(need ${target.b})`}` },
              { label: 'p × q', value: `${p * q} ${productOk ? '✓' : `(need ${target.c})`}` },
              {
                label: 'factored',
                value: solved ? <Tex>{`${factorTex(p)}${factorTex(q)}`}</Tex> : 'not yet',
                color: ZERO,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-first-factor" when={t === '0' && solved}>
          Factor <Tex>{'x^2 + 5x + 6'}</Tex>.
        </TryThis>
        <TryThis id="t-negative-c" when={target.c < 0 && solved}>
          Factor a target with a negative constant. Why must <Tex>{'p'}</Tex> and <Tex>{'q'}</Tex>{' '}
          have opposite signs?
        </TryThis>
        <TryThis id="t-two-negatives" when={t === '2' && solved}>
          Factor <Tex>{'x^2 - 7x + 10'}</Tex>. Where are its roots?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function SquaresExplorer() {
  const [a, setA] = useState(6)
  const [rawB, setB] = useState(2)
  const b = Math.min(rawB, a - 1)
  return (
    <LabSection id="squares" eyebrow="Explore" title="A difference of squares, cut and moved">
      <Prose>
        <p>
          Take an <Tex>{'a \\times a'}</Tex> square and cut a <Tex>{'b \\times b'}</Tex> square from
          its corner: the area left is <Tex>{'a^2 - b^2'}</Tex>. Slide the orange piece round to the
          side and the same area becomes a rectangle <Tex>{'(a + b) \\times (a - b)'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="grid grid-cols-[minmax(0,1fr)] items-end justify-items-center gap-4 px-3 pt-4 sm:grid-cols-2 sm:px-4">
          <div className="grid w-full justify-items-center gap-1">
            <PieceRects a={a} b={b} joined={false} />
            <span className="text-sm text-ink-2">
              <Tex>{`${a}^2 - ${b}^2`}</Tex>
            </span>
          </div>
          <div className="grid w-full justify-items-center gap-1">
            <PieceRects a={a} b={b} joined />
            <span className="text-sm text-ink-2">
              <Tex>{`(${a} + ${b})(${a} - ${b})`}</Tex>
            </span>
          </div>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Big square side a" value={a} min={3} max={9} step={1} onChange={setA} />
          <Slider
            label="Cut square side b"
            value={b}
            min={1}
            max={a - 1}
            step={1}
            onChange={setB}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'a² − b²', value: `${a * a} − ${b * b} = ${a * a - b * b}` },
              { label: '(a + b)(a − b)', value: `${a + b} × ${a - b} = ${(a + b) * (a - b)}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-thin-strip" when={b === a - 1}>
          Make the rectangle only 1 unit tall. What is <Tex>{'a^2 - b^2'}</Tex> then, in terms of{' '}
          <Tex>{'a'}</Tex> and <Tex>{'b'}</Tex>?
        </TryThis>
        <TryThis id="t-area-24" when={a * a - b * b === 24}>
          Find <Tex>{'a'}</Tex> and <Tex>{'b'}</Tex> with <Tex>{'a^2 - b^2 = 24'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [p, setP] = useState(0)
  const [q, setQ] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-pair-larger"
          index={1}
          prompt="$x^2 + 7x + 12 = (x + p)(x + q)$. What is the larger of $p$ and $q$?"
          answer={4}
          explanation="$3 + 4 = 7$ and $3 \times 4 = 12$, so $(x + 3)(x + 4)$."
        />
        <McqChallenge
          id="c-diff-squares"
          index={2}
          prompt="Factor $x^2 - 25$."
          options={[
            { text: '$(x + 5)(x - 5)$', correct: true },
            { text: '$(x - 5)^2$', why: 'That expands to $x^2 - 10x + 25$.' },
            { text: '$(x + 5)^2$', why: 'That expands to $x^2 + 10x + 25$.' },
            { text: 'It doesn’t factor', why: 'A difference of squares always factors.' },
          ]}
          explanation="$x^2 - 5^2 = (x + 5)(x - 5)$."
        />
        <McqChallenge
          id="c-common-factor"
          index={3}
          prompt="Factor $6x^2 + 9x$ completely."
          options={[
            { text: '$3x(2x + 3)$', correct: true },
            { text: '$3(2x^2 + 3x)$', why: 'Each term still has a factor $x$.' },
            { text: '$x(6x + 9)$', why: '$6x + 9$ still has a common factor 3.' },
            { text: '$6x(x + 9)$', why: 'That expands to $6x^2 + 54x$.' },
          ]}
          explanation="Both terms share $3x$: $6x^2 = 3x \cdot 2x$ and $9x = 3x \cdot 3$."
        />
        <NumericChallenge
          id="c-zero-product"
          index={4}
          prompt="Solve $(x - 4)(x + 1) = 0$. What is the positive solution?"
          answer={4}
          explanation="A product is zero when a factor is: $x - 4 = 0$ or $x + 1 = 0$, so $x = 4$ or $x = -1$."
        />
        <NumericChallenge
          id="c-mental-diff"
          index={5}
          prompt="Work out $51^2 - 49^2$ without a calculator."
          answer={200}
          explanation="$(51 + 49)(51 - 49) = 100 \times 2 = 200$."
        />
        <InteractiveChallenge
          id="c-find-pair"
          index={6}
          prompt="Factor $x^2 - x - 6$: choose $p$ and $q$."
          solved={p + q === -1 && p * q === -6}
          hint="You need a product of −6 (opposite signs) and a sum of −1."
          explanation="$2 + (-3) = -1$ and $2 \times (-3) = -6$: $(x + 2)(x - 3)$."
          onReset={() => {
            setP(0)
            setQ(0)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`${factorTex(p)}${factorTex(q)} = ${polyTex([p * q, p + q, 1])}`}</Tex>
            </p>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider label="p" value={p} min={-6} max={6} step={1} onChange={setP} color={ZERO} />
              <Slider label="q" value={q} min={-6} max={6} step={1} onChange={setQ} color={ZERO} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
