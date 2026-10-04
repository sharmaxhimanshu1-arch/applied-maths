import { useState } from 'react'
import { derivative } from '@/math/calculus'
import { formatNumber } from '@/math/core'
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
import { Tex } from '@/ui/Tex'
import {
  FunctionGraph,
  InfiniteLine,
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
const CUT = 'var(--c-red)'
const BASE = 'var(--c-green)'
const TANGENT = 'var(--c-magenta)'
const UP = 'var(--c-green)'
const DOWN = 'var(--c-orange)'

const SHEET = 10
const volume = (x: number) => x * (SHEET - 2 * x) ** 2
const BEST = SHEET / 6

const square = (x0: number, y0: number, s: number): Vec2[] => [
  [x0, y0],
  [x0 + s, y0],
  [x0 + s, y0 + s],
  [x0, y0 + s],
]

export default function OptimizationLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The top of the hill is flat">
        <Prose>
          <p>
            Businesses want the most profit, engineers the least material, and you want the shortest
            route. Whenever a quantity depends smoothly on a choice you make, its best value sits at
            a peak or a valley of a graph.
          </p>
          <p>
            And peaks and valleys share one feature: the tangent there is <strong>flat</strong>. So
            to find the best choice, find where the derivative is zero. That turns “try everything”
            into solving one equation.
          </p>
        </Prose>
      </LabSection>
      <BoxExplorer />
      <ClassifyExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Finding the best value">
        <Formula
          tex={"f'(c) = 0 \\quad \\text{or} \\quad f'(c) \\text{ undefined}"}
          caption="$c$ is a critical point. Every smooth peak or valley inside an interval is one."
        />
        <Prose>
          <p>The recipe:</p>
          <ol>
            <li>Write the quantity you want as a function of one variable.</li>
            <li>
              Differentiate it and solve <Tex>{"f'(x) = 0"}</Tex>.
            </li>
            <li>
              Classify each critical point. If <Tex>{"f'"}</Tex> changes from + to − it's a maximum;
              from − to + a minimum. The second derivative works too: <Tex>{"f'' < 0"}</Tex> means a
              peak, <Tex>{"f'' > 0"}</Tex> a valley.
            </li>
            <li>Check the ends of the allowed range: the best value can sit at an edge.</li>
          </ol>
          <p>
            For the box, <Tex>{'V(x) = x(10 - 2x)^2'}</Tex> gives{' '}
            <Tex>{"V'(x) = (10 - 2x)(10 - 6x)"}</Tex>. That is zero at <Tex>x = 5</Tex> (no box
            left) and at <Tex>{'x = \\tfrac53'}</Tex>, the best cut, with volume about 74.1.
          </p>
        </Prose>
        <Callout kind="misconception" title="A flat tangent isn't always a peak or a valley">
          <p>
            <Tex>{'x^3'}</Tex> has <Tex>{"f'(0) = 0"}</Tex>, but it keeps climbing straight through:
            the slope is positive on both sides. A critical point is only a candidate; check which
            way the slope changes.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Optimization everywhere">
        <RealWorld
          items={[
            {
              title: 'Packaging',
              body: 'Drink cans are shaped to hold the most liquid for the least aluminium, a classic calculus problem (real cans also allow for the thicker top and bottom).',
            },
            {
              title: 'Pricing',
              body: 'Raise the price and you sell fewer. Revenue is price × sales, and its peak is where the derivative is zero.',
            },
            {
              title: 'Light',
              body: 'Light travels the path that takes the least time. Setting a derivative to zero gives the law of refraction.',
            },
            {
              title: 'Machine learning',
              body: 'Training a model is minimising a loss. Gradient descent hunts for the point where the derivative (gradient) is zero.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            "Peaks and valleys of a smooth function have $f'(x) = 0$.",
            "Optimise by writing the goal as one function, differentiating, and solving $f'(x) = 0$.",
            "Classify: $f'$ from + to − is a max, from − to + is a min, no change is neither.",
            'Always check the ends of the allowed range too.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BoxExplorer() {
  const [x, setX] = useState(0.5)
  const V = volume(x)
  const slope = derivative(volume, x)
  const inner = SHEET - 2 * x
  return (
    <LabSection id="explore" eyebrow="Explore" title="The biggest box">
      <Prose>
        <p>
          Cut equal squares of side <Tex>x</Tex> from the corners of a 10 × 10 sheet, then fold up
          the sides to make an open box. Drag the point along the volume curve to choose the cut.
          Small cuts make a flat tray, big cuts a tiny tower. Where is the biggest box?
        </p>
      </Prose>
      <PredictReveal
        question="Roughly what size of cut gives the biggest box?"
        options={['About 0.5', 'About 1.7', 'About 2.5 (a quarter of the sheet)', 'About 4']}
        answer={1}
        explanation="About $1.7$ (exactly $\tfrac{10}{6}$). A cut of 2.5 makes a deep box, but its base shrinks to only $5 \times 5$."
      />
      <Figure>
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="p-3 sm:p-4">
            <Plot
              view={{ xMin: -0.5, xMax: 10.5, yMin: -0.5, yMax: 10.5 }}
              aspect="equal"
              grid={false}
              axes={false}
              ariaLabel={`A 10 by 10 sheet with ${num(x)} by ${num(x)} squares cut from each corner`}
            >
              <Polygon
                points={square(0, 0, SHEET)}
                fill="var(--surface-2)"
                fillOpacity={1}
                stroke="var(--ink-3)"
                strokeWidth={1.5}
              />
              {x > 0 && (
                <>
                  <Polygon
                    points={square(0, 0, x)}
                    fill={CUT}
                    fillOpacity={0.35}
                    stroke={CUT}
                    strokeWidth={1.5}
                  />
                  <Polygon
                    points={square(SHEET - x, 0, x)}
                    fill={CUT}
                    fillOpacity={0.35}
                    stroke={CUT}
                    strokeWidth={1.5}
                  />
                  <Polygon
                    points={square(0, SHEET - x, x)}
                    fill={CUT}
                    fillOpacity={0.35}
                    stroke={CUT}
                    strokeWidth={1.5}
                  />
                  <Polygon
                    points={square(SHEET - x, SHEET - x, x)}
                    fill={CUT}
                    fillOpacity={0.35}
                    stroke={CUT}
                    strokeWidth={1.5}
                  />
                </>
              )}
              {inner > 0 && (
                <Polygon
                  points={square(x, x, inner)}
                  fill={BASE}
                  fillOpacity={0.25}
                  stroke={BASE}
                  strokeWidth={1.5}
                  dashed
                />
              )}
              <Label at={[SHEET / 2, SHEET / 2]} anchor="center" className="text-xs">
                base {formatNumber(inner, 2)} × {formatNumber(inner, 2)}
              </Label>
            </Plot>
            <p className="mt-2 text-center text-sm text-ink-2">
              Fold the sides up along the dashed lines; the box is {formatNumber(x, 2)} tall.
            </p>
          </div>
          <div className="border-t border-line md:border-t-0 md:border-l">
            <Plot
              view={{ xMin: -0.3, xMax: 5.3, yMin: -8, yMax: 85 }}
              height={300}
              ariaLabel={`Volume ${num(V)} at cut ${num(x)}, slope ${num(slope)}`}
            >
              <FunctionGraph fn={volume} domain={[0, 5]} color={CURVE} />
              <InfiniteLine
                through={[x, V]}
                direction={[1, slope]}
                color={TANGENT}
                width={1.75}
                dashed
              />
              <MovablePoint
                x={x}
                y={V}
                onMove={(px) => setX(px)}
                constrain={constraints.compose(
                  constraints.snapToGrid(0.05),
                  constraints.onGraph(volume, 0, 5),
                )}
                color={CURVE}
                label="Cut size on the volume curve"
              />
              <Label at={[5.2, 80]} anchor="top-right" className="text-xs">
                <Tex>{'V(x) = x(10 - 2x)^2'}</Tex>
              </Label>
            </Plot>
          </div>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'cut x', value: formatNumber(x, 2), color: CUT },
              { label: 'volume', value: formatNumber(V, 2), color: CURVE },
              { label: 'slope V′(x)', value: formatNumber(slope, 2), color: TANGENT },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-big" when={V > 73}>
          Find a box with volume over 73.
        </TryThis>
        <TryThis id="t-flat-lab" when={Math.abs(x - BEST) < 0.04}>
          Put the point where the pink tangent is flat. What is the cut there?
        </TryThis>
        <TryThis id="t-tower" when={x >= 4}>
          Try a cut of 4 or more. Why does the volume collapse even though the box is tall?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type ClassKey = 'cubic' | 'cube' | 'quartic'

type Critical = { x: number; kind: 'max' | 'min' | 'neither' }

const CLASS_FNS: Record<
  ClassKey,
  { f: (x: number) => number; tex: string; label: string; crit: Critical[]; y: [number, number] }
> = {
  cubic: {
    f: (x) => x ** 3 - 3 * x,
    tex: 'f(x) = x^3 - 3x',
    label: 'x^3 - 3x',
    crit: [
      { x: -1, kind: 'max' },
      { x: 1, kind: 'min' },
    ],
    y: [-4, 4],
  },
  cube: {
    f: (x) => x ** 3,
    tex: 'f(x) = x^3',
    label: 'x^3',
    crit: [{ x: 0, kind: 'neither' }],
    y: [-4, 4],
  },
  quartic: {
    f: (x) => x ** 4 - 2 * x * x,
    tex: 'f(x) = x^4 - 2x^2',
    label: 'x^4 - 2x^2',
    crit: [
      { x: -1, kind: 'min' },
      { x: 0, kind: 'max' },
      { x: 1, kind: 'min' },
    ],
    y: [-1.6, 3],
  },
}

const SIGN_X = [-2.2, 2.2] as const

/** Runs of constant sign of f′ across the plotted range, for the sign chart. */
function signRuns(f: (x: number) => number) {
  const runs: { from: number; to: number; sign: number }[] = []
  const n = 220
  for (let i = 0; i < n; i++) {
    const a = SIGN_X[0] + ((SIGN_X[1] - SIGN_X[0]) * i) / n
    const b = a + (SIGN_X[1] - SIGN_X[0]) / n
    const d = derivative(f, (a + b) / 2)
    const sign = Math.abs(d) < 1e-9 ? 0 : Math.sign(d)
    const last = runs.at(-1)
    if (last && last.sign === sign) last.to = b
    else runs.push({ from: a, to: b, sign })
  }
  return runs
}

const KIND_LABEL = { max: 'peak (max)', min: 'valley (min)', neither: 'neither' } as const

function ClassifyExplorer() {
  const [key, setKey] = useState<ClassKey>('cubic')
  const [x, setX] = useState(-2)
  const fn = CLASS_FNS[key]
  const slope = derivative(fn.f, x)
  const runs = signRuns(fn.f)
  const near = fn.crit.find((c) => Math.abs(c.x - x) < 0.03)
  const [yMin, yMax] = fn.y
  const stripTop = yMin + (yMax - yMin) * 0.07
  return (
    <LabSection id="classify" eyebrow="Explore" title="Peak, valley or neither?">
      <Prose>
        <p>
          A flat tangent marks a <em>candidate</em>. The strip along the bottom shows the sign of
          the slope: green where the curve climbs, orange where it falls. Slide the point to each
          flat spot and read the strip on either side.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={(k) => {
              setKey(k)
              setX(-2)
            }}
            options={(Object.keys(CLASS_FNS) as ClassKey[]).map((k) => ({
              value: k,
              label: <Tex>{CLASS_FNS[k].label}</Tex>,
              ariaLabel: CLASS_FNS[k].label.replace('^', ' to the '),
            }))}
          />
        </div>
        <Plot
          view={{ xMin: SIGN_X[0], xMax: SIGN_X[1], yMin, yMax }}
          height={300}
          ariaLabel={`${fn.label} with slope ${num(slope)} at x = ${num(x)}${near ? `: a ${near.kind}` : ''}`}
        >
          {runs.map((r) =>
            r.sign === 0 ? null : (
              <Polygon
                key={r.from}
                points={[
                  [r.from, yMin],
                  [r.to, yMin],
                  [r.to, stripTop],
                  [r.from, stripTop],
                ]}
                fill={r.sign > 0 ? UP : DOWN}
                fillOpacity={0.45}
                stroke="none"
              />
            ),
          )}
          <FunctionGraph fn={fn.f} color={CURVE} />
          {fn.crit.map((c) => (
            <g key={c.x}>
              <Segment
                from={[c.x, yMin]}
                to={[c.x, fn.f(c.x)]}
                color="var(--ink-3)"
                width={1}
                dashed
              />
              <Point at={[c.x, fn.f(c.x)]} r={4} color="var(--ink-2)" hollow />
            </g>
          ))}
          <InfiniteLine
            through={[x, fn.f(x)]}
            direction={[1, slope]}
            color={TANGENT}
            width={1.75}
          />
          <MovablePoint
            x={x}
            y={fn.f(x)}
            onMove={(px) => setX(px)}
            constrain={constraints.compose(
              constraints.snapToGrid(0.05),
              constraints.onGraph(fn.f, -2, 2),
            )}
            color={CURVE}
            label="Point on the curve"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x', value: formatNumber(x, 2) },
              {
                label: 'slope f′(x)',
                value: formatNumber(slope, 2),
                color: slope > 1e-9 ? UP : slope < -1e-9 ? DOWN : undefined,
              },
              { label: 'here', value: near ? KIND_LABEL[near.kind] : 'not a critical point' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-max" when={key === 'cubic' && Math.abs(x + 1) < 0.03}>
          On <Tex>{'x^3 - 3x'}</Tex>, stop on the peak. What colour is the strip just left and just
          right?
        </TryThis>
        <TryThis id="t-neither" when={key === 'cube' && Math.abs(x) < 0.03}>
          On <Tex>{'x^3'}</Tex>, stop where the tangent is flat. Is it a peak or a valley?
        </TryThis>
        <TryThis id="t-two-valleys" when={key === 'quartic' && Math.abs(Math.abs(x) - 1) < 0.03}>
          On <Tex>{'x^4 - 2x^2'}</Tex>, find a valley. How many valleys and peaks does it have?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const FENCE = 100
const fenceArea = (w: number) => w * (FENCE - 2 * w)

function Practice() {
  const [w, setW] = useState(10)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-product"
          index={1}
          prompt="Two numbers add up to 10. What is the largest their product can be?"
          answer={25}
          hint="Write the product as $x(10 - x)$ and set its derivative to zero."
          explanation="$P(x) = 10x - x^2$, $P'(x) = 10 - 2x = 0$ at $x = 5$, so the product is $5 \times 5 = 25$."
        />
        <NumericChallenge
          id="c-critical"
          index={2}
          prompt="Where is the critical point of $f(x) = x^2 - 6x + 1$?"
          answer={3}
          explanation="$f'(x) = 2x - 6 = 0$ at $x = 3$ (a minimum: the parabola opens upwards)."
        />
        <McqChallenge
          id="c-sign"
          index={3}
          prompt="$f'$ changes from negative to positive at $x = c$. What is $f(c)$?"
          options={[
            { text: 'A local minimum', correct: true },
            { text: 'A local maximum', why: 'Falling then rising is a valley, not a peak.' },
            { text: 'Neither', why: 'A sign change means a real turn.' },
            { text: 'Zero', why: 'The value can be anything; it is the slope that is zero.' },
          ]}
          explanation="The graph falls, then rises: a valley."
        />
        <InteractiveChallenge
          id="c-fence-lab"
          index={4}
          prompt="100 m of fence makes three sides of a rectangle against a river (no fence along the river). Drag the width $w$ (the two short sides) to enclose the most area."
          solved={Math.abs(w - 25) < 0.01}
          hint="Area $= w(100 - 2w)$. Where is its tangent flat?"
          explanation="$A'(w) = 100 - 4w = 0$ at $w = 25$: sides 25, 50, 25 enclose 1,250 m²."
          onReset={() => setW(10)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -2, xMax: 52, yMin: -100, yMax: 1400 }}
              height={240}
              ariaLabel={`Area ${num(fenceArea(w))} square metres at width ${num(w)}`}
            >
              <FunctionGraph fn={fenceArea} domain={[0, 50]} color={CURVE} />
              <MovablePoint
                x={w}
                y={fenceArea(w)}
                onMove={(px) => setW(px)}
                constrain={constraints.compose(
                  constraints.snapToGrid(0.5),
                  constraints.onGraph(fenceArea, 0, 50),
                )}
                step={0.5}
                color={CURVE}
                label="Width w on the area curve"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              Width {formatNumber(w, 1)} m, length {formatNumber(FENCE - 2 * w, 1)} m: area{' '}
              {formatNumber(fenceArea(w), 1)} m²
            </p>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-candidate"
          index={5}
          prompt="$f'(c) = 0$. What can you conclude?"
          options={[
            {
              text: "Only that $c$ is a candidate: check the sign of $f'$ on each side",
              correct: true,
            },
            {
              text: '$f(c)$ is a maximum',
              why: 'It could be a minimum, or neither like $x^3$ at 0.',
            },
            { text: '$f(c)$ is a minimum', why: 'It could be a maximum, or neither.' },
            { text: '$f(c) = 0$', why: 'The slope is zero, not the height.' },
          ]}
          explanation="A flat tangent is necessary for a smooth interior peak or valley, but not sufficient: $x^3$ is flat at 0 and keeps climbing."
        />
      </ChallengeSet>
    </LabSection>
  )
}
