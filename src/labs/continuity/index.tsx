import { useState, type ReactNode } from 'react'
import { findRoots } from '@/math/calculus'
import { formatNumber } from '@/math/core'
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
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const PEN = 'var(--c-orange)'
const LEVEL = 'var(--c-magenta)'
const BAND = 'var(--c-green)'

type PenKey = 'smooth' | 'hole' | 'jump' | 'blowup'

type PenFn = {
  /** The function away from the break (and at it, where defined). */
  f: (x: number) => number
  /** Formula just left of the break, when the two sides differ. */
  left?: (x: number) => number
  /** Where the break is, if there is one. */
  breakAt: number | null
  /** f(a), or null if undefined there. */
  valueAt: number | null
  /** lim f(x) as x → a, or null if it doesn't exist. */
  limit: number | null
  tex: string
  label: string
  kind: string
}

const A = 1

const PEN_FNS: Record<PenKey, PenFn> = {
  smooth: {
    f: (x) => 0.3 * x * x - 1,
    breakAt: null,
    valueAt: 0.3 * A * A - 1,
    limit: 0.3 * A * A - 1,
    tex: 'f(x) = 0.3x^2 - 1',
    label: 'Smooth',
    kind: 'no break',
  },
  hole: {
    f: (x) => (x * x - 1) / (x - 1),
    breakAt: A,
    valueAt: null,
    limit: 2,
    tex: 'f(x) = \\dfrac{x^2 - 1}{x - 1}',
    label: 'Hole',
    kind: 'a hole',
  },
  jump: {
    f: (x) => (x < A ? x : x - 2),
    left: (x) => x,
    breakAt: A,
    valueAt: A - 2,
    limit: null,
    tex: 'f(x) = \\begin{cases} x & x < 1 \\\\ x - 2 & x \\ge 1 \\end{cases}',
    label: 'Jump',
    kind: 'a jump',
  },
  blowup: {
    f: (x) => 1 / (x - A),
    breakAt: A,
    valueAt: null,
    limit: null,
    tex: 'f(x) = \\dfrac{1}{x - 1}',
    label: 'Blow-up',
    kind: 'an infinite break',
  },
}

const X_MIN = -3
const X_MAX = 4

/** The pen-traced part of the curve, split at the break so no false vertical line appears. */
function Traced({ fn, upTo }: { fn: PenFn; upTo: number }) {
  if (upTo <= X_MIN) return null
  if (fn.breakAt === null || upTo <= fn.breakAt)
    return <FunctionGraph fn={fn.left ?? fn.f} domain={[X_MIN, upTo]} color={CURVE} width={3} />
  return (
    <>
      <FunctionGraph fn={fn.left ?? fn.f} domain={[X_MIN, fn.breakAt]} color={CURVE} width={3} />
      <FunctionGraph fn={fn.f} domain={[fn.breakAt, upTo]} color={CURVE} width={3} />
    </>
  )
}

function Check({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-1.5 inline-block size-2.5 shrink-0 rounded-full"
        style={{ background: ok ? 'var(--good)' : 'var(--bad)' }}
      />
      <span>
        <span className="sr-only">{ok ? 'Holds: ' : 'Fails: '}</span>
        {children}
      </span>
    </li>
  )
}

export default function ContinuityLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="No lifting the pen">
        <Prose>
          <p>
            Some graphs you can draw in one stroke. Others force you to lift the pen: there's a
            hole, a sudden jump, or the curve shoots off to infinity. A function you can draw
            without lifting the pen is <strong>continuous</strong>.
          </p>
          <p>
            That sounds like a doodling rule, but it carries a real promise. A continuous quantity
            can't skip values: to get from 30 to 60 km/h, a car passes through every speed in
            between. That one fact lets computers solve equations they can't solve with algebra.
          </p>
        </Prose>
      </LabSection>
      <PenExplorer />
      <IvtExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Continuity in three conditions">
        <Formula
          tex={'\\lim_{x \\to a} f(x) = f(a)'}
          caption="$f$ is continuous at $a$ when the value exists, the limit exists, and the two agree."
        />
        <Prose>
          <p>
            Each kind of break fails a different condition. A <strong>hole</strong> has a limit but
            no value (or the wrong value). A <strong>jump</strong> has a value but no limit, because
            the two sides disagree. An <strong>infinite break</strong> has neither. Polynomials,{' '}
            <Tex>{'\\sin'}</Tex>, <Tex>{'\\cos'}</Tex> and <Tex>{'e^x'}</Tex> are continuous
            everywhere; a fraction is continuous wherever its bottom isn't 0.
          </p>
        </Prose>
        <Formula
          tex={
            'f \\text{ continuous on } [a, b],\\; f(a) < c < f(b) \\implies f(x) = c \\text{ for some } x \\in (a, b)'
          }
          caption="The intermediate value theorem: a continuous function can't skip a height on its way between two values."
        />
        <Callout kind="misconception" title="Continuous doesn't mean smooth">
          <p>
            <Tex>|x|</Tex> has a sharp corner at 0, yet you can draw it without lifting the pen, so
            it is continuous there. It just has no derivative at the corner. Smooth is a stronger
            condition than continuous.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Why continuity matters">
        <RealWorld
          items={[
            {
              title: 'Solving equations by halving',
              body: 'Bisection traps a root between a negative and a positive value, then halves the interval again and again. It only works because continuous functions can’t skip zero.',
            },
            {
              title: 'Somewhere on the equator…',
              body: 'At any moment there are two opposite points on the equator with exactly the same temperature: the intermediate value theorem applied to the temperature difference.',
            },
            {
              title: 'Fair tax systems',
              body: 'Good tax rules keep take-home pay continuous, so earning one more euro never costs you hundreds.',
            },
            {
              title: 'Digital signals',
              body: 'A sound wave is continuous; a computer samples it at moments. Understanding the gaps between samples is the whole field of signal processing.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Continuous at $a$: $f(a)$ exists, $\\lim_{x \\to a} f(x)$ exists, and they are equal.',
            'Breaks come as holes, jumps and infinite blow-ups; each fails a different condition.',
            'Continuous functions can’t skip values (the intermediate value theorem).',
            'Continuous isn’t the same as smooth: corners are allowed.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PenExplorer() {
  const [key, setKey] = useState<PenKey>('smooth')
  const [pen, setPen] = useState(X_MIN)
  const fn = PEN_FNS[key]
  const passed = fn.breakAt !== null && pen > fn.breakAt
  const lifts = passed ? 1 : 0
  const defined = fn.valueAt !== null
  const hasLimit = fn.limit !== null
  const agree = defined && hasLimit && Math.abs(fn.valueAt! - fn.limit!) < 1e-9
  const tip = pen > X_MIN ? fn.f(pen) : NaN
  return (
    <LabSection id="explore" eyebrow="Explore" title="Trace it with a pen">
      <Prose>
        <p>
          Pick a function and slide the pen from left to right. It draws the curve as it goes. Watch
          what happens at <Tex>x = 1</Tex>, and check the three conditions for continuity
          underneath.
        </p>
      </Prose>
      <PredictReveal
        question="$\dfrac{x^2 - 1}{x - 1}$ simplifies to $x + 1$. Is it continuous at $x = 1$?"
        options={['Yes, it is just a line', 'No: there is a hole at $x = 1$']}
        answer={1}
        explanation="No. At $x = 1$ the formula is $\tfrac00$, so the function has no value there: the line has a single missing point. The limit is 2, but the value is missing."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={(k) => {
              setKey(k)
              setPen(X_MIN)
            }}
            options={(Object.keys(PEN_FNS) as PenKey[]).map((k) => ({
              value: k,
              label: PEN_FNS[k].label,
            }))}
          />
          <Tex>{fn.tex}</Tex>
        </div>
        <Plot
          view={{ xMin: X_MIN, xMax: X_MAX, yMin: -4, yMax: 4 }}
          height={300}
          ariaLabel={`${fn.label} function traced up to x = ${num(pen)}`}
        >
          {fn.breakAt !== null && fn.left ? (
            <>
              <FunctionGraph
                fn={fn.left}
                domain={[X_MIN, fn.breakAt]}
                color="var(--ink-3)"
                width={1.5}
                dashed
              />
              <FunctionGraph
                fn={fn.f}
                domain={[fn.breakAt, X_MAX]}
                color="var(--ink-3)"
                width={1.5}
                dashed
              />
            </>
          ) : (
            <FunctionGraph fn={fn.f} color="var(--ink-3)" width={1.5} dashed />
          )}
          <Traced fn={fn} upTo={pen} />
          {passed && fn.limit !== null && <Point at={[A, fn.limit]} r={5} color={CURVE} hollow />}
          {passed && key === 'jump' && <Point at={[A, 1]} r={5} color={CURVE} hollow />}
          {passed && fn.valueAt !== null && <Point at={[A, fn.valueAt]} r={5} color={CURVE} />}
          {Number.isFinite(tip) && Math.abs(tip) < 4 && <Point at={[pen, tip]} r={6} color={PEN} />}
          {passed && (
            <Label at={[A, 3.6]} anchor="top" color={PEN} className="text-xs">
              pen lifted
            </Label>
          )}
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Pen position x"
            value={pen}
            min={X_MIN}
            max={X_MAX}
            step={0.05}
            onChange={setPen}
            color={PEN}
          />
          <Readouts
            items={[
              { label: 'pen lifts', value: String(lifts), color: PEN },
              { label: 'break at x = 1', value: fn.kind },
            ]}
          />
        </div>
        <div className="border-t border-line p-3 text-sm sm:px-4">
          <div className="font-medium">
            At <Tex>x = 1</Tex>:
          </div>
          <ul className="mt-2 grid gap-1.5">
            <Check ok={defined}>
              <Tex>f(1)</Tex> exists
              {defined ? (
                <>
                  : <Tex>{`f(1) = ${num(fn.valueAt!)}`}</Tex>
                </>
              ) : (
                ' (no value there)'
              )}
            </Check>
            <Check ok={hasLimit}>
              the limit exists
              {hasLimit ? (
                <>
                  : <Tex>{`\\lim_{x \\to 1} f(x) = ${num(fn.limit!)}`}</Tex>
                </>
              ) : (
                ' (the two sides don’t settle on one height)'
              )}
            </Check>
            <Check ok={agree}>they are equal, so the function is continuous at 1</Check>
          </ul>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-one-stroke" when={key === 'smooth' && pen >= X_MAX - 0.05}>
          Trace the smooth curve all the way across. How many times did you lift the pen?
        </TryThis>
        <TryThis id="t-jump" when={key === 'jump' && passed}>
          Trace the jump past <Tex>x = 1</Tex>. Which condition fails?
        </TryThis>
        <TryThis id="t-hole" when={key === 'hole' && passed}>
          Trace the hole. The limit exists, so what goes wrong?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type IvtKey = 'cubic' | 'jump'

const IVT_FNS: Record<IvtKey, { f: (x: number) => number; left?: (x: number) => number }> = {
  cubic: { f: (x) => 0.5 * x ** 3 - 1.5 * x + 0.5 },
  jump: { f: (x) => (x < 0 ? 0.5 * x - 1 : 0.5 * x + 1), left: (x) => 0.5 * x - 1 },
}

const IA = -2
const IB = 2

function IvtExplorer() {
  const [key, setKey] = useState<IvtKey>('cubic')
  const [c, setC] = useState(-1.2)
  const fn = IVT_FNS[key]
  const fa = fn.f(IA)
  const fb = fn.f(IB)
  const lo = Math.min(fa, fb)
  const hi = Math.max(fa, fb)
  const guaranteed = c > lo && c < hi
  const crossings = findRoots((x) => fn.f(x) - c, IA, IB).filter(
    (x) =>
      // A jump can look like a sign change; keep only real crossings.
      Math.abs(fn.f(x) - c) < 1e-6,
  )
  const band: [number, number][] = [
    [IA - 0.6, lo],
    [IA - 0.3, lo],
    [IA - 0.3, hi],
    [IA - 0.6, hi],
  ]
  return (
    <LabSection id="ivt" eyebrow="Explore" title="No skipping heights">
      <Prose>
        <p>
          The curve runs from <Tex>x = -2</Tex> to <Tex>x = 2</Tex>. Drag the pink level line up and
          down. Every height in the green band, between the values at the two ends, is guaranteed to
          be hit at least once, as long as the function is continuous.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={setKey}
            options={[
              { value: 'cubic', label: 'Continuous' },
              { value: 'jump', label: 'With a jump' },
            ]}
          />
        </div>
        <Plot
          view={{ xMin: -2.8, xMax: 2.6, yMin: -2.6, yMax: 2.6 }}
          height={300}
          ariaLabel={`Level ${num(c)} meets the curve ${crossings.length} times`}
        >
          <Polygon points={band} fill={BAND} fillOpacity={0.35} stroke={BAND} strokeWidth={1} />
          <Segment from={[-2.8, c]} to={[2.6, c]} color={LEVEL} width={2} dashed />
          {fn.left ? (
            <>
              <FunctionGraph fn={fn.left} domain={[IA, 0]} color={CURVE} />
              <FunctionGraph fn={fn.f} domain={[0, IB]} color={CURVE} />
            </>
          ) : (
            <FunctionGraph fn={fn.f} domain={[IA, IB]} color={CURVE} />
          )}
          <Point at={[IA, fa]} r={5} color={BAND} />
          <Point at={[IB, fb]} r={5} color={BAND} />
          {crossings.map((x) => (
            <g key={x}>
              <Segment from={[x, 0]} to={[x, c]} color={LEVEL} width={1.25} dashed />
              <Point at={[x, c]} r={5} color={LEVEL} />
            </g>
          ))}
          <MovablePoint
            x={2.35}
            y={c}
            onMove={(_x, y) => setC(y)}
            constrain={constraints.compose(
              constraints.vertical(2.35),
              constraints.snapToGrid(0.05),
              constraints.within(2.35, 2.35, -2.4, 2.4),
            )}
            step={0.05}
            color={LEVEL}
            label="Level c"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'level c', value: formatNumber(c, 2), color: LEVEL },
              { label: 'crossings', value: String(crossings.length) },
              {
                label: 'guaranteed?',
                value: guaranteed ? 'yes, c is in the band' : 'no, outside the band',
                color: BAND,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-three" when={key === 'cubic' && crossings.length === 3}>
          Find a level the continuous curve meets three times.
        </TryThis>
        <TryThis id="t-missed" when={key === 'jump' && guaranteed && crossings.length === 0}>
          Switch to the jump and find a level inside the band that is never hit. Why is that
          possible here?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [k, setK] = useState(1)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-which"
          index={1}
          prompt="Which function is continuous at $x = 0$?"
          options={[
            { text: '$|x|$', correct: true },
            { text: '$\\dfrac{1}{x}$', why: 'It is not defined at 0, and blows up there.' },
            { text: '$\\dfrac{x}{|x|}$', why: 'It jumps from $-1$ to 1 at 0.' },
            { text: '$\\dfrac{x^2}{x}$', why: 'It equals $x$ elsewhere, but has a hole at 0.' },
          ]}
          explanation="$|x|$ has a corner at 0 but no break: its value and its limit there are both 0."
        />
        <NumericChallenge
          id="c-fill"
          index={2}
          prompt="What value of $f(3)$ makes $f(x) = \dfrac{x^2 - 9}{x - 3}$ continuous at 3?"
          answer={6}
          hint="Find the limit first: factor the top."
          explanation="For $x \ne 3$ it is $x + 3$, which heads to 6. Filling the hole with $f(3) = 6$ makes it continuous."
        />
        <McqChallenge
          id="c-ivt"
          index={3}
          prompt="A continuous $f$ has $f(0) = 4$ and $f(5) = -1$. What must be true?"
          options={[
            { text: '$f(x) = 0$ for some $x$ between 0 and 5', correct: true },
            { text: '$f(2.5) = 1.5$', why: 'The curve can take any path between the ends.' },
            { text: '$f$ is decreasing', why: 'It may wiggle up and down on the way.' },
            {
              text: '$f$ is never above 4',
              why: 'It could rise above 4 before coming down.',
            },
          ]}
          explanation="0 lies between 4 and $-1$, so by the intermediate value theorem $f$ hits 0 somewhere in between."
        />
        <InteractiveChallenge
          id="c-join"
          index={4}
          prompt="$f(x) = x^2$ for $x < 2$ and $f(x) = kx$ for $x \ge 2$. Choose $k$ so the two pieces join up."
          solved={Math.abs(k - 2) < 1e-9}
          hint="Both pieces must have the same height at $x = 2$."
          explanation="On the left the height heads to $2^2 = 4$; on the right it is $2k$. Continuity needs $2k = 4$, so $k = 2$."
          onReset={() => setK(1)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.5, xMax: 4, yMin: -0.5, yMax: 9 }}
              height={240}
              ariaLabel={`Left piece x squared and right piece ${num(k)} x`}
            >
              <FunctionGraph fn={(x) => x * x} domain={[-0.5, 2]} color={CURVE} />
              <FunctionGraph fn={(x) => k * x} domain={[2, 4]} color={PEN} />
              <Point at={[2, 4]} r={5} color={CURVE} hollow />
              <Point at={[2, 2 * k]} r={5} color={PEN} />
            </Plot>
            <div className="border-t border-line p-3">
              <Slider
                label={<Tex>k</Tex>}
                name="k"
                value={k}
                min={0}
                max={4}
                step={0.25}
                onChange={setK}
                color={PEN}
              />
            </div>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-bisect"
          index={5}
          prompt="Bisection on $f(x) = x^2 - 2$: the root is in $[1, 2]$. $f(1.5) = 0.25 > 0$, so the root is in $[1, 1.5]$. Where does the next step evaluate $f$?"
          answer={1.25}
          tolerance={0.001}
          explanation="Bisection always tests the midpoint of the current interval: $\tfrac{1 + 1.5}{2} = 1.25$."
        />
      </ChallengeSet>
    </LabSection>
  )
}
