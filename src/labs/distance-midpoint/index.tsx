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
import { Circle, Label, MovablePoint, Plot, Point, Segment, constraints } from '@/viz'
import { num } from '../_shared/tex'

const P_COL = 'var(--c-blue)'
const Q_COL = 'var(--c-orange)'
const MID = 'var(--c-magenta)'
const RUN = 'var(--c-green)'
const RISE = 'var(--c-violet)'

const VIEW = { xMin: -7, xMax: 7, yMin: -5, yMax: 5 }
const snapHalf = constraints.compose(
  constraints.snapToGrid(0.5),
  constraints.within(-6.5, 6.5, -4.5, 4.5),
)
const snapOne = constraints.compose(constraints.snapToGrid(1), constraints.within(-6, 6, -4.5, 4.5))
const fmt = (p: Vec2) => `(${num(p[0])}, ${num(p[1])})`

export default function DistanceMidpointLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Pythagoras on a grid">
        <Prose>
          <p>
            How far apart are two points on a map? Walk from one to the other along the grid: so
            many steps across, so many up. Those two walks are the legs of a right triangle, and the
            straight-line distance is its hypotenuse.
          </p>
          <p>
            So the <strong>distance formula</strong> is just the Pythagorean theorem in coordinates.
            And the point halfway between, the <strong>midpoint</strong>, is simply the average of
            the two positions.
          </p>
        </Prose>
      </LabSection>
      <DistanceExplorer />
      <CircleExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Two formulas">
        <Formula
          tex={'d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}'}
          caption="The across and up differences are the legs; the distance is the hypotenuse."
        />
        <Formula
          tex={'M = \\left(\\frac{x_1 + x_2}{2},\\; \\frac{y_1 + y_2}{2}\\right)'}
          caption="Average the $x$-coordinates and average the $y$-coordinates."
        />
        <Prose>
          <p>
            All the points at distance <Tex>r</Tex> from a centre <Tex>(a, b)</Tex> form a circle,
            and the distance formula gives its equation: <Tex>{'(x - a)^2 + (y - b)^2 = r^2'}</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="Don't add the across and up distances">
          <p>
            Walking 3 across then 4 up covers 7, but the straight line is only 5. The direct path is
            the hypotenuse, which is shorter than the two legs together.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where it's used">
        <RealWorld
          items={[
            {
              title: 'Maps and games',
              body: 'Games compute $\\sqrt{dx^2 + dy^2}$ constantly to check whether a character is in range.',
            },
            {
              title: 'Nearest neighbour',
              body: 'Recommendation systems and classifiers find the “closest” items using the same formula in many dimensions.',
            },
            {
              title: 'Meeting halfway',
              body: 'The midpoint of two locations is the fair place to meet: average the coordinates.',
            },
            {
              title: 'Phone location',
              body: 'Your phone finds itself by solving circle equations: you are at a known distance from several towers or satellites.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Distance: $d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$, Pythagoras in coordinates.',
            'Midpoint: average the $x$s and average the $y$s.',
            'Points at distance $r$ from $(a, b)$ form the circle $(x - a)^2 + (y - b)^2 = r^2$.',
            'The straight-line distance is shorter than going across then up.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function DistanceExplorer() {
  const [P, setP] = useState<Vec2>([-4, -2])
  const [Q, setQ] = useState<Vec2>([2, 1])
  const dx = Q[0] - P[0]
  const dy = Q[1] - P[1]
  const d = Math.hypot(dx, dy)
  const M: Vec2 = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]
  const corner: Vec2 = [Q[0], P[1]]
  return (
    <LabSection id="explore" eyebrow="Explore" title="Across, up and straight">
      <Prose>
        <p>
          Drag the two points. The green leg is how far across, the violet leg how far up, and the
          straight line between them is the distance. The pink dot is the midpoint.
        </p>
      </Prose>
      <PredictReveal
        question="Points $(0, 0)$ and $(6, 8)$: how far apart are they?"
        options={['14', '10', '48', '7']}
        answer={1}
        explanation="$\sqrt{6^2 + 8^2} = \sqrt{100} = 10$. 14 is the walk across and up."
      />
      <Figure>
        <Plot
          view={VIEW}
          aspect="equal"
          ariaLabel={`Points ${fmt(P)} and ${fmt(Q)} are ${formatNumber(d, 3)} apart; midpoint ${fmt(M)}`}
        >
          {dx !== 0 && <Segment from={P} to={corner} color={RUN} width={3} />}
          {dy !== 0 && <Segment from={corner} to={Q} color={RISE} width={3} />}
          <Segment from={P} to={Q} color="var(--ink-2)" width={2.5} />
          <Point at={M} r={5.5} color={MID} />
          <Label at={M} anchor="bottom-left" offset={[8, -6]} color={MID} className="text-xs">
            M {fmt(M)}
          </Label>
          {dx !== 0 && (
            <Label
              at={[(P[0] + Q[0]) / 2, P[1]]}
              anchor={dy >= 0 ? 'top' : 'bottom'}
              offset={[0, dy >= 0 ? 6 : -6]}
              color={RUN}
              className="text-xs"
            >
              {formatNumber(Math.abs(dx), 2)}
            </Label>
          )}
          {dy !== 0 && (
            <Label
              at={[Q[0], (P[1] + Q[1]) / 2]}
              anchor={dx >= 0 ? 'left' : 'right'}
              offset={[dx >= 0 ? 6 : -6, 0]}
              color={RISE}
              className="text-xs"
            >
              {formatNumber(Math.abs(dy), 2)}
            </Label>
          )}
          <MovablePoint
            x={P[0]}
            y={P[1]}
            onMove={(x, y) => setP([x, y])}
            constrain={snapHalf}
            step={0.5}
            color={P_COL}
            label="Point P"
          />
          <MovablePoint
            x={Q[0]}
            y={Q[1]}
            onMove={(x, y) => setQ([x, y])}
            constrain={snapHalf}
            step={0.5}
            color={Q_COL}
            label="Point Q"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'across', value: formatNumber(Math.abs(dx), 2), color: RUN },
              { label: 'up', value: formatNumber(Math.abs(dy), 2), color: RISE },
              { label: 'distance', value: formatNumber(d, 4) },
              { label: 'midpoint', value: fmt(M), color: MID },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-five-lab" when={Math.abs(d - 5) < 1e-9 && dx !== 0 && dy !== 0}>
          Place the points exactly 5 apart, without lining them up horizontally or vertically.
        </TryThis>
        <TryThis id="t-origin" when={M[0] === 0 && M[1] === 0 && d > 0}>
          Move the points so their midpoint is the origin. How are their coordinates related?
        </TryThis>
        <TryThis id="t-level" when={dy === 0 && dx !== 0}>
          Put both points on the same horizontal line. What does the formula reduce to?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function CircleExplorer() {
  const [r, setR] = useState(5)
  const [P, setP] = useState<Vec2>([1, 1])
  const [found, setFound] = useState<string[]>([])
  const d = Math.hypot(P[0], P[1])
  const onIt = Math.abs(d - r) < 1e-9
  const move = (x: number, y: number) => {
    setP([x, y])
    if (Math.abs(Math.hypot(x, y) - r) < 1e-9 && x !== 0 && y !== 0) {
      const key = `${r}:${x},${y}`
      setFound((f) => (f.includes(key) ? f : [...f, key]))
    }
  }
  const lattice = found.filter((k) => k.startsWith(`${r}:`)).length
  return (
    <LabSection id="circle" eyebrow="Explore" title="Every point at distance r">
      <Prose>
        <p>
          Which grid points are exactly <Tex>r</Tex> away from the origin? Drag the point around the
          whole-number grid: it turns green when its distance is exactly <Tex>r</Tex>. All such
          points lie on a circle, <Tex>{'x^2 + y^2 = r^2'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 6.5 }}
          aspect="equal"
          ariaLabel={`Point ${fmt(P)} at distance ${formatNumber(d, 3)}; circle of radius ${r}`}
        >
          <Circle center={[0, 0]} r={r} stroke="var(--c-green)" strokeWidth={1.5} dashed />
          <Segment from={[0, 0]} to={P} color={onIt ? 'var(--good)' : 'var(--ink-3)'} width={2} />
          <MovablePoint
            x={P[0]}
            y={P[1]}
            onMove={move}
            constrain={constraints.compose(
              constraints.snapToGrid(1),
              constraints.within(-6, 6, -6, 6),
            )}
            step={1}
            color={onIt ? 'var(--good)' : Q_COL}
            label="Point on the grid"
          />
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>r</Tex>}
            name="Radius r"
            value={r}
            min={1}
            max={6}
            step={1}
            onChange={setR}
            color="var(--c-green)"
          />
          <Readouts
            items={[
              { label: 'point', value: fmt(P) },
              { label: 'distance', value: formatNumber(d, 4) },
              {
                label: 'on the circle',
                value: onIt ? 'yes' : 'no',
                color: onIt ? 'var(--good)' : undefined,
              },
              { label: 'off-axis grid points found', value: String(lattice) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-lattice" when={found.filter((k) => k.startsWith('5:')).length >= 4}>
          With <Tex>r = 5</Tex>, find four grid points on the circle that are not on an axis.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const A: Vec2 = [-2, 1]
  const [B, setB] = useState<Vec2>([0, -2])
  const M: Vec2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-dist-lab"
          index={1}
          prompt="How far apart are $(1, 2)$ and $(4, 6)$?"
          answer={5}
          explanation="$\sqrt{3^2 + 4^2} = 5$."
        />
        <NumericChallenge
          id="c-mid-lab"
          index={2}
          prompt="What is the $x$-coordinate of the midpoint of $(2, 8)$ and $(6, -2)$?"
          answer={4}
          explanation="$\tfrac{2 + 6}{2} = 4$. (The midpoint is $(4, 3)$.)"
        />
        <McqChallenge
          id="c-circle"
          index={3}
          prompt="Which equation describes the circle with centre $(2, -1)$ and radius 3?"
          options={[
            { text: '$(x - 2)^2 + (y + 1)^2 = 9$', correct: true },
            { text: '$(x + 2)^2 + (y - 1)^2 = 9$', why: 'The signs flip: $(x - a)$ with $a = 2$.' },
            { text: '$(x - 2)^2 + (y + 1)^2 = 3$', why: 'The right side is $r^2 = 9$.' },
            { text: '$x^2 + y^2 = 9$', why: 'That circle is centred at the origin.' },
          ]}
          explanation="Distance from $(2, -1)$ equals 3: $(x - 2)^2 + (y + 1)^2 = 3^2$."
        />
        <NumericChallenge
          id="c-origin-lab"
          index={4}
          prompt="How far is $(-5, 12)$ from the origin?"
          answer={13}
          explanation="$\sqrt{25 + 144} = 13$."
        />
        <InteractiveChallenge
          id="c-place"
          index={5}
          prompt="$A$ is fixed at $(-2, 1)$. Drag $B$ so the midpoint of $AB$ is $(1, 3)$."
          solved={M[0] === 1 && M[1] === 3}
          hint="The midpoint is halfway, so $B$ is as far past $M$ as $A$ is before it."
          explanation="$B = (2 \cdot 1 - (-2),\; 2 \cdot 3 - 1) = (4, 5)$."
          onReset={() => setB([0, -2])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={VIEW}
              aspect="equal"
              ariaLabel={`A ${fmt(A)}, B ${fmt(B)}, midpoint ${fmt(M)}`}
            >
              <Segment from={A} to={B} color="var(--ink-2)" width={2} />
              <Point at={A} r={6} color={P_COL} />
              <Point at={[1, 3]} r={6} color={MID} />
              <Point at={M} r={4} color="var(--ink-2)" />
              <MovablePoint
                x={B[0]}
                y={B[1]}
                onMove={(x, y) => setB([x, y])}
                constrain={snapOne}
                step={1}
                color={Q_COL}
                label="Point B"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              B {fmt(B)} · midpoint {fmt(M)} · target (1, 3)
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
