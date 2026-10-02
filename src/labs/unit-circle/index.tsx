import { useState } from 'react'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  PredictReveal,
  Prose,
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
import { UnitCircle, type UnitCircleState } from '@/tools/unit-circle/UnitCircle'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'

const near = (deg: number, target: number) => Math.abs(deg - target) < 0.5

const SPECIAL = [
  { deg: 0, sin: '\\frac{\\sqrt0}{2} = 0', cos: '1' },
  { deg: 30, sin: '\\frac{\\sqrt1}{2} = \\frac12', cos: '\\frac{\\sqrt3}{2}' },
  { deg: 45, sin: '\\frac{\\sqrt2}{2}', cos: '\\frac{\\sqrt2}{2}' },
  { deg: 60, sin: '\\frac{\\sqrt3}{2}', cos: '\\frac12' },
  { deg: 90, sin: '\\frac{\\sqrt4}{2} = 1', cos: '0' },
]

export default function UnitCircleLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Sine and cosine for every angle">
        <Prose>
          <p>
            In a right triangle, sine and cosine are ratios of sides, but a triangle can't have an
            angle of 120° or −45°. The <strong>unit circle</strong> fixes that. Walk a point around
            a circle of radius 1: its <em>horizontal</em> position is <Tex>{'\\cos\\theta'}</Tex>{' '}
            and its <em>vertical</em> position is <Tex>{'\\sin\\theta'}</Tex>.
          </p>
          <p>
            Think of them as shadows: a light from above throws the point's shadow onto the
            horizontal axis (cosine); a light from the side throws it onto the vertical axis (sine).
            Now every angle, of any size, has a sine and a cosine.
          </p>
        </Prose>
      </LabSection>
      <CircleExplorer />
      <SpecialExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The unit circle in symbols">
        <Formula
          tex={
            'P(\\theta) = (\\cos\\theta,\\; \\sin\\theta) \\qquad \\cos^2\\theta + \\sin^2\\theta = 1'
          }
          caption="Every point on a circle of radius 1. The identity is Pythagoras on the triangle under the point."
        />
        <Formula
          tex={'\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}'}
          caption="The slope of the radius; undefined at 90° and 270°, where the radius is vertical."
        />
        <Prose>
          <p>
            The signs follow the quadrants: right of the vertical axis cosine is positive, above the
            horizontal axis sine is positive. Angles that differ by a full turn (360°, or{' '}
            <Tex>2\pi</Tex> radians) land on the same point, which is why sine and cosine repeat.
          </p>
        </Prose>
        <Callout kind="misconception" title="Degrees or radians?">
          <p>
            <Tex>{'\\sin 30 = \\tfrac12'}</Tex> only if “30” means degrees. In radians, 30 is almost
            five full turns and <Tex>{'\\sin 30 \\approx -0.99'}</Tex>. Check your calculator's
            mode.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet the unit circle">
        <RealWorld
          items={[
            {
              title: 'Anything that turns',
              body: 'A point on a bicycle wheel, a Ferris wheel seat or an engine crank moves with $(\\cos\\theta, \\sin\\theta)$ scaled by the radius.',
            },
            {
              title: 'Games and animation',
              body: 'To move a character at angle θ with speed $v$, games add $v\\cos\\theta$ across and $v\\sin\\theta$ up every frame.',
            },
            {
              title: 'Electricity',
              body: 'Mains AC voltage is the shadow of a rotating vector, turning 50 or 60 times a second.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'On the unit circle, the point at angle θ is $(\\cos\\theta, \\sin\\theta)$.',
            'Cosine is the horizontal shadow, sine the vertical one.',
            '$\\cos^2\\theta + \\sin^2\\theta = 1$ for every angle.',
            'Signs depend on the quadrant; values repeat every full turn.',
            'Special angles: $\\sin$ of 0°, 30°, 45°, 60°, 90° is $\\tfrac{\\sqrt0}{2}, \\tfrac{\\sqrt1}{2}, \\tfrac{\\sqrt2}{2}, \\tfrac{\\sqrt3}{2}, \\tfrac{\\sqrt4}{2}$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function CircleExplorer() {
  const [s, setS] = useState<UnitCircleState | null>(null)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Walk the point around">
      <Prose>
        <p>
          Drag the point around the circle (it clicks into place at the special angles). The blue
          bar is <Tex>{'\\cos\\theta'}</Tex> and the orange bar is <Tex>{'\\sin\\theta'}</Tex>.
          Watch them shrink, grow and change sign.
        </p>
      </Prose>
      <PredictReveal
        question="At θ = 150°, which of sin θ and cos θ is negative?"
        options={['Only sin θ', 'Only cos θ', 'Both', 'Neither']}
        answer={1}
        explanation="At 150° the point is in the top-left quarter: left of the vertical axis (cos θ < 0) but above the horizontal one (sin θ > 0)."
      />
      <Figure>
        <UnitCircle
          preset={{ theta: Math.PI / 4, showWave: false, units: 'deg' }}
          onStateChange={setS}
        />
      </Figure>
      <TryThisList>
        <TryThis id="t-30" when={s !== null && near(s.degrees, 30)}>
          Set the angle to 30°. What is <Tex>{'\\sin\\theta'}</Tex> exactly?
        </TryThis>
        <TryThis id="t-q2" when={s?.quadrant === 2}>
          Move into the top-left quarter. Which of sine and cosine is negative there?
        </TryThis>
        <TryThis id="t-equal" when={s !== null && Math.abs(s.sin - s.cos) < 1e-6 && s.sin < 0}>
          Find an angle where <Tex>{'\\sin\\theta = \\cos\\theta'}</Tex> and both are negative.
        </TryThis>
        <TryThis id="t-270" when={s !== null && near(s.degrees, 270)}>
          Go to 270°. What are the cosine and sine there?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function SpecialExplorer() {
  const [deg, setDeg] = useState(30)
  const [seen, setSeen] = useState<number[]>([30])
  return (
    <LabSection id="special" eyebrow="Explore" title="The special angles have a pattern">
      <Prose>
        <p>
          Five angles come up again and again. Their sines follow a pattern that makes them easy to
          remember:{' '}
          <Tex>
            {
              '\\tfrac{\\sqrt0}{2}, \\tfrac{\\sqrt1}{2}, \\tfrac{\\sqrt2}{2}, \\tfrac{\\sqrt3}{2}, \\tfrac{\\sqrt4}{2}'
            }
          </Tex>
          , and the cosines are the same list backwards. Click a row to see its triangle.
        </p>
      </Prose>
      <Figure>
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto p-3 sm:p-4">
            <table className="w-full text-sm">
              <caption className="sr-only">Exact sine and cosine of the special angles</caption>
              <thead>
                <tr className="text-left text-ink-2">
                  <th scope="col" className="px-2 py-1.5 font-medium">
                    θ
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-medium">
                    sin θ
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-medium">
                    cos θ
                  </th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL.map((row) => (
                  <tr
                    key={row.deg}
                    className={cn(
                      'border-t border-line',
                      deg === row.deg &&
                        'bg-[color-mix(in_oklab,var(--accent)_10%,var(--surface))]',
                    )}
                  >
                    <th scope="row" className="px-2 py-1.5 text-left">
                      <button
                        type="button"
                        aria-pressed={deg === row.deg}
                        className="w-full rounded-md px-1 py-0.5 text-left font-semibold hover:text-accent"
                        onClick={() => {
                          setDeg(row.deg)
                          setSeen((s) => (s.includes(row.deg) ? s : [...s, row.deg]))
                        }}
                      >
                        {row.deg}°
                      </button>
                    </th>
                    <td className="px-2 py-1.5">
                      <Tex>{row.sin}</Tex>
                    </td>
                    <td className="px-2 py-1.5">
                      <Tex>{row.cos}</Tex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line md:border-t-0 md:border-l">
            <UnitCircle
              key={deg}
              preset={{
                theta: (deg * Math.PI) / 180,
                showWave: false,
                triangle: true,
                controls: false,
              }}
            />
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-all" when={seen.length === SPECIAL.length}>
          Look at all five special angles. Which pairs of angles swap their sine and cosine?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [s, setS] = useState<UnitCircleState | null>(null)
  const solved = s !== null && Math.abs(s.cos + 0.5) < 0.01 && s.sin > 0
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-sin30"
          index={1}
          prompt="What is $\sin 30°$?"
          answer={0.5}
          explanation="At 30° the point is at height $\tfrac12$: $\sin 30° = \tfrac12$."
        />
        <NumericChallenge
          id="c-cos180"
          index={2}
          prompt="What is $\cos 180°$?"
          answer={-1}
          explanation="Half a turn puts the point at $(-1, 0)$, so the horizontal shadow is $-1$."
        />
        <McqChallenge
          id="c-quadrant"
          index={3}
          prompt="For which angles is $\sin\theta > 0$ but $\cos\theta < 0$?"
          options={[
            { text: 'Between 90° and 180°', correct: true },
            { text: 'Between 0° and 90°', why: 'There both are positive.' },
            { text: 'Between 180° and 270°', why: 'There both are negative.' },
            { text: 'Between 270° and 360°', why: 'There cosine is positive and sine negative.' },
          ]}
          explanation="Top-left quarter: above the horizontal axis (sine positive), left of the vertical axis (cosine negative)."
        />
        <NumericChallenge
          id="c-identity"
          index={4}
          prompt="What is $\sin^2 40° + \cos^2 40°$?"
          answer={1}
          hint="No calculator needed: think about the triangle under the point."
          explanation="For every angle, $\sin^2\theta + \cos^2\theta = 1$: Pythagoras on the unit circle."
        />
        <InteractiveChallenge
          id="c-find"
          index={5}
          prompt="Move the point to an angle where $\cos\theta = -\tfrac12$ and $\sin\theta > 0$."
          solved={solved}
          hint="$\cos 60° = \tfrac12$. You want the mirror image of 60° on the left side, above the axis."
          explanation="$\theta = 120°$: the point is $(-\tfrac12, \tfrac{\sqrt3}{2})$."
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <UnitCircle
              preset={{ theta: 0.3, showWave: false, units: 'deg', controls: false }}
              onStateChange={setS}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
