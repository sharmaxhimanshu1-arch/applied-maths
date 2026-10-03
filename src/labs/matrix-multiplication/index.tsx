import { useState } from 'react'
import { apply, columns, I2, mul, type Mat2 } from '@/math/linalg'
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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { F_SHAPE } from '@/tools/matrix/presets'
import { Plot, Polygon } from '@/viz'
import { mat, vec } from '../_shared/tex'

const TRANSFORMS: { id: string; name: string; m: Mat2 }[] = [
  { id: 'rot90', name: 'Rotate 90°', m: [0, -1, 1, 0] },
  { id: 'rot-90', name: 'Rotate −90°', m: [0, 1, -1, 0] },
  { id: 'shear', name: 'Shear right', m: [1, 1, 0, 1] },
  { id: 'stretch', name: 'Stretch sideways ×2', m: [2, 0, 0, 1] },
  { id: 'reflect-x', name: 'Reflect in x-axis', m: [1, 0, 0, -1] },
  { id: 'reflect-diag', name: 'Reflect in y = x', m: [0, 1, 1, 0] },
  { id: 'half', name: 'Shrink by half', m: [0.5, 0, 0, 0.5] },
  { id: 'identity', name: 'Do nothing (I)', m: [1, 0, 0, 1] },
]

const same = (a: Mat2, b: Mat2) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9)
const byId = (id: string) => TRANSFORMS.find((t) => t.id === id)!

function Picker({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  exclude?: string
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-line-strong bg-surface px-3 text-[0.9375rem]"
      >
        {TRANSFORMS.filter((t) => t.id !== exclude).map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function ShapePlot({
  m,
  middle,
  title,
  color,
}: {
  m: Mat2
  middle?: Mat2
  title: string
  color: string
}) {
  return (
    <div>
      <div className="px-3 pt-2 text-sm font-semibold">{title}</div>
      <Plot
        view={{ xMin: -2.6, xMax: 2.6, yMin: -2.6, yMax: 2.6 }}
        aspect="equal"
        tickLabels={false}
        ariaLabel={title}
      >
        <Polygon
          points={F_SHAPE}
          fill="var(--ink-3)"
          fillOpacity={0.12}
          stroke="var(--ink-3)"
          dashed
          strokeWidth={1.25}
        />
        {middle && (
          <Polygon
            points={F_SHAPE.map((p) => apply(middle, p))}
            fill={color}
            fillOpacity={0.1}
            stroke={color}
            dashed
            strokeWidth={1.25}
          />
        )}
        <Polygon
          points={F_SHAPE.map((p) => apply(m, p))}
          fill={color}
          fillOpacity={0.35}
          stroke={color}
        />
      </Plot>
    </div>
  )
}

export default function MatrixMultiplicationLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Do this, then that">
        <Prose>
          <p>
            A matrix is a transformation. So what happens if you do one transformation and then
            another? The combined effect is again a single transformation, with its own matrix.
            Finding that matrix is what <strong>matrix multiplication</strong> means.
          </p>
          <p>
            It's why a 3D game can combine “turn the camera”, “move the world” and “project onto the
            screen” into one matrix per frame, and why a neural network is a chain of matrix
            multiplications.
          </p>
        </Prose>
      </LabSection>
      <OrderExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The product, column by column">
        <Formula
          tex={'(BA)\\,\\vec v = B\\,(A\\,\\vec v)'}
          caption="BA means: apply A first, then B. Read right to left, like function composition."
        />
        <Prose>
          <p>
            Where does <Tex>{'\\hat\\imath'}</Tex> end up? First <Tex>A</Tex> sends it to A's first
            column, then <Tex>B</Tex> moves <em>that</em>. So each column of <Tex>BA</Tex> is{' '}
            <Tex>B</Tex> times the matching column of <Tex>A</Tex>, which gives the familiar
            row-times-column rule:
          </p>
        </Prose>
        <Formula
          tex={
            '\\begin{bmatrix} e & f \\\\ g & h \\end{bmatrix}\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = \\begin{bmatrix} ea + fc & eb + fd \\\\ ga + hc & gb + hd \\end{bmatrix}'
          }
        />
        <Callout kind="misconception">
          <p>
            Order matters: in general <Tex>{'AB \\ne BA'}</Tex>. Rotating then reflecting is not the
            same as reflecting then rotating, as you saw above.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet matrix products">
        <RealWorld
          items={[
            {
              title: '3D graphics pipelines',
              body: 'Model, view and projection matrices are multiplied into one, then applied to millions of points per frame on the GPU.',
            },
            {
              title: 'Robot arms',
              body: 'Each joint is a transformation; multiplying them along the arm tells the robot where its hand is.',
            },
            {
              title: 'Neural networks',
              body: 'Each layer multiplies by a weight matrix. Deep learning is, at heart, lots of matrix products (with a twist in between).',
            },
            {
              title: 'Weather and markets',
              body: 'For a Markov chain, multiplying the transition matrix by itself $n$ times gives the odds of every state after $n$ steps.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$BA$ means “apply $A$, then $B$”: the product is the combined transformation.',
            'Each column of $BA$ is $B$ times the matching column of $A$.',
            'Order matters: usually $AB \\ne BA$.',
            'Grouping does not matter: $C(BA) = (CB)A$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function OrderExplorer() {
  const [a, setA] = useState('rot90')
  const [b, setB] = useState('reflect-x')
  const [showMiddle, setShowMiddle] = useState(true)
  const A = byId(a).m
  const B = byId(b).m
  const BA = mul(B, A)
  const AB = mul(A, B)
  const equal = same(BA, AB)
  const [c1, c2] = columns(A)
  const nonTrivial = a !== 'identity' && b !== 'identity'

  return (
    <LabSection id="explore" eyebrow="Explore" title="Does the order matter?">
      <Prose>
        <p>
          Choose two transformations. The left picture applies <Tex>A</Tex> first, then <Tex>B</Tex>
          ; the right picture does them the other way round. The faint dashed F is where the shape
          started.
        </p>
      </Prose>
      <PredictReveal
        question="Rotate 90° then reflect in the x-axis, versus reflect first then rotate. Same result?"
        options={[
          'Always the same',
          'Different',
          'Same only for this F shape',
          'It depends on the angle units',
        ]}
        answer={1}
        explanation="They differ: the two orders send the F to two different mirror-image positions. Matrix multiplication is not commutative. It's the default choice below; compare the two pictures."
      />
      <Figure>
        <div className="grid gap-3 border-b border-line p-3 sm:grid-cols-2">
          <Picker label="A (first)" value={a} onChange={setA} />
          <Picker label="B (second)" value={b} onChange={setB} />
        </div>
        <div className="grid sm:grid-cols-2">
          <ShapePlot
            m={BA}
            middle={showMiddle ? A : undefined}
            title="A, then B (the product BA)"
            color="var(--c-blue)"
          />
          <div className="border-t border-line sm:border-t-0 sm:border-l">
            <ShapePlot
              m={AB}
              middle={showMiddle ? B : undefined}
              title="B, then A (the product AB)"
              color="var(--c-orange)"
            />
          </div>
        </div>
        <div className="grid gap-3 border-t border-line p-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 overflow-x-auto">
              <Tex>{`BA = ${mat(BA, 1)}`}</Tex>
            </span>
            <span className="flex items-center gap-2 overflow-x-auto">
              <Tex>{`AB = ${mat(AB, 1)}`}</Tex>
            </span>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-semibold',
                equal
                  ? 'bg-[color-mix(in_oklab,var(--good)_14%,var(--surface))]'
                  : 'bg-[color-mix(in_oklab,var(--c-orange)_16%,var(--surface))]',
              )}
            >
              {equal ? 'Same either way' : 'Order matters here'}
            </span>
          </div>
          <Switch label="Show the halfway step" checked={showMiddle} onChange={setShowMiddle} />
          <div className="overflow-x-auto text-[0.95rem]">
            <Tex
              display
            >{`BA = \\Big[\\,B${vec(c1, 1)}\\;\\Big|\\;B${vec(c2, 1)}\\,\\Big] = \\Big[\\,${vec(apply(B, c1), 1)}\\;\\Big|\\;${vec(apply(B, c2), 1)}\\,\\Big]`}</Tex>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-differ" when={!equal && !(a === 'rot90' && b === 'reflect-x')}>
          Find another pair where the order changes the result.
        </TryThis>
        <TryThis id="t-commute" when={equal && nonTrivial && a !== b}>
          Find two <em>different</em> transformations (neither “do nothing”) whose order doesn't
          matter.
        </TryThis>
        <TryThis id="t-undo" when={same(BA, I2) && a !== 'identity'}>
          Choose <Tex>B</Tex> so that doing <Tex>A</Tex> then <Tex>B</Tex> puts the F back where it
          started.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [b, setB] = useState('shear')
  const solved = same(mul(byId(b).m, byId('rot90').m), I2)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-mv"
          index={1}
          prompt="$\begin{bmatrix} 1 & 2 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 3 \\ 1 \end{bmatrix}$: what is the **first** entry?"
          answer={5}
          explanation="First row times the vector: $1 \cdot 3 + 2 \cdot 1 = 5$."
        />
        <McqChallenge
          id="c-product"
          index={2}
          prompt="$\begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 2 & 0 \\ 0 & 1 \end{bmatrix} = \;?$"
          options={[
            { text: '$\\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}$', correct: true },
            {
              text: '$\\begin{bmatrix} 2 & 2 \\\\ 0 & 1 \\end{bmatrix}$',
              why: 'Check the top-right: row 1 of the left times column 2 of the right is $1\\cdot0 + 1\\cdot1$.',
            },
            {
              text: '$\\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$',
              why: 'That adds the matrices instead of multiplying.',
            },
            {
              text: '$\\begin{bmatrix} 2 & 0 \\\\ 1 & 1 \\end{bmatrix}$',
              why: 'That is the transpose of the answer.',
            },
          ]}
          explanation="Column 1: $\begin{bmatrix}1&1\\0&1\end{bmatrix}\begin{bmatrix}2\\0\end{bmatrix} = \begin{bmatrix}2\\0\end{bmatrix}$. Column 2: $\begin{bmatrix}1&1\\0&1\end{bmatrix}\begin{bmatrix}0\\1\end{bmatrix} = \begin{bmatrix}1\\1\end{bmatrix}$."
        />
        <InteractiveChallenge
          id="c-undo"
          index={3}
          prompt="$A$ rotates 90° anticlockwise. Pick $B$ so that $A$ then $B$ leaves every point where it started ($BA = I$)."
          solved={solved}
          hint="You need to turn back by the same amount."
          explanation="Rotating −90° undoes rotating +90°, so $BA = I$. $B$ is the **inverse** of $A$; there's a whole lab on inverses next."
          onReset={() => setB('shear')}
        >
          <div className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:items-start">
            <Picker label="B (second)" value={b} onChange={setB} />
            <div className="overflow-hidden rounded-xl border border-line">
              <ShapePlot
                m={mul(byId(b).m, byId('rot90').m)}
                middle={byId('rot90').m}
                title="Rotate 90°, then B"
                color="var(--c-blue)"
              />
            </div>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-commute"
          index={4}
          prompt="Is $AB = BA$ for every pair of matrices?"
          options={[
            { text: 'No, the order usually matters', correct: true },
            {
              text: 'Yes, like multiplying numbers',
              why: 'Numbers commute, but transformations generally do not: rotate-then-reflect differs from reflect-then-rotate.',
            },
            {
              text: 'Only for 2×2 matrices',
              why: '2×2 matrices are where you just saw them fail to commute.',
            },
            {
              text: 'Only when the determinant is 1',
              why: 'Rotations have determinant 1 and still fail to commute with reflections.',
            },
          ]}
          explanation="Some pairs do commute (two rotations, or anything with $I$), but most don't."
        />
        <McqChallenge
          id="c-order"
          index={5}
          prompt="You stretch with $S$ first, then rotate with $R$. Which single matrix does both?"
          options={[
            { text: '$RS$', correct: true },
            {
              text: '$SR$',
              why: 'The first transformation goes on the right, nearest the vector: $R(S\\vec v)$.',
            },
            { text: '$R + S$', why: 'Adding matrices does not compose transformations.' },
            { text: '$S - R$', why: 'Composition is a product, not a difference.' },
          ]}
          explanation="$R(S\vec v) = (RS)\vec v$: read products right to left, like $f(g(x))$."
        />
      </ChallengeSet>
    </LabSection>
  )
}
