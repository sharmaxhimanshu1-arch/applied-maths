import { useState } from 'react'
import { Play } from 'lucide-react'
import { clamp, formatNumber } from '@/math/core'
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
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  Circle,
  MovablePoint,
  ParametricCurve,
  Plot,
  Point,
  Segment,
  constraints,
  usePlayback,
} from '@/viz'
import { DEG } from '../_shared/geometry'
import { wrapDeg } from '../_shared/trig'

const X_COL = 'var(--c-blue)'
const Y_COL = 'var(--c-orange)'
const R_COL = 'var(--c-violet)'
const ANG = 'var(--c-magenta)'
const CURVE = 'var(--c-green)'

const TAU = 2 * Math.PI
const tidy = (x: number) => (Math.abs(x) < 1e-9 ? 0 : Math.round(x * 1e9) / 1e9)

/** Polar snap: radius in halves, direction in 15° steps. */
const polarSnap = ([x, y]: Vec2): Vec2 => {
  const deg = wrapDeg(Math.round(Math.atan2(y, x) / DEG / 15) * 15)
  const r = clamp(Math.round(Math.hypot(x, y) * 2) / 2, 0.5, 4.5)
  return [tidy(r * Math.cos(deg * DEG)), tidy(r * Math.sin(deg * DEG))]
}

const squareSnap = constraints.compose(
  constraints.snapToGrid(0.5),
  constraints.within(-4.5, 4.5, -4.5, 4.5),
)

const thetaOf = ([x, y]: Vec2) => wrapDeg(Math.atan2(y, x) / DEG)

function PolarGrid() {
  const rays = [0, 30, 60, 90, 120, 150]
  return (
    <>
      {[1, 2, 3, 4].map((r) => (
        <Circle key={r} center={[0, 0]} r={r} stroke="var(--line)" strokeWidth={1} />
      ))}
      {rays.map((d) => (
        <Segment
          key={d}
          from={[-4.6 * Math.cos(d * DEG), -4.6 * Math.sin(d * DEG)]}
          to={[4.6 * Math.cos(d * DEG), 4.6 * Math.sin(d * DEG)]}
          color="var(--line)"
          width={1}
        />
      ))}
    </>
  )
}

/** The point with both of its addresses drawn: x/y legs and the r/θ arm. */
function Addresses({ p }: { p: Vec2 }) {
  const [x] = p
  const th = thetaOf(p)
  return (
    <>
      <Segment from={[0, 0]} to={[x, 0]} color={X_COL} width={3} dashed />
      <Segment from={[x, 0]} to={p} color={Y_COL} width={3} dashed />
      {th > 0 && <AngleArc center={[0, 0]} from={0} to={th * DEG} radius={28} color={ANG} />}
      <Segment from={[0, 0]} to={p} color={R_COL} width={3} />
    </>
  )
}

export default function PolarCoordinatesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="How far, and which way">
        <Prose>
          <p>
            There are two natural ways to say where something is. “3 blocks east, 4 blocks north” is
            a <strong>Cartesian</strong> address: <Tex>{'(x, y)'}</Tex>. “5 blocks away, a bit north
            of north-east” is a <strong>polar</strong> address: a distance <Tex>{'r'}</Tex> and a
            direction <Tex>{'\\theta'}</Tex>, measured anticlockwise from the positive x-axis.
          </p>
          <p>
            Radar, sonar and a lighthouse beam all think in polar coordinates. And some shapes that
            are horrible in <Tex>{'x'}</Tex> and <Tex>{'y'}</Tex> (spirals, flowers, hearts) become
            one-line formulas when you write <Tex>{'r'}</Tex> as a function of{' '}
            <Tex>{'\\theta'}</Tex>.
          </p>
        </Prose>
      </LabSection>
      <AddressExplorer />
      <CurveExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Converting between the two">
        <Formula
          tex={
            'x = r\\cos\\theta, \\quad y = r\\sin\\theta \\qquad r = \\sqrt{x^2 + y^2}, \\quad \\tan\\theta = \\frac{y}{x}'
          }
          caption="The arm r is the hypotenuse of a right triangle with legs x and y."
        />
        <Prose>
          <ul>
            <li>
              <strong>Polar to Cartesian</strong> is SOH CAH TOA: the x-leg is{' '}
              <Tex>{'r\\cos\\theta'}</Tex>, the y-leg <Tex>{'r\\sin\\theta'}</Tex>.
            </li>
            <li>
              <strong>Cartesian to polar:</strong> <Tex>{'r'}</Tex> comes from Pythagoras. For{' '}
              <Tex>{'\\theta'}</Tex>, <Tex>{'\\tan^{-1}(y/x)'}</Tex> only returns angles between{' '}
              <Tex>{'-90^\\circ'}</Tex> and <Tex>{'90^\\circ'}</Tex>, so check the quadrant: for{' '}
              <Tex>{'(-2, 2)'}</Tex> it is <Tex>{'135^\\circ'}</Tex>, not <Tex>{'-45^\\circ'}</Tex>.
            </li>
            <li>
              <strong>Polar curves</strong> <Tex>{'r = f(\\theta)'}</Tex>: <Tex>{'r = 2'}</Tex> is a
              circle, <Tex>{'r = \\theta/2'}</Tex> a spiral, <Tex>{'r = 3\\cos k\\theta'}</Tex> a
              rose with <Tex>{'k'}</Tex> petals when <Tex>{'k'}</Tex> is odd and <Tex>{'2k'}</Tex>{' '}
              when it is even.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="A point has many polar names">
          <p>
            Each point has one Cartesian address but endless polar ones. Adding a full turn changes
            nothing: <Tex>{'(2, 30^\\circ)'}</Tex> and <Tex>{'(2, 390^\\circ)'}</Tex> are the same
            place. A negative <Tex>{'r'}</Tex> means “walk backwards”, so{' '}
            <Tex>{'(-2, 210^\\circ)'}</Tex> lands there too.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet polar coordinates">
        <RealWorld
          items={[
            {
              title: 'Radar and sonar',
              body: 'A radar sweeps a beam round and times the echo: it measures exactly $\\theta$ and $r$.',
            },
            {
              title: 'Microphones',
              body: 'A microphone’s pick-up pattern is drawn as a polar graph; the common “cardioid” is $r = 1 + \\cos\\theta$, deaf to sound from behind.',
            },
            {
              title: 'Robots and drones',
              body: 'A robot arm or a lidar scanner reports angles and distances; converting them to $x, y$ is the first step in building a map.',
            },
            {
              title: 'Orbits',
              body: 'Planetary orbits are neat in polar form: $r = \\tfrac{p}{1 + e\\cos\\theta}$ with the Sun at the origin.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A polar address is a distance $r$ and a direction $\\theta$.',
            '$x = r\\cos\\theta$, $y = r\\sin\\theta$, and $r = \\sqrt{x^2 + y^2}$.',
            'Check the quadrant when finding $\\theta$ from $y/x$.',
            'Circles, spirals and roses have simple equations $r = f(\\theta)$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

type GridKind = 'square' | 'polar'

function AddressExplorer() {
  const [p, setP] = useState<Vec2>([2, 1.5])
  const [grid, setGrid] = useState<GridKind>('square')
  const [x, y] = p
  const r = Math.hypot(x, y)
  const th = thetaOf(p)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Two addresses for one point">
      <Prose>
        <p>
          Drag the point. The dashed blue and orange legs are its Cartesian address; the violet arm
          and pink angle are its polar address. Switch the grid to polar and the point clicks to
          whole half-units of distance and 15° steps of direction instead.
        </p>
      </Prose>
      <PredictReveal
        question="What is the polar angle $\theta$ of the point $(-3, 0)$?"
        options={['$0^\\circ$', '$90^\\circ$', '$180^\\circ$', '$-3^\\circ$']}
        answer={2}
        explanation="It is 3 units from the origin, pointing straight left: half a turn from the positive x-axis, so $(r, \theta) = (3, 180^\circ)$."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Grid"
            value={grid}
            onChange={(g) => {
              setGrid(g)
              setP((old) => (g === 'polar' ? polarSnap(old) : squareSnap(old)))
            }}
            options={[
              { value: 'square', label: 'Square grid' },
              { value: 'polar', label: 'Polar grid' },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -4.8, xMax: 4.8, yMin: -4.8, yMax: 4.8 }}
            aspect="equal"
            grid={grid === 'square'}
            ariaLabel={`Point at x ${formatNumber(x)}, y ${formatNumber(y)}; r ${formatNumber(r)}, angle ${formatNumber(th, 1)} degrees`}
          >
            {grid === 'polar' && <PolarGrid />}
            <Addresses p={p} />
            <MovablePoint
              x={x}
              y={y}
              onMove={(nx, ny) => setP([nx, ny])}
              constrain={grid === 'polar' ? polarSnap : squareSnap}
              color={R_COL}
              label="The point"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x', value: formatNumber(x, 2), color: X_COL },
              { label: 'y', value: formatNumber(y, 2), color: Y_COL },
              { label: 'r', value: formatNumber(r, 3), color: R_COL },
              { label: 'θ', value: `${formatNumber(th, 1)}°`, color: ANG },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-north" when={x === 0 && y === 4}>
          Put the point at <Tex>{'r = 4,\\ \\theta = 90^\\circ'}</Tex>. What are its{' '}
          <Tex>{'x'}</Tex> and <Tex>{'y'}</Tex>?
        </TryThis>
        <TryThis id="t-q3" when={x < 0 && y < 0}>
          Move into the bottom-left quadrant. Between which two angles is <Tex>{'\\theta'}</Tex>{' '}
          now?
        </TryThis>
        <TryThis id="t-345" when={x === 3 && y === 4}>
          Put the point at <Tex>{'(3, 4)'}</Tex>. How far is it from the origin?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type CurveKind = 'circle' | 'spiral' | 'rose' | 'cardioid'

const CURVES: Record<
  CurveKind,
  { label: string; tex: (k: number) => string; r: (t: number, k: number) => number }
> = {
  circle: { label: 'Circle', tex: () => 'r = 2', r: () => 2 },
  spiral: { label: 'Spiral', tex: () => 'r = \\theta / 2', r: (t) => t / 2 },
  rose: {
    label: 'Rose',
    tex: (k) => `r = 3\\cos ${k === 1 ? '' : k}\\theta`,
    r: (t, k) => 3 * Math.cos(k * t),
  },
  cardioid: {
    label: 'Cardioid',
    tex: () => 'r = 2(1 + \\cos\\theta)',
    r: (t) => 2 * (1 + Math.cos(t)),
  },
}

function CurveExplorer() {
  const [kind, setKind] = useState<CurveKind>('rose')
  const [k, setK] = useState(3)
  const [manual, setManual] = useState(TAU)
  const playback = usePlayback(5)
  const sweep = playback.playing ? playback.t * TAU : manual
  const c = CURVES[kind]
  const r = c.r(sweep, k)
  const pt: Vec2 = [r * Math.cos(sweep), r * Math.sin(sweep)]
  const full = sweep >= TAU - 0.01
  return (
    <LabSection id="curves" eyebrow="Explore" title="Draw with r = f(θ)">
      <Prose>
        <p>
          A polar curve is a recipe: for each direction <Tex>{'\\theta'}</Tex>, go out a distance{' '}
          <Tex>{'r = f(\\theta)'}</Tex>. Sweep <Tex>{'\\theta'}</Tex> from 0 to a full turn and the
          green pen draws the curve. The dashed line shows the direction; when <Tex>{'r'}</Tex> is
          negative the pen goes the opposite way.
        </p>
      </Prose>
      <Figure>
        <div className="space-y-2 px-3 pt-3 sm:px-4">
          <Segmented
            label="Curve"
            value={kind}
            onChange={setKind}
            options={(Object.keys(CURVES) as CurveKind[]).map((key) => ({
              value: key,
              label: CURVES[key].label,
            }))}
          />
          <div className="text-center text-lg">
            <Tex>{c.tex(k)}</Tex>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -4.6, xMax: 4.6, yMin: -4.6, yMax: 4.6 }}
            aspect="equal"
            grid={false}
            ariaLabel={`Polar curve ${c.label} drawn up to ${formatNumber(sweep, 2)} radians`}
          >
            <PolarGrid />
            {sweep > 0 && (
              <ParametricCurve
                x={(t) => c.r(t, k) * Math.cos(t)}
                y={(t) => c.r(t, k) * Math.sin(t)}
                tMin={0}
                tMax={sweep}
                samples={600}
                color={CURVE}
                width={3}
              />
            )}
            <Segment
              from={[0, 0]}
              to={[4.6 * Math.cos(sweep), 4.6 * Math.sin(sweep)]}
              color={ANG}
              width={1.5}
              dashed
            />
            <Segment from={[0, 0]} to={pt} color={R_COL} width={2.5} />
            <Point at={pt} r={5} color={CURVE} />
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'\\theta'}</Tex>}
            name="Sweep angle theta"
            value={sweep}
            min={0}
            max={TAU}
            step={0.01}
            format={(v) => `${formatNumber(v, 2)} (${Math.round(v / DEG)}°)`}
            onChange={(v) => {
              playback.pause()
              setManual(v)
            }}
            color={ANG}
          />
          {kind === 'rose' && (
            <Slider
              label={<Tex>{'k'}</Tex>}
              name="Rose number k"
              value={k}
              min={1}
              max={6}
              step={1}
              onChange={setK}
              color={CURVE}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<Play className="size-4" />}
            onClick={() => {
              setManual(TAU)
              playback.seek(0)
              playback.play()
            }}
            disabled={playback.playing}
          >
            Draw it
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'θ', value: `${formatNumber(sweep, 2)} rad`, color: ANG },
              { label: 'r', value: formatNumber(tidy(r), 2), color: R_COL },
              {
                label: '(x, y)',
                value: `(${formatNumber(tidy(pt[0]), 2)}, ${formatNumber(tidy(pt[1]), 2)})`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-four" when={kind === 'rose' && k === 2 && full}>
          Draw a whole rose with 4 petals.
        </TryThis>
        <TryThis id="t-half" when={kind === 'rose' && k === 3 && Math.abs(sweep - Math.PI) < 0.02}>
          With <Tex>{'k = 3'}</Tex>, stop the sweep at <Tex>{'\\theta = \\pi'}</Tex>. Is the rose
          already finished?
        </TryThis>
        <TryThis id="t-heart" when={kind === 'cardioid' && full}>
          Draw the whole cardioid. In which direction is <Tex>{'r = 0'}</Tex>?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [p, setP] = useState<Vec2>([1, 0])
  const r = Math.hypot(p[0], p[1])
  const th = thetaOf(p)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-r"
          index={1}
          prompt="What is $r$ for the point $(-6, 8)$?"
          answer={10}
          explanation="$r = \sqrt{(-6)^2 + 8^2} = \sqrt{100} = 10$."
        />
        <McqChallenge
          id="c-to-xy"
          index={2}
          prompt="Where is the polar point $(r, \theta) = (4, 90^\circ)$ in $x, y$?"
          options={[
            { text: '$(0, 4)$', correct: true },
            { text: '$(4, 0)$', why: 'That is at angle $0^\\circ$.' },
            { text: '$(4, 90)$', why: 'Polar and Cartesian numbers mean different things.' },
            { text: '$(-4, 0)$', why: 'That is at $180^\\circ$.' },
          ]}
          explanation="$x = 4\cos 90^\circ = 0$ and $y = 4\sin 90^\circ = 4$: straight up."
        />
        <NumericChallenge
          id="c-x"
          index={3}
          prompt="The polar point $(6, 60^\circ)$ has what $x$-coordinate?"
          answer={3}
          tolerance={0.001}
          explanation="$x = 6\cos 60^\circ = 6 \times \tfrac12 = 3$."
        />
        <NumericChallenge
          id="c-angle"
          index={4}
          prompt="What is the polar angle $\theta$ of the point $(-2, 2)$, in degrees between 0 and 360?"
          answer={135}
          unit="°"
          hint="$\tan^{-1}(2 / -2)$ gives $-45^\circ$, but which quadrant is the point in?"
          explanation="The point is up and to the left (second quadrant), so $\theta = 180^\circ - 45^\circ = 135^\circ$."
        />
        <NumericChallenge
          id="c-petals"
          index={5}
          prompt="How many petals does the rose $r = \cos(4\theta)$ have?"
          answer={8}
          explanation="For even $k$ a rose has $2k$ petals: $2 \times 4 = 8$."
        />
        <InteractiveChallenge
          id="c-place"
          index={6}
          prompt="Drag the point to the polar address $(r, \theta) = (3, 150^\circ)$."
          solved={Math.abs(r - 3) < 1e-6 && Math.abs(th - 150) < 1e-6}
          hint="150° is 30° short of pointing straight left."
          explanation="$(3, 150^\circ)$ is $x = 3\cos 150^\circ \approx -2.60$, $y = 3\sin 150^\circ = 1.5$."
          onReset={() => setP([1, 0])}
        >
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -4.8, xMax: 4.8, yMin: -4.8, yMax: 4.8 }}
              aspect="equal"
              grid={false}
              ariaLabel={`Point at r ${formatNumber(r)}, angle ${formatNumber(th, 1)} degrees`}
            >
              <PolarGrid />
              <Addresses p={p} />
              <MovablePoint
                x={p[0]}
                y={p[1]}
                onMove={(x, y) => setP([x, y])}
                constrain={polarSnap}
                color={R_COL}
                label="The point"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              r = {formatNumber(r, 2)}, θ = {formatNumber(th, 1)}°
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
