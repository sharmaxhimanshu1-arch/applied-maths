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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, Label, Plot, Point } from '@/viz'
import { lineMeet, linearTex, paren } from '../_shared/algebra'
import { num } from '../_shared/tex'

const ONE = 'var(--c-blue)'
const TWO = 'var(--c-orange)'
const MEET = 'var(--c-violet)'
const VIEW = { xMin: -6, xMax: 6, yMin: -5, yMax: 6 }
const TARGET = { x: 1, y: 3 }

/** a·x + b·y = c in TeX, e.g. '2x + 3y = 12'. */
function standardTex(a: number, b: number, c: number): string {
  const xTerm = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`
  const yMag = Math.abs(b) === 1 ? 'y' : `${Math.abs(b)}y`
  const yTerm =
    b === 0 ? '' : xTerm ? ` ${b > 0 ? '+' : '-'} ${yMag}` : `${b < 0 ? '-' : ''}${yMag}`
  return `${xTerm}${yTerm || (xTerm ? '' : '0')} = ${c}`
}

export default function SystemsOfEquationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Two clues, one answer">
        <Prose>
          <p>
            One equation with two unknowns, like <Tex>{'x + y = 10'}</Tex>, has endless answers: (1,
            9), (2, 8), (2.5, 7.5)… A second clue, say <Tex>{'x - y = 2'}</Tex>, narrows it to the
            one pair that fits both: (6, 4). Together the two equations form a{' '}
            <strong>system</strong>.
          </p>
          <p>
            Each equation is a line on a graph. A solution of the system is a point on <em>both</em>{' '}
            lines: where they cross. Lines can also be parallel (no solution) or the very same line
            (infinitely many).
          </p>
        </Prose>
      </LabSection>
      <LinesExplorer />
      <EliminationExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Three ways to solve">
        <Formula
          tex={
            '\\begin{cases} x + y = 10 \\\\ x - y = 2 \\end{cases} \\;\\Rightarrow\\; 2x = 12 \\;\\Rightarrow\\; x = 6,\\; y = 4'
          }
          caption="Elimination: add the equations so one unknown disappears."
        />
        <Prose>
          <ul>
            <li>
              <strong>Graphing:</strong> draw both lines and read off where they cross. Good for
              seeing, less good for exact answers.
            </li>
            <li>
              <strong>Substitution:</strong> solve one equation for a variable and put it into the
              other. From <Tex>{'y = 2x'}</Tex> and <Tex>{'x + y = 12'}</Tex>:{' '}
              <Tex>{'x + 2x = 12'}</Tex>, so <Tex>{'x = 4'}</Tex>, <Tex>{'y = 8'}</Tex>.
            </li>
            <li>
              <strong>Elimination:</strong> multiply equations so that adding them cancels one
              variable.
            </li>
            <li>
              Same slope, different intercept: parallel lines, <strong>no solution</strong>. Same
              slope and intercept: one line, <strong>infinitely many</strong>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="A solution must satisfy both equations">
          <p>
            <Tex>{'(7, 3)'}</Tex> satisfies <Tex>{'x + y = 10'}</Tex> but not{' '}
            <Tex>{'x - y = 2'}</Tex>. Always check your answer in <em>both</em> original equations;
            it's the quickest way to catch an arithmetic slip.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where systems are used">
        <RealWorld
          items={[
            {
              title: 'Break-even',
              body: 'Where the cost line meets the revenue line, a business stops losing money.',
            },
            {
              title: 'Mixtures',
              body: 'How much 10% and 40% solution make 3 litres of 20%? Two unknowns, two facts.',
            },
            {
              title: 'Comparing plans',
              body: 'A phone plan of £10 + 5p a minute against £20 flat: the lines cross at 200 minutes.',
            },
            {
              title: 'Engineering and graphics',
              body: 'Circuits, structures and 3-D graphics solve systems with thousands of unknowns, using the same elimination idea.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A solution of a system satisfies every equation at once.',
            'Graphically, it is where the lines cross.',
            'Parallel lines: no solution. The same line: infinitely many.',
            'Substitution and elimination give exact answers.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function LinesExplorer() {
  const [m1, setM1] = useState(1)
  const [b1, setB1] = useState(0)
  const [m2, setM2] = useState(-1)
  const [b2, setB2] = useState(4)
  const meet = lineMeet(m1, b1, m2, b2)
  const atTarget =
    meet.kind === 'one' && Math.abs(meet.x - TARGET.x) < 1e-9 && Math.abs(meet.y - TARGET.y) < 1e-9
  return (
    <LabSection id="explore" eyebrow="Explore" title="Where two lines cross">
      <Prose>
        <p>
          Set the slope and intercept of each line. The violet point is the solution of the system:
          the only point on both lines. Can you make the lines never meet, or meet everywhere?
        </p>
      </Prose>
      <PredictReveal
        question="How many solutions does the system $y = 2x + 1$, $y = 2x - 3$ have?"
        options={['None', 'Exactly one', 'Two', 'Infinitely many']}
        answer={0}
        explanation="Both lines have slope 2 but different intercepts: they're parallel and never cross, so no point is on both."
      />
      <Figure>
        <div className="mx-auto w-full max-w-xl px-3 pt-3 sm:px-4">
          <Plot
            view={VIEW}
            aspect="equal"
            ariaLabel={`Lines y = ${linearTex(m1, b1)} and y = ${linearTex(m2, b2)}: ${
              meet.kind === 'one'
                ? `they cross at (${num(meet.x)}, ${num(meet.y)})`
                : meet.kind === 'none'
                  ? 'parallel'
                  : 'the same line'
            }`}
          >
            <Point at={[TARGET.x, TARGET.y]} r={7} color="var(--ink-3)" hollow />
            <FunctionGraph
              fn={(x) => m1 * x + b1}
              color={ONE}
              width={meet.kind === 'same' ? 6 : 2.5}
            />
            <FunctionGraph fn={(x) => m2 * x + b2} color={TWO} dashed={meet.kind === 'same'} />
            {meet.kind === 'one' && (
              <>
                <Point at={[meet.x, meet.y]} r={6} color={MEET} />
                <Label
                  at={[meet.x, meet.y]}
                  anchor="bottom-left"
                  offset={[10, -10]}
                  className="text-sm font-semibold"
                >
                  ({num(meet.x)}, {num(meet.y)})
                </Label>
              </>
            )}
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="Line 1 slope"
            value={m1}
            min={-3}
            max={3}
            step={0.5}
            onChange={setM1}
            color={ONE}
          />
          <Slider
            label="Line 1 intercept"
            value={b1}
            min={-4}
            max={4}
            step={1}
            onChange={setB1}
            color={ONE}
          />
          <Slider
            label="Line 2 slope"
            value={m2}
            min={-3}
            max={3}
            step={0.5}
            onChange={setM2}
            color={TWO}
          />
          <Slider
            label="Line 2 intercept"
            value={b2}
            min={-4}
            max={4}
            step={1}
            onChange={setB2}
            color={TWO}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'line 1', value: <Tex>{`y = ${linearTex(m1, b1)}`}</Tex>, color: ONE },
              { label: 'line 2', value: <Tex>{`y = ${linearTex(m2, b2)}`}</Tex>, color: TWO },
              {
                label: 'solutions',
                value:
                  meet.kind === 'one'
                    ? `one: (${num(meet.x)}, ${num(meet.y)})`
                    : meet.kind === 'none'
                      ? 'none (parallel)'
                      : 'infinitely many (same line)',
                color: MEET,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-never-meet" when={meet.kind === 'none'}>
          Make the lines parallel. What do the two equations have in common?
        </TryThis>
        <TryThis id="t-one-line" when={meet.kind === 'same'}>
          Make the two lines the same line. How many solutions are there now?
        </TryThis>
        <TryThis id="t-hit-target" when={atTarget}>
          Make the lines cross exactly at the hollow point <Tex>{'(1, 3)'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function EliminationExplorer() {
  const [k, setK] = useState(1)
  // 2x + 3y = 12 and x + y = 5; add k times the second to the first.
  const [a, b, c] = [2 + k, 3 + k, 12 + 5 * k]
  const solved =
    a === 0 ? { name: 'y', value: c / b } : b === 0 ? { name: 'x', value: c / a } : null
  return (
    <LabSection id="elimination" eyebrow="Explore" title="Elimination: make a variable vanish">
      <Prose>
        <p>
          Multiplying an equation by a number keeps it true, and so does adding two true equations.
          Choose <Tex>{'k'}</Tex>: the second equation is multiplied by <Tex>{'k'}</Tex> and added
          to the first. Find a <Tex>{'k'}</Tex> that makes <Tex>{'x'}</Tex> or <Tex>{'y'}</Tex>{' '}
          disappear.
        </p>
      </Prose>
      <Figure>
        <div className="grid justify-center gap-1 px-3 pt-4 text-center sm:px-4">
          <Tex>{'2x + 3y = 12'}</Tex>
          <Tex>{`${paren(k)} \\times (x + y = 5) \\;\\to\\; ${standardTex(k, k, 5 * k)}`}</Tex>
          <div className="mx-auto w-48 border-t border-line" aria-hidden />
          <span className="text-lg">
            <Tex>{`\\text{sum: } ${standardTex(a, b, c)}`}</Tex>
          </span>
        </div>
        <div className="mt-3 border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Multiplier k"
            value={k}
            min={-4}
            max={4}
            step={1}
            onChange={setK}
            color={MEET}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x coefficient', value: `${a}` },
              { label: 'y coefficient', value: `${b}` },
              {
                label: 'result',
                value: solved
                  ? `${solved.name} = ${num(solved.value)}`
                  : 'both unknowns still there',
                color: MEET,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-cancel-x" when={a === 0}>
          Choose <Tex>{'k'}</Tex> so the <Tex>{'x'}</Tex>-terms cancel. What is <Tex>{'y'}</Tex>?
        </TryThis>
        <TryThis id="t-cancel-y" when={b === 0}>
          Now cancel the <Tex>{'y'}</Tex>-terms instead. Do you get a matching <Tex>{'x'}</Tex>?
          Check (3, 2) in both equations.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [m, setM] = useState(1)
  const [b, setB] = useState(0)
  const meet = lineMeet(1, 1, m, b)
  const solved = meet.kind === 'one' && Math.abs(meet.x - 2) < 1e-9 && Math.abs(meet.y - 3) < 1e-9
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-sum-diff-x"
          index={1}
          prompt="Solve $x + y = 9$ and $x - y = 3$. What is $x$?"
          answer={6}
          explanation="Add the equations: $2x = 12$, so $x = 6$ (and $y = 3$)."
        />
        <McqChallenge
          id="c-parallel-count"
          index={2}
          prompt="How many solutions does $y = 3x + 1$, $y = 3x + 5$ have?"
          options={[
            { text: 'None', correct: true },
            { text: 'One', why: 'Equal slopes mean the lines never cross unless they coincide.' },
            { text: 'Infinitely many', why: 'The intercepts differ, so they are different lines.' },
          ]}
          explanation="Same slope, different intercepts: parallel lines with no common point."
        />
        <NumericChallenge
          id="c-tickets"
          index={3}
          prompt="Adult tickets cost £5 and child tickets £3. A group buys 10 tickets for £38. How many adult tickets?"
          answer={4}
          explanation="$a + c = 10$ and $5a + 3c = 38$. Substitute $c = 10 - a$: $5a + 30 - 3a = 38$, so $a = 4$."
        />
        <McqChallenge
          id="c-check-pair"
          index={4}
          prompt="Is $(2, 1)$ a solution of $3x - y = 5$ and $x + y = 3$?"
          options={[
            { text: 'Yes, it satisfies both', correct: true },
            { text: 'Only the first', why: '$2 + 1 = 3$ works too.' },
            { text: 'Only the second', why: '$3 \\cdot 2 - 1 = 5$ works too.' },
            { text: 'Neither', why: 'Substitute: both equations hold.' },
          ]}
          explanation="$6 - 1 = 5$ ✓ and $2 + 1 = 3$ ✓."
        />
        <NumericChallenge
          id="c-substitute-y"
          index={5}
          prompt="Solve $y = 2x$ and $x + y = 12$. What is $y$?"
          answer={8}
          explanation="$x + 2x = 12$ gives $x = 4$, so $y = 2 \cdot 4 = 8$."
        />
        <InteractiveChallenge
          id="c-lines-meet"
          index={6}
          prompt="Line 1 is $y = x + 1$. Set line 2 so that the system's only solution is $(2, 3)$."
          solved={solved}
          hint="Line 2 must pass through $(2, 3)$ with a slope different from 1: $3 = 2m + b$."
          explanation="Any line through (2, 3) except line 1 works, for example $y = 3$ ($m = 0$, $b = 3$) or $y = -x + 5$."
          onReset={() => {
            setM(1)
            setB(0)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <div className="mx-auto w-full max-w-md">
              <Plot
                view={VIEW}
                aspect="equal"
                ariaLabel={`Line y = x + 1 and line y = ${linearTex(m, b)}`}
              >
                <Point at={[2, 3]} r={7} color="var(--ink-3)" hollow />
                <FunctionGraph fn={(x) => x + 1} color={ONE} />
                <FunctionGraph fn={(x) => m * x + b} color={TWO} />
                {meet.kind === 'one' && <Point at={[meet.x, meet.y]} r={6} color={MEET} />}
              </Plot>
            </div>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider
                label="Line 2 slope"
                value={m}
                min={-3}
                max={3}
                step={0.5}
                onChange={setM}
                color={TWO}
              />
              <Slider
                label="Line 2 intercept"
                value={b}
                min={-4}
                max={6}
                step={1}
                onChange={setB}
                color={TWO}
              />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
