import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
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
import { FunctionGraph, Plot, Point, Segment } from '@/viz'
import { GOLDEN_RATIO, fibonacciLike, paren, sequenceTerms } from '../_shared/algebra'
import { num } from '../_shared/tex'

const BAR = 'var(--c-blue)'
const LATEST = 'var(--c-orange)'
const RATIO = 'var(--c-violet)'
const PHI = 'var(--c-green)'

type Kind = 'arithmetic' | 'geometric'

/** A y-window that fits every term and 0, with a little headroom. */
function fitView(terms: number[], n: number) {
  const lo = Math.min(0, ...terms)
  const hi = Math.max(0, ...terms)
  const pad = Math.max(1, (hi - lo) * 0.12)
  return { xMin: 0, xMax: n + 1, yMin: lo - pad, yMax: hi + pad }
}

function TermBars({ terms, ariaLabel }: { terms: number[]; ariaLabel: string }) {
  return (
    <Plot
      view={fitView(terms, terms.length)}
      ratio={1.8}
      grid={false}
      xIntegers
      ariaLabel={ariaLabel}
    >
      {terms.map((t, i) => (
        <Segment
          key={i}
          from={[i + 1, 0]}
          to={[i + 1, t]}
          color={i === terms.length - 1 ? LATEST : BAR}
          width={terms.length > 12 ? 8 : 14}
        />
      ))}
    </Plot>
  )
}

export default function SequencesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Patterns that keep going">
        <Prose>
          <p>
            A <strong>sequence</strong> is a list of numbers that follows a rule: 3, 7, 11, 15, … or
            2, 6, 18, 54, … Spot the rule and you can jump to the 100th term without writing out the
            99 before it.
          </p>
          <p>
            Two patterns come up everywhere. <strong>Arithmetic</strong> sequences add the same
            amount each step, like saving £5 a week. <strong>Geometric</strong> sequences multiply
            by the same amount, like a population that doubles. One grows in a straight line; the
            other explodes, or fades away.
          </p>
        </Prose>
      </LabSection>
      <PatternExplorer />
      <FibonacciExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Formulas for the nth term and the sum">
        <Formula
          tex={'a_n = a_1 + (n - 1)d \\qquad\\qquad a_n = a_1 r^{\\,n-1}'}
          caption="Arithmetic (common difference d) and geometric (common ratio r): the nth term directly."
        />
        <Formula
          tex={
            'S_n = \\frac{n(a_1 + a_n)}{2} \\qquad\\qquad S_n = a_1\\,\\frac{1 - r^n}{1 - r}\\;\\;(r \\ne 1)'
          }
          caption="The sum of the first n terms: average of first and last, times n; or the geometric series formula."
        />
        <Prose>
          <ul>
            <li>
              <strong>Recursive</strong> rules say how to get the next term from earlier ones:{' '}
              <Tex>{'a_{n+1} = a_n + 4'}</Tex>, or Fibonacci's{' '}
              <Tex>{'F_{n+1} = F_n + F_{n-1}'}</Tex>.
            </li>
            <li>
              <strong>Explicit</strong> rules give any term straight from <Tex>{'n'}</Tex>:{' '}
              <Tex>{'a_n = 4n - 1'}</Tex>.
            </li>
            <li>
              A geometric sequence with <Tex>{'|r| < 1'}</Tex> shrinks towards 0, and its sum
              approaches <Tex>{'\\tfrac{a_1}{1 - r}'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="The nth term isn't a₁ + n·d">
          <p>
            The first term has had no steps added, so the 10th term has had 9:{' '}
            <Tex>{'a_{10} = a_1 + 9d'}</Tex>. For 3, 7, 11, …, that's{' '}
            <Tex>{'3 + 9 \\cdot 4 = 39'}</Tex>, not 43. Counting gaps between fence posts trips up
            everyone at least once.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where sequences appear">
        <RealWorld
          items={[
            {
              title: 'Savings and loans',
              body: 'Regular saving is arithmetic; compound interest multiplies, making it geometric.',
            },
            {
              title: 'Seating and stacking',
              body: 'Rows of a theatre that each gain 2 seats, or a stack of cans, are arithmetic.',
            },
            {
              title: 'Growth and decay',
              body: 'Bacteria doubling, a ball bouncing to 70% of its height, a drug halving in the blood: all geometric.',
            },
            {
              title: 'Nature',
              body: 'Fibonacci numbers count spirals in sunflowers and pine cones.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Arithmetic: add $d$ each time, $a_n = a_1 + (n - 1)d$.',
            'Geometric: multiply by $r$ each time, $a_n = a_1 r^{n-1}$.',
            'Recursive rules use earlier terms; explicit rules use $n$.',
            'Geometric terms with $|r| < 1$ shrink towards 0.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PatternExplorer() {
  const [kind, setKind] = useState<Kind>('arithmetic')
  const [a, setA] = useState(2)
  const [d, setD] = useState(3)
  const [r, setR] = useState(2)
  const [n, setN] = useState(6)
  const step = kind === 'arithmetic' ? d : r
  const terms = sequenceTerms(kind, a, step, n)
  const sum = terms.reduce((s, t) => s + t, 0)
  const rule =
    kind === 'arithmetic'
      ? `a_n = ${a} + (n - 1) \\cdot ${paren(d)}`
      : `a_n = ${a} \\cdot ${paren(r)}^{\\,n-1}`
  return (
    <LabSection id="explore" eyebrow="Explore" title="Adding vs multiplying">
      <Prose>
        <p>
          Choose a kind of sequence, a first term and the step. Each bar is a term; the orange one
          is the newest. Watch how differently the two kinds grow.
        </p>
      </Prose>
      <PredictReveal
        question="Start at 1. Which is bigger after 10 terms: adding 10 each time, or doubling each time?"
        options={['Adding 10 (reaches 91)', 'Doubling (reaches 512)', 'They end level']}
        answer={1}
        explanation="$1 + 9 \cdot 10 = 91$, but $1 \cdot 2^9 = 512$. Doubling starts slowly but always overtakes adding."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Kind of sequence"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'arithmetic', label: 'Arithmetic (add d)' },
              { value: 'geometric', label: 'Geometric (multiply by r)' },
            ]}
          />
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <TermBars terms={terms} ariaLabel={`Terms: ${terms.map((t) => num(t)).join(', ')}`} />
        </div>
        <p className="overflow-x-auto px-3 text-center text-sm sm:px-4">
          <Tex>{terms.map((t) => num(t)).join(',\\; ') + ',\\; \\ldots'}</Tex>
        </p>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="First term a₁"
            value={a}
            min={-5}
            max={10}
            step={1}
            onChange={setA}
            color={BAR}
          />
          {kind === 'arithmetic' ? (
            <Slider
              label="Difference d"
              value={d}
              min={-4}
              max={4}
              step={1}
              onChange={setD}
              color={BAR}
            />
          ) : (
            <Slider
              label="Ratio r"
              value={r}
              min={-2}
              max={2}
              step={0.5}
              onChange={setR}
              color={BAR}
            />
          )}
          <Slider
            label="Number of terms n"
            value={n}
            min={2}
            max={10}
            step={1}
            onChange={setN}
            color={LATEST}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'rule', value: <Tex>{rule}</Tex> },
              { label: `term ${n}`, value: num(terms[n - 1]), color: LATEST },
              { label: `sum of ${n} terms`, value: num(sum) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-going-down" when={kind === 'arithmetic' && d < 0}>
          Make an arithmetic sequence that goes down. What sign is <Tex>{'d'}</Tex>?
        </TryThis>
        <TryThis id="t-zigzag" when={kind === 'geometric' && r < 0 && a !== 0}>
          Make a geometric sequence whose terms flip sign every step.
        </TryThis>
        <TryThis
          id="t-shrinking-terms"
          when={kind === 'geometric' && Math.abs(r) < 1 && r !== 0 && a !== 0}
        >
          Make the terms of a geometric sequence shrink towards 0. Does the sum keep growing?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function FibonacciExplorer() {
  const [first, setFirst] = useState(1)
  const [second, setSecond] = useState(1)
  const [n, setN] = useState(6)
  const terms = fibonacciLike(first, second, n)
  const ratios: Vec2[] = terms.slice(1).map((t, i) => [i + 2, t / terms[i]])
  const last = ratios[ratios.length - 1][1]
  return (
    <LabSection id="fibonacci" eyebrow="Explore" title="A recursive rule: Fibonacci">
      <Prose>
        <p>
          Some sequences are defined by their own past: each new term is the sum of the two before
          it. Starting from 1, 1 you get the Fibonacci numbers. The violet dots show each term
          divided by the one before. Whatever two numbers you start with, those ratios home in on
          the golden ratio <Tex>{'\\varphi \\approx 1.618'}</Tex> (green line).
        </p>
      </Prose>
      <Figure>
        <p className="overflow-x-auto px-3 pt-3 text-center text-sm sm:px-4">
          <Tex>{terms.join(',\\; ') + ',\\; \\ldots'}</Tex>
        </p>
        <div className="mx-auto w-full max-w-xl px-3 pt-2 sm:px-4">
          <Plot
            view={{ xMin: 0, xMax: 21, yMin: 0, yMax: 3.2 }}
            ratio={2}
            xIntegers
            ariaLabel={`Ratios of consecutive terms, the last one ${num(last, 4)}`}
          >
            <FunctionGraph fn={() => GOLDEN_RATIO} color={PHI} dashed width={2} />
            {ratios.map((p) => (
              <Point key={p[0]} at={p} r={4.5} color={RATIO} />
            ))}
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <Slider label="First term" value={first} min={1} max={9} step={1} onChange={setFirst} />
          <Slider
            label="Second term"
            value={second}
            min={1}
            max={9}
            step={1}
            onChange={setSecond}
          />
          <Slider label="Terms" value={n} min={3} max={20} step={1} onChange={setN} color={RATIO} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'rule', value: <Tex>{'a_{n+1} = a_n + a_{n-1}'}</Tex> },
              { label: 'latest ratio', value: num(last, 5), color: RATIO },
              { label: 'golden ratio', value: num(GOLDEN_RATIO, 5), color: PHI },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-golden-close" when={Math.abs(last - GOLDEN_RATIO) < 0.001}>
          Add terms until the ratio is within 0.001 of the golden ratio. How many did it take?
        </TryThis>
        <TryThis id="t-other-start" when={(first !== 1 || second !== 1) && n >= 12}>
          Start from two other numbers and add at least 12 terms. Where do the ratios go?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState(0)
  const [d, setD] = useState(1)
  const terms = sequenceTerms('arithmetic', a, d, 5)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-tenth-term"
          index={1}
          prompt="What is the 10th term of $3, 7, 11, 15, \ldots$?"
          answer={39}
          explanation="$d = 4$, so $a_{10} = 3 + 9 \cdot 4 = 39$."
        />
        <NumericChallenge
          id="c-next-geometric"
          index={2}
          prompt="What comes next: $2, 6, 18, \ldots$?"
          answer={54}
          explanation="Each term is 3 times the last: $18 \times 3 = 54$."
        />
        <McqChallenge
          id="c-which-pattern"
          index={3}
          prompt="What kind of sequence is $5, 10, 20, 40, \ldots$?"
          options={[
            { text: 'Geometric, ratio 2', correct: true },
            { text: 'Arithmetic, difference 5', why: 'The gaps are 5, 10, 20: not constant.' },
            { text: 'Arithmetic, difference 2', why: 'Check: $5 + 2 \\ne 10$.' },
            { text: 'Neither', why: 'Each term doubles, so it is geometric.' },
          ]}
          explanation="Each term is double the one before: a common ratio of 2."
        />
        <NumericChallenge
          id="c-even-sum"
          index={4}
          prompt="Add up $2 + 4 + 6 + \cdots + 20$."
          answer={110}
          explanation="10 terms, average of first and last $\tfrac{2 + 20}{2} = 11$: $10 \times 11 = 110$."
        />
        <NumericChallenge
          id="c-fib-next"
          index={5}
          prompt="What comes next: $1, 1, 2, 3, 5, 8, 13, \ldots$?"
          answer={21}
          explanation="Each term is the sum of the two before: $8 + 13 = 21$."
        />
        <InteractiveChallenge
          id="c-build-sequence"
          index={6}
          prompt="Build an arithmetic sequence whose 1st term is 4 and whose 5th term is 16."
          solved={a === 4 && terms[4] === 16}
          hint="From term 1 to term 5 there are 4 steps of size $d$."
          explanation="$16 - 4 = 12$ over 4 steps, so $d = 3$: 4, 7, 10, 13, 16."
          onReset={() => {
            setA(0)
            setD(1)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{terms.join(',\\; ')}</Tex>
            </p>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider
                label="First term a₁"
                value={a}
                min={-5}
                max={10}
                step={1}
                onChange={setA}
                color={BAR}
              />
              <Slider
                label="Difference d"
                value={d}
                min={-4}
                max={6}
                step={1}
                onChange={setD}
                color={BAR}
              />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
