import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import { useState } from 'react'
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
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  FunctionGraph,
  InfiniteLine,
  Label,
  MovablePoint,
  Plot,
  Point,
  Segment,
  constraints,
} from '@/viz'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const SECANT = 'var(--c-orange)'
const TANGENT = 'var(--c-magenta)'
const SLOPE = 'var(--c-green)'

const sq = (x: number) => x * x

export default function DerivativesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Steepness at a single point">
        <Prose>
          <p>
            A straight line has one slope everywhere. A curve doesn't: it's steep in some places and
            flat in others. So what does “the slope at this point” even mean, when slope needs two
            points?
          </p>
          <p>
            Zoom in far enough on any smooth curve and it looks straight. The slope of that
            nearly-straight piece is the <strong>derivative</strong>: how fast the output is
            changing, right now, per unit of input. It's your speedometer reading, the rate a
            population grows, the cost of one more unit.
          </p>
        </Prose>
      </LabSection>
      <SecantExplorer />
      <SlopeMeterExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The derivative as a limit">
        <Formula
          tex={"f'(a) = \\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}"}
          caption="The slope of the secant over a gap $h$, as the gap shrinks to nothing."
        />
        <Prose>
          <p>
            The fraction is rise over run between <Tex>a</Tex> and <Tex>a + h</Tex>. At{' '}
            <Tex>h = 0</Tex> it is <Tex>{'\\tfrac00'}</Tex>, which is why we need a limit. For{' '}
            <Tex>f(x) = x^2</Tex> the algebra is short:
          </p>
        </Prose>
        <Formula
          tex={
            '\\frac{(a + h)^2 - a^2}{h} = \\frac{2ah + h^2}{h} = 2a + h \\;\\longrightarrow\\; 2a'
          }
          caption="So the slope of $x^2$ at any point $a$ is $2a$: the green line you traced."
        />
        <Prose>
          <p>
            Collect the slope at every point and you get a new function, <Tex>{"f'(x)"}</Tex>, also
            written <Tex>{'\\dfrac{dy}{dx}'}</Tex> (“a tiny change in <Tex>y</Tex> per tiny change
            in <Tex>x</Tex>”). Where <Tex>{"f'"}</Tex> is positive, <Tex>f</Tex> climbs; where it is
            negative, <Tex>f</Tex> falls; where it is 0, the tangent is flat: a peak, a valley, or a
            pause.
          </p>
        </Prose>
        <Callout kind="misconception" title="Slope, not height">
          <p>
            The derivative is how <em>steep</em> the graph is, not how <em>high</em> it is. At the
            top of a hill the height is at its largest but the slope is 0. And a corner, like the
            tip of <Tex>|x|</Tex>, has no single slope, so there's no derivative there.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Rates of change everywhere">
        <RealWorld
          items={[
            {
              title: 'Speed and acceleration',
              body: 'Speed is the derivative of position; acceleration is the derivative of speed. Your car shows the first one live.',
            },
            {
              title: 'Marginal cost',
              body: 'Economists call the derivative of total cost the marginal cost: what the next unit costs to make.',
            },
            {
              title: 'Machine learning',
              body: 'Training a model means following derivatives downhill: each weight moves against the slope of the loss.',
            },
            {
              title: 'Medicine',
              body: 'How fast a drug’s concentration in the blood is falling (a derivative) sets when the next dose is due.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            "The derivative $f'(a)$ is the slope of the curve at the single point $a$: the slope of its tangent line.",
            'It is the limit of secant slopes $\\dfrac{f(a + h) - f(a)}{h}$ as $h \\to 0$.',
            "Slopes at every point form a new function, $f'(x)$: positive where $f$ climbs, negative where it falls, 0 where it is flat.",
            'Corners (like $|x|$ at 0) and jumps have no derivative.',
          ]}
        />
      </LabSection>
    </div>
  )
}

/** Slider value h, never exactly 0 (a secant needs two different points). */
const nonZero = (h: number) => (h === 0 ? 0.01 : h)

function SecantExplorer() {
  const [a, setA] = useState(1)
  const [h, setH] = useState(1.5)
  const b = a + h
  const secant = (sq(b) - sq(a)) / h
  const tangent = 2 * a
  return (
    <LabSection id="explore" eyebrow="Explore" title="From secant to tangent">
      <Prose>
        <p>
          Here is <Tex>f(x) = x^2</Tex>. The orange <strong>secant</strong> line runs through two
          points on the curve, a gap <Tex>h</Tex> apart. Its slope is an ordinary rise over run. Now
          shrink the gap and watch the secant swing towards the pink <strong>tangent</strong>, the
          line that just grazes the curve.
        </p>
      </Prose>
      <PredictReveal
        question="The point sits at $x = 1$. As $h$ shrinks to 0, what number will the secant slope settle on?"
        options={['1', '2', '0', 'It never settles']}
        answer={1}
        explanation="It settles on 2. The secant slope is exactly $2 + h$ here (you'll see why in Formalize), so as $h \to 0$ it heads to 2."
      />
      <Figure>
        <Plot
          view={{ xMin: -3.5, xMax: 3.5, yMin: -1.5, yMax: 9 }}
          narrowView={{ xMin: -2.5, xMax: 3.5, yMin: -1, yMax: 9 }}
          height={340}
          ariaLabel={`Parabola with a secant of slope ${num(secant)} and tangent of slope ${num(tangent)}`}
        >
          <FunctionGraph fn={sq} color={CURVE} />
          <InfiniteLine
            through={[a, sq(a)]}
            direction={[1, tangent]}
            color={TANGENT}
            width={1.75}
            dashed
          />
          <InfiniteLine through={[a, sq(a)]} direction={[1, secant]} color={SECANT} width={2.5} />
          <Segment from={[a, sq(a)]} to={[b, sq(a)]} color="var(--ink-3)" width={1.5} dashed />
          <Segment from={[b, sq(a)]} to={[b, sq(b)]} color="var(--ink-3)" width={1.5} dashed />
          <Label
            at={[(a + b) / 2, sq(a)]}
            anchor={h > 0 ? 'top' : 'bottom'}
            offset={[0, h > 0 ? 6 : -6]}
            className="text-xs"
          >
            <Tex>h</Tex>
          </Label>
          <Point at={[b, sq(b)]} r={5} color={SECANT} />
          <MovablePoint
            x={a}
            y={sq(a)}
            onMove={(x) => setA(x)}
            constrain={constraints.compose(
              constraints.snapToGrid(0.1),
              constraints.onGraph(sq, -2.5, 2.5),
            )}
            color={CURVE}
            label="Point on the parabola"
          />
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>h</Tex>}
            name="Gap h"
            value={h}
            min={-2}
            max={2}
            step={0.01}
            onChange={(v) => setH(nonZero(v))}
            color={SECANT}
          />
          <Readouts
            items={[
              {
                label: 'secant slope',
                value: (
                  <Tex>{`\\frac{f(${num(b)}) - f(${num(a)})}{${num(h)}} = ${num(secant, 3)}`}</Tex>
                ),
                color: SECANT,
              },
              { label: 'tangent slope', value: num(tangent, 3), color: TANGENT },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-shrink-lab" when={Math.abs(h) <= 0.05}>
          Shrink <Tex>h</Tex> below 0.05. How far apart are the two slopes now?
        </TryThis>
        <TryThis id="t-left" when={h < 0 && h > -0.1}>
          Make <Tex>h</Tex> small and <em>negative</em>, so the second point is on the left. Same
          limit?
        </TryThis>
        <TryThis id="t-two" when={Math.abs(a - 2) < 0.05 && Math.abs(h) <= 0.1}>
          Move the point to <Tex>x = 2</Tex> and shrink <Tex>h</Tex>. Which number do the secant
          slopes close in on?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type MeterKey = 'square' | 'cubic' | 'sine' | 'abs'

type MeterFn = {
  f: (x: number) => number
  /** The exact derivative (undefined at corners). */
  d: (x: number) => number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  dMin: number
  dMax: number
  tex: string
  dTex: string
  label: FnLabel
}

type FnLabel = { text: string; aria: string }

const METER_FNS: Record<MeterKey, MeterFn> = {
  square: {
    f: sq,
    d: (x) => 2 * x,
    xMin: -3,
    xMax: 3,
    yMin: -1,
    yMax: 9,
    dMin: -6.5,
    dMax: 6.5,
    tex: 'f(x) = x^2',
    dTex: "f'(x) = 2x",
    label: { text: 'x^2', aria: 'x squared' },
  },
  cubic: {
    f: (x) => x ** 3 - 3 * x,
    d: (x) => 3 * x * x - 3,
    xMin: -2.4,
    xMax: 2.4,
    yMin: -4.5,
    yMax: 4.5,
    dMin: -4,
    dMax: 14,
    tex: 'f(x) = x^3 - 3x',
    dTex: "f'(x) = 3x^2 - 3",
    label: { text: 'x^3 - 3x', aria: 'x cubed minus 3 x' },
  },
  sine: {
    f: Math.sin,
    d: Math.cos,
    xMin: -6.5,
    xMax: 6.5,
    yMin: -1.6,
    yMax: 1.6,
    dMin: -1.6,
    dMax: 1.6,
    tex: 'f(x) = \\sin x',
    dTex: "f'(x) = \\cos x",
    label: { text: '\\sin x', aria: 'sine of x' },
  },
  abs: {
    f: Math.abs,
    d: (x) => (x === 0 ? NaN : Math.sign(x)),
    xMin: -3,
    xMax: 3,
    yMin: -0.8,
    yMax: 3.2,
    dMin: -2,
    dMax: 2,
    tex: 'f(x) = |x|',
    dTex: "f'(x) = \\begin{cases} -1 & x < 0 \\\\ 1 & x > 0 \\end{cases}",
    label: { text: '|x|', aria: 'absolute value of x' },
  },
}

const TRACE_STEP = 0.05
const traceKey = (x: number) => Math.round(x / TRACE_STEP)

/** Add every grid key between two meter positions, so fast drags leave no gaps. */
function addSweep(keys: readonly number[], from: number, to: number) {
  const seen = new Set(keys)
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  for (let k = lo; k <= hi; k++) seen.add(k)
  return seen.size === keys.length ? (keys as number[]) : [...seen]
}

/** Share of the x-range the learner has swept the meter across. */
function coverage(fn: MeterFn, keys: readonly number[]) {
  const total = Math.round((fn.xMax - fn.xMin) / TRACE_STEP) + 1
  return keys.length / total
}

function SlopeMeterExplorer() {
  const [key, setKey] = useState<MeterKey>('square')
  const [x, setX] = useState(1.5)
  const [trace, setTrace] = useState<number[]>([])
  const [reveal, setReveal] = useState(false)
  const fn = METER_FNS[key]
  const y = fn.f(x)
  const slope = fn.d(x)
  const corner = !Number.isFinite(slope)
  const covered = coverage(fn, trace)
  const flat = !corner && Math.abs(slope) < 0.05
  const sides =
    key === 'abs' &&
    trace.some((k) => k * TRACE_STEP < -0.2) &&
    trace.some((k) => k * TRACE_STEP > 0.2)
  const move = (px: number) => {
    setTrace((old) => addSweep(old, traceKey(x), traceKey(px)))
    setX(px)
  }
  const pick = (k: MeterKey) => {
    setKey(k)
    setX(k === 'sine' ? 1 : 1.5)
    setTrace([])
    setReveal(false)
  }
  const xView = { xMin: fn.xMin - 0.3, xMax: fn.xMax + 0.3 }
  return (
    <LabSection id="slope-meter" eyebrow="Explore" title="The slope meter draws f′">
      <Prose>
        <p>
          Drag the point along the top curve (or focus it and use the arrow keys). The pink tangent
          shows the slope there, and every slope you measure is plotted underneath as a green dot at
          the same <Tex>x</Tex>. Sweep across the whole curve and the dots draw a brand-new graph:
          the <strong>derivative</strong> <Tex>{"f'"}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={pick}
            options={(Object.keys(METER_FNS) as MeterKey[]).map((k) => ({
              value: k,
              label: <Tex>{METER_FNS[k].label.text}</Tex>,
              ariaLabel: METER_FNS[k].label.aria,
            }))}
          />
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              onClick={() => setReveal((r) => !r)}
            >
              {reveal ? 'Hide f′' : 'Reveal f′'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              disabled={!trace.length}
              onClick={() => setTrace([])}
            >
              Clear trace
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)]">
          <Plot
            view={{ ...xView, yMin: fn.yMin, yMax: fn.yMax }}
            height={260}
            ariaLabel={`Graph of ${fn.label.aria} with a tangent line at x = ${num(x)}`}
          >
            <FunctionGraph fn={fn.f} color={CURVE} />
            {!corner && (
              <InfiniteLine through={[x, y]} direction={[1, slope]} color={TANGENT} width={2} />
            )}
            <MovablePoint
              x={x}
              y={y}
              onMove={move}
              constrain={constraints.compose(
                constraints.snapToGrid(TRACE_STEP),
                constraints.onGraph(fn.f, fn.xMin, fn.xMax),
              )}
              step={0.1}
              color={CURVE}
              label="Slope meter on the curve"
            />
          </Plot>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
            <span>Slopes of</span>
            <Tex>{fn.tex}</Tex>
            <span aria-hidden>→</span>
            {reveal ? <Tex>{fn.dTex}</Tex> : <Tex>{"f'(x) = \\;?"}</Tex>}
          </div>
          <div className="border-t border-line">
            <Plot
              view={{ ...xView, yMin: fn.dMin, yMax: fn.dMax }}
              height={200}
              ariaLabel={`Traced slopes: ${trace.length} points measured${reveal ? '; derivative graph shown' : ''}`}
            >
              {reveal &&
                (key === 'abs' ? (
                  <>
                    <FunctionGraph
                      fn={fn.d}
                      domain={[-Infinity, 0]}
                      color={SLOPE}
                      dashed
                      width={2}
                    />
                    <FunctionGraph
                      fn={fn.d}
                      domain={[0, Infinity]}
                      color={SLOPE}
                      dashed
                      width={2}
                    />
                  </>
                ) : (
                  <FunctionGraph fn={fn.d} color={SLOPE} dashed width={2} />
                ))}
              {trace.map((k) => (
                <Point key={k} at={[k * TRACE_STEP, fn.d(k * TRACE_STEP)]} r={2.5} color={SLOPE} />
              ))}
              <Segment from={[x, 0]} to={[x, corner ? 0 : slope]} color={SLOPE} width={3} />
              {!corner && <Point at={[x, slope]} r={5.5} color={SLOPE} />}
            </Plot>
          </div>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x', value: formatNumber(x, 2) },
              { label: 'height f(x)', value: formatNumber(y, 3), color: CURVE },
              {
                label: 'slope f′(x)',
                value: corner ? 'none (a corner)' : formatNumber(slope, 3),
                color: SLOPE,
              },
              { label: 'traced', value: `${Math.round(Math.min(1, covered) * 100)}%` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-flat-lab" when={flat}>
          Find a spot where the tangent is flat. Where is the green dot when it is?
        </TryThis>
        <TryThis id="t-trace" when={covered >= 0.5}>
          Sweep across at least half of the curve, then reveal <Tex>{"f'"}</Tex>. Did your dots land
          on it?
        </TryThis>
        <TryThis id="t-sine" when={key === 'sine' && covered >= 0.4}>
          Trace the sine wave. The slope curve you draw is a famous function. Which one?
        </TryThis>
        <TryThis id="t-corner" when={sides}>
          Trace <Tex>|x|</Tex> on both sides of 0. What happens to the slope at the corner?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const CUBIC = METER_FNS.cubic

function Practice() {
  const [x, setX] = useState(-2)
  const slope = CUBIC.d(x)
  const solved = x > 0 && Math.abs(slope) < 0.05
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-secant-lab"
          index={1}
          prompt="What is the slope of the secant of $f(x) = x^2$ from $x = 1$ to $x = 3$?"
          answer={4}
          explanation="Rise over run: $\dfrac{9 - 1}{3 - 1} = \dfrac{8}{2} = 4$."
        />
        <NumericChallenge
          id="c-slope-lab"
          index={2}
          prompt="What is the slope of $f(x) = x^2$ at $x = 3$?"
          answer={6}
          hint="You found that the slope of $x^2$ at $a$ is $2a$."
          explanation="$f'(x) = 2x$, so $f'(3) = 6$. The tangent at $(3, 9)$ climbs 6 for every 1 across."
        />
        <McqChallenge
          id="c-meaning-lab"
          index={3}
          prompt="On some interval, $f'(x) < 0$. What does the graph of $f$ do there?"
          options={[
            { text: 'It falls from left to right', correct: true },
            {
              text: 'It is below the $x$-axis',
              why: 'That is about the height of $f$, not its slope.',
            },
            { text: 'It is flat', why: "Flat means $f'(x) = 0$." },
            { text: 'It climbs from left to right', why: 'Climbing means a positive slope.' },
          ]}
          explanation="A negative derivative means a negative slope: the output goes down as the input goes up."
        />
        <InteractiveChallenge
          id="c-flat"
          index={4}
          prompt="On $f(x) = x^3 - 3x$, drag the point to the valley on the right, where the tangent is flat."
          solved={solved}
          hint="Look for where the pink tangent is horizontal and $x > 0$."
          explanation="The valley is at $x = 1$: there $f'(1) = 3 \cdot 1^2 - 3 = 0$."
          onReset={() => setX(-2)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -2.7, xMax: 2.7, yMin: -4.5, yMax: 4.5 }}
              height={280}
              ariaLabel={`Graph of x cubed minus 3 x with tangent slope ${num(slope)} at x = ${num(x)}`}
            >
              <FunctionGraph fn={CUBIC.f} color={CURVE} />
              <InfiniteLine
                through={[x, CUBIC.f(x)]}
                direction={[1, slope]}
                color={TANGENT}
                width={2}
              />
              <MovablePoint
                x={x}
                y={CUBIC.f(x)}
                onMove={(px) => setX(px)}
                constrain={constraints.compose(
                  constraints.snapToGrid(0.05),
                  constraints.onGraph(CUBIC.f, -2.2, 2.2),
                )}
                color={CURVE}
                label="Point on the curve"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              Tangent slope: <span className="font-mono">{formatNumber(slope, 2)}</span>
            </p>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-corner"
          index={5}
          prompt="Where does $f(x) = |x|$ have no derivative?"
          options={[
            { text: 'At $x = 0$ only', correct: true },
            { text: 'Nowhere', why: 'At the corner the slope jumps from −1 to 1.' },
            { text: 'For all $x < 0$', why: 'There the slope is −1, a perfectly good number.' },
            { text: 'Everywhere', why: 'Away from 0, $|x|$ is a straight line with slope ±1.' },
          ]}
          explanation="The slope is −1 on the left and 1 on the right. At the corner the secants from the two sides disagree, so the limit (and the derivative) doesn't exist."
        />
        <NumericChallenge
          id="c-speed"
          index={6}
          prompt="A ball rolls $s(t) = 5t^2$ metres in $t$ seconds. How fast is it going at $t = 2$, in m/s?"
          answer={20}
          unit="m/s"
          hint="The slope of $t^2$ is $2t$, so the slope of $5t^2$ is 5 times that."
          explanation="$s'(t) = 10t$, so $s'(2) = 20$ m/s."
        />
      </ChallengeSet>
    </LabSection>
  )
}
