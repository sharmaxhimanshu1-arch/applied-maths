import { useState } from 'react'
import { apply, columns, det, dot, heading, I2, norm, type Mat2, type Vec2 } from '@/math/linalg'
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
import { MatrixLab } from '@/tools/matrix/MatrixLab'
import { F_SHAPE } from '@/tools/matrix/presets'
import { Tex } from '@/ui/Tex'
import { usePlot } from '@/viz'
import { num } from '../_shared/tex'

const near = (a: Mat2, b: Mat2) => a.every((x, i) => Math.abs(x - b[i]) < 0.01)

/** Angle wrapped into (−π, π]. */
const wrap = (a: number) => a - 2 * Math.PI * Math.ceil((a - Math.PI) / (2 * Math.PI))

/** Polygon area by the shoelace formula. */
function area(points: readonly Vec2[]): number {
  let twice = 0
  for (let k = 0; k < points.length; k++) {
    const [x1, y1] = points[k]
    const [x2, y2] = points[(k + 1) % points.length]
    twice += x1 * y2 - x2 * y1
  }
  return Math.abs(twice) / 2
}

const SQUARE: Vec2[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]
const CIRCLE: Vec2[] = Array.from({ length: 180 }, (_, k) => {
  const a = (k / 180) * 2 * Math.PI
  return [Math.cos(a), Math.sin(a)]
})

function orientationWord(d: number) {
  if (Math.abs(d) < 1e-9) return 'squashed flat'
  return d > 0 ? 'kept' : 'flipped over'
}

/** Curved arrow from î towards ĵ: anticlockwise normally, clockwise once the plane is flipped. */
function OrientationArc({ m }: { m: Mat2 }) {
  const t = usePlot()
  const [i, j] = columns(m)
  const d = det(m)
  const r = Math.min(30, Math.min(norm(i), norm(j)) * t.kx * 0.55)
  if (Math.abs(d) < 1e-9 || r < 12) return null
  const a0 = heading(i)
  const sweep = wrap(heading(j) - a0)
  const start = a0 + sweep * 0.12
  const end = a0 + sweep * 0.78
  const cx = t.sx(0)
  const cy = t.sy(0)
  const x0 = cx + r * Math.cos(start)
  const y0 = cy - r * Math.sin(start)
  const x1 = cx + r * Math.cos(end)
  const y1 = cy - r * Math.sin(end)
  // Screen-space tangent at the end of the arc, in the direction of travel.
  const dir = sweep > 0 ? 1 : -1
  const tx = -Math.sin(end) * dir
  const ty = -Math.cos(end) * dir
  const h = 8
  const color = d > 0 ? 'var(--c-blue)' : 'var(--c-orange)'
  return (
    <g aria-hidden>
      <path
        d={`M${x0},${y0}A${r},${r} 0 0 ${sweep > 0 ? 0 : 1} ${x1},${y1}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon
        points={`${x1 + tx * h},${y1 + ty * h} ${x1 - ty * h * 0.5},${y1 + tx * h * 0.5} ${x1 + ty * h * 0.5},${y1 - tx * h * 0.5}`}
        fill={color}
      />
    </g>
  )
}

export default function DeterminantLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="One number for “how much bigger?”">
        <Prose>
          <p>
            A transformation can stretch some directions and squeeze others, so lengths change in
            complicated ways. Areas don't: every region of the plane grows or shrinks by the{' '}
            <em>same</em> factor. That factor is the <strong>determinant</strong>.
          </p>
          <p>
            It also has a sign. A negative determinant means the plane was flipped over, like a page
            seen in a mirror. And a determinant of zero means the whole plane was squashed flat.
          </p>
        </Prose>
      </LabSection>
      <SquareExplorer />
      <AnyShapeExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The formula, and why it works">
        <Formula
          tex={'\\det\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc'}
          caption="The signed area of the parallelogram spanned by the columns $(a, c)$ and $(b, d)$."
        />
        <Prose>
          <p>
            Check it on easy cases. A stretch{' '}
            <Tex>{'\\begin{bmatrix} a & 0 \\\\ 0 & d \\end{bmatrix}'}</Tex> turns the unit square
            into an <Tex>a \times d</Tex> rectangle, area <Tex>ad</Tex>. A shear{' '}
            <Tex>{'\\begin{bmatrix} 1 & b \\\\ 0 & 1 \\end{bmatrix}'}</Tex> slides the top edge
            sideways; base and height stay 1, so the area stays <Tex>1 \cdot 1 - b \cdot 0 = 1</Tex>
            . The <Tex>-bc</Tex> term corrects for columns that lean towards each other.
          </p>
        </Prose>
        <Formula
          tex={'\\det(BA) = \\det B \\cdot \\det A'}
          caption="Doing $A$ then $B$ scales areas by $\det A$, then by $\det B$."
        />
        <Callout kind="misconception">
          <p>
            A negative determinant does not mean a negative area. Its size is the area factor; its
            sign only records whether the plane was flipped over.
          </p>
        </Callout>
        <Callout kind="insight">
          <p>
            <Tex>{'\\det A = 0'}</Tex> exactly when the columns lie on one line. Then the plane is
            squashed flat: many points land on the same spot, and there is no way to undo it. That
            is the key to the next lab, inverses.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet determinants">
        <RealWorld
          items={[
            {
              title: 'Changing coordinates in calculus',
              body: 'When an integral switches to polar or other coordinates, a determinant (the Jacobian) says how much each little patch of area stretches.',
            },
            {
              title: 'Is this system solvable?',
              body: 'A zero determinant warns that a set of equations has no unique solution: two of them say the same thing, or contradict each other.',
            },
            {
              title: 'Games and 3D graphics',
              body: 'The sign of a small determinant tells a renderer which way a triangle winds, so it can skip faces pointing away from the camera.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$\\det A$ is the factor by which $A$ scales every area.',
            'A negative determinant means the plane is flipped over; its size is still the area factor.',
            '$\\det\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc$.',
            '$\\det A = 0$ means the plane is squashed onto a line (or a point), so $A$ cannot be undone.',
            '$\\det(BA) = \\det B \\cdot \\det A$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SquareExplorer() {
  const [m, setM] = useState<Mat2>([2, 0.5, 0.5, 1.5])
  const d = det(m)
  const [c1, c2] = columns(m)
  const orthonormal =
    Math.abs(norm(c1) - 1) < 0.01 && Math.abs(norm(c2) - 1) < 0.01 && Math.abs(dot(c1, c2)) < 0.01
  return (
    <LabSection id="explore" eyebrow="Explore" title="Watch the unit square">
      <Prose>
        <p>
          The shaded square starts with area 1. Drag the tips of <Tex>{'\\hat\\imath'}</Tex> and{' '}
          <Tex>{'\\hat\\jmath'}</Tex> and watch its area. The curved arrow turns from{' '}
          <Tex>{'\\hat\\imath'}</Tex> towards <Tex>{'\\hat\\jmath'}</Tex>; when it turns clockwise,
          the plane has been flipped over and everything goes orange.
        </p>
      </Prose>
      <PredictReveal
        question="A transformation stretches everything 3× sideways and 2× upwards. By what factor do areas grow?"
        options={['5', '6', '9', '1, because it only stretches']}
        answer={1}
        explanation="The unit square becomes a 3 by 2 rectangle, so every area grows 6 times: $\det\begin{bmatrix}3&0\\0&2\end{bmatrix} = 6$."
      />
      <Figure>
        <MatrixLab
          matrix={m}
          onMatrixChange={setM}
          preset={{ controls: 'compact', extent: 4 }}
          overlay={(shown) => <OrientationArc m={shown} />}
          ariaLabel={`The unit square becomes a parallelogram of area ${num(Math.abs(d))}, orientation ${orientationWord(d)}`}
        />
        <div className="border-t border-line px-3 pb-3">
          <Readouts
            items={[
              {
                label: 'area of the square',
                value: num(Math.abs(d)),
                color: d < 0 ? 'var(--c-orange)' : 'var(--c-blue)',
              },
              { label: 'orientation', value: orientationWord(d) },
            ]}
          />
          <div className="mt-3 overflow-x-auto">
            <Tex
              display
            >{`\\det A = ad - bc = (${num(m[0])})(${num(m[3])}) - (${num(m[1])})(${num(m[2])}) = ${num(d)}`}</Tex>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-double" when={Math.abs(d - 2) < 0.01}>
          Make the square's area exactly 2.
        </TryThis>
        <TryThis id="t-flip" when={d < -0.01}>
          Flip the plane over. What happens to the sign of the determinant?
        </TryThis>
        <TryThis id="t-flat" when={Math.abs(d) < 1e-9 && (norm(c1) > 0.1 || norm(c2) > 0.1)}>
          Squash the square completely flat.
        </TryThis>
        <TryThis id="t-same-area" when={Math.abs(d - 1) < 0.01 && !orthonormal}>
          Change the square's shape but keep its area exactly 1.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function AnyShapeExplorer() {
  const [m, setM] = useState<Mat2>([1.5, 0, 0.5, 1])
  const d = det(m)
  const [c1, c2] = columns(m)
  const keepsCircle =
    !near(m, I2) &&
    Math.abs(norm(c1) - 1) < 0.01 &&
    Math.abs(norm(c2) - 1) < 0.01 &&
    Math.abs(dot(c1, c2)) < 0.01
  const rows = [
    { name: 'Unit square', before: area(SQUARE), after: area(SQUARE.map((p) => apply(m, p))) },
    { name: 'F shape', before: area(F_SHAPE), after: area(F_SHAPE.map((p) => apply(m, p))) },
    { name: 'Unit circle', before: area(CIRCLE), after: area(CIRCLE.map((p) => apply(m, p))) },
  ]
  return (
    <LabSection id="any-shape" eyebrow="Explore" title="Every shape scales the same way">
      <Prose>
        <p>
          Here the square, the F and the dashed unit circle all get transformed together. The table
          measures each area before and after. Change the matrix and watch the last column.
        </p>
      </Prose>
      <Figure>
        <MatrixLab
          matrix={m}
          onMatrixChange={setM}
          preset={{ controls: 'compact', extent: 4, showShape: true, showCircle: true }}
          ariaLabel={`Square, F and circle transformed together; every area scales by ${num(Math.abs(d))}`}
        />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[26rem] text-sm">
            <caption className="sr-only">Areas before and after the transformation</caption>
            <thead>
              <tr className="text-left text-ink-2">
                <th scope="col" className="px-3 py-2 font-medium">
                  Shape
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Area before
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Area after
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  After ÷ before
                </th>
              </tr>
            </thead>
            <tbody className="tabular font-mono">
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-sans font-medium">
                    {r.name}
                  </th>
                  <td className="px-3 py-2 text-right">{num(r.before)}</td>
                  <td className="px-3 py-2 text-right">{num(r.after)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{num(r.after / r.before)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Figure>
      <Prose className="mt-4">
        <p>
          The last column always matches <Tex>{`|\\det A| = ${num(Math.abs(d))}`}</Tex>. Why? The
          transformed grid is made of identical parallelograms, each of area{' '}
          <Tex>{'|\\det A|'}</Tex>, and any shape can be filled with tiny grid squares.
        </p>
      </Prose>
      <TryThisList>
        <TryThis id="t-triple" when={Math.abs(Math.abs(d) - 3) < 0.01}>
          Find a matrix that makes every area exactly 3 times bigger.
        </TryThis>
        <TryThis id="t-circle" when={keepsCircle}>
          Find a matrix (not <Tex>I</Tex>) that keeps the circle a perfect circle of the same size.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [m, setM] = useState<Mat2>([1, 0, 0, 1])
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-compute"
          index={1}
          prompt="$\det\begin{bmatrix} 3 & 1 \\ 2 & 2 \end{bmatrix} = \;?$"
          answer={4}
          hint="$ad - bc$: multiply down the main diagonal, subtract the other diagonal."
          explanation="$3 \cdot 2 - 1 \cdot 2 = 6 - 2 = 4$: every area grows 4 times."
        />
        <InteractiveChallenge
          id="c-negative"
          index={2}
          prompt="Build a matrix with determinant exactly $-2$."
          solved={Math.abs(det(m) + 2) < 0.01}
          hint="Start with something that doubles areas, like $\begin{bmatrix}2&0\\0&1\end{bmatrix}$, then mirror it by flipping one column."
          explanation="For example $\begin{bmatrix}-2&0\\0&1\end{bmatrix}$ or $\begin{bmatrix}0&1\\2&0\end{bmatrix}$: areas double and the plane flips over."
          onReset={() => setM([1, 0, 0, 1])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <MatrixLab
              matrix={m}
              onMatrixChange={setM}
              preset={{ controls: 'compact', extent: 3 }}
              overlay={(shown) => <OrientationArc m={shown} />}
            />
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-product"
          index={3}
          prompt="$\det A = 2$ and $\det B = 5$. What is $\det(BA)$?"
          options={[
            { text: '$10$', correct: true },
            {
              text: '$7$',
              why: 'Area factors multiply: areas double, then grow 5 times more.',
            },
            { text: '$2.5$', why: 'Nothing is divided here; both steps scale areas up.' },
            { text: '$25$', why: 'That would be $\\det B$ applied twice.' },
          ]}
          explanation="Doing $A$ then $B$ scales areas by $2$, then by $5$: $2 \times 5 = 10$."
        />
        <McqChallenge
          id="c-zero"
          index={4}
          prompt="If $\det A = 0$, then $A$…"
          options={[
            { text: 'squashes the plane onto a line or a point', correct: true },
            { text: 'is the identity', why: 'The identity changes nothing, so $\\det I = 1$.' },
            {
              text: 'rotates the plane',
              why: 'Rotations keep every area: their determinant is 1.',
            },
            {
              text: 'leaves areas unchanged',
              why: 'That is a determinant of 1 (or −1 with a flip).',
            },
          ]}
          explanation="Zero area means the unit square collapsed: both columns lie on one line, and the plane goes with them."
        />
        <NumericChallenge
          id="c-area"
          index={5}
          prompt="What is the area of the parallelogram with sides $(3, 0)$ and $(1, 2)$?"
          answer={6}
          hint="Put the sides in the columns of a matrix and take its determinant."
          explanation="$\det\begin{bmatrix}3&1\\0&2\end{bmatrix} = 3 \cdot 2 - 1 \cdot 0 = 6$: base 3, height 2."
        />
      </ChallengeSet>
    </LabSection>
  )
}
