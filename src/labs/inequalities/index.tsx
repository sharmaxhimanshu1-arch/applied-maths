import { useState, type ReactNode } from 'react'
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
import {
  FunctionGraph,
  Label,
  MovablePoint,
  Plot,
  Point,
  Polygon,
  Segment,
  constraints,
} from '@/viz'
import { COMPARISON_TEX, compare, halfPlane, linearTex, type Comparison } from '../_shared/algebra'
import { num } from '../_shared/tex'

const SET = 'var(--c-blue)'
const TEST = 'var(--c-orange)'
const BEFORE = 'var(--ink-3)'
const AFTER = 'var(--c-violet)'
const OPS: Comparison[] = ['<', '<=', '>', '>=']
const LO = -6
const HI = 6
const PLANE = { xMin: -6, xMax: 6, yMin: -5, yMax: 5 }

const onLine = (lo: number, hi: number) =>
  constraints.compose(
    constraints.horizontal(0),
    constraints.snapToGrid(1),
    constraints.within(lo, hi, 0, 0),
  )
const snapHalf = constraints.compose(
  constraints.snapToGrid(0.5),
  constraints.within(-5.5, 5.5, -4.5, 4.5),
)

const opOptions = OPS.map((op) => ({
  value: op,
  label: <Tex>{COMPARISON_TEX[op]}</Tex>,
  ariaLabel: { '<': 'less than', '<=': 'at most', '>': 'greater than', '>=': 'at least' }[op],
}))

const strict = (op: Comparison) => op === '<' || op === '>'
const relation = (p: number, q: number) => (p < q ? '<' : p > q ? '>' : '=')

/** A number line showing the solution set of x (op) a, as a ray from a. */
function SolutionLine({
  op,
  a,
  children,
  ariaLabel,
}: {
  op: Comparison
  a: number
  children?: ReactNode
  ariaLabel: string
}) {
  const right = op === '>' || op === '>='
  return (
    <Plot
      view={{ xMin: LO - 0.6, xMax: HI + 0.6, yMin: -1.2, yMax: 1.6 }}
      height={140}
      grid={false}
      axes="x"
      xIntegers
      ariaLabel={ariaLabel}
    >
      <Segment from={[a, 0.35]} to={[right ? HI + 0.6 : LO - 0.6, 0.35]} color={SET} width={5} />
      <Point at={[a, 0.35]} r={7} color={SET} hollow={strict(op)} />
      {children}
    </Plot>
  )
}

export default function InequalitiesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Not one answer, a whole region">
        <Prose>
          <p>
            An equation like <Tex>{'x + 3 = 7'}</Tex> has one answer. An <strong>inequality</strong>{' '}
            like <Tex>{'x + 3 < 7'}</Tex> has a whole stretch of them: every number less than 4.
            “You must be at least 120 cm tall”, “spend no more than £20”, “the speed limit is 30”:
            each is an inequality.
          </p>
          <p>
            You solve them almost like equations, with one twist: multiplying or dividing by a
            negative number flips the sign.
          </p>
        </Prose>
      </LabSection>
      <NumberLineExplorer />
      <FlipExplorer />
      <PlaneExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Rules for solving">
        <Formula
          tex={
            'a < b \\;\\Rightarrow\\; a + c < b + c \\qquad a < b,\\; c > 0 \\;\\Rightarrow\\; ac < bc \\qquad a < b,\\; c < 0 \\;\\Rightarrow\\; ac > bc'
          }
          caption="Adding anything, or multiplying by a positive, keeps the direction. Multiplying by a negative reverses it."
        />
        <Prose>
          <ul>
            <li>
              <strong>Example:</strong> <Tex>{'-2x + 1 > 7'}</Tex>. Subtract 1:{' '}
              <Tex>{'-2x > 6'}</Tex>. Divide by −2 and flip: <Tex>{'x < -3'}</Tex>.
            </li>
            <li>
              On a number line an <strong>open dot</strong> means the endpoint is left out ({' '}
              <Tex>{'<, >'}</Tex>); a <strong>closed dot</strong> means it is included (
              <Tex>{'\\le, \\ge'}</Tex>).
            </li>
            <li>
              <strong>Interval notation:</strong> <Tex>{'-2 \\le x < 3'}</Tex> is{' '}
              <Tex>{'[-2, 3)'}</Tex>; square brackets include, round ones exclude.
            </li>
            <li>
              In two variables, <Tex>{'y < mx + b'}</Tex> is the half of the plane below the line{' '}
              <Tex>{'y = mx + b'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Forgetting the flip">
          <p>
            From <Tex>{'-x < 5'}</Tex> it's tempting to write <Tex>{'x < -5'}</Tex>. Test it:{' '}
            <Tex>{'x = 0'}</Tex> satisfies <Tex>{'-x < 5'}</Tex> but not <Tex>{'x < -5'}</Tex>.
            Dividing by −1 flips the sign: <Tex>{'x > -5'}</Tex>. Checking one number is a quick way
            to catch the slip.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where inequalities are used">
        <RealWorld
          items={[
            {
              title: 'Budgets',
              body: 'With £20 and items at £3 each, $3n \\le 20$ says you can buy up to 6.',
            },
            {
              title: 'Rules and limits',
              body: 'Speed limits, age limits, safe dosages and weight limits are all inequalities.',
            },
            {
              title: 'Planning',
              body: 'Businesses find the best plan inside a region cut out by many inequalities (linear programming).',
            },
            {
              title: 'Tolerances',
              body: 'A bolt that must measure 10 mm ± 0.1 mm satisfies $9.9 \\le d \\le 10.1$.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An inequality has a set of solutions, drawn as a ray or region.',
            'Open dot: endpoint excluded ($<$, $>$). Closed dot: included ($\\le$, $\\ge$).',
            'Multiplying or dividing by a negative flips the inequality sign.',
            'Check your answer by testing one number.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function NumberLineExplorer() {
  const [op, setOp] = useState<Comparison>('<')
  const [a, setA] = useState(2)
  const [t, setT] = useState(0)
  const holds = compare(t, op, a)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Drawing a solution set">
      <Prose>
        <p>
          Build an inequality <Tex>{'x \\;?\\; a'}</Tex>. The blue ray shows every solution. Drag
          the orange test point to check numbers, especially the endpoint itself.
        </p>
      </Prose>
      <PredictReveal
        question="Is $x = 3$ a solution of $x < 3$?"
        options={['Yes', 'No']}
        answer={1}
        explanation="$3 < 3$ is false: 3 is not less than itself. That's why $x < 3$ gets an open dot at 3, while $x \le 3$ gets a closed one."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Tex>{'x'}</Tex>
          <Segmented label="Comparison" value={op} onChange={setOp} options={opOptions} />
          <Tex>{`${a}`}</Tex>
        </div>
        <div className="px-3 pt-2 sm:px-4">
          <SolutionLine
            op={op}
            a={a}
            ariaLabel={`Solutions of x ${op} ${a}, with a test point at ${t}`}
          >
            <MovablePoint
              x={t}
              y={0}
              onMove={(nx) => setT(nx)}
              constrain={onLine(LO, HI)}
              step={1}
              color={TEST}
              label="Test point"
            />
          </SolutionLine>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Endpoint a"
            value={a}
            min={-5}
            max={5}
            step={1}
            onChange={setA}
            color={SET}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'inequality',
                value: <Tex>{`x ${COMPARISON_TEX[op]} ${a}`}</Tex>,
                color: SET,
              },
              {
                label: 'endpoint',
                value: strict(op) ? 'open dot (left out)' : 'closed dot (included)',
              },
              {
                label: 'test',
                value: (
                  <Tex>{`${t} ${COMPARISON_TEX[op]} ${a} \\text{ is ${holds ? 'true' : 'false'}}`}</Tex>
                ),
                color: TEST,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-boundary-counts" when={!strict(op) && t === a}>
          Pick <Tex>{'\\le'}</Tex> or <Tex>{'\\ge'}</Tex> and test the endpoint itself. Is it a
          solution?
        </TryThis>
        <TryThis id="t-boundary-excluded" when={strict(op) && t === a}>
          Now test the endpoint with <Tex>{'<'}</Tex> or <Tex>{'>'}</Tex>. What changes?
        </TryThis>
        <TryThis id="t-false-test" when={!holds}>
          Move the test point to a number that is not a solution.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function FlipExplorer() {
  const [k, setK] = useState(2)
  const [p, q] = [2 * k, 5 * k]
  return (
    <LabSection id="flip" eyebrow="Explore" title="Why negatives flip the sign">
      <Prose>
        <p>
          Start from a true statement, <Tex>{'2 < 5'}</Tex>, and multiply both sides by{' '}
          <Tex>{'k'}</Tex>. Grey dots are 2 and 5; violet dots are <Tex>{'2k'}</Tex> and{' '}
          <Tex>{'5k'}</Tex>. A negative <Tex>{'k'}</Tex> reflects both across 0, which swaps their
          order.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Plot
            view={{ xMin: -16, xMax: 16, yMin: -1.4, yMax: 1.8 }}
            height={150}
            grid={false}
            axes="x"
            ariaLabel={`2 times ${k} is ${p} and 5 times ${k} is ${q}`}
          >
            <Point at={[2, 0.45]} r={5} color={BEFORE} />
            <Point at={[5, 0.45]} r={5} color={BEFORE} />
            <Label at={[2, 0.45]} anchor="bottom" offset={[0, -8]} className="text-xs">
              2
            </Label>
            <Label at={[5, 0.45]} anchor="bottom" offset={[0, -8]} className="text-xs">
              5
            </Label>
            <Point at={[p, -0.55]} r={6} color={AFTER} />
            <Point at={[q, -0.55]} r={6} color={AFTER} />
            <Label at={[p, -0.55]} anchor="top" offset={[0, 8]} className="text-xs">
              2k
            </Label>
            {q !== p && (
              <Label at={[q, -0.55]} anchor="top" offset={[0, 8]} className="text-xs">
                5k
              </Label>
            )}
          </Plot>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Multiply by k"
            value={k}
            min={-3}
            max={3}
            step={1}
            onChange={setK}
            color={AFTER}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'before', value: <Tex>{'2 < 5'}</Tex> },
              {
                label: 'after',
                value: <Tex>{`${p} ${relation(p, q)} ${q}`}</Tex>,
                color: AFTER,
              },
              { label: 'sign', value: k > 0 ? 'kept' : k < 0 ? 'flipped' : 'both sides become 0' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-negative-flip" when={k < 0}>
          Multiply by a negative number. Which way does the sign point now?
        </TryThis>
        <TryThis id="t-times-zero" when={k === 0}>
          Multiply by 0. Why can't you multiply an inequality by 0 and keep any information?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function PlaneExplorer() {
  const [op, setOp] = useState<Comparison>('<')
  const [m, setM] = useState(1)
  const [b, setB] = useState(1)
  const [pt, setPt] = useState<Vec2>([2, 3.5])
  const holds = compare(pt[1], op, m * pt[0] + b)
  const above = op === '>' || op === '>='
  const lineTex = linearTex(m, b)
  return (
    <LabSection id="plane" eyebrow="Explore" title="Inequalities in two variables">
      <Prose>
        <p>
          <Tex>{'y < mx + b'}</Tex> holds for every point below the line <Tex>{'y = mx + b'}</Tex>.
          The line is dashed when it isn't included. Drag the test point; testing one point (often
          the origin) tells you which side to shade.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Tex>{'y'}</Tex>
          <Segmented label="Comparison" value={op} onChange={setOp} options={opOptions} />
          <Tex>{lineTex}</Tex>
        </div>
        <div className="mx-auto w-full max-w-xl px-3 pt-3 sm:px-4">
          <Plot
            view={PLANE}
            aspect="equal"
            ariaLabel={`The region y ${op} ${lineTex}, with a test point at (${num(pt[0])}, ${num(pt[1])})`}
          >
            <Polygon points={halfPlane(m, b, above, PLANE)} fill={SET} fillOpacity={0.14} />
            <FunctionGraph fn={(x) => m * x + b} color={SET} dashed={strict(op)} />
            <MovablePoint
              x={pt[0]}
              y={pt[1]}
              onMove={(x, y) => setPt([x, y])}
              constrain={snapHalf}
              step={0.5}
              color={TEST}
              label="Test point"
              showCoords
            />
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="Slope m"
            value={m}
            min={-3}
            max={3}
            step={0.5}
            onChange={setM}
            color={SET}
          />
          <Slider
            label="Intercept b"
            value={b}
            min={-4}
            max={4}
            step={1}
            onChange={setB}
            color={SET}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'region', value: above ? 'above the line' : 'below the line', color: SET },
              { label: 'boundary', value: strict(op) ? 'dashed (left out)' : 'solid (included)' },
              {
                label: `test (${num(pt[0])}, ${num(pt[1])})`,
                value: holds ? 'in the region' : 'not in the region',
                color: TEST,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-origin-test" when={pt[0] === 0 && pt[1] === 0}>
          Move the test point to the origin. Is <Tex>{'(0, 0)'}</Tex> in the region? That's the
          quickest check.
        </TryThis>
        <TryThis id="t-shade-above" when={above && holds}>
          Switch to <Tex>{'>'}</Tex> or <Tex>{'\\ge'}</Tex> and put the test point in the shaded
          region.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [op, setOp] = useState<Comparison>('<')
  const [a, setA] = useState(2)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-largest-whole"
          index={1}
          prompt="Solve $3x + 2 < 14$. What is the largest whole number that works?"
          answer={3}
          explanation="$3x < 12$, so $x < 4$. The largest whole number below 4 is 3."
        />
        <McqChallenge
          id="c-divide-negative"
          index={2}
          prompt="Solve $-2x > 8$."
          options={[
            { text: '$x < -4$', correct: true },
            { text: '$x > -4$', why: 'Dividing by −2 flips the sign.' },
            { text: '$x > 4$', why: 'Check $x = 5$: $-10 > 8$ is false.' },
            { text: '$x < 4$', why: 'Check $x = 0$: $0 > 8$ is false.' },
          ]}
          explanation="Divide by −2 and flip: $x < -4$. Check: $x = -5$ gives $10 > 8$. ✓"
        />
        <NumericChallenge
          id="c-count-integers"
          index={3}
          prompt="How many integers satisfy $-2 \le x < 3$?"
          answer={5}
          explanation="−2, −1, 0, 1, 2: the closed end −2 counts, the open end 3 doesn't."
        />
        <McqChallenge
          id="c-closed-dot"
          index={4}
          prompt="Which inequality is drawn with a closed (filled) dot?"
          options={[
            { text: '$x \\ge 1$', correct: true },
            { text: '$x > 1$', why: 'Strict: 1 is left out, so the dot is open.' },
            { text: '$x < 1$', why: 'Strict: 1 is left out.' },
          ]}
          explanation="$\ge$ includes the endpoint, so its dot is filled."
        />
        <NumericChallenge
          id="c-between"
          index={5}
          prompt="How many whole numbers satisfy $1 < x \le 4$?"
          answer={3}
          explanation="2, 3 and 4. The 1 is excluded and the 4 is included."
        />
        <InteractiveChallenge
          id="c-build-inequality"
          index={6}
          prompt="Make the number line show $x \ge -1$."
          solved={op === '>=' && a === -1}
          hint="You need a closed dot at −1 and a ray to the right."
          explanation="$\ge$ gives a closed dot, and the ray points to larger numbers."
          onReset={() => {
            setOp('<')
            setA(2)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <div className="flex flex-wrap items-center gap-3">
              <Tex>{'x'}</Tex>
              <Segmented label="Comparison" value={op} onChange={setOp} options={opOptions} />
              <Tex>{`${a}`}</Tex>
            </div>
            <SolutionLine op={op} a={a} ariaLabel={`Solutions of x ${op} ${a}`} />
            <Slider
              label="Endpoint a"
              value={a}
              min={-5}
              max={5}
              step={1}
              onChange={setA}
              color={SET}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
