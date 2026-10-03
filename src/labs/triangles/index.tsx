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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  InfiniteLine,
  Label,
  MovablePoint,
  Plot,
  Polygon,
  Segment,
  constraints,
} from '@/viz'
import { angleAt, interiorArc } from '../_shared/geometry'

const A_COL = 'var(--c-orange)'
const B_COL = 'var(--c-green)'
const C_COL = 'var(--c-violet)'
const EDGE = 'var(--c-blue)'
const PARALLEL = 'var(--ink-3)'

const VIEW = { xMin: -5, xMax: 5, yMin: -3.2, yMax: 3.8 }
const snapIn = constraints.compose(
  constraints.snapToGrid(0.5),
  constraints.within(-4.5, 4.5, -2.5, 3.5),
)

const sq = (p: Vec2, q: Vec2) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2

/** Side and angle types, using exact squared lengths so grid triangles classify cleanly. */
function classify(A: Vec2, B: Vec2, C: Vec2) {
  const s = [sq(B, C), sq(A, C), sq(A, B)].sort((x, y) => x - y)
  const eq = (x: number, y: number) => Math.abs(x - y) < 1e-9
  const sides = eq(s[0], s[2])
    ? 'equilateral'
    : eq(s[0], s[1]) || eq(s[1], s[2])
      ? 'isosceles'
      : 'scalene'
  const gap = s[0] + s[1] - s[2]
  const angles = Math.abs(gap) < 1e-9 ? 'right' : gap < 0 ? 'obtuse' : 'acute'
  return { sides, angles }
}

function Arc({
  p,
  q,
  r,
  color,
  radius = 26,
}: {
  p: Vec2
  q: Vec2
  r: Vec2
  color: string
  radius?: number
}) {
  const { from, to } = interiorArc(p, q, r)
  return <AngleArc center={q} from={from} to={to} radius={radius} color={color} />
}

function TrianglePlot({
  A,
  B,
  C,
  onA,
  onB,
  onC,
  proof = false,
  label,
}: {
  A: Vec2
  B: Vec2
  C: Vec2
  onA: (p: Vec2) => void
  onB: (p: Vec2) => void
  onC: (p: Vec2) => void
  proof?: boolean
  label: string
}) {
  const dir: Vec2 = [B[0] - A[0], B[1] - A[1]]
  const back: Vec2 = [C[0] - dir[0], C[1] - dir[1]]
  const fwd: Vec2 = [C[0] + dir[0], C[1] + dir[1]]
  return (
    <Plot view={VIEW} aspect="equal" ariaLabel={label}>
      <Polygon points={[A, B, C]} fill={EDGE} fillOpacity={0.12} stroke={EDGE} strokeWidth={2.5} />
      <Arc p={C} q={A} r={B} color={A_COL} />
      <Arc p={A} q={B} r={C} color={B_COL} />
      <Arc p={A} q={C} r={B} color={C_COL} />
      {proof && (
        <>
          <InfiniteLine through={C} direction={dir} color={PARALLEL} width={1.5} dashed />
          <Arc p={back} q={C} r={A} color={A_COL} radius={38} />
          <Arc p={B} q={C} r={fwd} color={B_COL} radius={38} />
        </>
      )}
      <Label at={A} anchor="top-right" offset={[-6, 6]} color={A_COL}>
        A
      </Label>
      <Label at={B} anchor="top-left" offset={[6, 6]} color={B_COL}>
        B
      </Label>
      <Label at={C} anchor="bottom" offset={[0, -10]} color={C_COL}>
        C
      </Label>
      <MovablePoint
        x={A[0]}
        y={A[1]}
        onMove={(x, y) => onA([x, y])}
        constrain={snapIn}
        step={0.5}
        color={A_COL}
        label="Vertex A"
      />
      <MovablePoint
        x={B[0]}
        y={B[1]}
        onMove={(x, y) => onB([x, y])}
        constrain={snapIn}
        step={0.5}
        color={B_COL}
        label="Vertex B"
      />
      <MovablePoint
        x={C[0]}
        y={C[1]}
        onMove={(x, y) => onC([x, y])}
        constrain={snapIn}
        step={0.5}
        color={C_COL}
        label="Vertex C"
      />
    </Plot>
  )
}

export default function TrianglesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The strongest shape">
        <Prose>
          <p>
            Push on a square frame and it folds into a rhombus. Push on a triangle and it holds:
            three sides fix the shape completely. That's why bridges, cranes and roof trusses are
            built from triangles.
          </p>
          <p>
            Triangles also hide a surprising rule. However long, thin or lopsided you make one, its
            three angles always add up to exactly the same total. You're about to see why.
          </p>
        </Prose>
      </LabSection>
      <AngleSumExplorer />
      <InequalityExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Triangle facts">
        <Formula
          tex={'\\angle A + \\angle B + \\angle C = 180^\\circ'}
          caption="Draw a line through C parallel to AB: the angles at C copy A and B, and together they make a straight line."
        />
        <Formula
          tex={'a + b > c, \\quad b + c > a, \\quad a + c > b'}
          caption="The triangle inequality: any two sides together must be longer than the third."
        />
        <Prose>
          <ul>
            <li>
              By sides: <em>equilateral</em> (all equal, all angles <Tex>{'60^\\circ'}</Tex>),{' '}
              <em>isosceles</em> (two equal sides and two equal base angles), <em>scalene</em> (all
              different).
            </li>
            <li>
              By angles: <em>acute</em> (all under <Tex>{'90^\\circ'}</Tex>), <em>right</em> (one
              exactly <Tex>{'90^\\circ'}</Tex>), <em>obtuse</em> (one over <Tex>{'90^\\circ'}</Tex>
              ).
            </li>
            <li>
              An <em>exterior angle</em> equals the sum of the two interior angles opposite it.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="A triangle can't have two right angles">
          <p>
            Two right angles already use up <Tex>{'180^\\circ'}</Tex>, leaving nothing for the
            third. The two “sides” would be parallel and never meet.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Triangles everywhere">
        <RealWorld
          items={[
            {
              title: 'Bridges and cranes',
              body: 'Trusses are networks of triangles: each triangle keeps its shape, so the whole structure is rigid.',
            },
            {
              title: 'Navigation',
              body: 'Triangulation finds your position from angles to two known landmarks. GPS uses a 3-D cousin of the idea.',
            },
            {
              title: 'Computer graphics',
              body: 'Every 3-D model in a game is a mesh of thousands of tiny triangles.',
            },
            {
              title: 'Shortest routes',
              body: 'The triangle inequality says a detour is never shorter than going straight: the basis of route-finding.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'The angles of any triangle add to $180^\\circ$.',
            'Any two sides together are longer than the third.',
            'Classify by sides (equilateral, isosceles, scalene) and by angles (acute, right, obtuse).',
            'Three sides fix a triangle completely, which makes it rigid.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function AngleSumExplorer() {
  const [A, setA] = useState<Vec2>([-3, -1.5])
  const [B, setB] = useState<Vec2>([3, -1.5])
  const [C, setC] = useState<Vec2>([-1, 2])
  const [proof, setProof] = useState(false)
  const a = angleAt(C, A, B)
  const b = angleAt(A, B, C)
  const c = angleAt(A, C, B)
  const degenerate = a < 0.01 || b < 0.01 || c < 0.01
  const { sides, angles } = classify(A, B, C)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Always 180°">
      <Prose>
        <p>
          Drag the corners anywhere. The three coloured angles change, but check their sum. Then
          switch on the proof: a line through C, parallel to AB, copies angles A and B up to C.
        </p>
      </Prose>
      <PredictReveal
        question="If you drag C very far up, so the triangle becomes tall and thin, what happens to the angle sum?"
        options={['It grows', 'It shrinks', 'It stays $180^\\circ$']}
        answer={2}
        explanation="It stays $180^\circ$. Angle C shrinks exactly as much as A and B grow."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Switch checked={proof} onChange={setProof} label="Show the parallel-line proof" />
        </div>
        <TrianglePlot
          A={A}
          B={B}
          C={C}
          onA={setA}
          onB={setB}
          onC={setC}
          proof={proof}
          label={`Triangle with angles ${Math.round(a)}, ${Math.round(b)} and ${Math.round(c)} degrees`}
        />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'A', value: `${formatNumber(a, 1)}°`, color: A_COL },
              { label: 'B', value: `${formatNumber(b, 1)}°`, color: B_COL },
              { label: 'C', value: `${formatNumber(c, 1)}°`, color: C_COL },
              {
                label: 'sum',
                value: degenerate ? 'no triangle' : `${formatNumber(a + b + c, 1)}°`,
              },
              { label: 'type', value: degenerate ? '–' : `${sides}, ${angles}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-right" when={!degenerate && angles === 'right'}>
          Make a right-angled triangle. What do the other two angles add to?
        </TryThis>
        <TryThis id="t-obtuse" when={!degenerate && angles === 'obtuse'}>
          Make an obtuse triangle. Can it have two obtuse angles?
        </TryThis>
        <TryThis id="t-isosceles" when={!degenerate && sides === 'isosceles'}>
          Make an isosceles triangle. Which two angles match?
        </TryThis>
        <TryThis id="t-proof" when={proof && !degenerate}>
          Switch on the proof. Why do the three angles at C make a straight line?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function InequalityExplorer() {
  const [a, setA] = useState(4)
  const [b, setB] = useState(3)
  const [c, setC] = useState(6)
  const longest = Math.max(a, b, c)
  const slack = a + b + c - 2 * longest
  const possible = slack > 1e-9
  const flat = Math.abs(slack) < 1e-9
  const x = (b * b - a * a + c * c) / (2 * c)
  const y = Math.sqrt(Math.max(0, b * b - x * x))
  const L: Vec2 = [-c / 2, 0]
  const R: Vec2 = [c / 2, 0]
  const apex: Vec2 = [L[0] + x, y]
  // If it can't close, lay the two arms flat towards each other to show the gap.
  const leftTip: Vec2 = possible || flat ? apex : [L[0] + b, 0]
  const rightTip: Vec2 = possible || flat ? apex : [R[0] - a, 0]
  return (
    <LabSection id="inequality" eyebrow="Explore" title="Can these sides make a triangle?">
      <Prose>
        <p>
          Choose three side lengths. The base is <Tex>c</Tex>; the arms <Tex>b</Tex> and{' '}
          <Tex>a</Tex> swing up from its ends. If they're too short, they can't meet, however you
          angle them.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -6.5, xMax: 6.5, yMin: -1.2, yMax: 6 }}
          aspect="equal"
          ariaLabel={`Sides ${a}, ${b} and ${c}: ${possible ? 'a triangle' : flat ? 'a flat line' : 'no triangle'}`}
        >
          <Segment from={L} to={R} color={EDGE} width={3} />
          <Segment from={L} to={leftTip} color={B_COL} width={3} />
          <Segment from={R} to={rightTip} color={A_COL} width={3} />
          {!possible && !flat && (
            <Label
              at={[(leftTip[0] + rightTip[0]) / 2, 0]}
              anchor="bottom"
              offset={[0, -8]}
              className="text-xs"
            >
              {longest === c ? 'gap' : 'too short to close'}
            </Label>
          )}
          <Label at={[0, 0]} anchor="top" offset={[0, 6]} color={EDGE} className="text-xs">
            c = {c}
          </Label>
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
          <Slider
            label={<Tex>a</Tex>}
            name="Side a"
            value={a}
            min={1}
            max={10}
            step={0.5}
            onChange={setA}
            color={A_COL}
          />
          <Slider
            label={<Tex>b</Tex>}
            name="Side b"
            value={b}
            min={1}
            max={10}
            step={0.5}
            onChange={setB}
            color={B_COL}
          />
          <Slider
            label={<Tex>c</Tex>}
            name="Side c"
            value={c}
            min={1}
            max={10}
            step={0.5}
            onChange={setC}
            color={EDGE}
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'two shorter sides', value: formatNumber(a + b + c - longest, 1) },
              { label: 'longest side', value: formatNumber(longest, 1) },
              {
                label: 'result',
                value: possible ? 'a triangle' : flat ? 'flat: no area' : 'impossible',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-impossible" when={!possible && !flat}>
          Choose three lengths that can't make a triangle.
        </TryThis>
        <TryThis id="t-flat" when={flat}>
          Find lengths where the triangle collapses flat. What's special about them?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [A, setA] = useState<Vec2>([-3, -1.5])
  const [B, setB] = useState<Vec2>([3, -1.5])
  const [C, setC] = useState<Vec2>([-1, 2])
  const { angles } = classify(A, B, C)
  const area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-third"
          index={1}
          prompt="Two angles of a triangle are $50^\circ$ and $60^\circ$. What is the third?"
          answer={70}
          explanation="$180 - 50 - 60 = 70$."
        />
        <NumericChallenge
          id="c-isosceles"
          index={2}
          prompt="An isosceles triangle has a top angle of $40^\circ$. What is each base angle?"
          answer={70}
          explanation="The base angles are equal and share $180 - 40 = 140$: $70^\circ$ each."
        />
        <McqChallenge
          id="c-sides"
          index={3}
          prompt="Can sides of length 2, 3 and 6 make a triangle?"
          options={[
            { text: 'No: $2 + 3$ is shorter than 6', correct: true },
            { text: 'Yes, a scalene one', why: 'Check the triangle inequality first.' },
            { text: 'Yes, an obtuse one', why: 'The two short sides can’t reach across 6.' },
            { text: 'Only a flat one', why: 'Flat needs $2 + 3 = 6$ exactly.' },
          ]}
          explanation="Any two sides must add to more than the third: $2 + 3 = 5 < 6$."
        />
        <NumericChallenge
          id="c-exterior"
          index={4}
          prompt="Two interior angles of a triangle are $50^\circ$ and $60^\circ$. Extend the third side: what is the exterior angle there?"
          answer={110}
          hint="The exterior angle and the third interior angle sit on a straight line."
          explanation="The third angle is $70^\circ$, so the exterior is $180 - 70 = 110^\circ = 50^\circ + 60^\circ$."
        />
        <InteractiveChallenge
          id="c-make-right"
          index={5}
          prompt="Drag the corners to make a right-angled triangle."
          solved={area > 0.01 && angles === 'right'}
          hint="Put two corners on the same horizontal line and the third straight above one of them."
          explanation="One angle is exactly $90^\circ$; the other two then add to $90^\circ$."
          onReset={() => {
            setA([-3, -1.5])
            setB([3, -1.5])
            setC([-1, 2])
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <TrianglePlot
              A={A}
              B={B}
              C={C}
              onA={setA}
              onB={setB}
              onC={setC}
              label="A triangle to reshape"
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
