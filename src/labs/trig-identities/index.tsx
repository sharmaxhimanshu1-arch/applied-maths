import { useState } from 'react'
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
  AngleArc,
  Circle,
  FunctionGraph,
  InfiniteLine,
  Label,
  MovablePoint,
  Plot,
  Point,
  Segment,
} from '@/viz'
import { DEG } from '../_shared/geometry'
import { wrapDeg } from '../_shared/trig'

const COS = 'var(--c-blue)'
const SIN = 'var(--c-orange)'
const ONE = 'var(--c-violet)'
const PARTNER = 'var(--c-green)'
const ANG = 'var(--c-magenta)'

/** Whole-degree angle of a dragged point. */
const degOf = ([x, y]: Vec2) => wrapDeg(Math.round(Math.atan2(y, x) / DEG))
const onUnit = (p: Vec2): Vec2 => {
  const d = degOf(p) * DEG
  return [Math.cos(d), Math.sin(d)]
}
const at = (deg: number): Vec2 => [Math.cos(deg * DEG), Math.sin(deg * DEG)]

/** Round tiny floating-point noise away so cos 90° reads 0, not 6e-17. */
const clean = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x)
const f3 = (x: number) => clean(x).toFixed(3)

const UNIT_VIEW = { xMin: -1.45, xMax: 1.45, yMin: -1.35, yMax: 1.35 }

function UnitPoint({
  deg,
  onDeg,
  label,
}: {
  deg: number
  onDeg: (d: number) => void
  label: string
}) {
  const [x, y] = at(deg)
  return (
    <MovablePoint
      x={x}
      y={y}
      onMove={(nx, ny) => onDeg(degOf([nx, ny]))}
      constrain={onUnit}
      color={ONE}
      label={label}
    />
  )
}

export default function TrigIdentitiesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Equations that are true for every angle">
        <Prose>
          <p>
            Most equations are puzzles: <Tex>{'2x + 1 = 7'}</Tex> is true for one value of{' '}
            <Tex>{'x'}</Tex>. An <strong>identity</strong> is different. It is true for{' '}
            <em>every</em> value, so it isn't something to solve but a fact you can use, a way of
            swapping one expression for a simpler one.
          </p>
          <p>
            Trigonometry is full of identities, and almost all of them come from one picture: the
            point <Tex>{'(\\cos\\theta, \\sin\\theta)'}</Tex> going round a circle of radius 1. Its
            distance from the centre never changes, and the circle looks the same in a mirror.
          </p>
        </Prose>
      </LabSection>
      <PythagorasExplorer />
      <SymmetryExplorer />
      <GraphTester />
      <LabSection id="formalize" eyebrow="Formalize" title="The identities worth knowing">
        <Formula
          tex={'\\sin^2\\theta + \\cos^2\\theta = 1'}
          caption="The Pythagorean identity: the point is always 1 from the centre."
        />
        <Prose>
          <ul>
            <li>
              <strong>Divide it</strong> by <Tex>{'\\cos^2\\theta'}</Tex>:{' '}
              <Tex>{'1 + \\tan^2\\theta = \\sec^2\\theta'}</Tex>, where{' '}
              <Tex>{'\\sec\\theta = 1/\\cos\\theta'}</Tex>.
            </li>
            <li>
              <strong>Symmetry:</strong> <Tex>{'\\sin(-\\theta) = -\\sin\\theta'}</Tex>,{' '}
              <Tex>{'\\cos(-\\theta) = \\cos\\theta'}</Tex>,{' '}
              <Tex>{'\\sin(180^\\circ - \\theta) = \\sin\\theta'}</Tex>,{' '}
              <Tex>{'\\sin(90^\\circ - \\theta) = \\cos\\theta'}</Tex>.
            </li>
            <li>
              <strong>Angle sums:</strong>{' '}
              <Tex>{'\\sin(a + b) = \\sin a\\cos b + \\cos a\\sin b'}</Tex> and{' '}
              <Tex>{'\\cos(a + b) = \\cos a\\cos b - \\sin a\\sin b'}</Tex>. They come from rotating
              the point by <Tex>{'b'}</Tex> after rotating it by <Tex>{'a'}</Tex>.
            </li>
            <li>
              <strong>Double angles</strong> (put <Tex>{'a = b = \\theta'}</Tex>):{' '}
              <Tex>{'\\sin 2\\theta = 2\\sin\\theta\\cos\\theta'}</Tex> and{' '}
              <Tex>{'\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta'}</Tex>.
            </li>
          </ul>
          <p>
            To <em>prove</em> an identity, start from one side and transform it step by step into
            the other, using identities you already trust. A graph that overlaps is good evidence;
            one value where the sides differ is enough to show a claim is false.
          </p>
        </Prose>
        <Callout kind="misconception" title="Sine doesn't distribute">
          <p>
            <Tex>{'\\sin(a + b)'}</Tex> is <strong>not</strong> <Tex>{'\\sin a + \\sin b'}</Tex>.
            Try <Tex>{'a = b = 90^\\circ'}</Tex>: <Tex>{'\\sin 180^\\circ = 0'}</Tex>, but{' '}
            <Tex>{'\\sin 90^\\circ + \\sin 90^\\circ = 2'}</Tex>. Likewise{' '}
            <Tex>{'\\sin 2\\theta \\ne 2\\sin\\theta'}</Tex>: sine is a function, not a number you
            can multiply out of the brackets.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where identities earn their keep">
        <RealWorld
          items={[
            {
              title: 'Radio',
              body: 'Multiplying two waves gives a sum and a difference frequency, by $\\sin a\\sin b = \\tfrac12[\\cos(a - b) - \\cos(a + b)]$. Radios use this to shift signals.',
            },
            {
              title: 'Projectiles',
              body: 'A ball launched at speed $v$ and angle $\\theta$ lands $\\tfrac{v^2}{g}\\sin 2\\theta$ away. The double-angle form shows at once that $45^\\circ$ goes furthest.',
            },
            {
              title: 'Computer graphics',
              body: 'Rotating a point by $a$ then $b$ uses the angle-sum formulas; they are what a rotation matrix multiplies out to.',
            },
            {
              title: 'Electricity',
              body: 'The average power in an AC circuit uses $\\sin^2 t = \\tfrac12(1 - \\cos 2t)$, which is why it is half the peak power.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An identity is true for every angle; use it to swap one expression for another.',
            '$\\sin^2\\theta + \\cos^2\\theta = 1$ is Pythagoras on the unit circle.',
            'Mirror symmetries of the circle give the sign and complement rules.',
            '$\\sin(a + b) \\ne \\sin a + \\sin b$: use the angle-sum formula.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PythagorasExplorer() {
  const [deg, setDeg] = useState(130)
  const [c, s] = at(deg)
  const c2 = c * c
  const s2 = s * s
  // Push the “1” off the hypotenuse, on the side away from the right angle.
  const k = -s * c > 0 ? -1 : 1
  const away: [number, number] = [k * -s * 14, -k * c * 14]
  return (
    <LabSection id="explore" eyebrow="Explore" title="Pythagoras on the unit circle">
      <Prose>
        <p>
          Drag the point round the circle. The blue leg is <Tex>{'\\cos\\theta'}</Tex>, the orange
          leg is <Tex>{'\\sin\\theta'}</Tex>, and the hypotenuse is the radius, always 1. The bar
          underneath adds the two squared legs.
        </p>
      </Prose>
      <PredictReveal
        question="In the third quadrant both $\sin\theta$ and $\cos\theta$ are negative. What is $\sin^2\theta + \cos^2\theta$ there?"
        options={['$-1$', '$0$', '$1$', 'It depends on the angle']}
        answer={2}
        explanation="Squaring removes the signs, and the legs still make a right triangle with hypotenuse 1. It is 1 everywhere."
      />
      <Figure>
        <div className="mx-auto w-full max-w-sm">
          <Plot
            view={UNIT_VIEW}
            aspect="equal"
            grid={false}
            ariaLabel={`Unit circle at ${deg} degrees`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1.5} />
            <AngleArc center={[0, 0]} from={0} to={deg * DEG} radius={22} color={ANG} />
            <Segment from={[0, 0]} to={[c, 0]} color={COS} width={3.5} />
            <Segment from={[c, 0]} to={[c, s]} color={SIN} width={3.5} />
            <Segment from={[0, 0]} to={[c, s]} color={ONE} width={2.5} />
            <Label at={[c / 2, s / 2]} anchor="center" offset={away} color={ONE}>
              1
            </Label>
            <UnitPoint deg={deg} onDeg={setDeg} label="Point on the unit circle" />
          </Plot>
        </div>
        <div className="border-t border-line px-3 py-3 sm:px-4">
          <div
            className="flex h-7 w-full overflow-hidden rounded-lg border border-line"
            role="img"
            aria-label={`cos squared ${f3(c2)} plus sin squared ${f3(s2)} equals 1`}
          >
            <div style={{ width: `${c2 * 100}%`, background: COS, opacity: 0.75 }} />
            <div style={{ width: `${s2 * 100}%`, background: SIN, opacity: 0.75 }} />
          </div>
          <Readouts
            items={[
              { label: 'θ', value: `${deg}°`, color: ANG },
              { label: 'cos θ', value: f3(c), color: COS },
              { label: 'sin θ', value: f3(s), color: SIN },
              { label: 'cos²θ + sin²θ', value: `${f3(c2)} + ${f3(s2)} = ${f3(c2 + s2)}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-equal-lab" when={deg === 45 || deg === 225}>
          Find an angle where <Tex>{'\\sin\\theta = \\cos\\theta'}</Tex>. (There are two.)
        </TryThis>
        <TryThis id="t-q3" when={deg > 180 && deg < 270}>
          Move into the third quadrant, where both legs point the negative way. Is the sum still 1?
        </TryThis>
        <TryThis id="t-three-quarters" when={[60, 120, 240, 300].includes(deg)}>
          Make <Tex>{'\\sin^2\\theta'}</Tex> exactly three-quarters of the bar. How many angles do
          it?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Mirror = 'neg' | 'supp' | 'comp' | 'half'

const MIRRORS: Record<
  Mirror,
  { label: string; partner: (d: number) => number; tex: [string, string]; line: Vec2 | null }
> = {
  neg: {
    label: '−θ',
    partner: (d) => -d,
    tex: ['\\sin(-\\theta) = -\\sin\\theta', '\\cos(-\\theta) = \\cos\\theta'],
    line: [1, 0],
  },
  supp: {
    label: '180° − θ',
    partner: (d) => 180 - d,
    tex: [
      '\\sin(180^\\circ - \\theta) = \\sin\\theta',
      '\\cos(180^\\circ - \\theta) = -\\cos\\theta',
    ],
    line: [0, 1],
  },
  comp: {
    label: '90° − θ',
    partner: (d) => 90 - d,
    tex: ['\\sin(90^\\circ - \\theta) = \\cos\\theta', '\\cos(90^\\circ - \\theta) = \\sin\\theta'],
    line: [1, 1],
  },
  half: {
    label: 'θ + 180°',
    partner: (d) => d + 180,
    tex: [
      '\\sin(\\theta + 180^\\circ) = -\\sin\\theta',
      '\\cos(\\theta + 180^\\circ) = -\\cos\\theta',
    ],
    line: null,
  },
}

const MIRROR_NAMES: Record<Mirror, string> = {
  neg: 'Mirror in the x-axis.',
  supp: 'Mirror in the y-axis.',
  comp: 'Mirror in the line y = x: x and y swap.',
  half: 'A half turn about the centre: both coordinates flip sign.',
}

function SymmetryExplorer() {
  const [deg, setDeg] = useState(35)
  const [mode, setMode] = useState<Mirror>('supp')
  const [seen, setSeen] = useState<Mirror[]>(['supp'])
  const m = MIRRORS[mode]
  const q = wrapDeg(m.partner(deg))
  const P = at(deg)
  const Q = at(q)
  return (
    <LabSection id="symmetry" eyebrow="Explore" title="Mirror the point">
      <Prose>
        <p>
          Pick a symmetry. The green point is the mirror image of your point, and its angle is
          written in terms of <Tex>{'\\theta'}</Tex>. Compare the two points' coordinates: the
          identity underneath just says what the mirror does to them.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Partner angle"
            value={mode}
            onChange={(v) => {
              setMode(v)
              if (!seen.includes(v)) setSeen([...seen, v])
            }}
            options={(Object.keys(MIRRORS) as Mirror[]).map((k) => ({
              value: k,
              label: MIRRORS[k].label,
            }))}
          />
          <p className="mt-2 text-sm text-ink-2">{MIRROR_NAMES[mode]}</p>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <Plot
            view={UNIT_VIEW}
            aspect="equal"
            grid={false}
            ariaLabel={`Point at ${deg} degrees and its partner at ${q} degrees`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1.5} />
            {m.line ? (
              <InfiniteLine through={[0, 0]} direction={m.line} color="var(--ink-3)" dashed />
            ) : (
              <Segment from={P} to={Q} color="var(--ink-3)" dashed />
            )}
            <Segment from={[0, 0]} to={Q} color={PARTNER} width={2} />
            <Segment from={[0, 0]} to={P} color={ONE} width={2} />
            <Point at={Q} r={6} color={PARTNER} />
            <Label
              at={Q}
              anchor="center"
              offset={[Q[0] >= 0 ? 22 : -22, Q[1] >= 0 ? -14 : 14]}
              color={PARTNER}
              className="text-xs"
            >
              {m.label}
            </Label>
            <Label
              at={P}
              anchor="center"
              offset={[P[0] >= 0 ? 16 : -16, P[1] >= 0 ? -14 : 14]}
              color={ONE}
              className="text-xs"
            >
              θ
            </Label>
            <UnitPoint deg={deg} onDeg={setDeg} label="Your point on the unit circle" />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 pt-3 text-lg">
            <Tex>{m.tex[0]}</Tex>
            <Tex>{m.tex[1]}</Tex>
          </div>
          <Readouts
            items={[
              { label: `θ = ${deg}°`, value: `(${f3(P[0])}, ${f3(P[1])})`, color: ONE },
              { label: `${m.label} = ${q}°`, value: `(${f3(Q[0])}, ${f3(Q[1])})`, color: PARTNER },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-all" when={seen.length === 4}>
          Try all four symmetries. Which ones change the sign of sine?
        </TryThis>
        <TryThis id="t-comp-meet" when={mode === 'comp' && (deg === 45 || deg === 225)}>
          With <Tex>{'90^\\circ - \\theta'}</Tex>, find where the point and its partner meet.
        </TryThis>
        <TryThis id="t-neg-meet" when={mode === 'neg' && (deg === 0 || deg === 180)}>
          With <Tex>{'-\\theta'}</Tex>, find where the point is its own mirror image.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Claim = 'pyth' | 'double' | 'cos2' | 'sum' | 'twice'

const CLAIMS: Record<
  Claim,
  { label: string; tex: string; left: (x: number) => number; right: (x: number) => number }
> = {
  pyth: {
    label: 'Pythagoras',
    tex: '\\sin^2 x + \\cos^2 x \\overset{?}{=} 1',
    left: (x) => Math.sin(x) ** 2 + Math.cos(x) ** 2,
    right: () => 1,
  },
  double: {
    label: 'Double angle',
    tex: '\\sin 2x \\overset{?}{=} 2\\sin x\\cos x',
    left: (x) => Math.sin(2 * x),
    right: (x) => 2 * Math.sin(x) * Math.cos(x),
  },
  cos2: {
    label: 'cos 2x',
    tex: '\\cos 2x \\overset{?}{=} 1 - 2\\sin^2 x',
    left: (x) => Math.cos(2 * x),
    right: (x) => 1 - 2 * Math.sin(x) ** 2,
  },
  sum: {
    label: 'Split the sum',
    tex: '\\sin(x + 1) \\overset{?}{=} \\sin x + \\sin 1',
    left: (x) => Math.sin(x + 1),
    right: (x) => Math.sin(x) + Math.sin(1),
  },
  twice: {
    label: 'Pull out the 2',
    tex: '\\sin 2x \\overset{?}{=} 2\\sin x',
    left: (x) => Math.sin(2 * x),
    right: (x) => 2 * Math.sin(x),
  },
}

/** Largest gap between the two sides over one period, sampled finely. */
function maxGap(c: (typeof CLAIMS)[Claim]): number {
  let gap = 0
  for (let i = 0; i <= 720; i++) {
    const x = (i / 720) * 2 * Math.PI
    gap = Math.max(gap, Math.abs(c.left(x) - c.right(x)))
  }
  return gap
}

function GraphTester() {
  const [claim, setClaim] = useState<Claim>('pyth')
  const [seen, setSeen] = useState<Claim[]>(['pyth'])
  const c = CLAIMS[claim]
  const gap = maxGap(c)
  const holds = gap < 1e-9
  return (
    <LabSection id="test" eyebrow="Explore" title="Test a claim with graphs">
      <Prose>
        <p>
          Graph both sides of a claimed identity. If it is a true identity the curves lie exactly on
          top of each other, everywhere. If they come apart even once, the claim is false. Two of
          these five are impostors.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Claim to test"
            size="sm"
            className="flex-wrap"
            value={claim}
            onChange={(v) => {
              setClaim(v)
              if (!seen.includes(v)) setSeen([...seen, v])
            }}
            options={(Object.keys(CLAIMS) as Claim[]).map((k) => ({
              value: k,
              label: CLAIMS[k].label,
            }))}
          />
          <div className="mt-2 overflow-x-auto text-center">
            <Tex display>{c.tex}</Tex>
          </div>
        </div>
        <Plot
          view={{ xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -2.6, yMax: 2.6 }}
          narrowView={{ xMin: -Math.PI, xMax: Math.PI, yMin: -2.6, yMax: 2.6 }}
          height={280}
          piTicks
          ariaLabel={`Both sides of the claim ${c.label}`}
        >
          <FunctionGraph fn={c.left} color={COS} width={5} opacity={0.55} />
          <FunctionGraph fn={c.right} color={SIN} width={2.5} dashed />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'left side', value: 'thick blue', color: COS },
              { label: 'right side', value: 'dashed orange', color: SIN },
              {
                label: 'biggest gap',
                value: holds ? '0: an identity ✓' : `${formatNumber(gap, 2)}: not an identity ✗`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-fake" when={claim === 'sum' || claim === 'twice'}>
          Find an impostor. Where do the two graphs come furthest apart?
        </TryThis>
        <TryThis id="t-both-fakes" when={seen.includes('sum') && seen.includes('twice')}>
          Find both impostors.
        </TryThis>
        <TryThis id="t-double" when={claim === 'double'}>
          Check the double-angle formula for sine.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [deg, setDeg] = useState(90)
  const [c, s] = at(deg)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-pyth-lab"
          index={1}
          prompt="$\sin\theta = 0.6$ and $\theta$ is acute. What is $\cos\theta$?"
          answer={0.8}
          tolerance={0.001}
          explanation="$\cos^2\theta = 1 - 0.36 = 0.64$, and cosine is positive for an acute angle, so $\cos\theta = 0.8$."
        />
        <McqChallenge
          id="c-supp"
          index={2}
          prompt="$\sin(180^\circ - \theta)$ equals…"
          options={[
            { text: '$\\sin\\theta$', correct: true },
            { text: '$-\\sin\\theta$', why: 'Mirroring in the y-axis keeps the height.' },
            { text: '$\\cos\\theta$', why: 'That would be $\\sin(90^\\circ - \\theta)$.' },
            { text: '$-\\cos\\theta$', why: 'That is $\\cos(180^\\circ - \\theta)$.' },
          ]}
          explanation="The point for $180^\circ - \theta$ is the mirror image of $\theta$'s point in the y-axis: same height, so the same sine."
        />
        <NumericChallenge
          id="c-double-lab"
          index={3}
          prompt="$\sin\theta = 0.6$ and $\cos\theta = 0.8$. What is $\sin 2\theta$?"
          answer={0.96}
          tolerance={0.001}
          explanation="$\sin 2\theta = 2\sin\theta\cos\theta = 2 \times 0.6 \times 0.8 = 0.96$."
        />
        <NumericChallenge
          id="c-quadrant"
          index={4}
          prompt="$\cos\theta = 0.5$ and $\theta$ is in the fourth quadrant. What is $\sin\theta$? (3 decimal places)"
          answer={-Math.sqrt(3) / 2}
          tolerance={0.001}
          hint="Use the Pythagorean identity, then decide the sign from the quadrant."
          explanation="$\sin^2\theta = 1 - 0.25 = 0.75$, so $\sin\theta = \pm 0.866$. In the fourth quadrant the point is below the axis: $-0.866$."
        />
        <McqChallenge
          id="c-impostor"
          index={5}
          prompt="Which of these is NOT true for every angle?"
          options={[
            { text: '$\\sin 2x = 2\\sin x$', correct: true },
            { text: '$\\cos(-x) = \\cos x$', why: 'True: mirroring in the x-axis keeps x.' },
            {
              text: '$1 + \\tan^2 x = \\sec^2 x$',
              why: 'True: divide the Pythagorean identity by $\\cos^2 x$.',
            },
            {
              text: '$\\sin(90^\\circ - x) = \\cos x$',
              why: 'True: mirroring in $y = x$ swaps the coordinates.',
            },
          ]}
          explanation="At $x = 90^\circ$: $\sin 180^\circ = 0$ but $2\sin 90^\circ = 2$. The true rule is $\sin 2x = 2\sin x\cos x$."
        />
        <InteractiveChallenge
          id="c-place"
          index={6}
          prompt="Drag the point to the angle where $\sin\theta = -\tfrac12$ and $\cos\theta > 0$."
          solved={deg === 330}
          hint="$\sin 30^\circ = \tfrac12$. Which mirror makes sine negative but keeps cosine positive?"
          explanation="$\theta = 330^\circ$ (or $-30^\circ$): the mirror image of $30^\circ$ in the x-axis."
          onReset={() => setDeg(90)}
        >
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-line">
            <Plot
              view={UNIT_VIEW}
              aspect="equal"
              grid={false}
              ariaLabel={`Point at ${deg} degrees`}
            >
              <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1.5} />
              <Segment from={[0, 0]} to={[c, 0]} color={COS} width={3} />
              <Segment from={[c, 0]} to={[c, s]} color={SIN} width={3} />
              <UnitPoint deg={deg} onDeg={setDeg} label="Point on the unit circle" />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              θ = {deg}°, sin θ = {f3(s)}, cos θ = {f3(c)}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
