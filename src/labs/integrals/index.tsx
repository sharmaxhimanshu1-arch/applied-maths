import { useState } from 'react'
import { riemann, type RiemannMethod } from '@/math/calculus'
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
  AreaUnder,
  FunctionGraph,
  Label,
  MovablePoint,
  Plot,
  RiemannRects,
  Segment,
  constraints,
} from '@/viz'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const ABOVE = 'var(--c-blue)'
const BELOW = 'var(--c-red)'
const EDGE = 'var(--c-violet)'

type StripKey = 'speed' | 'sine' | 'wave'

type StripFn = {
  f: (x: number) => number
  a: number
  b: number
  exact: number
  view: { xMin: number; xMax: number; yMin: number; yMax: number }
  tex: string
  aria: string
}

const STRIP_FNS: Record<StripKey, StripFn> = {
  speed: {
    f: (t) => 0.3 * t * t + 1,
    a: 0,
    b: 4,
    exact: 10.4,
    view: { xMin: -0.4, xMax: 4.4, yMin: -0.6, yMax: 6.4 },
    tex: 'v(t) = 0.3t^2 + 1',
    aria: 'speed 0.3 t squared plus 1',
  },
  sine: {
    f: Math.sin,
    a: 0,
    b: Math.PI,
    exact: 2,
    view: { xMin: -0.3, xMax: Math.PI + 0.3, yMin: -0.25, yMax: 1.35 },
    tex: 'f(x) = \\sin x',
    aria: 'sine of x',
  },
  wave: {
    f: (x) => 1 + Math.sin(2 * x),
    a: 0,
    b: 4,
    exact: 4 + (1 - Math.cos(8)) / 2,
    view: { xMin: -0.4, xMax: 4.4, yMin: -0.4, yMax: 2.4 },
    tex: 'f(x) = 1 + \\sin 2x',
    aria: '1 plus sine of 2 x',
  },
}

const METHODS: { value: RiemannMethod; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'mid', label: 'Middle' },
  { value: 'trap', label: 'Trapezoid' },
]

export default function IntegralsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Adding up infinitely many slivers">
        <Prose>
          <p>
            Drive at a steady 20 m/s for 10 seconds and you cover 200 m: speed × time, the area of a
            rectangle under a flat speed graph. But real speed changes from moment to moment. How
            far do you go then?
          </p>
          <p>
            Chop the time into thin strips. In each strip the speed barely changes, so a rectangle
            is almost right. Add the rectangles up, then make the strips thinner and thinner. The
            sum settles on one number: the <strong>integral</strong>, the exact area under the
            curve. The same trick totals up anything that builds up a little at a time.
          </p>
        </Prose>
      </LabSection>
      <StripsExplorer />
      <SignedAreaExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The definite integral">
        <Formula
          tex={'\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i)\\,\\Delta x'}
          caption="Split $[a, b]$ into $n$ strips of width $\Delta x = \frac{b - a}{n}$, add height × width, and let the strips get infinitely thin."
        />
        <Prose>
          <p>
            The notation is the recipe. The <Tex>{'\\int'}</Tex> is a stretched-out S for “sum”,{' '}
            <Tex>f(x)</Tex> is a strip's height and <Tex>dx</Tex> its infinitely thin width. Left,
            right or middle points all give the same limit for a continuous function. They only
            differ in how fast they get there.
          </p>
          <p>
            Area <em>below</em> the axis counts as negative, so the integral is a <em>net</em> or{' '}
            <em>signed</em> area. Swapping the limits flips the sign:{' '}
            <Tex>{'\\int_b^a f\\,dx = -\\int_a^b f\\,dx'}</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="Integral is not the same as “total area”">
          <p>
            <Tex>{'\\int_{-\\pi}^{\\pi} \\sin x\\,dx = 0'}</Tex>, even though plenty of area is
            shaded: the part below the axis cancels the part above. If you want the total shaded
            area, integrate <Tex>{'|f(x)|'}</Tex> instead.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where integrals add things up">
        <RealWorld
          items={[
            {
              title: 'Distance from speed',
              body: 'The area under a speed–time graph is the distance travelled. Fitness trackers and car trip computers do exactly this sum.',
            },
            {
              title: 'Energy use',
              body: 'Your electricity bill integrates power (kW) over time to get energy (kWh).',
            },
            {
              title: 'Probability',
              body: 'For a continuous random variable, the probability of landing between $a$ and $b$ is the area under its density curve.',
            },
            {
              title: 'Medicine',
              body: 'The “area under the curve” of drug concentration over time measures how much of a drug the body was exposed to.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An integral adds up height × width over infinitely many infinitely thin strips.',
            'Riemann sums approximate it; more strips (or smarter sample points) get closer.',
            'Area below the axis counts as negative: the integral is a signed, net area.',
            '$\\int_a^b f\\,dx$ of a rate gives the total change, e.g. speed → distance.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function StripsExplorer() {
  const [key, setKey] = useState<StripKey>('speed')
  const [n, setN] = useState(4)
  const [method, setMethod] = useState<RiemannMethod>('left')
  const fn = STRIP_FNS[key]
  const { sum, slices } = riemann(fn.f, fn.a, fn.b, n, method)
  const error = sum - fn.exact
  return (
    <LabSection id="explore" eyebrow="Explore" title="Slice it into strips">
      <Prose>
        <p>
          The first curve is a car's speed (in m/s) over 4 seconds, so the area underneath is the
          distance it travels. Fill the area with rectangles, choose where each rectangle takes its
          height, and add more strips to see the sum close in on the true area.
        </p>
      </Prose>
      <PredictReveal
        question="The speed keeps rising. If each rectangle takes its height from the **left** edge of its strip, will the sum be too big or too small?"
        options={['Too big', 'Too small', 'Exactly right', 'It depends on the number of strips']}
        answer={1}
        explanation="Too small. On a rising curve the left edge is the lowest point of each strip, so every rectangle sits under the curve. Using the right edge would overshoot instead."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={setKey}
            options={(Object.keys(STRIP_FNS) as StripKey[]).map((k) => ({
              value: k,
              label: <Tex>{STRIP_FNS[k].tex}</Tex>,
              ariaLabel: STRIP_FNS[k].aria,
            }))}
          />
          <Segmented
            label="Rectangle height from"
            value={method}
            onChange={setMethod}
            options={METHODS}
          />
        </div>
        <Plot
          view={fn.view}
          height={300}
          ariaLabel={`${n} ${method} strips under ${fn.aria}; sum ${formatNumber(sum, 3)}`}
        >
          <RiemannRects slices={slices} color={ABOVE} />
          <FunctionGraph fn={fn.f} color={CURVE} />
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider label="Number of strips n" value={n} min={1} max={60} step={1} onChange={setN} />
          <Readouts
            items={[
              { label: 'sum of strips', value: formatNumber(sum, 4), color: ABOVE },
              { label: 'true area', value: formatNumber(fn.exact, 4), color: CURVE },
              {
                label: 'error',
                value: `${error > 0 ? '+' : ''}${formatNumber(error, 4)}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-many" when={n >= 50}>
          Push the number of strips to 50 or more. How small does the error get?
        </TryThis>
        <TryThis id="t-over" when={key === 'speed' && method === 'right'}>
          On the speed curve, take heights from the right edge. Is the sum too big now?
        </TryThis>
        <TryThis id="t-few" when={n <= 5 && Math.abs(error) < 0.1}>
          Using at most 5 strips, get within 0.1 of the true area. Which method wins?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** f(x) = x³/4 − x, with roots at −2, 0 and 2, and its antiderivative. */
const cubic = (x: number) => (x * x * x) / 4 - x
const cubicF = (x: number) => (x * x * x * x) / 16 - (x * x) / 2
const pos = (x: number) => Math.max(0, cubic(x))
const neg = (x: number) => Math.min(0, cubic(x))

/** Unsigned area above and below the axis between lo and hi (exact, split at the roots). */
function splitArea(lo: number, hi: number) {
  const cuts = [lo, ...[-2, 0, 2].filter((r) => r > lo && r < hi), hi]
  let above = 0
  let below = 0
  for (let i = 0; i + 1 < cuts.length; i++) {
    const piece = cubicF(cuts[i + 1]) - cubicF(cuts[i])
    if (piece >= 0) above += piece
    else below -= piece
  }
  return { above, below }
}

const onAxis = constraints.compose(constraints.snapToGrid(0.1), constraints.within(-2.8, 2.8, 0, 0))

function SignedAreaExplorer() {
  const [a, setA] = useState(-1)
  const [b, setB] = useState(2.5)
  const net = cubicF(b) - cubicF(a)
  const { above, below } = splitArea(Math.min(a, b), Math.max(a, b))
  return (
    <LabSection id="signed-area" eyebrow="Explore" title="Area below the axis counts as negative">
      <Prose>
        <p>
          Drag the endpoints <Tex>a</Tex> and <Tex>b</Tex> along the axis. Blue area above the axis
          adds to the integral; red area below it subtracts. What you get is the <em>net</em> area.
        </p>
      </Prose>
      <Figure>
        <div className="border-b border-line px-3 py-2 sm:px-4">
          <Tex>{'f(x) = \\tfrac14 x^3 - x'}</Tex>
        </div>
        <Plot
          view={{ xMin: -3.2, xMax: 3.2, yMin: -2.4, yMax: 2.8 }}
          height={320}
          ariaLabel={`Integral of the cubic from ${num(a)} to ${num(b)} is ${num(net, 3)}`}
        >
          <AreaUnder fn={pos} a={a} b={b} color={ABOVE} opacity={0.3} />
          <AreaUnder fn={neg} a={a} b={b} color={BELOW} opacity={0.3} />
          <FunctionGraph fn={cubic} color="var(--ink-2)" width={2.25} />
          <Segment from={[a, 0]} to={[a, cubic(a)]} color={EDGE} width={2} dashed />
          <Segment from={[b, 0]} to={[b, cubic(b)]} color={EDGE} width={2} dashed />
          <Label at={[a, 0]} anchor="top" offset={[0, 12]} color={EDGE}>
            <Tex>a</Tex>
          </Label>
          <Label at={[b, 0]} anchor="top" offset={[0, 12]} color={EDGE}>
            <Tex>b</Tex>
          </Label>
          <MovablePoint
            x={a}
            y={0}
            onMove={(x) => setA(x)}
            constrain={onAxis}
            color={EDGE}
            label="Lower limit a"
          />
          <MovablePoint
            x={b}
            y={0}
            onMove={(x) => setB(x)}
            constrain={onAxis}
            color={EDGE}
            label="Upper limit b"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'area above', value: formatNumber(above, 3), color: ABOVE },
              { label: 'area below', value: formatNumber(below, 3), color: BELOW },
              {
                label: 'integral',
                value: <Tex>{`\\int_{${num(a)}}^{${num(b)}} f\\,dx = ${num(net, 3)}`}</Tex>,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-zero" when={Math.abs(net) < 0.02 && above > 0.1}>
          Make the integral 0 while plenty of area is still shaded. Where did the area go?
        </TryThis>
        <TryThis id="t-below" when={above < 1e-9 && below > 0.2}>
          Pick an interval where the curve is entirely below the axis. What sign does the integral
          have?
        </TryThis>
        <TryThis id="t-swap" when={a > b && Math.abs(net) > 0.05}>
          Drag <Tex>a</Tex> to the right of <Tex>b</Tex>. What happens to the sign?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [b, setB] = useState(2)
  const area = (b * b) / 2
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-rect"
          index={1}
          prompt="Find $\displaystyle\int_0^3 2\,dx$."
          answer={6}
          explanation="The graph is a flat line at height 2, so the area is a rectangle: $2 \times 3 = 6$."
        />
        <NumericChallenge
          id="c-triangle"
          index={2}
          prompt="Find $\displaystyle\int_0^4 x\,dx$."
          answer={8}
          hint="The region under $y = x$ from 0 to 4 is a triangle."
          explanation="A triangle with base 4 and height 4: $\tfrac12 \cdot 4 \cdot 4 = 8$."
        />
        <McqChallenge
          id="c-left"
          index={3}
          prompt="$f$ is decreasing on $[a, b]$. A left Riemann sum will be…"
          options={[
            { text: 'Too big', correct: true },
            { text: 'Too small', why: 'That is for an increasing function.' },
            { text: 'Exact', why: 'Only a flat (constant) function makes it exact.' },
            { text: 'Negative', why: 'The sign depends on whether $f$ is above the axis.' },
          ]}
          explanation="On a falling curve the left edge is the highest point of each strip, so each rectangle pokes above the curve."
        />
        <InteractiveChallenge
          id="c-sweep"
          index={4}
          prompt="Drag $b$ so that $\displaystyle\int_0^b x\,dx = 8$."
          solved={Math.abs(b - 4) < 0.05}
          hint="The shaded triangle has area $\tfrac12 b^2$."
          explanation="$\tfrac12 b^2 = 8$ gives $b^2 = 16$, so $b = 4$."
          onReset={() => setB(2)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.5, xMax: 6.5, yMin: -0.8, yMax: 6.5 }}
              height={260}
              ariaLabel={`Area under y = x from 0 to ${num(b)} is ${num(area)}`}
            >
              <AreaUnder fn={(x) => x} a={0} b={b} color={ABOVE} opacity={0.3} />
              <FunctionGraph fn={(x) => x} color={CURVE} />
              <MovablePoint
                x={b}
                y={0}
                onMove={(x) => setB(x)}
                constrain={constraints.compose(
                  constraints.snapToGrid(0.1),
                  constraints.within(0.1, 6, 0, 0),
                )}
                color={EDGE}
                label="Upper limit b"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              <Tex>{`\\int_0^{${num(b)}} x\\,dx = ${num(area)}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-odd"
          index={5}
          prompt="Find $\displaystyle\int_{-1}^{1} x^3\,dx$."
          answer={0}
          hint="Sketch $y = x^3$. How does the left half compare with the right half?"
          explanation="The area from $-1$ to 0 is below the axis and exactly mirrors the area from 0 to 1 above it, so they cancel."
        />
        <McqChallenge
          id="c-negative"
          index={6}
          prompt="$\displaystyle\int_a^b f(x)\,dx < 0$ (with $a < b$). What must be true?"
          options={[
            { text: 'More area lies below the axis than above it', correct: true },
            {
              text: '$f(x) < 0$ everywhere on $[a, b]$',
              why: 'Some of it can be above, as long as more is below.',
            },
            { text: '$f$ is decreasing', why: 'A decreasing function can stay positive.' },
            {
              text: 'Nothing: integrals are never negative',
              why: 'Area below the axis counts as negative.',
            },
          ]}
          explanation="The integral is (area above) − (area below). It is negative exactly when the area below wins."
        />
      </ChallengeSet>
    </LabSection>
  )
}
