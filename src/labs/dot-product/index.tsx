import { useState } from 'react'
import { angleBetween, dot, norm, project, type Vec2 } from '@/math/linalg'
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
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  InfiniteLine,
  Label,
  MovablePoint,
  Plot,
  Segment,
  Vector,
  constraints,
} from '@/viz'
import { COLORS, num } from '../_shared/tex'

const VIEW = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
const snap = constraints.snapToGrid(0.5)

function signWord(d: number) {
  if (Math.abs(d) < 1e-9) return 'zero: perpendicular'
  return d > 0 ? 'positive: pointing together' : 'negative: pointing apart'
}

function ShadowPlot({
  u,
  v,
  setU,
  setV,
}: {
  u: Vec2
  v: Vec2
  setU?: (p: Vec2) => void
  setV?: (p: Vec2) => void
}) {
  const shadow = project(u, v)
  const d = dot(u, v)
  const shadowColor =
    Math.abs(d) < 1e-9 ? 'var(--ink-3)' : d > 0 ? 'var(--c-green)' : 'var(--c-red)'
  const theta = angleBetween(u, v)
  const hu = Math.atan2(u[1], u[0])
  const hv = Math.atan2(v[1], v[0])
  // Draw the arc the short way round, from v to u.
  let from = hv
  let to = hu
  let diff = to - from
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  if (diff < 0) [from, to] = [hu, hv]
  return (
    <Plot
      view={VIEW}
      aspect="equal"
      ariaLabel={`u dot v equals ${num(d)}; the angle between them is ${num((theta * 180) / Math.PI, 0)} degrees`}
    >
      {norm(v) > 0 && (
        <InfiniteLine through={[0, 0]} direction={v} color="var(--ink-3)" width={1} opacity={0.5} />
      )}
      <Segment from={u} to={shadow} color="var(--ink-3)" dashed width={1.5} />
      <Segment from={[0, 0]} to={shadow} color={shadowColor} width={7} opacity={0.55} />
      {norm(u) > 0.4 && norm(v) > 0.4 && (
        <AngleArc center={[0, 0]} from={from} to={to} radius={30} color="var(--c-violet)" />
      )}
      <Vector to={v} color={COLORS.v} />
      <Vector to={u} color={COLORS.u} />
      <Label at={u} anchor="bottom-left" offset={[8, -4]} color={COLORS.u}>
        <Tex>{'\\vec u'}</Tex>
      </Label>
      <Label at={v} anchor="bottom-left" offset={[8, -4]} color={COLORS.v}>
        <Tex>{'\\vec v'}</Tex>
      </Label>
      <Label at={shadow} anchor="top" offset={[0, 8]} className="text-xs text-ink-2">
        shadow
      </Label>
      {setU && (
        <MovablePoint
          x={u[0]}
          y={u[1]}
          onMove={(x, y) => setU([x, y])}
          constrain={snap}
          step={0.5}
          color={COLORS.u}
          size={6}
          label="Tip of vector u"
        />
      )}
      {setV && (
        <MovablePoint
          x={v[0]}
          y={v[1]}
          onMove={(x, y) => setV([x, y])}
          constrain={snap}
          step={0.5}
          color={COLORS.v}
          size={6}
          label="Tip of vector v"
        />
      )}
    </Plot>
  )
}

export default function DotProductLab() {
  return (
    <div className="space-y-16">
      <LabSection
        id="idea"
        eyebrow="The big idea"
        title="How much does one arrow point along another?"
      >
        <Prose>
          <p>
            Shine a light straight down onto a line and an arrow casts a <strong>shadow</strong> on
            it. A long shadow means the arrow points mostly along the line; no shadow means it
            stands at right angles to it.
          </p>
          <p>
            The <strong>dot product</strong> turns that shadow into one number. It measures work
            done by a force, how bright a surface looks under a lamp, and how similar two songs or
            documents are in a recommendation engine.
          </p>
        </Prose>
      </LabSection>
      <Explore />
      <LabSection id="formalize" eyebrow="Formalize" title="Two ways to compute one number">
        <Formula
          tex={'\\vec u \\cdot \\vec v = u_1 v_1 + u_2 v_2 = |\\vec u|\\,|\\vec v| \\cos\\theta'}
          caption="Multiply matching components and add, or multiply the lengths by the cosine of the angle."
        />
        <Prose>
          <p>
            The first form is how computers calculate it; the second explains what it means. The
            signed length of the shadow of <Tex>{'\\vec u'}</Tex> on <Tex>{'\\vec v'}</Tex> is{' '}
            <Tex>{'\\frac{\\vec u \\cdot \\vec v}{|\\vec v|}'}</Tex>, and two non-zero vectors are{' '}
            <strong>perpendicular</strong> exactly when their dot product is 0.
          </p>
        </Prose>
        <Formula
          tex={'\\cos\\theta = \\frac{\\vec u \\cdot \\vec v}{|\\vec u|\\,|\\vec v|}'}
          caption="Cosine similarity: 1 for the same direction, 0 for unrelated, −1 for opposite."
        />
        <Callout kind="misconception">
          <p>
            The dot product of two vectors is a <strong>number</strong>, not another vector. It only
            tells you how much they line up, not which way the result points.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet the dot product">
        <RealWorld
          items={[
            {
              title: 'Work in physics',
              body: 'Work $= \\vec F \\cdot \\vec d$: only the part of a force along the motion does work. Pushing straight down on a sliding box does none.',
            },
            {
              title: 'Recommendations',
              body: 'Streaming services turn your tastes into a vector and suggest items whose vectors have high cosine similarity with yours.',
            },
            {
              title: '3D lighting',
              body: 'A surface facing a lamp is bright; one turned away is dark. Renderers compute brightness as a dot product of the surface normal and the light direction.',
            },
            {
              title: 'Search engines',
              body: 'Documents and queries become word-count vectors, ranked by how closely they point the same way.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$\\vec u \\cdot \\vec v = u_1 v_1 + u_2 v_2 = |\\vec u||\\vec v|\\cos\\theta$, a single number.',
            'Positive: pointing together. Zero: perpendicular. Negative: pointing apart.',
            'The shadow of $\\vec u$ on $\\vec v$ has signed length $\\frac{\\vec u\\cdot\\vec v}{|\\vec v|}$.',
            'Divide by both lengths to get cosine similarity, a score from −1 to 1.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function Explore() {
  const [u, setU] = useState<Vec2>([3, 2])
  const [v, setV] = useState<Vec2>([4, 0])
  const d = dot(u, v)
  const theta = angleBetween(u, v)
  const lens = norm(u) * norm(v)
  const cosSim = lens > 0 ? d / lens : 0
  return (
    <LabSection id="explore" eyebrow="Explore" title="Cast a shadow">
      <Prose>
        <p>
          Drag either tip. The thick bar is the shadow of <Tex>{'\\vec u'}</Tex> on the line of{' '}
          <Tex>{'\\vec v'}</Tex>: green when they point together, red when they point apart.
        </p>
      </Prose>
      <PredictReveal
        question="Two arrows meet at exactly 90°. What is their dot product?"
        options={[
          'Zero',
          'The product of their lengths',
          'Negative',
          'It depends on their lengths',
        ]}
        answer={0}
        explanation="At a right angle the shadow has no length at all, and $\cos 90° = 0$, so the dot product is 0 whatever the lengths. Try it below."
      />
      <Figure>
        <ShadowPlot u={u} v={v} setU={setU} setV={setV} />
        <div className="border-t border-line px-3 pb-3">
          <Readouts
            items={[
              {
                label: <Tex>{'\\vec u\\cdot\\vec v'}</Tex>,
                value: num(d),
                color: d > 1e-9 ? 'var(--c-green)' : d < -1e-9 ? 'var(--c-red)' : 'var(--ink-3)',
              },
              { label: 'sign', value: signWord(d) },
              { label: <Tex>\theta</Tex>, value: `${num((theta * 180) / Math.PI, 1)}°` },
              { label: 'cosine similarity', value: num(cosSim, 3) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-zero" when={Math.abs(d) < 1e-9 && norm(u) > 0.4 && norm(v) > 0.4}>
          Make the dot product exactly zero (without shrinking an arrow to nothing).
        </TryThis>
        <TryThis id="t-negative" when={d < 0}>
          Make the dot product negative.
        </TryThis>
        <TryThis id="t-max" when={norm(u) > 0.4 && norm(v) > 0.4 && cosSim > 0.9999}>
          Line them up so the cosine similarity is 1. Is the dot product now the product of the
          lengths?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          Check the formula with the numbers on screen:{' '}
          <Tex>{`${num(u[0], 1)}\\cdot${num(v[0], 1)} + ${num(u[1], 1)}\\cdot${num(v[1], 1)} = ${num(d)}`}</Tex>
          , and{' '}
          <Tex>{`|\\vec u||\\vec v|\\cos\\theta = ${num(norm(u))}\\cdot${num(norm(v))}\\cdot${num(Math.cos(theta), 3)} = ${num(lens * Math.cos(theta))}`}</Tex>
          . Same number, two meanings.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const [u, setU] = useState<Vec2>([3, 1])
  const v: Vec2 = [2, 3]
  const solved = Math.abs(dot(u, v)) < 1e-9 && norm(u) > 0.9
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-compute"
          index={1}
          prompt="$(1, 2) \cdot (3, 4) = \;?$"
          answer={11}
          explanation="$1 \cdot 3 + 2 \cdot 4 = 3 + 8 = 11$."
        />
        <InteractiveChallenge
          id="c-perp"
          index={2}
          prompt="Drag $\vec u$ so it is perpendicular to $\vec v = (2, 3)$ (and at least 1 unit long)."
          solved={solved}
          hint="Swap the components and change one sign: $(3, -2)$ or $(-3, 2)$ are perpendicular to $(2, 3)$."
          explanation="$(3, -2)\cdot(2, 3) = 6 - 6 = 0$. Swapping components and flipping a sign always gives a perpendicular vector in 2D."
          onReset={() => setU([3, 1])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <ShadowPlot u={u} v={v} setU={setU} />
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-obtuse"
          index={3}
          prompt="If $\vec u \cdot \vec v < 0$, the angle between them is…"
          options={[
            { text: 'more than 90°', correct: true },
            {
              text: 'less than 90°',
              why: 'That would make the cosine, and the dot product, positive.',
            },
            { text: 'exactly 90°', why: 'That gives a dot product of exactly 0.' },
            {
              text: 'impossible to tell',
              why: 'The sign alone tells you which side of 90° you are on.',
            },
          ]}
          explanation="$\cos\theta < 0$ exactly when $90° < \theta \le 180°$: the vectors point more apart than together."
        />
        <NumericChallenge
          id="c-shadow"
          index={4}
          prompt="How long is the shadow of $(3, 4)$ on the direction $(1, 0)$?"
          answer={3}
          explanation="$\frac{(3,4)\cdot(1,0)}{|(1,0)|} = \frac{3}{1} = 3$: the shadow on the x-axis is just the x-component."
        />
        <NumericChallenge
          id="c-cosine"
          index={5}
          prompt="What is the cosine similarity of $(1, 0)$ and $(1, 1)$? (Two decimal places is fine.)"
          answer={Math.SQRT1_2}
          tolerance={0.01}
          hint="$\frac{\vec u\cdot\vec v}{|\vec u||\vec v|}$ with $|(1,1)| = \sqrt2$."
          explanation="$\frac{1}{1 \cdot \sqrt2} \approx 0.71$, which matches the 45° angle between them: $\cos 45° \approx 0.71$."
        />
      </ChallengeSet>
    </LabSection>
  )
}
