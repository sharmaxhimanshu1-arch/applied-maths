import { useState } from 'react'
import { add, columns, det, norm, scale, type Mat2, type Vec2 } from '@/math/linalg'
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
import { MatrixLab } from '@/tools/matrix/MatrixLab'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Vector, constraints } from '@/viz'
import { COLORS, mat, num, vec } from '../_shared/tex'

const near = (a: Mat2, b: Mat2) => a.every((x, i) => Math.abs(x - b[i]) < 0.01)

/** î stays put while ĵ leans sideways. */
const isShear = ([a, b, c, d]: Mat2) =>
  Math.abs(a - 1) < 0.01 && Math.abs(c) < 0.01 && Math.abs(d - 1) < 0.01 && Math.abs(b) > 0.1

export default function LinearTransformationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="A matrix moves the whole plane">
        <Prose>
          <p>
            Imagine the plane printed on a rubber sheet with a grid on it. A{' '}
            <strong>linear transformation</strong> stretches, turns, flips or shears that sheet,
            with two rules: the origin stays pinned, and grid lines stay straight, parallel and
            evenly spaced.
          </p>
          <p>
            Here's the surprise that makes linear algebra work: to know where <em>every</em> point
            goes, you only need to know where two arrows land, the unit arrows{' '}
            <Tex>{'\\hat\\imath'}</Tex> and <Tex>{'\\hat\\jmath'}</Tex>. Write those two landing
            spots side by side and you have a <strong>matrix</strong>.
          </p>
        </Prose>
      </LabSection>
      <WarpExplorer />
      <FollowOneVector />
      <LabSection id="formalize" eyebrow="Formalize" title="Columns are where the basis lands">
        <Formula
          tex={
            'A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\qquad A\\begin{bmatrix} x \\\\ y \\end{bmatrix} = x\\begin{bmatrix} a \\\\ c \\end{bmatrix} + y\\begin{bmatrix} b \\\\ d \\end{bmatrix} = \\begin{bmatrix} ax + by \\\\ cx + dy \\end{bmatrix}'
          }
          caption="The first column is where $\hat\imath$ lands; the second is where $\hat\jmath$ lands."
        />
        <Prose>
          <p>
            Because the input <Tex>(x, y)</Tex> means “<Tex>x</Tex> steps along{' '}
            <Tex>{'\\hat\\imath'}</Tex> plus <Tex>y</Tex> steps along <Tex>{'\\hat\\jmath'}</Tex>”,
            its image is the same recipe using the <em>moved</em> arrows. That's all matrix-vector
            multiplication is.
          </p>
        </Prose>
        <Callout kind="misconception">
          <p>
            Sliding everything over (a <strong>translation</strong>) is not a linear transformation:
            it moves the origin. Linear transformations can rotate, reflect, stretch and shear, but
            the origin always stays put.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet transformations">
        <RealWorld
          items={[
            {
              title: 'Computer graphics',
              body: 'Rotating a character, zooming a map or slanting italic text: each is a matrix applied to every point of the shape.',
            },
            {
              title: 'Robotics',
              body: 'Robots describe how each joint turns as a matrix, then convert coordinates between the arm, the gripper and the world.',
            },
            {
              title: 'Image processing',
              body: 'Straightening a photographed document or correcting lens tilt is a transformation of pixel coordinates.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A linear transformation keeps the origin fixed and grid lines straight, parallel and evenly spaced.',
            'It is completely described by where $\\hat\\imath$ and $\\hat\\jmath$ land: the columns of its matrix.',
            '$A(x, y) = x \\cdot (\\text{column 1}) + y \\cdot (\\text{column 2})$.',
            'Rotations, reflections, stretches and shears are all linear; translations are not.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function WarpExplorer() {
  const [m, setM] = useState<Mat2>([1.5, 0.5, 0, 1])
  const [c1, c2] = columns(m)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Drag the basis, warp the plane">
      <Prose>
        <p>
          Drag the tips of the green <Tex>{'\\hat\\imath'}</Tex> and red <Tex>{'\\hat\\jmath'}</Tex>
          . The blue grid shows where the old grid lines end up, and the purple F shows what happens
          to a shape. Press <strong>Animate from I</strong> to watch the plane move from where it
          started.
        </p>
      </Prose>
      <Figure>
        <MatrixLab
          matrix={m}
          onMatrixChange={setM}
          preset={{ showShape: true, controls: 'compact', extent: 4.5 }}
          ariaLabel={`The plane transformed by the matrix with columns (${num(c1[0])}, ${num(c1[1])}) and (${num(c2[0])}, ${num(c2[1])})`}
        />
      </Figure>
      <TryThisList>
        <TryThis id="t-rotate" when={near(m, [0, -1, 1, 0])}>
          Rotate the plane a quarter turn anticlockwise.
        </TryThis>
        <TryThis id="t-flip" when={det(m) < 0}>
          Turn the F into its mirror image.
        </TryThis>
        <TryThis id="t-shear" when={isShear(m)}>
          Make a <strong>shear</strong>: leave <Tex>{'\\hat\\imath'}</Tex> alone and lean{' '}
          <Tex>{'\\hat\\jmath'}</Tex> sideways.
        </TryThis>
        <TryThis id="t-squash" when={Math.abs(det(m)) < 1e-9 && (norm(c1) > 0.1 || norm(c2) > 0.1)}>
          Squash the entire plane onto a single line.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function FollowOneVector() {
  const [i, setI] = useState<Vec2>([2, 0.5])
  const [j, setJ] = useState<Vec2>([-0.5, 1.5])
  const [x, setX] = useState(2)
  const [y, setY] = useState(1)
  const xi = scale(i, x)
  const image = add(xi, scale(j, y))
  const m: Mat2 = [i[0], j[0], i[1], j[1]]
  const snap = constraints.snapToGrid(0.5)
  return (
    <LabSection id="follow" eyebrow="Explore" title="Follow one vector">
      <Prose>
        <p>
          Pick an input <Tex>(x, y)</Tex> with the sliders. Its image is built from the moved
          arrows: <Tex>x</Tex> copies of the new <Tex>{'\\hat\\imath'}</Tex>, then <Tex>y</Tex>{' '}
          copies of the new <Tex>{'\\hat\\jmath'}</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="If $\hat\imath$ lands on $(2, 0)$ and $\hat\jmath$ stays at $(0, 1)$, where does $(1, 1)$ go?"
        options={['$(2, 1)$', '$(1, 1)$', '$(2, 2)$', '$(3, 1)$']}
        answer={0}
        explanation={
          <>
            One copy of <Tex>(2, 0)</Tex> plus one copy of <Tex>(0, 1)</Tex> is <Tex>(2, 1)</Tex>:
            the plane is stretched sideways by 2.
          </>
        }
      />
      <Figure>
        <Plot
          view={{ xMin: -8, xMax: 8, yMin: -5, yMax: 5 }}
          aspect="equal"
          ariaLabel={`The vector (${num(x)}, ${num(y)}) lands on (${num(image[0])}, ${num(image[1])})`}
        >
          <Vector to={xi} color={COLORS.i} dashed width={2.25} />
          <Vector from={xi} to={image} color={COLORS.j} dashed width={2.25} />
          <Vector to={image} color={COLORS.result} width={3.25} />
          <Vector to={i} color={COLORS.i} />
          <Vector to={j} color={COLORS.j} />
          <Label at={i} anchor="bottom-left" offset={[8, -4]}>
            <Tex>{'\\hat\\imath'}</Tex>
          </Label>
          <Label at={j} anchor="bottom-right" offset={[-8, -4]}>
            <Tex>{'\\hat\\jmath'}</Tex>
          </Label>
          <Label at={image} anchor="bottom-left" offset={[8, -4]} color={COLORS.result}>
            <Tex>{`A\\begin{bmatrix}${num(x)}\\\\${num(y)}\\end{bmatrix}`}</Tex>
          </Label>
          <MovablePoint
            x={i[0]}
            y={i[1]}
            onMove={(a, b) => setI([a, b])}
            constrain={snap}
            step={0.5}
            color={COLORS.i}
            size={6}
            label="Tip of the new i-hat"
          />
          <MovablePoint
            x={j[0]}
            y={j[1]}
            onMove={(a, b) => setJ([a, b])}
            constrain={snap}
            step={0.5}
            color={COLORS.j}
            size={6}
            label="Tip of the new j-hat"
          />
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
          <Slider
            label={<Tex>x</Tex>}
            name="Input x"
            value={x}
            min={-2}
            max={2}
            step={0.5}
            onChange={setX}
            color={COLORS.i}
          />
          <Slider
            label={<Tex>y</Tex>}
            name="Input y"
            value={y}
            min={-2}
            max={2}
            step={0.5}
            onChange={setY}
            color={COLORS.j}
          />
          <div className="overflow-x-auto text-[0.95rem] sm:col-span-2">
            <Tex
              display
            >{`${mat(m, 1)}${vec([x, y], 1)} = ${num(x, 1)}${vec(i, 1)} + ${num(y, 1)}${vec(j, 1)} = ${vec(image, 2)}`}</Tex>
          </div>
        </div>
      </Figure>
    </LabSection>
  )
}

function Practice() {
  const [rot, setRot] = useState<Mat2>([1, 0, 0, 1])
  const [dbl, setDbl] = useState<Mat2>([1, 0, 0, 1])
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <InteractiveChallenge
          id="c-rotate"
          index={1}
          prompt="Build the matrix that rotates the plane 90° **anticlockwise**."
          solved={near(rot, [0, -1, 1, 0])}
          hint="A quarter turn anticlockwise sends $\hat\imath = (1, 0)$ up to $(0, 1)$. Where does $\hat\jmath = (0, 1)$ go?"
          explanation="$\hat\imath \to (0, 1)$ and $\hat\jmath \to (-1, 0)$, so the matrix is $\begin{bmatrix} 0 & -1 \\ 1 & 0 \end{bmatrix}$."
          onReset={() => setRot([1, 0, 0, 1])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <MatrixLab
              matrix={rot}
              onMatrixChange={setRot}
              preset={{ showShape: true, controls: 'compact', extent: 3 }}
            />
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-apply"
          index={2}
          prompt="$\begin{bmatrix} 2 & 1 \\ 0 & 3 \end{bmatrix}\begin{bmatrix} 1 \\ 1 \end{bmatrix} = \;?$"
          options={[
            { text: '$(3, 3)$', correct: true },
            {
              text: '$(2, 3)$',
              why: 'Each row uses both inputs: the first row is $2\\cdot1 + 1\\cdot1$.',
            },
            { text: '$(3, 1)$', why: 'Check the second row: $0\\cdot1 + 3\\cdot1$.' },
            { text: '$(2, 1)$', why: 'That only takes the first column.' },
          ]}
          explanation="One copy of column 1, $(2, 0)$, plus one copy of column 2, $(1, 3)$, gives $(3, 3)$."
        />
        <McqChallenge
          id="c-not-linear"
          index={3}
          prompt="Which of these is **not** a linear transformation?"
          options={[
            { text: 'Shift every point 1 unit to the right', correct: true },
            {
              text: 'Rotate everything by 30° about the origin',
              why: 'Rotations about the origin are linear.',
            },
            {
              text: 'Stretch everything vertically by 3',
              why: 'Stretches are linear: that is $\\begin{bmatrix}1&0\\\\0&3\\end{bmatrix}$.',
            },
            {
              text: 'Reflect in the line $y = x$',
              why: 'That swaps coordinates: $\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$.',
            },
          ]}
          explanation="A shift moves the origin to $(1, 0)$, and linear maps always send the origin to itself."
        />
        <NumericChallenge
          id="c-image"
          index={4}
          prompt="A matrix sends $\hat\imath$ to $(3, 1)$ and $\hat\jmath$ to $(-1, 2)$. Where does $(2, 0)$ go? Give the **first** component."
          answer={6}
          explanation="$(2, 0) = 2\hat\imath$, so it lands on $2 \cdot (3, 1) = (6, 2)$."
        />
        <InteractiveChallenge
          id="c-double"
          index={5}
          prompt="Make a transformation that doubles every length without rotating anything."
          solved={near(dbl, [2, 0, 0, 2])}
          hint="Each basis arrow should keep its direction but become twice as long."
          explanation="$\begin{bmatrix} 2 & 0 \\ 0 & 2 \end{bmatrix} = 2I$ scales every vector by 2. Areas grow by $2 \times 2 = 4$."
          onReset={() => setDbl([1, 0, 0, 1])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <MatrixLab
              matrix={dbl}
              onMatrixChange={setDbl}
              preset={{ controls: 'compact', extent: 3 }}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
