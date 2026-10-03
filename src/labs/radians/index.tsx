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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Circle, Label, MovablePoint, ParametricCurve, Plot, Segment } from '@/viz'
import { DEG } from '../_shared/geometry'
import { piTex, wrapRad } from '../_shared/trig'

const ARC = 'var(--c-orange)'
const RADIUS = 'var(--c-blue)'
const SINE = 'var(--c-violet)'
const TICK = 'var(--c-magenta)'

const STEP = Math.PI / 12

/** Angle of a dragged point: hundredths of a radian, pulled onto multiples of π/12 when close. */
function angleOf([x, y]: Vec2): number {
  const t = Math.round(wrapRad(Math.atan2(y, x)) * 100) / 100
  const k = Math.round(t / STEP)
  if (Math.abs(t - k * STEP) < 0.02) return k === 24 ? 0 : k * STEP
  return t
}

/** k when θ is a multiple of π/12, otherwise null. */
function piMultiple(t: number): number | null {
  const k = Math.round(t / STEP)
  return Math.abs(t - k * STEP) < 1e-9 ? k : null
}

const onDial =
  (r: number, pick: (p: Vec2) => number) =>
  (p: Vec2): Vec2 => {
    const t = pick(p)
    return [r * Math.cos(t), r * Math.sin(t)]
  }

function AngleTex({ t }: { t: number }) {
  const k = piMultiple(t)
  return (
    <Tex>
      {k == null || k === 0 ? formatNumber(t, 2) : `${piTex(k, 12)} \\approx ${formatNumber(t, 2)}`}
    </Tex>
  )
}

export default function RadiansLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Measure an angle by walking the edge">
        <Prose>
          <p>
            Why 360 degrees in a full turn? Probably because the Babylonians liked numbers that
            divide nicely, and a year is roughly 360 days. It's a human choice, not a mathematical
            one.
          </p>
          <p>
            Mathematics has a more natural ruler. Stand at the centre of a circle, and measure how
            far a point travels <strong>along the edge</strong>, counted in radius-lengths. Walk one
            radius along the edge and you have turned <strong>1 radian</strong>. With this unit,
            formulas for arcs, spinning wheels and waves lose their awkward constants.
          </p>
        </Prose>
      </LabSection>
      <WrapExplorer />
      <SmallAngleExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Radians in symbols">
        <Formula
          tex={
            '\\theta = \\frac{s}{r} \\qquad 2\\pi \\text{ rad} = 360^\\circ \\qquad s = r\\theta'
          }
          caption="The angle in radians is arc length divided by radius."
        />
        <Prose>
          <ul>
            <li>
              The whole circumference is <Tex>{'2\\pi r'}</Tex>, so a full turn is{' '}
              <Tex>{'2\\pi'}</Tex> radians and a half turn is <Tex>{'\\pi'}</Tex>.
            </li>
            <li>
              <strong>Degrees to radians:</strong> multiply by <Tex>{'\\tfrac{\\pi}{180}'}</Tex>.{' '}
              <strong>Radians to degrees:</strong> multiply by <Tex>{'\\tfrac{180}{\\pi}'}</Tex>.
              One radian is about <Tex>{'57.3^\\circ'}</Tex>.
            </li>
            <li>
              Landmarks: <Tex>{'90^\\circ = \\tfrac{\\pi}{2}'}</Tex>,{' '}
              <Tex>{'60^\\circ = \\tfrac{\\pi}{3}'}</Tex>,{' '}
              <Tex>{'45^\\circ = \\tfrac{\\pi}{4}'}</Tex>,{' '}
              <Tex>{'30^\\circ = \\tfrac{\\pi}{6}'}</Tex>.
            </li>
            <li>
              A radian is a length divided by a length, so it has no real unit. That is why calculus
              can write <Tex>{'\\tfrac{d}{dx}\\sin x = \\cos x'}</Tex> with no conversion factor; in
              degrees it would be <Tex>{'\\tfrac{\\pi}{180}\\cos x'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="The π is just a number">
          <p>
            <Tex>{'\\tfrac{\\pi}{2}'}</Tex> radians isn't a special kind of quantity: it's about
            1.57, a turn of 1.57 radius-lengths along the edge. We write angles as fractions of{' '}
            <Tex>{'\\pi'}</Tex> because they come out neat, but 1 radian, 2 radians and 2.5 radians
            are perfectly good angles too.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet radians">
        <RealWorld
          items={[
            {
              title: 'Wheels and gears',
              body: 'A wheel of radius $r$ turning through $\\theta$ radians rolls a distance $r\\theta$. Spin it at $\\omega$ rad/s and the rim moves at $r\\omega$.',
            },
            {
              title: 'Programming',
              body: 'Math.sin, numpy.sin and every graphics library take radians. Passing degrees by mistake is a classic bug.',
            },
            {
              title: 'Pendulums',
              body: 'For small swings, $\\sin\\theta \\approx \\theta$ (in radians), which turns the pendulum equation into a simple one with a fixed period.',
            },
            {
              title: 'Astronomy',
              body: 'An object of size $s$ at distance $d$ covers about $s/d$ radians of sky: the Moon is about 0.009 rad (half a degree) wide.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'One radian is the angle whose arc is one radius long.',
            'A full turn is $2\\pi$ radians, so $180^\\circ = \\pi$.',
            'Arc length is $s = r\\theta$, with $\\theta$ in radians.',
            'For small angles in radians, $\\sin\\theta \\approx \\theta$: the reason calculus uses radians.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function WrapExplorer() {
  const [t, setT] = useState(2)
  const [r, setR] = useState(2)
  const [resized, setResized] = useState(false)
  const k = piMultiple(t)
  const ticks = [1, 2, 3, 4, 5, 6]
  return (
    <LabSection id="explore" eyebrow="Explore" title="Count radius-lengths around the edge">
      <Prose>
        <p>
          Drag the point around the circle. The orange arc is how far it has travelled along the
          edge; the pink ticks mark every whole radius-length. The angle in radians is simply how
          many radius-lengths the arc is.
        </p>
      </Prose>
      <PredictReveal
        question="How many radius-lengths of string would it take to wrap all the way around a circle?"
        options={['Exactly 3', 'A bit more than 6', 'Exactly 4', '360']}
        answer={1}
        explanation="The circumference is $2\pi r \approx 6.28\,r$: six radius-lengths and a bit. So a full turn is $2\pi \approx 6.28$ radians."
      />
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -3.7, xMax: 3.7, yMin: -3.7, yMax: 3.7 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`An angle of ${formatNumber(t, 2)} radians on a circle of radius ${r}`}
          >
            <Circle center={[0, 0]} r={r} stroke="var(--ink-3)" strokeWidth={1.5} />
            {t > 0 && (
              <ParametricCurve
                x={(s) => r * Math.cos(s)}
                y={(s) => r * Math.sin(s)}
                tMin={0}
                tMax={t}
                color={ARC}
                width={6}
                opacity={0.85}
              />
            )}
            {ticks.map((n) => (
              <Segment
                key={n}
                from={[0.88 * r * Math.cos(n), 0.88 * r * Math.sin(n)]}
                to={[1.12 * r * Math.cos(n), 1.12 * r * Math.sin(n)]}
                color={TICK}
                width={2}
              />
            ))}
            {ticks.map((n) => (
              <Label
                key={n}
                at={[(r + 0.45) * Math.cos(n), (r + 0.45) * Math.sin(n)]}
                anchor="center"
                color={TICK}
                className="text-xs"
              >
                {n}
              </Label>
            ))}
            <Segment from={[0, 0]} to={[r, 0]} color={RADIUS} width={2.5} />
            <Segment
              from={[0, 0]}
              to={[r * Math.cos(t), r * Math.sin(t)]}
              color={RADIUS}
              width={2.5}
            />
            <Label at={[r / 2, 0]} anchor="top" offset={[0, 4]} color={RADIUS} className="text-xs">
              r = {formatNumber(r)}
            </Label>
            <MovablePoint
              x={r * Math.cos(t)}
              y={r * Math.sin(t)}
              onMove={(x, y) => setT(angleOf([x, y]))}
              constrain={onDial(r, angleOf)}
              color={ARC}
              label="Point on the circle"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Radius r"
            value={r}
            min={1}
            max={3}
            step={0.5}
            onChange={(v) => {
              setR(v)
              setResized(true)
            }}
            color={RADIUS}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'arc s', value: formatNumber(r * t, 2), color: ARC },
              { label: 's ÷ r = θ (rad)', value: <AngleTex t={t} />, color: TICK },
              { label: 'degrees', value: `${formatNumber(t / DEG, 1)}°` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-one" when={t === 1}>
          Turn exactly 1 radian, so the arc is one radius long. About how many degrees is that?
        </TryThis>
        <TryThis id="t-half" when={k === 12}>
          Turn half a circle. How many radians is it?
        </TryThis>
        <TryThis id="t-six" when={t > 6}>
          Go past the 6 tick. How much of the circle is left before a full turn?
        </TryThis>
        <TryThis id="t-radius" when={resized}>
          Change the radius. Which readouts change, and which one stays put?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function SmallAngleExplorer() {
  const [t, setT] = useState(0.8)
  const w = Math.min(t, 1)
  const view = { xMin: 1 - 1.3 * w, xMax: 1 + 0.15 * w, yMin: -0.15 * w, yMax: 1.15 * w }
  const s = Math.sin(t)
  const c = Math.cos(t)
  return (
    <LabSection id="small" eyebrow="Explore" title="Small angles: sin θ ≈ θ">
      <Prose>
        <p>
          On a circle of radius 1, the arc for angle <Tex>{'\\theta'}</Tex> has length exactly{' '}
          <Tex>{'\\theta'}</Tex>, and the violet drop from the point to the axis has length{' '}
          <Tex>{'\\sin\\theta'}</Tex>. Shrink the angle (the picture zooms in as you go) and watch
          the two lengths become almost the same.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={view}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`Arc of ${formatNumber(t, 2)} radians next to its sine, ${formatNumber(s, 3)}`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" strokeWidth={1.5} />
            <Segment from={[0, 0]} to={[1, 0]} color="var(--ink-3)" width={1.5} />
            <Segment from={[0, 0]} to={[c, s]} color="var(--ink-3)" width={1.5} />
            <ParametricCurve x={Math.cos} y={Math.sin} tMin={0} tMax={t} color={ARC} width={4} />
            <Segment from={[c, 0]} to={[c, s]} color={SINE} width={3} />
            <Label
              at={[Math.cos(t / 2), Math.sin(t / 2)]}
              anchor="left"
              offset={[8, 0]}
              color={ARC}
              className="text-xs"
            >
              arc θ
            </Label>
            <Label at={[c, s / 2]} anchor="right" offset={[-6, 0]} color={SINE} className="text-xs">
              sin θ
            </Label>
          </Plot>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label={<Tex>{'\\theta \\text{ (radians)}'}</Tex>}
            name="Angle in radians"
            value={t}
            min={0.02}
            max={1.5}
            step={0.01}
            onChange={setT}
            color={ARC}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'θ', value: `${formatNumber(t, 2)} rad`, color: ARC },
              { label: 'sin θ', value: s.toFixed(4), color: SINE },
              { label: 'sin θ ÷ θ', value: (s / t).toFixed(4) },
              { label: 'sin θ ÷ (θ in degrees)', value: (s / (t / DEG)).toFixed(4) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-close" when={s / t > 0.999}>
          Make <Tex>{'\\sin\\theta \\div \\theta'}</Tex> bigger than 0.999. How small did the angle
          have to be?
        </TryThis>
        <TryThis id="t-far" when={t >= 1.5}>
          Open the angle all the way. Is the sine shorter or longer than the arc?
        </TryThis>
      </TryThisList>
      <Prose>
        <p>
          Measured in radians, the ratio heads to exactly 1. Measured in degrees it heads to{' '}
          <Tex>{'\\tfrac{\\pi}{180} \\approx 0.0175'}</Tex>, an awkward constant that would follow
          sine around every formula in calculus. That's why scientists and programmers use radians.
        </p>
      </Prose>
    </LabSection>
  )
}

const pickTwelfth = ([x, y]: Vec2) => {
  const k = Math.round(wrapRad(Math.atan2(y, x)) / STEP) % 24
  return k * STEP
}

function Practice() {
  const R = 3
  const [t, setT] = useState(0)
  const k = Math.round(t / STEP)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-to-rad"
          index={1}
          prompt="Convert $90^\circ$ to radians, as a decimal."
          answer={Math.PI / 2}
          tolerance={0.01}
          explanation="$90 \times \tfrac{\pi}{180} = \tfrac{\pi}{2} \approx 1.571$."
        />
        <NumericChallenge
          id="c-to-deg"
          index={2}
          prompt="Convert $\tfrac{\pi}{3}$ radians to degrees."
          answer={60}
          unit="°"
          explanation="$\tfrac{\pi}{3} \times \tfrac{180}{\pi} = 60^\circ$."
        />
        <McqChallenge
          id="c-one"
          index={3}
          prompt="Roughly how big is an angle of 1 radian?"
          options={[
            { text: 'About $57^\\circ$', correct: true },
            {
              text: 'About $1^\\circ$',
              why: 'A radian is much bigger: the arc is a whole radius.',
            },
            { text: 'About $180^\\circ$', why: 'That is $\\pi$ radians, a bit over 3.' },
            {
              text: 'About $6^\\circ$',
              why: 'There are about 6.28 radians in a full turn, not 6 degrees in a radian.',
            },
          ]}
          explanation="$1 \times \tfrac{180}{\pi} \approx 57.3^\circ$, a bit less than a sixth of a turn."
        />
        <NumericChallenge
          id="c-arc"
          index={4}
          prompt="An arc on a circle of radius 5 cm subtends 2 radians at the centre. How long is the arc, in cm?"
          answer={10}
          unit="cm"
          explanation="$s = r\theta = 5 \times 2 = 10$ cm."
        />
        <NumericChallenge
          id="c-wheel"
          index={5}
          prompt="A bike wheel of radius 0.35 m turns through 20 radians. How far does the bike roll, in m?"
          answer={7}
          tolerance={0.01}
          unit="m"
          explanation="The ground under the wheel matches the arc: $s = r\theta = 0.35 \times 20 = 7$ m."
        />
        <InteractiveChallenge
          id="c-five-sixths"
          index={6}
          prompt="Drag the point to the angle $\tfrac{5\pi}{6}$ radians. (It clicks in steps of $\tfrac{\pi}{12}$.)"
          solved={k === 10}
          hint="$\pi$ is half a turn; $\tfrac{5\pi}{6}$ is five-sixths of that."
          explanation="$\tfrac{5\pi}{6} = 150^\circ$: five-sixths of the way to a half turn."
          onReset={() => setT(0)}
        >
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -3.8, xMax: 3.8, yMin: -3.8, yMax: 3.8 }}
              aspect="equal"
              grid={false}
              axes={false}
              ariaLabel={`Angle of ${k} twelfths of pi`}
            >
              <Circle center={[0, 0]} r={R} stroke="var(--ink-3)" strokeWidth={1.5} />
              {t > 0 && (
                <ParametricCurve
                  x={(s) => R * Math.cos(s)}
                  y={(s) => R * Math.sin(s)}
                  tMin={0}
                  tMax={t}
                  color={ARC}
                  width={5}
                />
              )}
              <Segment from={[0, 0]} to={[R, 0]} color={RADIUS} width={2} />
              <Segment
                from={[0, 0]}
                to={[R * Math.cos(t), R * Math.sin(t)]}
                color={RADIUS}
                width={2}
              />
              <MovablePoint
                x={R * Math.cos(t)}
                y={R * Math.sin(t)}
                onMove={(x, y) => setT(pickTwelfth([x, y]))}
                constrain={onDial(R, pickTwelfth)}
                color={ARC}
                label="Point on the circle"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              Angle: <Tex>{`${piTex(k, 12)} \\approx ${formatNumber(t, 2)}`}</Tex> rad
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
