import { useState } from 'react'
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
import { Label, MovablePoint, Plot, Point, Polygon, Segment, constraints } from '@/viz'
import { quadrant } from '../_shared/algebra'

const VIEW = { xMin: -7, xMax: 7, yMin: -6, yMax: 6 }
const POINT = 'var(--c-blue)'
const ACROSS = 'var(--c-green)'
const UP = 'var(--c-orange)'
const IMAGE = 'var(--c-violet)'
const TARGET: Vec2 = [-4, 3]
const snap = constraints.compose(constraints.snapToGrid(1), constraints.within(-6, 6, -5, 5))

const ROMAN = ['on an axis', 'I', 'II', 'III', 'IV'] as const
const QUADRANT_CORNER: Record<1 | 2 | 3 | 4, Vec2> = {
  1: [6, 5],
  2: [-6, 5],
  3: [-6, -5],
  4: [6, -5],
}

/** The rectangle of the plot window that makes up a quadrant. */
function quadrantBox(q: 1 | 2 | 3 | 4): Vec2[] {
  const sx = q === 1 || q === 4 ? 1 : -1
  const sy = q === 1 || q === 2 ? 1 : -1
  return [
    [0, 0],
    [7 * sx, 0],
    [7 * sx, 6 * sy],
    [0, 6 * sy],
  ]
}

const describe = ([x, y]: Vec2) => {
  const across = x === 0 ? 'no steps across' : `${Math.abs(x)} ${x > 0 ? 'right' : 'left'}`
  const up = y === 0 ? 'no steps up or down' : `${Math.abs(y)} ${y > 0 ? 'up' : 'down'}`
  return `${across}, then ${up}`
}

type Mirror = 'x' | 'y' | 'origin'

const reflect = ([x, y]: Vec2, m: Mirror): Vec2 =>
  m === 'x' ? [x, -y || 0] : m === 'y' ? [-x || 0, y] : [-x || 0, -y || 0]

const RULE: Record<Mirror, string> = {
  x: '(x, y) \\to (x, -y)',
  y: '(x, y) \\to (-x, y)',
  origin: '(x, y) \\to (-x, -y)',
}

function QuadrantLabels() {
  return (
    <>
      {([1, 2, 3, 4] as const).map((q) => (
        <Label
          key={q}
          at={QUADRANT_CORNER[q]}
          anchor="center"
          className="text-sm font-semibold text-ink-2"
        >
          {ROMAN[q]}
        </Label>
      ))}
    </>
  )
}

export default function CoordinatePlaneLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Two number lines make a map">
        <Prose>
          <p>
            One number line pins down a position on a line. Cross two of them at 0, one across and
            one up, and every point on a flat sheet gets an address: a pair of numbers{' '}
            <Tex>{'(x, y)'}</Tex>.
          </p>
          <p>
            The first number says how far to go <strong>across</strong>, the second how far to go{' '}
            <strong>up</strong>. That simple idea, from René Descartes, turns pictures into numbers
            and lets algebra draw graphs.
          </p>
        </Prose>
      </LabSection>
      <AddressExplorer />
      <MirrorExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Ordered pairs and quadrants">
        <Formula
          tex={'P = (x, y)'}
          caption="An ordered pair: x is the horizontal position, y the vertical one, both measured from the origin (0, 0)."
        />
        <Prose>
          <ul>
            <li>
              The <strong>axes</strong> cross at the <strong>origin</strong> <Tex>{'(0, 0)'}</Tex>.
              Points on the <Tex>{'x'}</Tex>-axis have <Tex>{'y = 0'}</Tex>; points on the{' '}
              <Tex>{'y'}</Tex>-axis have <Tex>{'x = 0'}</Tex>.
            </li>
            <li>
              The axes cut the plane into four <strong>quadrants</strong>, numbered I to IV
              anticlockwise from the top right: I <Tex>{'(+, +)'}</Tex>, II <Tex>{'(-, +)'}</Tex>,
              III <Tex>{'(-, -)'}</Tex>, IV <Tex>{'(+, -)'}</Tex>.
            </li>
            <li>
              Reflecting in the <Tex>{'x'}</Tex>-axis flips the sign of <Tex>{'y'}</Tex>; in the{' '}
              <Tex>{'y'}</Tex>-axis, the sign of <Tex>{'x'}</Tex>; through the origin, both.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="(2, 5) and (5, 2) are different points">
          <p>
            The pair is <em>ordered</em>: across first, then up. <Tex>{'(2, 5)'}</Tex> is 2 across
            and 5 up; <Tex>{'(5, 2)'}</Tex> is 5 across and 2 up. A handy rhyme: “along the
            corridor, then up the stairs”.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where coordinates are used">
        <RealWorld
          items={[
            {
              title: 'Maps and GPS',
              body: 'Longitude and latitude are coordinates on the globe; a grid reference on a hiking map works the same way.',
            },
            {
              title: 'Screens',
              body: 'Every pixel has an (x, y) address. On most screens y counts downwards from the top-left corner.',
            },
            {
              title: 'Games',
              body: 'Battleship, chess (e4!) and every video game world place things by coordinates.',
            },
            {
              title: 'Graphs',
              body: 'Plotting data or a function means drawing points (x, y): the coordinate plane is where algebra becomes a picture.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A point is an ordered pair $(x, y)$: across first, then up.',
            'The axes meet at the origin $(0, 0)$ and split the plane into quadrants I–IV.',
            'The signs of $x$ and $y$ tell you the quadrant.',
            'Reflections flip signs: in the $x$-axis $y \\to -y$, in the $y$-axis $x \\to -x$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function AddressExplorer() {
  const [p, setP] = useState<Vec2>([3, 2])
  const [x, y] = p
  const q = quadrant(x, y)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Every point has an address">
      <Prose>
        <p>
          Drag the blue point. The green step goes across (<Tex>{'x'}</Tex>) and the orange step
          goes up or down (<Tex>{'y'}</Tex>). The shaded quarter is the point's quadrant. The hollow
          circle is a target to reach.
        </p>
      </Prose>
      <PredictReveal
        question="Which quadrant is $(-2, 5)$ in?"
        options={['I', 'II', 'III', 'IV']}
        answer={1}
        explanation="$x$ is negative (left) and $y$ is positive (up): the top-left quarter, quadrant II."
      />
      <Figure>
        <div className="mx-auto w-full max-w-xl px-3 pt-3 sm:px-4">
          <Plot view={VIEW} aspect="equal" xIntegers ariaLabel={`The point (${x}, ${y})`}>
            {q !== 0 && <Polygon points={quadrantBox(q)} fill={POINT} fillOpacity={0.08} />}
            <QuadrantLabels />
            <Point at={TARGET} r={7} color={UP} hollow />
            {x !== 0 && <Segment from={[0, 0]} to={[x, 0]} color={ACROSS} width={3.5} />}
            {y !== 0 && <Segment from={[x, 0]} to={[x, y]} color={UP} width={3.5} />}
            <Label at={p} anchor="bottom-left" offset={[10, -10]} className="text-sm font-semibold">
              ({x}, {y})
            </Label>
            <MovablePoint
              x={x}
              y={y}
              onMove={(nx, ny) => setP([nx, ny])}
              constrain={snap}
              step={1}
              color={POINT}
              label="Point"
            />
          </Plot>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'point', value: `(${x}, ${y})`, color: POINT },
              { label: 'walk', value: describe(p) },
              { label: 'quadrant', value: ROMAN[q] },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-both-negative" when={x < 0 && y < 0}>
          Move the point to where both coordinates are negative. Which quadrant is that?
        </TryThis>
        <TryThis id="t-on-an-axis" when={x === 0 || y === 0}>
          Put the point on an axis. Which coordinate becomes 0?
        </TryThis>
        <TryThis id="t-hit-target" when={x === TARGET[0] && y === TARGET[1]}>
          Land on the hollow target circle. What is its address?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function MirrorExplorer() {
  const [p, setP] = useState<Vec2>([3, 2])
  const [mirror, setMirror] = useState<Mirror>('x')
  const img = reflect(p, mirror)
  const same = img[0] === p[0] && img[1] === p[1]
  return (
    <LabSection id="reflect" eyebrow="Explore" title="Reflections flip signs">
      <Prose>
        <p>
          Pick a mirror and drag the blue point. Its reflection (violet) is the same distance from
          the mirror on the other side. Watch which coordinate changes sign.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Mirror"
            value={mirror}
            onChange={setMirror}
            options={[
              { value: 'x', label: 'x-axis' },
              { value: 'y', label: 'y-axis' },
              { value: 'origin', label: 'Through the origin' },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-xl px-3 pt-3 sm:px-4">
          <Plot
            view={VIEW}
            aspect="equal"
            xIntegers
            ariaLabel={`The point (${p[0]}, ${p[1]}) and its reflection (${img[0]}, ${img[1]})`}
          >
            <QuadrantLabels />
            {!same && <Segment from={p} to={img} color="var(--ink-3)" width={1.5} dashed />}
            <Point at={img} r={7} color={IMAGE} />
            <Label at={img} anchor="bottom-left" offset={[10, -10]} className="text-sm">
              ({img[0]}, {img[1]})
            </Label>
            <MovablePoint
              x={p[0]}
              y={p[1]}
              onMove={(nx, ny) => setP([nx, ny])}
              constrain={snap}
              step={1}
              color={POINT}
              label="Point to reflect"
            />
          </Plot>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'rule', value: <Tex>{RULE[mirror]}</Tex> },
              { label: 'point', value: `(${p[0]}, ${p[1]})`, color: POINT },
              { label: 'image', value: `(${img[0]}, ${img[1]})`, color: IMAGE },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-own-mirror" when={same && (p[0] !== 0 || p[1] !== 0)}>
          Find a point (not the origin) that is its own reflection. Where must it sit?
        </TryThis>
        <TryThis id="t-into-second" when={quadrant(img[0], img[1]) === 2}>
          Make the reflection land in quadrant II.
        </TryThis>
        <TryThis id="t-half-turn" when={mirror === 'origin' && quadrant(p[0], p[1]) === 1}>
          Reflect a quadrant I point through the origin. Where does it land, and why is that a half
          turn?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [p, setP] = useState<Vec2>([2, 1])
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-which-quadrant"
          index={1}
          prompt="Which quadrant is $(4, -7)$ in?"
          options={[
            { text: 'IV', correct: true },
            { text: 'I', why: 'In quadrant I both coordinates are positive.' },
            { text: 'II', why: 'Quadrant II has $x < 0$ and $y > 0$.' },
            { text: 'III', why: 'Quadrant III has both negative.' },
          ]}
          explanation="$x > 0$ and $y < 0$: right and down, quadrant IV."
        />
        <NumericChallenge
          id="c-grid-walk"
          index={2}
          prompt="Walking only along grid lines, how many unit steps is it from $(-2, 3)$ to $(4, -1)$?"
          answer={10}
          explanation="6 steps across ($-2 \to 4$) and 4 steps down ($3 \to -1$): $6 + 4 = 10$."
        />
        <NumericChallenge
          id="c-mirror-y"
          index={3}
          prompt="Reflect $(4, -1)$ in the $y$-axis. What is the new $x$-coordinate?"
          answer={-4}
          explanation="The $y$-axis mirror flips the sign of $x$: $(4, -1) \to (-4, -1)$."
        />
        <McqChallenge
          id="c-x-is-zero"
          index={4}
          prompt="Every point with $x = 0$ lies on…"
          options={[
            { text: 'the $y$-axis', correct: true },
            { text: 'the $x$-axis', why: 'Points on the $x$-axis have $y = 0$.' },
            { text: 'the origin only', why: '$(0, 3)$ and $(0, -2)$ also have $x = 0$.' },
          ]}
          explanation="No steps across means you stay on the vertical axis: the $y$-axis."
        />
        <NumericChallenge
          id="c-move-left"
          index={5}
          prompt="Start at $(1, 2)$. Move 5 left and 3 down. What is the new $x$-coordinate?"
          answer={-4}
          explanation="Left changes $x$: $1 - 5 = -4$. (Down changes $y$: $2 - 3 = -1$.)"
        />
        <InteractiveChallenge
          id="c-plot-target"
          index={6}
          prompt="Drag the point to $(-3, -2)$."
          solved={p[0] === -3 && p[1] === -2}
          hint="Go 3 left, then 2 down from the origin."
          explanation="$(-3, -2)$ is 3 left and 2 down, in quadrant III."
          onReset={() => setP([2, 1])}
        >
          <div className="mx-auto w-full max-w-md rounded-xl border border-line p-3">
            <Plot view={VIEW} aspect="equal" xIntegers ariaLabel={`The point (${p[0]}, ${p[1]})`}>
              <MovablePoint
                x={p[0]}
                y={p[1]}
                onMove={(nx, ny) => setP([nx, ny])}
                constrain={snap}
                step={1}
                color={POINT}
                label="Point"
                showCoords
              />
            </Plot>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
