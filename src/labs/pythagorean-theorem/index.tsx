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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon, constraints } from '@/viz'

const A_SQ = 'var(--c-orange)'
const B_SQ = 'var(--c-green)'
const C_SQ = 'var(--c-blue)'
const TRI = 'var(--c-violet)'

/** Right triangle with legs on the axes, and a square drawn outward on each side. */
function SquaresPlot({
  a,
  b,
  onA,
  onB,
  label,
}: {
  a: number
  b: number
  onA: (a: number) => void
  onB: (b: number) => void
  label: string
}) {
  const A: Vec2 = [a, 0]
  const B: Vec2 = [0, b]
  const hyp: Vec2[] = [A, B, [B[0] + b, B[1] + a], [A[0] + b, A[1] + a]]
  return (
    <Plot view={{ xMin: -4.6, xMax: 8.6, yMin: -4.6, yMax: 8.6 }} aspect="equal" ariaLabel={label}>
      <Polygon
        points={[
          [0, 0],
          [a, 0],
          [a, -a],
          [0, -a],
        ]}
        fill={A_SQ}
        fillOpacity={0.3}
        stroke={A_SQ}
        strokeWidth={2}
      />
      <Polygon
        points={[
          [0, 0],
          [0, b],
          [-b, b],
          [-b, 0],
        ]}
        fill={B_SQ}
        fillOpacity={0.3}
        stroke={B_SQ}
        strokeWidth={2}
      />
      <Polygon points={hyp} fill={C_SQ} fillOpacity={0.25} stroke={C_SQ} strokeWidth={2} />
      <Polygon
        points={[[0, 0], A, B]}
        fill={TRI}
        fillOpacity={0.35}
        stroke={TRI}
        strokeWidth={2.5}
      />
      <Polygon
        points={[
          [0, 0],
          [0.4, 0],
          [0.4, 0.4],
          [0, 0.4],
        ]}
        fill="none"
        fillOpacity={0}
        stroke={TRI}
        strokeWidth={1.25}
      />
      <Label at={[a / 2, -a / 2]} anchor="center" color={A_SQ}>
        <Tex>{`a^2 = ${formatNumber(a * a, 2)}`}</Tex>
      </Label>
      <Label at={[-b / 2, b / 2]} anchor="center" color={B_SQ}>
        <Tex>{`b^2 = ${formatNumber(b * b, 2)}`}</Tex>
      </Label>
      <Label at={[(a + b) / 2, (a + b) / 2]} anchor="center" color={C_SQ}>
        <Tex>{`c^2 = ${formatNumber(a * a + b * b, 2)}`}</Tex>
      </Label>
      <MovablePoint
        x={a}
        y={0}
        onMove={(x) => onA(x)}
        constrain={constraints.compose(
          constraints.snapToGrid(0.5),
          constraints.within(0.5, 4, 0, 0),
        )}
        step={0.5}
        color={A_SQ}
        label="Length of leg a"
      />
      <MovablePoint
        x={0}
        y={b}
        onMove={(_x, y) => onB(y)}
        constrain={constraints.compose(
          constraints.snapToGrid(0.5),
          constraints.within(0, 0, 0.5, 4),
        )}
        step={0.5}
        color={B_SQ}
        label="Length of leg b"
      />
    </Plot>
  )
}

export default function PythagoreanTheoremLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Squares on the sides">
        <Prose>
          <p>
            Take any right-angled triangle and build a square on each side. Something remarkable
            happens: the two smaller squares together have exactly the same area as the big one on
            the longest side, the <strong>hypotenuse</strong>.
          </p>
          <p>
            That's the <strong>Pythagorean theorem</strong>, and it turns “how far?” questions into
            arithmetic. Ladders, screen sizes, shortest routes, distances on a map: any time two
            directions meet at a right angle, it's there.
          </p>
        </Prose>
      </LabSection>
      <SquaresExplorer />
      <ProofExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The theorem">
        <Formula
          tex={'a^2 + b^2 = c^2'}
          caption="$a$ and $b$ are the legs (the sides that make the right angle) and $c$ is the hypotenuse, opposite the right angle."
        />
        <Prose>
          <p>
            To find the hypotenuse, <Tex>{'c = \\sqrt{a^2 + b^2}'}</Tex>; to find a leg,{' '}
            <Tex>{'a = \\sqrt{c^2 - b^2}'}</Tex>. Whole-number solutions like 3-4-5 and 5-12-13 are
            called <em>Pythagorean triples</em>; builders have used 3-4-5 ropes to lay out square
            corners for thousands of years.
          </p>
          <p>
            It also works backwards: if <Tex>{'a^2 + b^2 = c^2'}</Tex>, the triangle has a right
            angle. If <Tex>{'a^2 + b^2 > c^2'}</Tex> the angle opposite <Tex>c</Tex> is acute; if it
            is less, obtuse.
          </p>
        </Prose>
        <Callout kind="misconception" title="Only for right-angled triangles">
          <p>
            <Tex>{'a^2 + b^2 = c^2'}</Tex> fails for other triangles. For those, the law of cosines
            adds a correction term. And <Tex>c</Tex> must be the longest side, opposite the right
            angle.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Right angles everywhere">
        <RealWorld
          items={[
            {
              title: 'Screen sizes',
              body: 'A “55-inch” TV is 55 inches across the diagonal: the hypotenuse of its width and height.',
            },
            {
              title: 'Ladders',
              body: 'How high a ladder reaches depends on its length and how far its foot is from the wall: $h = \\sqrt{L^2 - d^2}$.',
            },
            {
              title: 'Navigation',
              body: 'Walk 3 km east and 4 km north and you are 5 km from where you started, as the crow flies.',
            },
            {
              title: 'Building',
              body: 'Builders check a corner is square by measuring 3, 4 and 5 units along the sides and diagonal.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'In a right triangle, $a^2 + b^2 = c^2$, where $c$ is the hypotenuse.',
            'Geometrically: the squares on the two legs together equal the square on the hypotenuse.',
            '$c = \\sqrt{a^2 + b^2}$; a leg is $\\sqrt{c^2 - (\\text{other leg})^2}$.',
            'It only holds when there is a right angle, and it detects one.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SquaresExplorer() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(2)
  const c = Math.hypot(a, b)
  const whole = Math.abs(c - Math.round(c)) < 1e-9
  return (
    <LabSection id="explore" eyebrow="Explore" title="Build squares on the sides">
      <Prose>
        <p>
          Drag the ends of the two legs to change the right triangle. Each side carries a square.
          Compare the orange and green areas with the blue one on the hypotenuse.
        </p>
      </Prose>
      <PredictReveal
        question="The legs are 3 and 4. How long is the hypotenuse?"
        options={['5', '7', '12', '25']}
        answer={0}
        explanation="$3^2 + 4^2 = 9 + 16 = 25$, and $\sqrt{25} = 5$. (25 is the area of the big square, not its side.)"
      />
      <Figure>
        <div className="mx-auto w-full max-w-xl">
          <SquaresPlot
            a={a}
            b={b}
            onA={setA}
            onB={setB}
            label={`Right triangle with legs ${a} and ${b}, hypotenuse ${formatNumber(c, 3)}`}
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'a² + b²', value: formatNumber(a * a + b * b, 3), color: A_SQ },
              { label: 'c²', value: formatNumber(c * c, 3), color: C_SQ },
              { label: 'hypotenuse c', value: formatNumber(c, 4), color: C_SQ },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-345-lab" when={whole && c === 5}>
          Make the hypotenuse exactly 5.
        </TryThis>
        <TryThis id="t-equal-lab" when={a === b && a >= 2}>
          Make the legs equal (2 or more). How does the big square compare with one small one?
        </TryThis>
        <TryThis id="t-whole" when={whole && c !== 5}>
          Find another triangle whose hypotenuse comes out a whole number.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Layout = 'tilted' | 'split'

/** Two arrangements of the same four triangles inside a square of side a + b. */
function proofPieces(a: number, b: number, layout: Layout) {
  const s = a + b
  if (layout === 'tilted') {
    const tris: Vec2[][] = [
      [
        [0, 0],
        [a, 0],
        [0, b],
      ],
      [
        [s, 0],
        [s, a],
        [a, 0],
      ],
      [
        [s, s],
        [b, s],
        [s, a],
      ],
      [
        [0, s],
        [0, b],
        [b, s],
      ],
    ]
    return {
      tris,
      gaps: [
        {
          pts: [
            [a, 0],
            [s, a],
            [b, s],
            [0, b],
          ] as Vec2[],
          color: C_SQ,
          label: 'c²',
          at: [s / 2, s / 2] as Vec2,
        },
      ],
    }
  }
  const tris: Vec2[][] = [
    [
      [a, 0],
      [s, 0],
      [s, a],
    ],
    [
      [a, 0],
      [s, a],
      [a, a],
    ],
    [
      [0, a],
      [a, a],
      [a, s],
    ],
    [
      [0, a],
      [a, s],
      [0, s],
    ],
  ]
  return {
    tris,
    gaps: [
      {
        pts: [
          [0, 0],
          [a, 0],
          [a, a],
          [0, a],
        ] as Vec2[],
        color: A_SQ,
        label: 'a²',
        at: [a / 2, a / 2] as Vec2,
      },
      {
        pts: [
          [a, a],
          [s, a],
          [s, s],
          [a, s],
        ] as Vec2[],
        color: B_SQ,
        label: 'b²',
        at: [a + b / 2, a + b / 2] as Vec2,
      },
    ],
  }
}

function ProofExplorer() {
  const [layout, setLayout] = useState<Layout>('tilted')
  const [a, setA] = useState(2)
  const b = 3
  const { tris, gaps } = proofPieces(a, b, layout)
  const [seen, setSeen] = useState<Layout[]>(['tilted'])
  return (
    <LabSection id="proof" eyebrow="Explore" title="A proof you can see">
      <Prose>
        <p>
          A big square of side <Tex>a + b</Tex> holds four copies of the triangle. Arrange them one
          way and the empty space is a tilted square, <Tex>{'c^2'}</Tex>. Rearrange them and the
          empty space is two squares, <Tex>{'a^2'}</Tex> and <Tex>{'b^2'}</Tex>. Same big square,
          same triangles, so the empty areas must be equal.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Arrangement"
            value={layout}
            onChange={(v) => {
              setLayout(v)
              setSeen((s) => (s.includes(v) ? s : [...s, v]))
            }}
            options={[
              { value: 'tilted', label: 'Arrangement 1' },
              { value: 'split', label: 'Arrangement 2' },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-sm p-3">
          <Plot
            view={{ xMin: -0.3, xMax: 6.3, yMin: -0.3, yMax: 6.3 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`Arrangement ${layout === 'tilted' ? 1 : 2} of four triangles`}
          >
            <Polygon
              points={[
                [0, 0],
                [a + b, 0],
                [a + b, a + b],
                [0, a + b],
              ]}
              fill="none"
              fillOpacity={0}
              stroke="var(--ink-2)"
              strokeWidth={2}
            />
            {gaps.map((g) => (
              <g key={g.label}>
                <Polygon
                  points={g.pts}
                  fill={g.color}
                  fillOpacity={0.3}
                  stroke={g.color}
                  strokeWidth={1.5}
                />
                <Label at={g.at} anchor="center" color={g.color}>
                  <Tex>{g.label.replace('²', '^2')}</Tex>
                </Label>
              </g>
            ))}
            {tris.map((t, i) => (
              <Polygon
                key={i}
                points={t}
                fill={TRI}
                fillOpacity={0.4}
                stroke={TRI}
                strokeWidth={1.5}
              />
            ))}
          </Plot>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider label="Leg a" value={a} min={1} max={3} step={0.5} onChange={setA} color={A_SQ} />
          <Readouts
            items={[
              {
                label: layout === 'tilted' ? 'empty area c²' : 'empty area a² + b²',
                value: formatNumber(a * a + b * b, 2),
              },
              { label: 'big square', value: formatNumber((a + b) ** 2, 2) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-both" when={seen.length === 2}>
          Look at both arrangements. Why must <Tex>{'c^2'}</Tex> equal <Tex>{'a^2 + b^2'}</Tex>?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-hyp-lab"
          index={1}
          prompt="The legs of a right triangle are 6 and 8. How long is the hypotenuse?"
          answer={10}
          explanation="$\sqrt{36 + 64} = \sqrt{100} = 10$."
        />
        <NumericChallenge
          id="c-leg"
          index={2}
          prompt="The hypotenuse is 13 and one leg is 5. How long is the other leg?"
          answer={12}
          explanation="$\sqrt{169 - 25} = \sqrt{144} = 12$."
        />
        <McqChallenge
          id="c-which"
          index={3}
          prompt="Which side lengths make a right-angled triangle?"
          options={[
            { text: '5, 12, 13', correct: true },
            { text: '4, 5, 6', why: '$16 + 25 = 41 \\ne 36$.' },
            { text: '2, 3, 4', why: '$4 + 9 = 13 \\ne 16$.' },
            { text: '6, 6, 9', why: '$36 + 36 = 72 \\ne 81$.' },
          ]}
          explanation="$25 + 144 = 169 = 13^2$."
        />
        <NumericChallenge
          id="c-ladder-lab"
          index={4}
          prompt="A 5 m ladder leans against a wall with its foot 3 m out. How high up the wall does it reach, in m?"
          answer={4}
          explanation="$\sqrt{5^2 - 3^2} = \sqrt{16} = 4$ m."
        />
        <InteractiveChallenge
          id="c-five"
          index={5}
          prompt="Drag the legs so the hypotenuse is exactly 5."
          solved={a * a + b * b === 25}
          hint="Look for two squares that add to 25."
          explanation="Legs 3 and 4: $9 + 16 = 25$."
          onReset={() => {
            setA(1)
            setB(1)
          }}
        >
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-line">
            <SquaresPlot a={a} b={b} onA={setA} onB={setB} label={`Legs ${a} and ${b}`} />
            <p className="border-t border-line px-3 py-2 text-sm">
              Hypotenuse: <span className="font-mono">{formatNumber(Math.hypot(a, b), 4)}</span>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
