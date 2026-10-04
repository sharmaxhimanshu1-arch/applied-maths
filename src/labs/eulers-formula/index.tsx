import { useState } from 'react'
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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  Circle,
  Label,
  MovablePoint,
  ParametricCurve,
  Plot,
  Point,
  Polyline,
  Segment,
  Vector,
} from '@/viz'
import { DEG } from '../_shared/geometry'
import { wrapDeg } from '../_shared/trig'

const TARGET = 'var(--c-blue)'
const STEPS = 'var(--c-orange)'
const Z_COL = 'var(--c-blue)'
const W_COL = 'var(--c-orange)'
const ZW_COL = 'var(--c-violet)'

/** Complex number as a + bi in plain text. */
function cx([a, b]: Vec2, d = 3): string {
  const re = formatNumber(Math.abs(a) < 1e-12 ? 0 : a, d)
  const im = Math.abs(b) < 1e-12 ? 0 : b
  return `${re} ${im < 0 ? '−' : '+'} ${formatNumber(Math.abs(im), d)}i`
}

/** The points 1, q, q², …, qⁿ for q = 1 + iθ/n: n small turn-and-stretch steps. */
function chain(theta: number, n: number): Vec2[] {
  const out: Vec2[] = [[1, 0]]
  const q: Vec2 = [1, theta / n]
  for (let k = 0; k < n; k++) {
    const [a, b] = out[out.length - 1]
    out.push([a * q[0] - b * q[1], a * q[1] + b * q[0]])
  }
  return out
}

export default function EulersFormulaLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Imaginary exponents turn">
        <Prose>
          <p>
            <Tex>{'e^{i\\pi} + 1 = 0'}</Tex> ties together five of the most important numbers in
            mathematics in one line. It looks like a magic trick, but it is really a picture:
            raising <Tex>{'e'}</Tex> to an <em>imaginary</em> power means{' '}
            <strong>walking around a circle</strong>.
          </p>
          <p>
            Real exponents make things grow or shrink. Multiplying by <Tex>{'i'}</Tex> turns a
            number a quarter turn on the complex plane. Put the two ideas together and{' '}
            <Tex>{'e^{i\\theta}'}</Tex> turns out to be the point at angle <Tex>{'\\theta'}</Tex> on
            the unit circle: <Tex>{'\\cos\\theta + i\\sin\\theta'}</Tex>.
          </p>
        </Prose>
      </LabSection>
      <StepsExplorer />
      <MultiplyExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Euler's formula">
        <Formula
          tex={'e^{i\\theta} = \\cos\\theta + i\\sin\\theta'}
          caption="The point at angle θ (in radians) on the unit circle."
        />
        <Prose>
          <ul>
            <li>
              <strong>Why:</strong> <Tex>{'e^x'}</Tex> is the limit of <Tex>{'(1 + x/n)^n'}</Tex>.
              With <Tex>{'x = i\\theta'}</Tex>, each factor <Tex>{'1 + i\\theta/n'}</Tex> is a tiny
              turn by about <Tex>{'\\theta/n'}</Tex> radians, and <Tex>{'n'}</Tex> of them turn you
              by <Tex>{'\\theta'}</Tex>. (The power series of <Tex>{'e^x'}</Tex>,{' '}
              <Tex>{'\\cos'}</Tex> and <Tex>{'\\sin'}</Tex> give a second proof.)
            </li>
            <li>
              <strong>At</strong> <Tex>{'\\theta = \\pi'}</Tex> you are half way round, at{' '}
              <Tex>{'-1'}</Tex>: <Tex>{'e^{i\\pi} = -1'}</Tex>, so <Tex>{'e^{i\\pi} + 1 = 0'}</Tex>.
            </li>
            <li>
              <strong>Polar form:</strong> every complex number is <Tex>{'z = re^{i\\theta}'}</Tex>,
              a length times a direction. Then{' '}
              <Tex>
                {'r_1e^{i\\alpha} \\cdot r_2e^{i\\beta} = r_1r_2\\,e^{i(\\alpha + \\beta)}'}
              </Tex>
              : multiply the lengths, add the angles.
            </li>
            <li>
              <strong>Powers:</strong>{' '}
              <Tex>{'(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta'}</Tex> (de
              Moivre), and cosine and sine are averages of two spinning arrows:{' '}
              <Tex>{'\\cos\\theta = \\tfrac{e^{i\\theta} + e^{-i\\theta}}{2}'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="e to an imaginary power doesn't grow">
          <p>
            <Tex>{'e^{10}'}</Tex> is huge, but <Tex>{'e^{10i}'}</Tex> has length exactly 1: it is
            just a point on the unit circle, about one and a half turns round. The real part of an
            exponent stretches; the imaginary part rotates.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where Euler's formula works">
        <RealWorld
          items={[
            {
              title: 'Electrical engineering',
              body: 'AC voltages are written $Ve^{i\\omega t}$: an arrow spinning at $\\omega$ rad/s whose shadow is the sine wave. Circuits become algebra instead of trig.',
            },
            {
              title: 'Signal processing',
              body: 'The Fourier transform breaks a sound into spinning arrows $e^{i\\omega t}$; that is how MP3s, JPEGs and phone calls compress data.',
            },
            {
              title: 'Quantum mechanics',
              body: 'A particle’s state carries a phase $e^{i\\theta}$; interference is adding rotating arrows that may cancel.',
            },
            {
              title: 'Graphics and robotics',
              body: 'Rotating a 2D point by $\\theta$ is multiplying by $e^{i\\theta}$; quaternions extend the idea to 3D.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$e^{i\\theta} = \\cos\\theta + i\\sin\\theta$: the point at angle $\\theta$ on the unit circle.',
            '$e^{i\\pi} = -1$, a half turn.',
            'Any complex number is $re^{i\\theta}$; multiplying multiplies lengths and adds angles.',
            'Imaginary exponents rotate; real exponents stretch.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function StepsExplorer() {
  const [theta, setTheta] = useState(Math.round((Math.PI / 3) * 100) / 100)
  const [n, setN] = useState(4)
  const pts = chain(theta, n)
  const end = pts[pts.length - 1]
  const target: Vec2 = [Math.cos(theta), Math.sin(theta)]
  const gap = Math.hypot(end[0] - target[0], end[1] - target[1])
  return (
    <LabSection id="explore" eyebrow="Explore" title="Many tiny turns">
      <Prose>
        <p>
          <Tex>{'e^{i\\theta}'}</Tex> is the limit of <Tex>{'(1 + i\\theta/n)^n'}</Tex>. Start at 1
          and multiply by <Tex>{'1 + i\\theta/n'}</Tex> again and again, <Tex>{'n'}</Tex> times.
          Each multiplication turns the point a little and stretches it a tiny bit. The orange path
          shows the steps; the blue point is <Tex>{'\\cos\\theta + i\\sin\\theta'}</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="Set $\theta = \pi$ and make $n$ huge. Where does the end of the orange path go?"
        options={['$1$', '$i$', '$-1$', 'Off to infinity']}
        answer={2}
        explanation="The steps become a smooth walk round the unit circle, and $\pi$ radians is half way round: $e^{i\pi} = -1$."
      />
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -2.3, xMax: 2.3, yMin: -2.3, yMax: 2.3 }}
            aspect="equal"
            xLabel="Re"
            yLabel="Im"
            ariaLabel={`${n} steps of 1 plus i theta over n, theta ${formatNumber(theta, 2)}`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1.5} />
            <ParametricCurve
              x={Math.cos}
              y={Math.sin}
              tMin={0}
              tMax={theta}
              color={TARGET}
              width={4}
              opacity={0.35}
            />
            <Polyline points={pts} color={STEPS} width={2.5} />
            {n <= 24 && pts.map((p, i) => <Point key={i} at={p} r={3} color={STEPS} />)}
            <Point at={end} r={5} color={STEPS} />
            <Point at={target} r={6} color={TARGET} />
            <Label at={target} anchor="left" offset={[10, 0]} color={TARGET} className="text-xs">
              <Tex>{'e^{i\\theta}'}</Tex>
            </Label>
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'\\theta'}</Tex>}
            name="Angle theta"
            value={theta}
            min={0}
            max={6.28}
            step={0.01}
            onChange={setTheta}
            color={TARGET}
          />
          <Slider
            label={<Tex>{'n'}</Tex>}
            name="Number of steps n"
            value={n}
            min={1}
            max={100}
            step={1}
            onChange={setN}
            color={STEPS}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: '(1 + iθ/n)ⁿ', value: cx(end), color: STEPS },
              { label: 'cos θ + i sin θ', value: cx(target), color: TARGET },
              { label: 'gap', value: formatNumber(gap, 3) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-pi-lab" when={Math.abs(theta - Math.PI) < 0.02}>
          Set <Tex>{'\\theta = \\pi'}</Tex>. Where does <Tex>{'e^{i\\pi}'}</Tex> land?
        </TryThis>
        <TryThis id="t-steps-lab" when={gap < 0.05}>
          Raise <Tex>{'n'}</Tex> until the orange path ends within 0.05 of the blue point.
        </TryThis>
        <TryThis id="t-i-lab" when={Math.abs(theta - Math.PI / 2) < 0.02}>
          Find <Tex>{'\\theta'}</Tex> so that <Tex>{'e^{i\\theta} = i'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Polar = { r: number; deg: number }

/** Polar snap for an arrow tip: length in quarters, angle in 5° steps. */
const snapPolar = ([x, y]: Vec2): Vec2 => {
  const { r, deg } = toPolar([x, y])
  return [r * Math.cos(deg * DEG), r * Math.sin(deg * DEG)]
}

function toPolar([x, y]: Vec2): Polar {
  return {
    r: clamp(Math.round(Math.hypot(x, y) * 4) / 4, 0.5, 1.75),
    deg: wrapDeg(Math.round(Math.atan2(y, x) / DEG / 5) * 5),
  }
}

const tip = (p: Polar): Vec2 => [p.r * Math.cos(p.deg * DEG), p.r * Math.sin(p.deg * DEG)]

function MultiplyExplorer() {
  const [z, setZ] = useState<Polar>({ r: 1.5, deg: 30 })
  const [w, setW] = useState<Polar>({ r: 1, deg: 60 })
  const prod: Polar = { r: z.r * w.r, deg: wrapDeg(z.deg + w.deg) }
  const Z = tip(z)
  const W = tip(w)
  const P = tip(prod)
  return (
    <LabSection id="multiply" eyebrow="Explore" title="Multiply: stretch and turn">
      <Prose>
        <p>
          Write complex numbers as <Tex>{'re^{i\\theta}'}</Tex>, a length and an angle. Drag the
          tips of <Tex>{'z'}</Tex> (blue) and <Tex>{'w'}</Tex> (orange). The violet arrow is the
          product <Tex>{'zw'}</Tex>. Compare its length and angle with theirs.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -3.3, xMax: 3.3, yMin: -3.3, yMax: 3.3 }}
            aspect="equal"
            xLabel="Re"
            yLabel="Im"
            ariaLabel={`z has length ${z.r} at ${z.deg} degrees, w has length ${w.r} at ${w.deg} degrees, product length ${formatNumber(prod.r)} at ${prod.deg} degrees`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1} dashed />
            {prod.deg > 0 && (
              <AngleArc center={[0, 0]} from={0} to={prod.deg * DEG} radius={22} color={ZW_COL} />
            )}
            <Vector to={P} color={ZW_COL} width={3.5} />
            <Vector to={Z} color={Z_COL} />
            <Vector to={W} color={W_COL} />
            <Label
              at={P}
              anchor="center"
              offset={[P[0] >= 0 ? 18 : -18, P[1] >= 0 ? -12 : 12]}
              color={ZW_COL}
            >
              zw
            </Label>
            <MovablePoint
              x={Z[0]}
              y={Z[1]}
              onMove={(x, y) => setZ(toPolar([x, y]))}
              constrain={snapPolar}
              color={Z_COL}
              label="Tip of z"
            />
            <MovablePoint
              x={W[0]}
              y={W[1]}
              onMove={(x, y) => setW(toPolar([x, y]))}
              constrain={snapPolar}
              color={W_COL}
              label="Tip of w"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <div className="overflow-x-auto pt-3 text-center">
            <Tex>
              {`${z.r}e^{i\\,${z.deg}^\\circ} \\cdot ${w.r}e^{i\\,${w.deg}^\\circ} = ${formatNumber(prod.r, 4)}e^{i\\,${prod.deg}^\\circ}`}
            </Tex>
          </div>
          <Readouts
            items={[
              { label: 'z', value: `${z.r} at ${z.deg}°`, color: Z_COL },
              { label: 'w', value: `${w.r} at ${w.deg}°`, color: W_COL },
              { label: 'zw', value: `${formatNumber(prod.r, 4)} at ${prod.deg}°`, color: ZW_COL },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-minus-one" when={Math.abs(prod.r - 1) < 1e-9 && prod.deg === 180}>
          Make the product exactly <Tex>{'-1'}</Tex>.
        </TryThis>
        <TryThis id="t-square" when={z.r === w.r && z.deg === w.deg && z.deg !== 0}>
          Put <Tex>{'w'}</Tex> right on top of <Tex>{'z'}</Tex>, so the product is{' '}
          <Tex>{'z^2'}</Tex>. What happens to the angle?
        </TryThis>
        <TryThis id="t-shrink" when={prod.r < Math.min(z.r, w.r)}>
          Make the product shorter than both <Tex>{'z'}</Tex> and <Tex>{'w'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [w, setW] = useState<Polar>({ r: 1.5, deg: 0 })
  const z: Polar = { r: 1, deg: 60 }
  const prod: Polar = { r: z.r * w.r, deg: wrapDeg(z.deg + w.deg) }
  const W = tip(w)
  const P = tip(prod)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-quarter"
          index={1}
          prompt="What is $e^{i\pi/2}$?"
          options={[
            { text: '$i$', correct: true },
            { text: '$-1$', why: 'That is $e^{i\\pi}$, a half turn.' },
            { text: '$1$', why: 'That is $e^{0}$ (or $e^{2\\pi i}$).' },
            {
              text: '$e^{1.57}\\approx 4.8$',
              why: 'An imaginary exponent turns; it does not grow.',
            },
          ]}
          explanation="A quarter turn ($\tfrac{\pi}{2}$ radians) from 1 lands on $i$: $\cos\tfrac{\pi}{2} + i\sin\tfrac{\pi}{2} = 0 + i$."
        />
        <NumericChallenge
          id="c-abs-lab"
          index={2}
          prompt="What is $|e^{2.7i}|$, the distance from 0?"
          answer={1}
          explanation="$|\cos 2.7 + i\sin 2.7| = \sqrt{\cos^2 2.7 + \sin^2 2.7} = 1$. Every $e^{i\theta}$ is on the unit circle."
        />
        <NumericChallenge
          id="c-full-lab"
          index={3}
          prompt="What is $e^{2\pi i}$?"
          answer={1}
          explanation="$2\pi$ radians is a full turn, back to where you started: $\cos 2\pi + i\sin 2\pi = 1$."
        />
        <NumericChallenge
          id="c-real"
          index={4}
          prompt="What is the real part of $4e^{i\pi/3}$?"
          answer={2}
          tolerance={0.001}
          explanation="$4e^{i\pi/3} = 4(\cos\tfrac{\pi}{3} + i\sin\tfrac{\pi}{3}) = 2 + 2\sqrt3\,i$, so the real part is 2."
        />
        <McqChallenge
          id="c-power"
          index={5}
          prompt="What is $\left(e^{i\pi/4}\right)^8$?"
          options={[
            { text: '$1$', correct: true },
            { text: '$-1$', why: 'Eight eighth-turns is a full turn, not a half turn.' },
            { text: '$i$', why: 'That would take two eighth-turns.' },
            { text: '$e^{8}$', why: 'Multiplying angles by 8 just turns further.' },
          ]}
          explanation="Powers multiply the angle: $8 \times \tfrac{\pi}{4} = 2\pi$, a full turn, so the answer is 1."
        />
        <InteractiveChallenge
          id="c-to-i"
          index={6}
          prompt="$z = e^{i\,60^\circ}$ is fixed (blue). Drag $w$ (orange) so that $zw = i$."
          solved={Math.abs(prod.r - 1) < 1e-9 && prod.deg === 90}
          hint="$i$ has length 1 at $90^\circ$. Lengths multiply and angles add."
          explanation="$w$ needs length 1 and angle $90^\circ - 60^\circ = 30^\circ$: $w = e^{i\,30^\circ}$."
          onReset={() => setW({ r: 1.5, deg: 0 })}
        >
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -2.4, xMax: 2.4, yMin: -2.4, yMax: 2.4 }}
              aspect="equal"
              ariaLabel={`w has length ${w.r} at ${w.deg} degrees`}
            >
              <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1} dashed />
              <Segment from={[0, 0]} to={[0, 1]} color="var(--ink-3)" width={1} dashed />
              <Vector to={P} color={ZW_COL} width={3.5} />
              <Vector to={tip(z)} color={Z_COL} />
              <Vector to={W} color={W_COL} />
              <MovablePoint
                x={W[0]}
                y={W[1]}
                onMove={(x, y) => setW(toPolar([x, y]))}
                constrain={snapPolar}
                color={W_COL}
                label="Tip of w"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              w = {w.r} at {w.deg}°, zw = {formatNumber(prod.r, 3)} at {prod.deg}°
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
