import { useState } from 'react'
import { Hand, RotateCcw } from 'lucide-react'
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { usePlayback } from '@/viz'
import { DotGrid } from '../_shared/DotGrid'

const STANDING = 'var(--c-blue)'
const FALLEN = 'var(--c-orange)'
const LAYERS = [
  'var(--c-blue)',
  'var(--c-orange)',
  'var(--c-green)',
  'var(--c-violet)',
  'var(--c-aqua)',
]
const N = 10

/** How many dominoes end up down: none without the first push, otherwise up to the gap. */
const reach = (base: boolean, gap: number) => (!base ? 0 : gap === 0 ? N : gap)

function Dominoes({ fallen, gap }: { fallen: number; gap: number }) {
  return (
    <svg
      viewBox="0 0 420 120"
      className="mx-auto block h-auto w-full max-w-xl"
      role="img"
      aria-label={`${fallen} of ${N} dominoes have fallen`}
    >
      <line x1="10" y1="104" x2="410" y2="104" style={{ stroke: 'var(--ink-3)', strokeWidth: 2 }} />
      {Array.from({ length: N }, (_, i) => {
        const x = 24 + i * 40
        const down = i < fallen
        return (
          <g key={i} transform={`rotate(${down ? 62 : 0} ${x + 8} 104)`}>
            <rect
              x={x}
              y={44}
              width={12}
              height={60}
              rx={2}
              style={{ fill: down ? FALLEN : STANDING, opacity: 0.85 }}
            />
          </g>
        )
      })}
      {gap > 0 && gap < N && (
        <text
          x={24 + gap * 40 - 14}
          y={30}
          textAnchor="middle"
          style={{ fill: 'var(--ink-2)', fontSize: 12 }}
        >
          gap
        </text>
      )}
      {Array.from({ length: N }, (_, i) => (
        <text
          key={`n${i}`}
          x={30 + i * 40}
          y={118}
          textAnchor="middle"
          style={{ fill: 'var(--ink-2)', fontSize: 11 }}
        >
          {i + 1}
        </text>
      ))}
    </svg>
  )
}

export default function InductionLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Infinitely many dominoes, two checks">
        <Prose>
          <p>
            How can you prove something for <em>every</em> whole number when you can only check a
            few? Picture an endless row of dominoes. You don't need to watch them all fall. It is
            enough to know two things: the <strong>first</strong> one falls, and{' '}
            <strong>each</strong> falling domino knocks over the next.
          </p>
          <p>
            That is <strong>proof by induction</strong>. Show the statement is true for{' '}
            <Tex>{'n = 1'}</Tex> (the base case), then show that <em>if</em> it is true for some{' '}
            <Tex>{'n'}</Tex> it must be true for <Tex>{'n + 1'}</Tex> (the inductive step). Then it
            is true for all of them.
          </p>
        </Prose>
      </LabSection>
      <DominoExplorer />
      <SquaresExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The shape of an induction proof">
        <Formula
          tex={
            'P(1) \\;\\text{ and }\\; \\big(P(n) \\Rightarrow P(n+1)\\big) \\quad\\Longrightarrow\\quad P(n) \\text{ for all } n \\ge 1'
          }
          caption="A base case plus an inductive step proves every case."
        />
        <Prose>
          <p>
            <strong>Example:</strong> prove <Tex>{'1 + 2 + \\cdots + n = \\tfrac{n(n+1)}{2}'}</Tex>.
          </p>
          <ul>
            <li>
              <strong>Base case</strong> <Tex>{'n = 1'}</Tex>: the left side is 1 and the right side
              is <Tex>{'\\tfrac{1 \\cdot 2}{2} = 1'}</Tex>. ✓
            </li>
            <li>
              <strong>Inductive step:</strong> assume it holds for <Tex>{'n'}</Tex>. Then{' '}
              <Tex>
                {'1 + \\cdots + n + (n+1) = \\tfrac{n(n+1)}{2} + (n+1) = \\tfrac{(n+1)(n+2)}{2}'}
              </Tex>
              , which is the formula for <Tex>{'n + 1'}</Tex>. ✓
            </li>
            <li>
              So it holds for every <Tex>{'n \\ge 1'}</Tex>.
            </li>
          </ul>
          <p>
            The base case can start anywhere: to prove something for all <Tex>{'n \\ge 4'}</Tex>,
            check <Tex>{'n = 4'}</Tex> first.
          </p>
        </Prose>
        <Callout kind="misconception" title="Checking lots of cases isn't a proof">
          <p>
            <Tex>{'n^2 + n + 41'}</Tex> is prime for <Tex>{'n = 0, 1, 2, \\ldots, 39'}</Tex> (forty
            cases!) but not for <Tex>{'n = 40'}</Tex>. Examples build confidence; only the inductive
            step guarantees that the pattern never breaks.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where induction is used">
        <RealWorld
          items={[
            {
              title: 'Programs and loops',
              body: 'A loop invariant is proved by induction: true before the loop, and kept true by every pass.',
            },
            {
              title: 'Recursion',
              body: 'A recursive function is correct if it handles the smallest case and each call reduces to a smaller correct one.',
            },
            {
              title: 'Formulas',
              body: 'Sums like 1 + 2 + … + n, compound interest and the number of moves in the Tower of Hanoi are all proved this way.',
            },
            {
              title: 'Games and puzzles',
              body: 'Winning strategies for games like Nim are justified by induction on the size of the position.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Induction needs two parts: a base case and an inductive step.',
            'The step proves “if true for $n$, then true for $n + 1$”.',
            'Without the base case nothing starts; without the step the chain breaks.',
            'Checking many examples is evidence, not proof.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function DominoExplorer() {
  const [base, setBase] = useState(true)
  const [gap, setGap] = useState(0)
  const [pushed, setPushed] = useState(false)
  const playback = usePlayback(1.6)
  const target = reach(base, gap)
  const fallen = pushed ? Math.min(target, Math.floor(playback.t * N + 1e-9)) : 0
  const done = pushed && !playback.playing && playback.t >= 1
  const reset = () => {
    playback.reset()
    setPushed(false)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="The domino row">
      <Prose>
        <p>
          The switch and the slider are the two parts of an induction proof. The switch is the base
          case: the push reaches the first domino. The gap slider breaks the inductive step at one
          place: there, a falling domino misses the next. Push and watch what happens.
        </p>
      </Prose>
      <PredictReveal
        question="Every domino is set to knock over the next, but nobody pushes the first. How many fall?"
        options={['All of them', 'None of them', 'Just the first', 'Half of them']}
        answer={1}
        explanation="The inductive step only says “if one falls, the next falls”. Without the base case, nothing ever starts."
      />
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <Dominoes fallen={fallen} gap={gap} />
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-line mt-3 px-3 pt-3 sm:px-4">
          <Switch
            checked={base}
            onChange={(v) => {
              setBase(v)
              reset()
            }}
            label="Base case: the push reaches the first domino"
          />
          <Button
            size="sm"
            variant="primary"
            icon={<Hand className="size-4" />}
            onClick={() => {
              setPushed(true)
              playback.seek(0)
              playback.play()
            }}
          >
            Push
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={reset}
            disabled={!pushed}
          >
            Stand them up
          </Button>
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <Slider
            label="Gap after domino (0 = no gap)"
            value={gap}
            min={0}
            max={N - 1}
            step={1}
            onChange={(v) => {
              setGap(v)
              reset()
            }}
            color={FALLEN}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'fallen', value: `${fallen} of ${N}`, color: FALLEN },
              {
                label: 'inductive step',
                value: gap === 0 ? 'holds everywhere' : `fails after domino ${gap}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-all-down" when={done && fallen === N}>
          Make every domino fall. Which two conditions did you need?
        </TryThis>
        <TryThis id="t-no-push" when={done && !base}>
          Switch off the base case and push. Does the inductive step help on its own?
        </TryThis>
        <TryThis id="t-broken-step" when={done && base && gap > 0}>
          Put a gap in the row. Which dominoes are still proved to fall?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function squareCells(n: number) {
  return Array.from({ length: n * n }, (_, i) => {
    const layer = Math.max(Math.floor(i / n), i % n)
    return { color: LAYERS[layer % LAYERS.length] }
  })
}

function SquaresExplorer() {
  const [n, setN] = useState(3)
  const odds = Array.from({ length: n }, (_, i) => 2 * i + 1)
  return (
    <LabSection id="squares" eyebrow="Explore" title="Odd numbers build squares">
      <Prose>
        <p>
          Add the odd numbers <Tex>{'1 + 3 + 5 + \\cdots'}</Tex>. Each new odd number is an L-shape
          that wraps around the square you already have, making the next square. That L is the
          inductive step in picture form: from an <Tex>{'n \\times n'}</Tex> square, adding{' '}
          <Tex>{'2n + 1'}</Tex> dots gives <Tex>{'(n+1) \\times (n+1)'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-60 px-3 pt-4 sm:px-4">
          <DotGrid
            cells={squareCells(n)}
            columns={n}
            ariaLabel={`${n} by ${n} square built from ${n} L-shaped layers`}
            size={14}
            gap={4}
          />
        </div>
        <div className="overflow-x-auto px-3 pt-3 text-center sm:px-4">
          <Tex>{`${odds.join(' + ')} = ${n * n} = ${n}^2`}</Tex>
        </div>
        <div className="border-t border-line mt-3 px-3 pt-3 sm:px-4">
          <Slider
            label="Number of odd numbers n"
            value={n}
            min={1}
            max={10}
            step={1}
            onChange={setN}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'newest layer', value: `${2 * n - 1} dots` },
              { label: 'total', value: `${n * n} = ${n}²` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-ten-odds" when={n === 10}>
          Add the first ten odd numbers. What do you get?
        </TryThis>
        <TryThis id="t-layer-size" when={n >= 5}>
          With 5 or more layers, how many dots does the newest L-shape have? Write it in terms of{' '}
          <Tex>{'n'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [base, setBase] = useState(false)
  const [gap, setGap] = useState(4)
  const [pushed, setPushed] = useState(false)
  const fallen = pushed ? reach(base, gap) : 0
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-first-five-odds"
          index={1}
          prompt="What is $1 + 3 + 5 + 7 + 9$?"
          answer={25}
          explanation="The first 5 odd numbers add to $5^2 = 25$."
        />
        <McqChallenge
          id="c-missing-part"
          index={2}
          prompt="A proof shows the statement is true for $n = 1$, and checks $n = 2, 3, 4$ by hand. What is missing?"
          options={[
            { text: 'The inductive step: true for n ⇒ true for n + 1', correct: true },
            { text: 'Another base case', why: 'One base case is enough; the step does the rest.' },
            {
              text: 'Nothing: four cases prove it',
              why: 'Patterns can break later, like n² + n + 41.',
            },
          ]}
          explanation="Without the step, nothing links the checked cases to all the others."
        />
        <NumericChallenge
          id="c-gauss"
          index={3}
          prompt="Use $1 + 2 + \cdots + n = \tfrac{n(n+1)}{2}$ to find $1 + 2 + \cdots + 100$."
          answer={5050}
          explanation="$\tfrac{100 \times 101}{2} = 5050$."
        />
        <McqChallenge
          id="c-start-here"
          index={4}
          prompt="To prove $2^n > n^2$ for all $n \ge 5$, what is the base case?"
          options={[
            { text: 'Check $n = 5$: $32 > 25$', correct: true },
            {
              text: 'Check $n = 1$',
              why: 'The claim is only for $n \\ge 5$ (and it fails at $n = 2, 3, 4$).',
            },
            { text: 'Check $n = 0$', why: 'Start where the claim starts.' },
          ]}
          explanation="The base case is the first value the claim covers: $n = 5$."
        />
        <NumericChallenge
          id="c-six-odds"
          index={5}
          prompt="What is the sum of the first 6 odd numbers?"
          answer={36}
          explanation="$1 + 3 + 5 + 7 + 9 + 11 = 36 = 6^2$."
        />
        <InteractiveChallenge
          id="c-topple-all"
          index={6}
          prompt="Set up the dominoes so that pushing knocks all 10 down, then push."
          solved={fallen === N}
          hint="You need both the base case and an unbroken inductive step."
          explanation="Turn on the base case and remove the gap (0): then every domino falls."
          onReset={() => {
            setBase(false)
            setGap(4)
            setPushed(false)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <Dominoes fallen={fallen} gap={gap} />
            <div className="flex flex-wrap items-center gap-4">
              <Switch
                checked={base}
                onChange={(v) => {
                  setBase(v)
                  setPushed(false)
                }}
                label="Base case"
              />
              <Button
                size="sm"
                variant="primary"
                icon={<Hand className="size-4" />}
                onClick={() => setPushed(true)}
              >
                Push
              </Button>
            </div>
            <Slider
              label="Gap after domino (0 = no gap)"
              value={gap}
              min={0}
              max={N - 1}
              step={1}
              onChange={(v) => {
                setGap(v)
                setPushed(false)
              }}
              color={FALLEN}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
