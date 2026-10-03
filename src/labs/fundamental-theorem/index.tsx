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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  AreaUnder,
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
const AREA = 'var(--c-blue)'
const BELOW = 'var(--c-red)'
const ACC = 'var(--c-green)'
const EDGE = 'var(--c-orange)'
const TANGENT = 'var(--c-magenta)'

type AccKey = 'line' | 'down' | 'cos'

type AccFn = {
  f: (t: number) => number
  /** A(x) = ∫₀ˣ f(t) dt, in closed form. */
  A: (x: number) => number
  xMax: number
  fY: [number, number]
  aY: [number, number]
  tex: string
  aTex: string
  aria: string
}

const ACC_FNS: Record<AccKey, AccFn> = {
  line: {
    f: (t) => t,
    A: (x) => (x * x) / 2,
    xMax: 4,
    fY: [-0.6, 4.6],
    aY: [-0.8, 8.8],
    tex: 'f(t) = t',
    aTex: 'A(x) = \\tfrac12 x^2',
    aria: 't',
  },
  down: {
    f: (t) => 2 - t,
    A: (x) => 2 * x - (x * x) / 2,
    xMax: 4.5,
    fY: [-2.8, 2.6],
    aY: [-1.6, 2.8],
    tex: 'f(t) = 2 - t',
    aTex: 'A(x) = 2x - \\tfrac12 x^2',
    aria: '2 minus t',
  },
  cos: {
    f: Math.cos,
    A: Math.sin,
    xMax: 6.3,
    fY: [-1.4, 1.4],
    aY: [-1.4, 1.4],
    tex: 'f(t) = \\cos t',
    aTex: 'A(x) = \\sin x',
    aria: 'cosine of t',
  },
}

export default function FundamentalTheoremLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Slope and area undo each other">
        <Prose>
          <p>
            Calculus has two big tools. The derivative measures how fast something is changing
            (slope). The integral adds up a quantity bit by bit (area). They look like separate
            ideas, invented for separate problems.
          </p>
          <p>
            The <strong>fundamental theorem of calculus</strong> says they are opposites, like
            multiplying and dividing. Turn the tap on: the <em>rate</em> water flows in is the
            derivative of the <em>amount</em> in the tank, and the amount is the integral of the
            rate. So you can calculate an area without adding up a single rectangle: just run a
            derivative backwards.
          </p>
        </Prose>
      </LabSection>
      <AccumulationExplorer />
      <EvaluateExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The fundamental theorem">
        <Formula
          tex={'\\frac{d}{dx} \\int_a^x f(t)\\,dt = f(x)'}
          caption="Part 1: the area function grows at a rate equal to the current height of $f$."
        />
        <Prose>
          <p>
            Why? Nudge <Tex>x</Tex> forward by a sliver <Tex>h</Tex>. The area gains a thin strip
            about <Tex>f(x)</Tex> tall and <Tex>h</Tex> wide, so{' '}
            <Tex>{'A(x + h) - A(x) \\approx f(x)\\,h'}</Tex>. Divide by <Tex>h</Tex> and let it
            shrink: the slope of <Tex>A</Tex> is <Tex>f(x)</Tex>.
          </p>
        </Prose>
        <Formula
          tex={"\\int_a^b f(x)\\,dx = F(b) - F(a) \\quad \\text{where } F' = f"}
          caption="Part 2: to find an area, find any antiderivative $F$ (a function whose slope is $f$) and subtract."
        />
        <Prose>
          <p>
            We write <Tex>{'\\big[F(x)\\big]_a^b'}</Tex> for <Tex>F(b) - F(a)</Tex>. For example,{' '}
            <Tex>{'\\int_0^3 x^2\\,dx = \\big[\\tfrac13 x^3\\big]_0^3 = 9 - 0 = 9'}</Tex>: no
            rectangles needed.
          </p>
        </Prose>
        <Callout kind="misconception" title="The + C doesn't matter here">
          <p>
            Antiderivatives come in a family, <Tex>F(x) + C</Tex>, because shifting a graph up
            doesn't change its slopes. In <Tex>F(b) - F(a)</Tex> the <Tex>C</Tex> appears twice and
            cancels, so any member of the family gives the same area.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Rate in, total out">
        <RealWorld
          items={[
            {
              title: 'Water in a tank',
              body: 'Flow rate in litres per minute is the slope of the volume. Total water added from minute 2 to minute 10 is $V(10) - V(2)$.',
            },
            {
              title: 'Distance and speed',
              body: 'Distance is an antiderivative of speed, so the distance between two times is the change in position: no adding up needed.',
            },
            {
              title: 'Cumulative statistics',
              body: 'A probability density is the slope of the cumulative distribution; probabilities are differences of the cumulative function.',
            },
            {
              title: 'Business',
              body: 'Revenue is the integral of the sales rate; the sales rate is the derivative of revenue. Dashboards show both.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'The area function $A(x) = \\int_a^x f(t)\\,dt$ has slope $f(x)$: integrating then differentiating gets you back to $f$.',
            "To compute $\\int_a^b f\\,dx$, find an antiderivative $F$ (with $F' = f$) and take $F(b) - F(a)$.",
            'The constant $C$ cancels, so any antiderivative works.',
            'Derivative and integral are inverse operations: rate ↔ total.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function AccumulationExplorer() {
  const [key, setKey] = useState<AccKey>('line')
  const [x, setX] = useState(1)
  const fn = ACC_FNS[key]
  const fx = fn.f(x)
  const Ax = fn.A(x)
  const xView = { xMin: -0.4, xMax: fn.xMax + 0.4 }
  // Slope triangle: one unit across, f(x) up. Flip to the left near the right edge.
  const run = x + 1 <= fn.xMax ? 1 : -1
  const corner: [number, number] = [x + run, Ax]
  const tip: [number, number] = [x + run, Ax + run * fx]
  const pick = (k: AccKey) => {
    setKey(k)
    setX(1)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Watch the area grow">
      <Prose>
        <p>
          Drag <Tex>x</Tex> along the top axis. The shaded region is the area under <Tex>f</Tex>{' '}
          from 0 to <Tex>x</Tex>. Its size, <Tex>A(x)</Tex>, is plotted underneath and draws itself
          as you go. Watch the orange <em>leading edge</em>: its height is how fast the area is
          growing right now.
        </p>
      </Prose>
      <PredictReveal
        question="On $f(t) = 2 - t$, the height turns negative after $t = 2$. What does the area function $A(x)$ do after that?"
        options={[
          'Keeps growing, but more slowly',
          'Starts going down',
          'Stays constant',
          'Jumps to zero',
        ]}
        answer={1}
        explanation="It goes down. After $t = 2$ each new strip is below the axis, so it counts as negative area. $A(x)$ peaks exactly where $f$ crosses zero."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={pick}
            options={(Object.keys(ACC_FNS) as AccKey[]).map((k) => ({
              value: k,
              label: <Tex>{ACC_FNS[k].tex}</Tex>,
              ariaLabel: ACC_FNS[k].aria,
            }))}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)]">
          <Plot
            view={{ ...xView, yMin: fn.fY[0], yMax: fn.fY[1] }}
            height={230}
            ariaLabel={`Area under ${fn.aria} from 0 to ${num(x)}`}
          >
            <AreaUnder fn={(t) => Math.max(0, fn.f(t))} a={0} b={x} color={AREA} opacity={0.3} />
            <AreaUnder fn={(t) => Math.min(0, fn.f(t))} a={0} b={x} color={BELOW} opacity={0.3} />
            <FunctionGraph fn={fn.f} color={CURVE} />
            <Segment from={[x, 0]} to={[x, fx]} color={EDGE} width={3.5} />
            <MovablePoint
              x={x}
              y={0}
              onMove={(px) => setX(px)}
              constrain={constraints.compose(
                constraints.snapToGrid(0.05),
                constraints.within(0, fn.xMax, 0, 0),
              )}
              step={0.1}
              color={EDGE}
              label="Right end x of the area"
            />
          </Plot>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
            <span>Area so far:</span>
            <Tex>{fn.aTex}</Tex>
          </div>
          <div className="border-t border-line">
            <Plot
              view={{ ...xView, yMin: fn.aY[0], yMax: fn.aY[1] }}
              height={200}
              ariaLabel={`Area function A(${num(x)}) = ${num(Ax, 3)}, slope ${num(fx, 3)}`}
            >
              <FunctionGraph fn={fn.A} domain={[0, x]} color={ACC} width={3} />
              <InfiniteLine
                through={[x, Ax]}
                direction={[1, fx]}
                color={TANGENT}
                width={1.75}
                dashed
              />
              <Segment from={[x, Ax]} to={corner} color="var(--ink-3)" width={1.5} />
              <Segment from={corner} to={tip} color={EDGE} width={3.5} />
              <Label
                at={[corner[0], (corner[1] + tip[1]) / 2]}
                anchor={run > 0 ? 'left' : 'right'}
                offset={[run > 0 ? 6 : -6, 0]}
                color={EDGE}
                className="text-xs"
              >
                <Tex>f(x)</Tex>
              </Label>
              <Point at={[x, Ax]} r={5} color={ACC} />
            </Plot>
          </div>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x', value: formatNumber(x, 2) },
              { label: 'height f(x)', value: formatNumber(fx, 3), color: EDGE },
              { label: 'area A(x)', value: formatNumber(Ax, 3), color: ACC },
              { label: 'slope of A at x', value: formatNumber(fx, 3), color: TANGENT },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-sweep" when={x >= 3.95}>
          Sweep <Tex>x</Tex> to 4 or beyond and watch <Tex>A(x)</Tex> draw itself. Compare the
          orange edge in the top plot with the orange rise of the slope triangle.
        </TryThis>
        <TryThis id="t-peak" when={key === 'down' && Math.abs(x - 2) < 0.03}>
          On <Tex>f(t) = 2 - t</Tex>, put <Tex>x</Tex> where <Tex>A(x)</Tex> peaks. What is the
          height of <Tex>f</Tex> there?
        </TryThis>
        <TryThis id="t-falling" when={key === 'cos' && fx < -0.3}>
          On <Tex>\cos t</Tex>, go where <Tex>f</Tex> is negative. Is <Tex>A(x)</Tex> climbing or
          falling?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type EvalKey = 'square' | 'sine'

type EvalFn = {
  f: (x: number) => number
  F: (x: number) => number
  x: [number, number]
  fY: [number, number]
  FY: [number, number]
  tex: string
  FTex: string
  aria: string
}

const EVAL_FNS: Record<EvalKey, EvalFn> = {
  square: {
    f: (x) => x * x,
    F: (x) => (x * x * x) / 3,
    x: [-0.4, 3.4],
    fY: [-2.2, 11],
    FY: [-4, 16],
    tex: 'f(x) = x^2',
    FTex: 'F(x) = \\tfrac13 x^3',
    aria: 'x squared',
  },
  sine: {
    f: Math.sin,
    F: (x) => -Math.cos(x),
    x: [-0.3, 2 * Math.PI + 0.3],
    fY: [-1.3, 1.3],
    FY: [-4.4, 4.4],
    tex: 'f(x) = \\sin x',
    FTex: 'F(x) = -\\cos x',
    aria: 'sine of x',
  },
}

function EvaluateExplorer() {
  const [key, setKey] = useState<EvalKey>('square')
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const [C, setC] = useState(0)
  const fn = EVAL_FNS[key]
  const F = (x: number) => fn.F(x) + C
  const rise = F(b) - F(a)
  const pick = (k: EvalKey) => {
    setKey(k)
    setA(k === 'sine' ? 0.5 : 1)
    setB(k === 'sine' ? 1.5 : 2)
    setC(0)
  }
  const xLo = fn.x[0] + 0.3
  const xHi = fn.x[1] - 0.3
  const onAxis = constraints.compose(
    constraints.snapToGrid(key === 'sine' ? Math.PI / 12 : 0.1),
    constraints.within(xLo, xHi, 0, 0),
  )
  const step = key === 'sine' ? Math.PI / 12 : 0.1
  return (
    <LabSection id="evaluate" eyebrow="Explore" title="Area from an antiderivative">
      <Prose>
        <p>
          On the left, the area under <Tex>f</Tex> from <Tex>a</Tex> to <Tex>b</Tex>. On the right,
          an antiderivative <Tex>F</Tex>: a function whose <em>slope</em> is <Tex>f</Tex>. The
          orange bar is how much <Tex>F</Tex> climbs between <Tex>a</Tex> and <Tex>b</Tex>. Drag the
          endpoints and compare the two numbers.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={pick}
            options={(Object.keys(EVAL_FNS) as EvalKey[]).map((k) => ({
              value: k,
              label: <Tex>{EVAL_FNS[k].tex}</Tex>,
              ariaLabel: EVAL_FNS[k].aria,
            }))}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Plot
              view={{ xMin: fn.x[0], xMax: fn.x[1], yMin: fn.fY[0], yMax: fn.fY[1] }}
              height={260}
              ariaLabel={`Area under ${fn.aria} from ${num(a)} to ${num(b)}`}
            >
              <AreaUnder fn={(x) => Math.max(0, fn.f(x))} a={a} b={b} color={AREA} opacity={0.3} />
              <AreaUnder fn={(x) => Math.min(0, fn.f(x))} a={a} b={b} color={BELOW} opacity={0.3} />
              <FunctionGraph fn={fn.f} color={CURVE} />
              <MovablePoint
                x={a}
                y={0}
                onMove={(x) => setA(x)}
                constrain={onAxis}
                step={step}
                color="var(--c-violet)"
                label="Lower limit a"
              />
              <MovablePoint
                x={b}
                y={0}
                onMove={(x) => setB(x)}
                constrain={onAxis}
                step={step}
                color="var(--c-violet)"
                label="Upper limit b"
              />
              <Label at={[a, 0]} anchor="top" offset={[0, 12]} color="var(--c-violet)">
                <Tex>a</Tex>
              </Label>
              <Label at={[b, 0]} anchor="top" offset={[0, 12]} color="var(--c-violet)">
                <Tex>b</Tex>
              </Label>
            </Plot>
            <div className="border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
              <Tex>{fn.tex}</Tex>
            </div>
          </div>
          <div className="border-t border-line md:border-t-0 md:border-l">
            <Plot
              view={{ xMin: fn.x[0], xMax: fn.x[1], yMin: fn.FY[0], yMax: fn.FY[1] }}
              height={260}
              ariaLabel={`Antiderivative rises by ${num(rise, 3)} from ${num(a)} to ${num(b)}`}
            >
              <FunctionGraph fn={F} color={ACC} />
              <Segment from={[a, F(a)]} to={[b, F(a)]} color="var(--ink-3)" width={1.5} dashed />
              <Segment from={[b, F(a)]} to={[b, F(b)]} color={EDGE} width={4} />
              <Point at={[a, F(a)]} r={5} color={ACC} />
              <Point at={[b, F(b)]} r={5} color={ACC} />
            </Plot>
            <div className="border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
              <Tex>{`${fn.FTex} ${C === 0 ? '' : C > 0 ? `+ ${num(C)}` : `- ${num(-C)}`}`}</Tex>
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>C</Tex>}
            name="Shift C of the antiderivative"
            value={C}
            min={-3}
            max={3}
            step={0.5}
            onChange={setC}
            color={ACC}
          />
          <Readouts
            items={[
              {
                label: 'area',
                value: (
                  <Tex>{`\\int_{${num(a)}}^{${num(b)}} f\\,dx = ${num(fn.F(b) - fn.F(a), 3)}`}</Tex>
                ),
                color: AREA,
              },
              {
                label: 'rise of F',
                value: <Tex>{`F(b) - F(a) = ${num(rise, 3)}`}</Tex>,
                color: EDGE,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-shift" when={Math.abs(C) >= 1}>
          Slide <Tex>C</Tex> to move <Tex>F</Tex> up or down. Does the rise from <Tex>a</Tex> to{' '}
          <Tex>b</Tex> change?
        </TryThis>
        <TryThis
          id="t-nine"
          when={key === 'square' && Math.abs(a) < 1e-9 && Math.abs(b - 3) < 1e-9}
        >
          On <Tex>x^2</Tex>, set <Tex>a = 0</Tex> and <Tex>b = 3</Tex>. Check the area against{' '}
          <Tex>{'\\tfrac13 \\cdot 3^3'}</Tex>.
        </TryThis>
        <TryThis
          id="t-hump"
          when={key === 'sine' && Math.abs(a) < 1e-9 && Math.abs(b - Math.PI) < 1e-6}
        >
          On <Tex>\sin x</Tex>, measure the area of one hump, from 0 to <Tex>\pi</Tex>. It's a
          surprisingly tidy number.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const DOWN = ACC_FNS.down

function Practice() {
  const [x, setX] = useState(0.5)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-square"
          index={1}
          prompt="Use $F(x) = \tfrac13 x^3$ to find $\displaystyle\int_0^3 x^2\,dx$."
          answer={9}
          explanation="$F(3) - F(0) = \tfrac13 \cdot 27 - 0 = 9$."
        />
        <NumericChallenge
          id="c-sine"
          index={2}
          prompt="Find $\displaystyle\int_0^{\pi} \sin x\,dx$. (An antiderivative of $\sin x$ is $-\cos x$.)"
          answer={2}
          explanation="$[-\cos x]_0^{\pi} = -\cos\pi - (-\cos 0) = 1 + 1 = 2$."
        />
        <McqChallenge
          id="c-part1"
          index={3}
          prompt="$A(x) = \displaystyle\int_0^x f(t)\,dt$. What is $A'(x)$?"
          options={[
            { text: '$f(x)$', correct: true },
            {
              text: "$f'(x)$",
              why: 'Differentiating undoes the integral; it does not differentiate $f$ again.',
            },
            { text: '$f(x) - f(0)$', why: 'That would be Part 2 applied to the wrong function.' },
            {
              text: "$\\displaystyle\\int_0^x f'(t)\\,dt$",
              why: "That equals $f(x) - f(0)$, not $A'(x)$.",
            },
          ]}
          explanation="Part 1 of the theorem: the area function grows at a rate equal to the height of $f$ at its right end."
        />
        <InteractiveChallenge
          id="c-peak"
          index={4}
          prompt="For $f(t) = 2 - t$, drag $x$ to where the accumulated area $A(x)$ is as large as possible."
          solved={Math.abs(x - 2) < 0.03}
          hint="$A$ stops climbing when its slope, $f(x)$, reaches 0."
          explanation="$A'(x) = f(x) = 2 - x$ is zero at $x = 2$. Before that strips add area; after it they subtract."
          onReset={() => setX(0.5)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.4, xMax: 4.9, yMin: -2.8, yMax: 2.6 }}
              height={240}
              ariaLabel={`Area under 2 minus t from 0 to ${num(x)} is ${num(DOWN.A(x), 3)}`}
            >
              <AreaUnder
                fn={(t) => Math.max(0, DOWN.f(t))}
                a={0}
                b={x}
                color={AREA}
                opacity={0.3}
              />
              <AreaUnder
                fn={(t) => Math.min(0, DOWN.f(t))}
                a={0}
                b={x}
                color={BELOW}
                opacity={0.3}
              />
              <FunctionGraph fn={DOWN.f} color={CURVE} />
              <MovablePoint
                x={x}
                y={0}
                onMove={(px) => setX(px)}
                constrain={constraints.compose(
                  constraints.snapToGrid(0.05),
                  constraints.within(0, 4.5, 0, 0),
                )}
                color={EDGE}
                label="Right end x of the area"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              <Tex>{`A(${num(x)}) = ${num(DOWN.A(x), 3)}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-linear"
          index={5}
          prompt="Find $\displaystyle\int_1^2 2x\,dx$."
          answer={3}
          hint="Which function has slope $2x$?"
          explanation="$F(x) = x^2$, so the integral is $4 - 1 = 3$."
        />
        <McqChallenge
          id="c-chain"
          index={6}
          prompt="What is $\dfrac{d}{dx} \displaystyle\int_0^x \cos(t^2)\,dt$?"
          options={[
            { text: '$\\cos(x^2)$', correct: true },
            {
              text: '$\\sin(x^2)$',
              why: 'No antiderivative is needed: Part 1 hands back the integrand.',
            },
            {
              text: '$-2x\\sin(x^2)$',
              why: 'That is the derivative of $\\cos(x^2)$, one step too far.',
            },
            {
              text: 'It cannot be found',
              why: 'Even without a formula for the integral, Part 1 gives its derivative.',
            },
          ]}
          explanation="Part 1: differentiate an area function and you get the integrand at $x$, here $\cos(x^2)$. No formula for the area is needed."
        />
      </ChallengeSet>
    </LabSection>
  )
}
