import { Pause, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { prefersReducedMotion } from '@/app/theme'
import { clamp, formatNumber, snap } from '@/math/core'
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
  ExpressionChallenge,
  InteractiveChallenge,
  McqChallenge,
  NumericChallenge,
} from '@/learn/challenges'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon, Segment, constraints, useAnimationFrame } from '@/viz'

const X_COL = 'var(--c-blue)'
const U_COL = 'var(--c-orange)'
const Y_COL = 'var(--c-green)'
const GEAR_COLORS = [X_COL, U_COL, Y_COL]

/** Outline of a gear with its pitch circle of radius r, centred on the origin. */
function gearPath(r: number) {
  const teeth = Math.max(6, Math.round((2 * Math.PI * r) / 11))
  const outer = r + 3.5
  const inner = r - 3.5
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * 2 * Math.PI
    const w = (2 * Math.PI) / teeth
    const corners: [number, number][] = [
      [inner, a],
      [outer, a + w * 0.15],
      [outer, a + w * 0.45],
      [inner, a + w * 0.6],
    ]
    for (const [rad, ang] of corners)
      pts.push(`${(rad * Math.cos(ang)).toFixed(1)},${(rad * Math.sin(ang)).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

/** Centres of gears placed in a row so neighbouring pitch circles touch. */
function gearLayout(radii: readonly number[], pad: number) {
  const centres: number[] = []
  let x = pad
  for (const r of radii) {
    centres.push(x + r)
    x += 2 * r
  }
  return { centres, width: x + pad }
}

/** Three meshing gears: x drives u, u drives y. Radii follow the speed ratios. */
function GearTrain({ k1, k2, turns }: { k1: number; k2: number; turns: number }) {
  const R = 40
  const radii = [R, R / k1, R / (k1 * k2)]
  const pad = 10
  const top = Math.max(...radii) + pad
  const { centres, width } = gearLayout(radii, pad)
  // Each gear turns opposite to its neighbour; speeds are 1, k1 and k1·k2.
  const angles = [turns * 360, -turns * 360 * k1, turns * 360 * k1 * k2]
  const names = ['x', 'u', 'y']
  return (
    <svg
      viewBox={`0 0 ${width.toFixed(1)} ${(2 * top).toFixed(1)}`}
      className="mx-auto block h-auto max-h-72 w-full"
      role="img"
      aria-label={`Gear x has turned ${formatNumber(turns, 2)} times, gear u ${formatNumber(turns * k1, 2)} times, gear y ${formatNumber(turns * k1 * k2, 2)} times`}
    >
      {radii.map((r, i) => (
        <g key={i} transform={`translate(${centres[i].toFixed(1)} ${top.toFixed(1)})`}>
          <g transform={`rotate(${angles[i].toFixed(2)})`}>
            <path
              d={gearPath(r)}
              fill={`color-mix(in oklab, ${GEAR_COLORS[i]} 22%, var(--surface))`}
              stroke={GEAR_COLORS[i]}
              strokeWidth={1.5}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-(r - 6)}
              stroke={GEAR_COLORS[i]}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle r={Math.min(5, r / 3)} fill={GEAR_COLORS[i]} />
          </g>
          <text
            y={Math.min(r * 0.55, 22)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(16, Math.max(9, r / 2.5))}
            fontWeight={700}
            fill="var(--ink)"
            paintOrder="stroke"
            stroke="var(--surface)"
            strokeWidth={3}
          >
            {names[i]}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function ChainRuleLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Rates multiply along a chain">
        <Prose>
          <p>
            Many quantities depend on something that depends on something else. The temperature
            outside depends on your altitude, and your altitude depends on time as you drive up a
            mountain. How fast is the temperature changing per minute?
          </p>
          <p>
            Think of gears. If gear <Tex>u</Tex> spins 2 times for each turn of gear <Tex>x</Tex>,
            and gear <Tex>y</Tex> spins 3 times for each turn of <Tex>u</Tex>, then <Tex>y</Tex>{' '}
            spins <Tex>2 \times 3 = 6</Tex> times for each turn of <Tex>x</Tex>. The{' '}
            <strong>chain rule</strong> says derivatives work exactly the same way: rates along a
            chain multiply.
          </p>
        </Prose>
      </LabSection>
      <GearsExplorer />
      <StretchExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The chain rule">
        <Formula
          tex={'\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}'}
          caption="If $y$ depends on $u$ and $u$ depends on $x$, multiply the two rates."
        />
        <Formula
          tex={"\\big(f(g(x))\\big)' = f'\\big(g(x)\\big) \\cdot g'(x)"}
          caption="The same thing in function notation: the outer derivative, evaluated at the inside, times the inner derivative."
        />
        <Prose>
          <p>
            Example: <Tex>{'y = \\sin(x^2)'}</Tex>. The outer function is <Tex>{'\\sin u'}</Tex>{' '}
            with derivative <Tex>{'\\cos u'}</Tex>; the inner function is <Tex>{'u = x^2'}</Tex>{' '}
            with derivative <Tex>2x</Tex>. So <Tex>{'\\dfrac{dy}{dx} = \\cos(x^2) \\cdot 2x'}</Tex>.
            That's exactly the product of the two stretch factors you measured.
          </p>
        </Prose>
        <Callout kind="misconception" title="Don't forget the inside">
          <p>
            <Tex>{'\\tfrac{d}{dx}\\sin(x^2)'}</Tex> is <em>not</em> <Tex>{'\\cos(x^2)'}</Tex>.
            That's only the outer rate. Leave out the inner factor <Tex>2x</Tex> and you've ignored
            the middle gear.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Chains of rates">
        <RealWorld
          items={[
            {
              title: 'Bike gears',
              body: 'Pedal turns → chainring → rear sprocket → wheel. The wheel speed is the product of every ratio along the chain.',
            },
            {
              title: 'Unit conversions',
              body: 'km/h × (1000 m per km) × (1 h per 3600 s) is a chain rule: the rates multiply.',
            },
            {
              title: 'Backpropagation',
              body: 'Neural networks learn by applying the chain rule backwards through every layer: each layer multiplies in its own local derivative.',
            },
            {
              title: 'Climbing a mountain',
              body: '°C per metre of altitude × metres climbed per minute = °C per minute you feel.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'For a chain $x \\to u \\to y$, rates multiply: $\\dfrac{dy}{dx} = \\dfrac{dy}{du} \\cdot \\dfrac{du}{dx}$.',
            "For a composition: $(f(g(x)))' = f'(g(x)) \\cdot g'(x)$: outer derivative at the inside, times the inner derivative.",
            'Each derivative is a local stretch factor; stretches stack by multiplying.',
            'A zero anywhere in the chain freezes the output; a negative factor flips direction.',
          ]}
        />
      </LabSection>
    </div>
  )
}

const MAX_TURNS = 3

function GearsExplorer() {
  const [k1, setK1] = useState(1.5)
  const [k2, setK2] = useState(1.5)
  const [turns, setTurns] = useState(0)
  const [playing, setPlaying] = useState(false)
  useAnimationFrame((dt) => {
    const next = turns + dt * 0.3
    if (next >= MAX_TURNS) setPlaying(false)
    setTurns(Math.min(MAX_TURNS, next))
  }, playing)
  const play = () => {
    if (prefersReducedMotion()) {
      setTurns((t) => Math.min(MAX_TURNS, Math.floor(t + 1)))
      return
    }
    if (turns >= MAX_TURNS) setTurns(0)
    setPlaying(true)
  }
  const rate = k1 * k2
  return (
    <LabSection id="explore" eyebrow="Explore" title="Linked gears">
      <Prose>
        <p>
          Gear <Tex>x</Tex> drives gear <Tex>u</Tex>, which drives gear <Tex>y</Tex>. Set how fast
          each gear spins relative to the one before it, then turn <Tex>x</Tex>. A smaller gear has
          to spin faster to keep up.
        </p>
      </Prose>
      <PredictReveal
        question="$u$ turns 2 times per turn of $x$. $y$ turns 0.5 times per turn of $u$. How many times does $y$ turn per turn of $x$?"
        options={['2.5', '1', '4', '0.25']}
        answer={1}
        explanation="$2 \times 0.5 = 1$. The rates multiply, they don't add, so $y$ ends up turning at the same speed as $x$."
      />
      <Figure>
        <div className="p-3 sm:p-4">
          <GearTrain k1={k1} k2={k2} turns={turns} />
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>{'\\dfrac{du}{dx}'}</Tex>}
            name="Turns of u per turn of x"
            value={k1}
            min={0.5}
            max={2}
            step={0.25}
            onChange={setK1}
            color={U_COL}
          />
          <Slider
            label={<Tex>{'\\dfrac{dy}{du}'}</Tex>}
            name="Turns of y per turn of u"
            value={k2}
            min={0.5}
            max={2}
            step={0.25}
            onChange={setK2}
            color={Y_COL}
          />
          <Slider
            label="Turns of x"
            value={turns}
            min={0}
            max={MAX_TURNS}
            step={0.05}
            onChange={(v) => {
              setPlaying(false)
              setTurns(v)
            }}
            color={X_COL}
          />
          <div className="flex flex-wrap items-end gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              onClick={playing ? () => setPlaying(false) : play}
            >
              {playing ? 'Pause' : 'Turn x'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              disabled={turns === 0}
              onClick={() => {
                setPlaying(false)
                setTurns(0)
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x turns', value: formatNumber(turns, 2), color: X_COL },
              { label: 'u turns', value: formatNumber(turns * k1, 2), color: U_COL },
              { label: 'y turns', value: formatNumber(turns * rate, 2), color: Y_COL },
              {
                label: 'dy/dx',
                value: (
                  <Tex>{`${formatNumber(k1, 2)} \\times ${formatNumber(k2, 2)} = ${formatNumber(rate, 4)}`}</Tex>
                ),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-four" when={k1 === 2 && k2 === 2 && turns >= 0.99}>
          Set both ratios to 2 and turn <Tex>x</Tex> once. How many times does <Tex>y</Tex> turn?
        </TryThis>
        <TryThis id="t-slow" when={rate < 1}>
          Make <Tex>y</Tex> turn more slowly than <Tex>x</Tex>.
        </TryThis>
        <TryThis id="t-match" when={Math.abs(rate - 1) < 1e-9 && k1 !== 1}>
          Make <Tex>y</Tex> keep pace with <Tex>x</Tex> exactly, without setting either ratio to 1.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type PairKey = 'sinSq' | 'sq3' | 'sinCube'

type Pair = {
  g: (x: number) => number
  gp: (x: number) => number
  f: (u: number) => number
  fp: (u: number) => number
  x: [number, number]
  u: [number, number]
  y: [number, number]
  tex: string
  inner: string
  outer: string
  aria: string
}

const PAIRS: Record<PairKey, Pair> = {
  sinSq: {
    g: (x) => x * x,
    gp: (x) => 2 * x,
    f: Math.sin,
    fp: Math.cos,
    x: [0, 2.5],
    u: [0, 6.25],
    y: [-1, 1],
    tex: 'y = \\sin(x^2)',
    inner: 'u = x^2',
    outer: 'y = \\sin u',
    aria: 'sine of x squared',
  },
  sq3: {
    g: (x) => 3 * x,
    gp: () => 3,
    f: (u) => u * u,
    fp: (u) => 2 * u,
    x: [-1, 1.2],
    u: [-3, 3.6],
    y: [0, 13],
    tex: 'y = (3x)^2',
    inner: 'u = 3x',
    outer: 'y = u^2',
    aria: '3 x, squared',
  },
  sinCube: {
    g: Math.sin,
    gp: Math.cos,
    f: (u) => u * u * u,
    fp: (u) => 3 * u * u,
    x: [0, 3.1],
    u: [0, 1],
    y: [0, 1],
    tex: 'y = \\sin^3 x',
    inner: 'u = \\sin x',
    outer: 'y = u^3',
    aria: 'sine of x, cubed',
  },
}

const LINE_Y = { x: 2.6, u: 1.5, y: 0.4 }
const L = 0.06
const W = 0.88

/** Map a value in [lo, hi] onto the shared 0–1 drawing width. */
const toN = ([lo, hi]: [number, number], v: number) => L + (W * (v - lo)) / (hi - lo)
const fromN = ([lo, hi]: [number, number], n: number) => lo + ((n - L) / W) * (hi - lo)

function tickValues([lo, hi]: [number, number]) {
  const span = hi - lo
  const step = [0.25, 0.5, 1, 2, 5].find((s) => span / s <= 7) ?? 5
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step)
    out.push(Math.round(v * 100) / 100)
  return out
}

/** Three number lines x → u → y with the image of a small interval funnelled down the chain. */
function StretchLines({
  pair,
  x,
  dx,
  onX,
}: {
  pair: Pair
  x: number
  dx: number
  onX: (x: number) => void
}) {
  const x1 = x + dx
  const u0 = pair.g(x)
  const u1 = pair.g(x1)
  const y0 = pair.f(u0)
  const y1 = pair.f(u1)
  const lines: {
    key: 'x' | 'u' | 'y'
    range: [number, number]
    a: number
    b: number
    color: string
    name: string
  }[] = [
    { key: 'x', range: pair.x, a: x, b: x1, color: X_COL, name: 'x' },
    { key: 'u', range: pair.u, a: u0, b: u1, color: U_COL, name: pair.inner },
    { key: 'y', range: pair.y, a: y0, b: y1, color: Y_COL, name: pair.outer },
  ]
  const funnel = (i: number): Vec2[] => {
    const top = lines[i]
    const bot = lines[i + 1]
    return [
      [toN(top.range, top.a), LINE_Y[top.key]],
      [toN(top.range, top.b), LINE_Y[top.key]],
      [toN(bot.range, bot.b), LINE_Y[bot.key]],
      [toN(bot.range, bot.a), LINE_Y[bot.key]],
    ]
  }
  return (
    <Plot
      view={{ xMin: 0, xMax: 1, yMin: 0, yMax: 3.2 }}
      height={300}
      axes={false}
      grid={false}
      ariaLabel={`An interval of width ${formatNumber(dx, 2)} at x = ${formatNumber(x, 2)} maps to width ${formatNumber(u1 - u0, 3)} in u and ${formatNumber(y1 - y0, 3)} in y`}
    >
      <Polygon points={funnel(0)} fill={U_COL} fillOpacity={0.14} stroke="none" />
      <Polygon points={funnel(1)} fill={Y_COL} fillOpacity={0.14} stroke="none" />
      {lines.map((ln) => (
        <g key={ln.key}>
          <Segment
            from={[L, LINE_Y[ln.key]]}
            to={[L + W, LINE_Y[ln.key]]}
            color="var(--ink-3)"
            width={1.5}
          />
          {tickValues(ln.range).map((v) => (
            <g key={v}>
              <Segment
                from={[toN(ln.range, v), LINE_Y[ln.key] - 0.05]}
                to={[toN(ln.range, v), LINE_Y[ln.key] + 0.05]}
                color="var(--ink-3)"
                width={1}
              />
              <Label
                at={[toN(ln.range, v), LINE_Y[ln.key]]}
                anchor="top"
                offset={[0, 6]}
                color="var(--ink-2)"
                className="text-xs"
              >
                {formatNumber(v, 2)}
              </Label>
            </g>
          ))}
          <Segment
            from={[toN(ln.range, ln.a), LINE_Y[ln.key]]}
            to={[toN(ln.range, ln.b), LINE_Y[ln.key]]}
            color={ln.color}
            width={6}
          />
          <Label
            at={[L, LINE_Y[ln.key]]}
            anchor="bottom-left"
            offset={[0, -10]}
            color={ln.color}
            className="text-xs"
          >
            <Tex>{ln.name}</Tex>
          </Label>
        </g>
      ))}
      <MovablePoint
        x={toN(pair.x, x)}
        y={LINE_Y.x}
        onMove={(nx) => onX(nx)}
        constrain={constraints.horizontal(LINE_Y.x)}
        step={0.02}
        color={X_COL}
        label="Start of the x interval"
      />
    </Plot>
  )
}

/** Turn a dragged drawing coordinate into an x value inside the pair's range. */
function xFromDrawing(pair: Pair, nx: number, dx: number) {
  return clamp(snap(fromN(pair.x, nx), 0.02), pair.x[0], pair.x[1] - dx)
}

function StretchExplorer() {
  const [key, setKey] = useState<PairKey>('sinSq')
  const [x, setX] = useState(1)
  const [dx, setDx] = useState(0.3)
  const pair = PAIRS[key]
  const u = pair.g(x)
  const du = pair.g(x + dx) - u
  const dy = pair.f(pair.g(x + dx)) - pair.f(u)
  const inner = pair.gp(x)
  const outer = pair.fp(u)
  const exact = inner * outer
  const estimate = dy / dx
  const pick = (k: PairKey) => {
    setKey(k)
    setX(k === 'sq3' ? 0.5 : 1)
  }
  return (
    <LabSection id="stretch" eyebrow="Explore" title="Stretch factors multiply">
      <Prose>
        <p>
          A derivative is a local <em>stretch factor</em>: a tiny interval of inputs gets stretched
          (or squashed) by that factor. Take a short blue interval of <Tex>x</Tex> values and send
          it down the chain. Each step stretches it, and the total stretch is the product.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Composition"
            value={key}
            onChange={pick}
            options={(Object.keys(PAIRS) as PairKey[]).map((k) => ({
              value: k,
              label: <Tex>{PAIRS[k].tex}</Tex>,
              ariaLabel: PAIRS[k].aria,
            }))}
          />
        </div>
        <StretchLines pair={pair} x={x} dx={dx} onX={(nx) => setX(xFromDrawing(pair, nx, dx))} />
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>{'\\Delta x'}</Tex>}
            name="Interval width delta x"
            value={dx}
            min={0.02}
            max={0.4}
            step={0.02}
            onChange={(v) => {
              setDx(v)
              setX((old) => Math.min(old, pair.x[1] - v))
            }}
            color={X_COL}
          />
          <Readouts
            items={[
              { label: 'Δu / Δx', value: formatNumber(du / dx, 3), color: U_COL },
              {
                label: 'Δy / Δu',
                value: Math.abs(du) < 1e-12 ? '–' : formatNumber(dy / du, 3),
                color: Y_COL,
              },
              { label: 'Δy / Δx', value: formatNumber(estimate, 3) },
            ]}
          />
        </div>
        <div className="overflow-x-auto overflow-y-hidden border-t border-line px-3 py-3 text-sm sm:px-4">
          <Tex>{`\\frac{dy}{dx} = \\underbrace{${formatNumber(outer, 3).replace('−', '-')}}_{f'(u)} \\times \\underbrace{${formatNumber(inner, 3).replace('−', '-')}}_{g'(x)} = ${formatNumber(exact, 3).replace('−', '-')}`}</Tex>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-shrink" when={dx <= 0.04 && Math.abs(estimate - exact) < 0.05}>
          Shrink <Tex>{'\\Delta x'}</Tex> to the smallest width. Do the measured stretches match the
          exact derivatives below?
        </TryThis>
        <TryThis id="t-flip" when={outer * inner < -0.05}>
          Find a spot where the <Tex>y</Tex> interval comes out flipped (its ends swap sides). Which
          factor went negative?
        </TryThis>
        <TryThis id="t-freeze" when={Math.abs(exact) < 0.05}>
          Find a spot where the <Tex>y</Tex> interval barely moves at all. Which link in the chain
          is zero?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const SQ3 = PAIRS.sq3

function Practice() {
  const [x, setX] = useState(0)
  const total = SQ3.gp(x) * SQ3.fp(SQ3.g(x))
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-gears"
          index={1}
          prompt="Gear $u$ turns 3 times per turn of gear $x$, and gear $y$ turns 4 times per turn of $u$. How many times does $y$ turn per turn of $x$?"
          answer={12}
          explanation="$\dfrac{dy}{dx} = \dfrac{dy}{du} \cdot \dfrac{du}{dx} = 4 \times 3 = 12$."
        />
        <ExpressionChallenge
          id="c-sin3x"
          index={2}
          prompt="Differentiate $y = \sin(3x)$."
          answer="3cos(3x)"
          hint="Outer: $\sin u \to \cos u$. Inner: $u = 3x \to 3$."
          explanation="$\cos(3x) \cdot 3 = 3\cos(3x)$."
        />
        <NumericChallenge
          id="c-power"
          index={3}
          prompt="$y = (x^2 + 1)^3$. Find $\dfrac{dy}{dx}$ at $x = 1$."
          answer={24}
          hint="Outer: $u^3 \to 3u^2$. Inner: $u = x^2 + 1 \to 2x$."
          explanation="$3(x^2 + 1)^2 \cdot 2x$. At $x = 1$: $3 \cdot 4 \cdot 2 = 24$."
        />
        <McqChallenge
          id="c-exp"
          index={4}
          prompt="What is the derivative of $e^{5x}$?"
          options={[
            { text: '$5e^{5x}$', correct: true },
            {
              text: '$e^{5x}$',
              why: 'That forgets the inner factor: the derivative of $5x$ is 5.',
            },
            {
              text: '$5xe^{5x - 1}$',
              why: 'The power rule is for $x^n$, not for $e^{\\text{something}}$.',
            },
            {
              text: '$e^5$',
              why: 'The exponent depends on $x$, so the answer still has $x$ in it.',
            },
          ]}
          explanation="Outer: $e^u$ is its own derivative. Inner: $5x$ has derivative 5. Multiply: $5e^{5x}$."
        />
        <InteractiveChallenge
          id="c-eighteen"
          index={5}
          prompt="For $y = (3x)^2$, drag the interval so the total stretch factor $\dfrac{dy}{dx}$ is exactly 18."
          solved={Math.abs(total - 18) < 0.2}
          hint="The stretch factors are $3$ (for $u = 3x$) and $2u$ (for $y = u^2$)."
          explanation="$\dfrac{dy}{dx} = 2u \cdot 3 = 6 \cdot 3x = 18x$, so $x = 1$."
          onReset={() => setX(0)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <StretchLines
              pair={SQ3}
              x={x}
              dx={0.1}
              onX={(nx) => setX(xFromDrawing(SQ3, nx, 0.1))}
            />
            <p className="border-t border-line px-3 py-2 text-sm">
              <Tex>{`\\frac{dy}{dx} = ${formatNumber(total, 2).replace('−', '-')}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-forget"
          index={6}
          prompt="A student writes $\dfrac{d}{dx}\cos(x^2) = -\sin(x^2)$. What went wrong?"
          options={[
            { text: 'They left out the inner derivative $2x$', correct: true },
            {
              text: 'The sign should be $+$',
              why: 'The derivative of $\\cos$ really is $-\\sin$.',
            },
            {
              text: 'It should be $-\\sin(2x)$',
              why: 'The inner function goes inside unchanged; its derivative multiplies outside.',
            },
            {
              text: 'Nothing, it is correct',
              why: 'Check the chain: there is a middle gear, $u = x^2$.',
            },
          ]}
          explanation="The correct answer is $-\sin(x^2) \cdot 2x$: outer derivative at the inside, times the inner derivative."
        />
      </ChallengeSet>
    </LabSection>
  )
}
