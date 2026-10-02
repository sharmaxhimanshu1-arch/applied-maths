import { Play, RotateCcw, StepForward } from 'lucide-react'
import { useState } from 'react'
import { apply, dot, eigen2, heading, norm, normalize, type Mat2, type Vec2 } from '@/math/linalg'
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
import { MatrixEditor } from '@/tools/matrix/MatrixLab'
import { Button } from '@/ui/Button'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import {
  Circle,
  InfiniteLine,
  Label,
  MovablePoint,
  ParametricCurve,
  Plot,
  Vector,
  constraints,
  useAnimationFrame,
} from '@/viz'
import { COLORS, mat, num } from '../_shared/tex'

const VIEW = { xMin: -4.8, xMax: 4.8, yMin: -3, yMax: 3 }
const NARROW_VIEW = { xMin: -3.3, xMax: 3.3, yMin: -3.3, yMax: 3.3 }
const EIGEN_COLOR = 'var(--c-yellow)'
/** Lines closer than this count as "the same line". */
const ALIGN_DEG = 1.5
/** The probe clicks onto an eigen-direction when dragged this close. */
const MAGNET = (4 * Math.PI) / 180
const TAU = 2 * Math.PI

const PRESETS: { id: string; name: string; m: Mat2 }[] = [
  { id: 'diagonal', name: 'Diagonal stretch', m: [2, 1, 1, 2] },
  { id: 'lopsided', name: 'Lopsided stretch', m: [3, 1, 0, 2] },
  { id: 'flip', name: 'Stretch and flip', m: [1, 2, 2, 1] },
  { id: 'shear', name: 'Shear', m: [1, 1, 0, 1] },
  { id: 'rotation', name: 'Rotation', m: [0, -1, 1, 0] },
]

type Found = { angle: number; lambda: number }

const toDeg = (rad: number) => (rad * 180) / Math.PI
/** Angle wrapped into [−π/2, π/2]: lines through the origin repeat every π. */
const wrapHalf = (a: number) => a - Math.PI * Math.round(a / Math.PI)
const unit = (a: number): Vec2 => [Math.cos(a), Math.sin(a)]

/** Angle between the lines through u and v, in degrees (0 to 90). */
function lineAngleDeg(u: Vec2, v: Vec2): number {
  const nu = norm(u)
  const nv = norm(v)
  if (nu < 1e-12 || nv < 1e-12) return 0
  return toDeg(Math.acos(Math.min(1, Math.abs(dot(u, v)) / (nu * nv))))
}

/** Point a direction into the right half-plane so labels land in a predictable place. */
const canonical = (v: Vec2): Vec2 =>
  v[0] < -1e-9 || (Math.abs(v[0]) <= 1e-9 && v[1] < 0) ? [-v[0], -v[1]] : v

function eigenDirections(m: Mat2): Vec2[] {
  const e = eigen2(m)
  return e.kind === 'complex' ? [] : e.vectors.filter((v): v is Vec2 => v !== null).map(canonical)
}

/** Snap an angle onto a nearby eigen-direction so it can be hit by hand. */
function magnetAngle(a: number, dirs: Vec2[]): number {
  const diff = dirs.map((e) => wrapHalf(a - heading(e))).find((d) => Math.abs(d) < MAGNET)
  return diff === undefined ? a : a - diff
}

/** If the probe at angle `a` is an eigenvector, add its direction to the list. */
function withFound(list: Found[], m: Mat2, a: number): Found[] {
  const v = unit(a)
  const av = apply(m, v)
  if (lineAngleDeg(v, av) > ALIGN_DEG && norm(av) > 1e-9) return list
  const angle = ((a % Math.PI) + Math.PI) % Math.PI
  if (list.some((f) => Math.abs(wrapHalf(f.angle - angle)) < (3 * Math.PI) / 180)) return list
  return [...list, { angle, lambda: dot(av, v) }].slice(-6)
}

/** Probe vector v on the unit circle, its image Av, and any eigenlines found so far. */
function ProbePlot({
  m,
  theta,
  onTheta,
  found = [],
  trail,
}: {
  m: Mat2
  theta: number
  onTheta: (a: number) => void
  found?: Found[]
  trail?: readonly [number, number]
}) {
  const v = unit(theta)
  const av = apply(m, v)
  const aligned = lineAngleDeg(v, av) < ALIGN_DEG
  const dirs = eigenDirections(m)
  const constrain = (p: Vec2): Vec2 => unit(magnetAngle(Math.atan2(p[1], p[0]), dirs))
  return (
    <Plot
      view={VIEW}
      narrowView={NARROW_VIEW}
      aspect="equal"
      ariaLabel={`v at ${num(toDeg(theta), 0)} degrees; A v = (${num(av[0])}, ${num(av[1])})${aligned ? ', on the same line as v' : ''}`}
    >
      {trail && (
        <ParametricCurve
          x={(t) => m[0] * Math.cos(t) + m[1] * Math.sin(t)}
          y={(t) => m[2] * Math.cos(t) + m[3] * Math.sin(t)}
          tMin={trail[0]}
          tMax={trail[1]}
          color={COLORS.result}
          width={1.5}
          opacity={0.55}
        />
      )}
      <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" dashed strokeWidth={1.25} />
      {found.map((f) => (
        <InfiniteLine
          key={f.angle}
          through={[0, 0]}
          direction={unit(f.angle)}
          color={EIGEN_COLOR}
          width={2.5}
          opacity={0.9}
        />
      ))}
      <InfiniteLine
        through={[0, 0]}
        direction={v}
        color={aligned ? EIGEN_COLOR : 'var(--ink-3)'}
        width={aligned ? 2.5 : 1.25}
        dashed={!aligned}
        opacity={aligned ? 1 : 0.6}
      />
      <Vector to={av} color={COLORS.result} width={3} />
      <Vector to={v} color={COLORS.u} />
      <Label at={av} anchor="bottom-left" offset={[8, -6]} color={COLORS.result}>
        <Tex>{'A\\vec v'}</Tex>
      </Label>
      <Label at={v} anchor="top-right" offset={[-6, 6]} color={COLORS.u}>
        <Tex>{'\\vec v'}</Tex>
      </Label>
      <MovablePoint
        x={v[0]}
        y={v[1]}
        onMove={(x, y) => onTheta(Math.atan2(y, x))}
        constrain={constrain}
        step={0.1}
        color={COLORS.u}
        size={6}
        label="Tip of the probe vector v (it stays on the unit circle)"
      />
    </Plot>
  )
}

export default function EigenvectorsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The directions that don't turn">
        <Prose>
          <p>
            Apply a matrix to most arrows and they get knocked off their line: they turn as well as
            stretch. But many matrices have a few special directions where arrows{' '}
            <em>stay on their own line</em>, only getting longer, shorter or flipped.
          </p>
          <p>
            Those are the <strong>eigenvectors</strong>, and the stretch factor is the{' '}
            <strong>eigenvalue</strong> <Tex>\lambda</Tex>. They are the “grain” of a
            transformation: along them, a complicated matrix acts like plain multiplication by a
            number.
          </p>
        </Prose>
      </LabSection>
      <EigenHunt />
      <PowerIteration />
      <LabSection id="formalize" eyebrow="Formalize" title="Finding them with algebra">
        <Formula
          tex={'A\\vec v = \\lambda\\vec v \\qquad (\\vec v \\ne \\vec 0)'}
          caption="$\vec v$ stays on its line; $\lambda$ is how much it stretches (negative means it flips)."
        />
        <Prose>
          <p>
            Rewrite it as <Tex>{'(A - \\lambda I)\\vec v = \\vec 0'}</Tex>. A non-zero arrow gets
            squashed to nothing, so <Tex>{'A - \\lambda I'}</Tex> must squash the plane: its
            determinant is zero. For a 2×2 matrix that is a quadratic equation in <Tex>\lambda</Tex>
            :
          </p>
        </Prose>
        <Formula
          tex={'\\det(A - \\lambda I) = \\lambda^2 - (a + d)\\,\\lambda + (ad - bc) = 0'}
          caption="The characteristic equation. Its two roots add up to the trace $a + d$ and multiply to $\det A$."
        />
        <Prose>
          <p>
            For <Tex>{'\\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}'}</Tex>:{' '}
            <Tex>{'\\lambda^2 - 4\\lambda + 3 = (\\lambda - 1)(\\lambda - 3) = 0'}</Tex>, so{' '}
            <Tex>\lambda = 3</Tex> (along <Tex>(1, 1)</Tex>) and <Tex>\lambda = 1</Tex> (along{' '}
            <Tex>(1, -1)</Tex>), exactly what the hunt found.
          </p>
        </Prose>
        <Callout kind="insight">
          <p>
            When the quadratic has no real roots (a negative discriminant), there are no real
            eigenvectors: the matrix turns <em>every</em> direction, like a rotation.
          </p>
        </Callout>
        <Callout kind="misconception">
          <p>
            An eigenvector is really a whole direction, not one arrow: double it, halve it or flip
            it and it is still an eigenvector with the same <Tex>\lambda</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet eigenvectors">
        <RealWorld
          items={[
            {
              title: 'Google PageRank',
              body: "A page's importance is its entry in the top eigenvector of the web's link matrix, found by power iteration, just like above.",
            },
            {
              title: 'Vibrations and bridges',
              body: 'The natural ways a guitar string, building or bridge vibrates are eigenvectors; their eigenvalues set the frequencies engineers must avoid.',
            },
            {
              title: 'Data science',
              body: 'Principal component analysis finds the directions in which data varies most: eigenvectors of its covariance matrix.',
            },
            {
              title: 'Population growth',
              body: 'In age-structured population models, the top eigenvalue is the long-run growth rate and its eigenvector the stable age mix.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An eigenvector stays on its own line: $A\\vec v = \\lambda\\vec v$.',
            'The eigenvalue $\\lambda$ is the stretch factor; negative means it flips, 0 means it is squashed.',
            'Eigenvalues solve $\\det(A - \\lambda I) = 0$; for 2×2 matrices that is a quadratic.',
            'They add up to the trace and multiply to the determinant.',
            'Applying $A$ again and again lines any arrow up with the dominant eigenvector.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function EigenHunt() {
  const [presetId, setPresetId] = useState<string | null>('diagonal')
  const [m, setM] = useState<Mat2>(PRESETS[0].m)
  const [theta, setTheta] = useState(0.35)
  const [found, setFound] = useState<Found[]>([])
  const [sweep, setSweep] = useState<{ from: number; done: number; running: boolean } | null>(null)
  const [sweptRotation, setSweptRotation] = useState(false)
  const v = unit(theta)
  const av = apply(m, v)
  const angle = lineAngleDeg(v, av)
  const aligned = angle < ALIGN_DEG || norm(av) < 1e-9
  const eig = eigen2(m)

  const changeMatrix = (next: Mat2, id: string | null) => {
    setM(next)
    setPresetId(id)
    setFound([])
    setSweep(null)
  }
  const moveProbe = (a: number) => {
    setTheta(a)
    setFound((list) => withFound(list, m, a))
  }

  useAnimationFrame((dt) => {
    if (!sweep) return
    const step = Math.min(dt * 1.1, TAU - sweep.done)
    const next = theta + step
    // Record every eigen-direction the probe passes during this frame.
    const crossed = eigenDirections(m)
      .map((e) => heading(e))
      .map((phi) => phi + Math.PI * Math.ceil((theta - phi) / Math.PI))
      .filter((a) => a <= next)
    setFound((list) => crossed.reduce((acc, a) => withFound(acc, m, a), list))
    setTheta(next)
    const done = sweep.done + step
    if (done >= TAU - 1e-9) {
      setSweep({ ...sweep, done: TAU, running: false })
      if (eig.kind === 'complex') setSweptRotation(true)
    } else setSweep({ ...sweep, done })
  }, sweep?.running ?? false)

  return (
    <LabSection id="explore" eyebrow="Explore" title="Hunt for the special directions">
      <Prose>
        <p>
          Drag the tip of <Tex>{'\\vec v'}</Tex> around the circle and watch <Tex>{'A\\vec v'}</Tex>
          . Usually it points somewhere else. Find the directions where <Tex>{'A\\vec v'}</Tex>{' '}
          lands on the dashed line through <Tex>{'\\vec v'}</Tex>: the line lights up yellow. Or
          press <strong>Sweep</strong> to turn <Tex>{'\\vec v'}</Tex> all the way round.
        </p>
      </Prose>
      <PredictReveal
        question="A shear $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ slides the plane sideways. How many eigen-directions does it have?"
        options={['None', 'Exactly one', 'Two', 'Every direction']}
        answer={1}
        explanation="Only horizontal arrows stay put (with $\lambda = 1$); every other arrow gets tilted. Pick the shear below and sweep to see it."
      />
      <Figure>
        <ProbePlot
          m={m}
          theta={theta}
          onTheta={moveProbe}
          found={found}
          trail={sweep ? [sweep.from, sweep.from + sweep.done] : undefined}
        />
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Example matrices">
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={presetId === p.id ? 'soft' : 'ghost'}
                aria-pressed={presetId === p.id}
                onClick={() => changeMatrix(p.m, p.id)}
              >
                {p.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <MatrixEditor m={m} onChange={(next) => changeMatrix(next, null)} />
            <Button
              size="sm"
              variant="primary"
              icon={<Play className="size-4" />}
              disabled={sweep?.running}
              onClick={() => setSweep({ from: theta, done: 0, running: true })}
            >
              Sweep v around
            </Button>
          </div>
          <Readouts
            items={[
              {
                label: (
                  <>
                    angle between <Tex>{'\\vec v'}</Tex> and <Tex>{'A\\vec v'}</Tex> lines
                  </>
                ),
                value: `${num(angle, 1)}°`,
                color: aligned ? EIGEN_COLOR : undefined,
              },
              {
                label: aligned ? (
                  <>
                    eigenvalue <Tex>\lambda</Tex>
                  </>
                ) : (
                  <>
                    length of <Tex>{'A\\vec v'}</Tex>
                  </>
                ),
                value: num(aligned ? dot(av, v) : norm(av)),
              },
              {
                label: 'eigenvalues of A',
                value:
                  eig.kind === 'real'
                    ? `${num(eig.values[0])}, ${num(eig.values[1])}`
                    : 'none are real',
              },
            ]}
          />
          {found.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-2">Found:</span>
              {found.map((f) => {
                const d = unit(f.angle)
                return (
                  <span
                    key={f.angle}
                    className="rounded-full border border-line bg-surface-2 px-3 py-1"
                  >
                    <Tex>{`(${num(d[0])}, ${num(d[1])})\\;\\; \\lambda = ${num(f.lambda)}`}</Tex>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-one" when={found.length >= 1}>
          Find a direction where <Tex>{'A\\vec v'}</Tex> lands on the line of <Tex>{'\\vec v'}</Tex>
          .
        </TryThis>
        <TryThis id="t-two" when={found.length >= 2}>
          Find a second, different eigen-direction for the same matrix.
        </TryThis>
        <TryThis id="t-negative" when={found.some((f) => f.lambda < -0.01)}>
          Find an eigenvector that gets flipped: <Tex>{'A\\vec v'}</Tex> points the opposite way (
          <Tex>{'\\lambda < 0'}</Tex>).
        </TryThis>
        <TryThis id="t-none" when={sweptRotation}>
          Pick the rotation and sweep. Does any direction survive?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const POWER_PRESETS: { id: string; name: string; m: Mat2 }[] = [
  { id: 'lopsided', name: 'Lopsided stretch', m: [3, 1, 0, 2] },
  { id: 'diagonal', name: 'Diagonal stretch', m: [2, 1, 1, 2] },
]
const POWER_VIEW = { xMin: -4, xMax: 4, yMin: -2.5, yMax: 2.5 }
const startConstraint = constraints.compose(
  constraints.snapToGrid(0.5),
  constraints.within(-3.5, 3.5, -2, 2),
  // The zero vector has no direction to iterate.
  (p) => (p[0] === 0 && p[1] === 0 ? [0.5, 0] : p),
)

function PowerIteration() {
  const [presetId, setPresetId] = useState('lopsided')
  const [start, setStart] = useState<Vec2>([-1, 2])
  const [steps, setSteps] = useState(0)
  const m = POWER_PRESETS.find((p) => p.id === presetId)!.m
  const eig = eigen2(m)
  // Both presets have two real, positive eigenvalues; eigen2 lists the larger one first.
  const [dominant, other] =
    eig.kind === 'real' ? eig.vectors.map((v) => v && canonical(v)) : [null, null]
  const lambda1 = eig.kind === 'real' ? eig.values[0] : 0
  const seq = Array.from({ length: steps }).reduce<Vec2[]>(
    (acc) => [...acc, normalize(apply(m, acc[acc.length - 1]))],
    [normalize(start)],
  )
  const last = seq[seq.length - 1]
  const stretch = norm(apply(m, last))
  const off = dominant ? lineAngleDeg(last, dominant) : 90
  const startOnOther = other !== null && lineAngleDeg(start, other) < 0.5
  const shown = (u: Vec2): Vec2 => [u[0] * 2.2, u[1] * 2.2]

  return (
    <LabSection id="repeat" eyebrow="Explore" title="Apply it again, and again">
      <Prose>
        <p>
          Start with any arrow and keep applying <Tex>A</Tex>, rescaling each time so the arrow
          stays a sensible size. Each press of <strong>Step</strong> applies <Tex>A</Tex> once;
          older arrows fade.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={POWER_VIEW}
          aspect="equal"
          ariaLabel={`After ${steps} steps the arrow is ${num(off, 1)} degrees from the dominant eigen-direction`}
        >
          {[dominant, other].map(
            (d, k) =>
              d && (
                <InfiniteLine
                  key={k}
                  through={[0, 0]}
                  direction={d}
                  color={EIGEN_COLOR}
                  width={k === 0 ? 2 : 1.5}
                  dashed
                  opacity={k === 0 ? 0.9 : 0.5}
                />
              ),
          )}
          {seq.map((u, k) => (
            <Vector
              key={k}
              to={shown(u)}
              color={k === seq.length - 1 ? COLORS.u : 'var(--ink-3)'}
              width={k === seq.length - 1 ? 3 : 1.75}
              opacity={k === seq.length - 1 ? 1 : 0.25 + (0.5 * (k + 1)) / seq.length}
            />
          ))}
          {dominant && (
            <Label at={shown(dominant)} anchor="bottom-left" offset={[10, -8]}>
              <Tex>{`\\lambda = ${num(lambda1)}`}</Tex>
            </Label>
          )}
          {steps === 0 && (
            <MovablePoint
              x={start[0]}
              y={start[1]}
              onMove={(x, y) => setStart([x, y])}
              constrain={startConstraint}
              step={0.5}
              color={COLORS.u}
              size={6}
              label="Starting arrow"
            />
          )}
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {POWER_PRESETS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={presetId === p.id ? 'soft' : 'ghost'}
                aria-pressed={presetId === p.id}
                onClick={() => {
                  setPresetId(p.id)
                  setSteps(0)
                }}
              >
                {p.name}
              </Button>
            ))}
            <span className="ml-1 text-[0.95rem]">
              <Tex>{`A = ${mat(m, 0)}`}</Tex>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<StepForward className="size-4" />}
              disabled={steps >= 30}
              onClick={() => setSteps((s) => s + 1)}
            >
              Step
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={steps >= 30}
              onClick={() => setSteps((s) => Math.min(30, s + 5))}
            >
              Step ×5
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              disabled={steps === 0}
              onClick={() => setSteps(0)}
            >
              Reset
            </Button>
            <span className={cn('text-sm text-ink-2', steps > 0 && 'sr-only')}>
              Drag the arrow's tip to choose where to start.
            </span>
          </div>
          <Readouts
            items={[
              { label: 'steps', value: String(steps) },
              { label: 'angle to the dominant line', value: `${num(off, 1)}°` },
              {
                label: (
                  <>
                    last stretch <Tex>{'|A\\vec v| / |\\vec v|'}</Tex>
                  </>
                ),
                value: num(stretch, 3),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-settle" when={steps >= 3 && off < 1 && !startOnOther}>
          Keep stepping until the arrow stops turning. Which line does it settle on, and what does
          the stretch settle to?
        </TryThis>
        <TryThis id="t-other" when={startOnOther && steps >= 1}>
          Start exactly on the <em>other</em> eigen-direction, then step. Why does the arrow never
          move?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          Every arrow is a mix of the two eigen-directions. Each step multiplies the first part by{' '}
          <Tex>{'\\lambda_1'}</Tex> and the second by <Tex>{'\\lambda_2'}</Tex>, so the part with
          the bigger eigenvalue wins. This <strong>power iteration</strong> is how the first
          versions of Google ranked the web.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const [theta, setTheta] = useState(2.6)
  const A: Mat2 = [2, 0, 1, 1]
  const v = unit(theta)
  const solved = lineAngleDeg(v, apply(A, v)) < ALIGN_DEG
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <InteractiveChallenge
          id="c-find"
          index={1}
          prompt="For $A = \begin{bmatrix} 2 & 0 \\ 1 & 1 \end{bmatrix}$, turn $\vec v$ until $A\vec v$ lies on the line of $\vec v$."
          solved={solved}
          hint="Try straight up, or the diagonal between the axes."
          explanation="$(0, 1)$ stays put ($\lambda = 1$) and $(1, 1)$ doubles ($\lambda = 2$). Either one is an eigenvector."
          onReset={() => setTheta(2.6)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <ProbePlot m={A} theta={theta} onTheta={setTheta} />
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-diag"
          index={2}
          prompt="What is the larger eigenvalue of $\begin{bmatrix} 3 & 0 \\ 0 & 5 \end{bmatrix}$?"
          answer={5}
          hint="A diagonal matrix just stretches each axis. Which axis stretches more?"
          explanation="It stretches x by 3 and y by 5, so the axes are the eigenvectors, with $\lambda = 3$ and $\lambda = 5$."
        />
        <McqChallenge
          id="c-rotation"
          index={3}
          prompt="How many real eigen-directions does a 90° rotation have?"
          options={[
            { text: 'None', correct: true },
            {
              text: 'One',
              why: 'Which arrow would survive a quarter turn without leaving its line?',
            },
            { text: 'Two', why: 'Every arrow gets turned by 90°, off its own line.' },
            {
              text: 'Every direction',
              why: 'That would need $A = \\lambda I$, which only stretches.',
            },
          ]}
          explanation="Every arrow turns by 90°, so none stays on its line. Algebraically, $\lambda^2 + 1 = 0$ has no real roots."
        />
        <NumericChallenge
          id="c-trace"
          index={4}
          prompt="The two eigenvalues of $\begin{bmatrix} 3 & 1 \\ 2 & 1 \end{bmatrix}$ add up to what?"
          answer={4}
          hint="You don't need to find them: the eigenvalues add up to the trace, $a + d$."
          explanation="$\lambda_1 + \lambda_2 = 3 + 1 = 4$. (They are $2 \pm \sqrt 3$.)"
        />
        <McqChallenge
          id="c-negative"
          index={5}
          prompt="An eigenvector has eigenvalue $\lambda = -1$. What does $A$ do to it?"
          options={[
            { text: 'Flips it to point the opposite way, same length', correct: true },
            { text: 'Leaves it unchanged', why: 'That is $\\lambda = 1$.' },
            { text: 'Squashes it to zero', why: 'That is $\\lambda = 0$.' },
            {
              text: 'Turns it by 90°',
              why: 'Then it would leave its line, so it would not be an eigenvector.',
            },
          ]}
          explanation="$A\vec v = -\vec v$: same line, same length, opposite direction."
        />
      </ChallengeSet>
    </LabSection>
  )
}
