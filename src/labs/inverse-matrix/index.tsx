import { Redo2, Sparkles, Undo2 } from 'lucide-react'
import { useState } from 'react'
import {
  apply,
  det,
  dot,
  I2,
  inverse,
  lerpMat,
  mul,
  norm,
  scale,
  sub,
  type Mat2,
  type Vec2,
} from '@/math/linalg'
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
import { MatrixEditor, MatrixLab } from '@/tools/matrix/MatrixLab'
import { Button } from '@/ui/Button'
import { Tex } from '@/ui/Tex'
import {
  InfiniteLine,
  Label,
  MovablePoint,
  Plot,
  Point,
  Vector,
  constraints,
  ease,
  usePlayback,
  type View,
} from '@/viz'
import { COLORS, mat, num, vec } from '../_shared/tex'

const near = (a: Mat2, b: Mat2) => a.every((x, i) => Math.abs(x - b[i]) < 0.01)

/** "2x + y = 5" from a row of A and the matching entry of b. */
function equationTex(row: Vec2, rhs: number): string {
  const term = (c: number, name: string, first: boolean) => {
    if (c === 0) return ''
    const sign = c < 0 ? '-' : first ? '' : '+'
    return `${sign} ${Math.abs(c) === 1 ? '' : num(Math.abs(c))}${name}`
  }
  return `${term(row[0], 'x', true)} ${term(row[1], 'y', row[0] === 0)} = ${num(rhs)}`
}

export default function InverseMatrixLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="An undo button for transformations">
        <Prose>
          <p>
            If a matrix <Tex>A</Tex> moves the plane, its <strong>inverse</strong>{' '}
            <Tex>{'A^{-1}'}</Tex> moves it back. Doing one and then the other changes nothing at
            all.
          </p>
          <p>
            That undo button is exactly what you need to solve equations. A system like{' '}
            <Tex>2x + y = 5,\; x + 3y = 5</Tex> asks: which input does <Tex>A</Tex> send to{' '}
            <Tex>(5, 5)</Tex>? Run <Tex>A</Tex> backwards from the answer and you find out.
          </p>
        </Prose>
      </LabSection>
      <UndoExplorer />
      <SolveExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The inverse of a 2×2 matrix">
        <Formula
          tex={'A^{-1} = \\frac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}'}
          caption="Swap $a$ and $d$, change the signs of $b$ and $c$, and divide by the determinant."
        />
        <Formula
          tex={'A\\vec x = \\vec b \\quad\\Longrightarrow\\quad \\vec x = A^{-1}\\vec b'}
          caption="Undo $A$ on both sides, because $A^{-1}A = I$."
        />
        <Prose>
          <p>
            Dividing by <Tex>ad - bc</Tex> makes sense: <Tex>A</Tex> scaled areas by{' '}
            <Tex>{'\\det A'}</Tex>, so the undo must scale them back by <Tex>{'1/\\det A'}</Tex>.
            When <Tex>{'\\det A = 0'}</Tex> there's nothing to divide by, and no inverse.
          </p>
        </Prose>
        <Callout kind="misconception">
          <p>
            You can't divide by a matrix. Write <Tex>{'A^{-1}\\vec b'}</Tex>, never{' '}
            <Tex>{'\\vec b / A'}</Tex>, and keep the order: <Tex>{'A^{-1}'}</Tex> goes on the left,
            next to the <Tex>A</Tex> it cancels.
          </p>
        </Callout>
        <Callout kind="note" title="How computers do it">
          <p>
            Software rarely computes <Tex>{'A^{-1}'}</Tex> to solve{' '}
            <Tex>{'A\\vec x = \\vec b'}</Tex>. Elimination (subtracting multiples of one equation
            from another) is faster and more accurate. The inverse is the idea; elimination is the
            tool.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet inverses">
        <RealWorld
          items={[
            {
              title: 'Clicking on a zoomed map',
              body: 'Maps and design tools run the screen transformation backwards to find which point lies under your cursor.',
            },
            {
              title: 'Circuits and bridges',
              body: 'Currents in a circuit and forces in a truss come from solving $A\\vec x = \\vec b$ with thousands of unknowns.',
            },
            {
              title: 'Economics',
              body: "Leontief's input-output model uses $(I - A)^{-1}$ to work out how much every industry must produce to meet demand.",
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$A^{-1}$ undoes $A$: $A^{-1}A = AA^{-1} = I$.',
            'Solving $A\\vec x = \\vec b$ means finding the input $A$ sends to $\\vec b$: $\\vec x = A^{-1}\\vec b$.',
            'An inverse exists exactly when $\\det A \\ne 0$: a squashed plane cannot be un-squashed.',
            'For a 2×2 matrix: swap $a$ and $d$, negate $b$ and $c$, divide by $ad - bc$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function UndoExplorer() {
  const [a, setA] = useState<Mat2>([1.5, 0.5, 0.5, 1])
  const inv = inverse(a)
  const playback = usePlayback(1.6)
  const busy = playback.playing || playback.t > 0
  const undone = inv !== null && playback.t >= 1
  const shown = inv ? mul(lerpMat(I2, inv, ease(playback.t)), a) : a
  const change = (m: Mat2) => {
    playback.reset()
    setA(m)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Do it, then undo it">
      <Prose>
        <p>
          Shape the transformation by dragging <Tex>{'\\hat\\imath'}</Tex> and{' '}
          <Tex>{'\\hat\\jmath'}</Tex> (or typing entries). Then press <strong>Undo</strong> and
          watch <Tex>{'A^{-1}'}</Tex> carry everything back to where it started.
        </p>
      </Prose>
      <PredictReveal
        question="$A$ stretches everything 2× sideways. What does $A^{-1}$ do?"
        options={[
          'Squeezes everything to half its width',
          'Stretches 2× sideways again',
          'Flips the plane over',
          'Stretches 2× upwards',
        ]}
        answer={0}
        explanation="To undo a stretch by 2 you squeeze by $\frac12$: $\begin{bmatrix}2&0\\0&1\end{bmatrix}^{-1} = \begin{bmatrix}\frac12&0\\0&1\end{bmatrix}$."
      />
      <Figure>
        <MatrixLab
          matrix={shown}
          onMatrixChange={change}
          preset={{ controls: 'none', extent: 4, showShape: true, draggableBasis: !busy }}
          ariaLabel={
            undone
              ? 'The F is back where it started'
              : `The plane transformed by A with columns (${num(a[0])}, ${num(a[2])}) and (${num(a[1])}, ${num(a[3])})`
          }
        />
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <MatrixEditor m={a} onChange={change} />
            <div className="overflow-x-auto">
              {inv ? (
                <Tex>{`A^{-1} = ${mat(inv)}`}</Tex>
              ) : (
                <span className="text-sm font-semibold text-bad-ink">
                  No inverse: <Tex>{'\\det A = 0'}</Tex>
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Undo2 className="size-4" />}
              disabled={!inv || playback.playing || undone}
              onClick={playback.play}
            >
              Undo with A⁻¹
            </Button>
            {busy && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Redo2 className="size-4" />}
                onClick={playback.reset}
              >
                Show A again
              </Button>
            )}
            <span className="text-sm text-ink-2" aria-live="polite">
              {undone ? 'Back home: A⁻¹A = I' : ''}
            </span>
          </div>
        </div>
      </Figure>
      {!inv && (
        <Callout kind="insight" title="Why there's no undo">
          <p>
            This matrix squashes the plane onto a line. Different points land on the same spot, so
            there's no way to tell where each one came from.
          </p>
        </Callout>
      )}
      <TryThisList>
        <TryThis id="t-undo" when={undone}>
          Undo a transformation and watch the F return home.
        </TryThis>
        <TryThis id="t-self" when={inv !== null && near(inv, a) && !near(a, I2)}>
          Find a matrix (not <Tex>I</Tex>) that is its own inverse: doing it twice changes nothing.
          Mirrors are a good place to look.
        </TryThis>
        <TryThis id="t-singular" when={Math.abs(det(a)) < 1e-9}>
          Find a matrix that has no inverse. What happened to the F?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** Drag x in the input plane (where the equations are lines); A x appears in the output plane. */
function SolvePlots({
  A,
  b,
  x,
  setX,
  inputView,
  outputView,
}: {
  A: Mat2
  b: Vec2
  x: Vec2
  setX: (x: Vec2) => void
  inputView: View
  outputView: View
}) {
  const ax = apply(A, x)
  const rows: [Vec2, Vec2] = [
    [A[0], A[1]],
    [A[2], A[3]],
  ]
  const lineColors = [COLORS.u, COLORS.v]
  const constrain = constraints.compose(
    constraints.snapToGrid(0.5),
    constraints.within(inputView.xMin, inputView.xMax, inputView.yMin, inputView.yMax),
  )
  return (
    <>
      <div className="grid sm:grid-cols-2">
        <div>
          <div className="px-3 pt-2 text-sm font-semibold">
            Input: drag <Tex>{'\\vec x'}</Tex>
          </div>
          <Plot
            view={inputView}
            aspect="equal"
            ariaLabel={`Input x = (${num(x[0])}, ${num(x[1])}), with one line for each equation`}
          >
            {rows.map((r, k) => (
              <InfiniteLine
                key={k}
                through={scale(r, b[k] / dot(r, r))}
                direction={[-r[1], r[0]]}
                color={lineColors[k]}
                width={2}
              />
            ))}
            <Vector to={x} color="var(--ink-2)" />
            <Label at={x} anchor="bottom-left" offset={[8, -6]}>
              <Tex>{'\\vec x'}</Tex>
            </Label>
            <MovablePoint
              x={x[0]}
              y={x[1]}
              onMove={(p, q) => setX([p, q])}
              constrain={constrain}
              step={0.5}
              color="var(--ink-2)"
              size={6}
              label="Input vector x"
            />
          </Plot>
        </div>
        <div className="border-t border-line sm:border-t-0 sm:border-l">
          <div className="px-3 pt-2 text-sm font-semibold">
            Output: <Tex>{'A\\vec x'}</Tex> should land on <Tex>{'\\vec b'}</Tex>
          </div>
          <Plot
            view={outputView}
            aspect="equal"
            ariaLabel={`A x = (${num(ax[0])}, ${num(ax[1])}); target b = (${num(b[0])}, ${num(b[1])})`}
          >
            <Point at={b} r={12} color={COLORS.target} hollow />
            <Label at={b} anchor="top-left" offset={[12, 8]} color={COLORS.target}>
              <Tex>{'\\vec b'}</Tex>
            </Label>
            <Vector to={ax} color={COLORS.result} width={3} />
            <Label at={ax} anchor="bottom-right" offset={[-8, -6]}>
              <Tex>{'A\\vec x'}</Tex>
            </Label>
          </Plot>
        </div>
      </div>
      <div className="border-t border-line px-3 pb-3">
        <Readouts
          items={[
            ...rows.map((r, k) => {
              const miss = dot(r, x) - b[k]
              return {
                label: <Tex>{equationTex(r, b[k])}</Tex>,
                value: Math.abs(miss) < 1e-9 ? 'satisfied' : `off by ${num(miss)}`,
                color: lineColors[k],
              }
            }),
            {
              label: <Tex>{'A\\vec x'}</Tex>,
              value: `(${num(ax[0])}, ${num(ax[1])})`,
              color: COLORS.result,
            },
          ]}
        />
      </div>
    </>
  )
}

const SYSTEM: Mat2 = [2, 1, 1, 3]
const TARGET: Vec2 = [5, 5]

function SolveExplorer() {
  const [x, setX] = useState<Vec2>([0.5, 0.5])
  const [shortcut, setShortcut] = useState(false)
  const hit = norm(sub(apply(SYSTEM, x), TARGET)) < 1e-9
  const inv = inverse(SYSTEM)!
  const onFirstLine = Math.abs(2 * x[0] + x[1] - 5) < 1e-9
  return (
    <LabSection id="solve" eyebrow="Explore" title="Solve Ax = b by dragging">
      <Prose>
        <p>
          The system <Tex>2x + y = 5,\; x + 3y = 5</Tex> is{' '}
          <Tex>{`${mat(SYSTEM, 0)}\\vec x = ${vec(TARGET, 0)}`}</Tex>. Drag <Tex>{'\\vec x'}</Tex>{' '}
          on the left and watch <Tex>{'A\\vec x'}</Tex> move on the right. Can you land it on the
          target <Tex>{'\\vec b'}</Tex>?
        </p>
      </Prose>
      <Figure>
        <SolvePlots
          A={SYSTEM}
          b={TARGET}
          x={x}
          setX={setX}
          inputView={{ xMin: -1, xMax: 4, yMin: -1, yMax: 3 }}
          outputView={{ xMin: -2, xMax: 10.5, yMin: -2, yMax: 8 }}
        />
      </Figure>
      <TryThisList>
        <TryThis id="t-line" when={onFirstLine && !hit}>
          Put <Tex>{'\\vec x'}</Tex> on the blue line but off the orange one. Which coordinate of{' '}
          <Tex>{'A\\vec x'}</Tex> is right?
        </TryThis>
        <TryThis id="t-solve" when={hit}>
          Land <Tex>{'A\\vec x'}</Tex> exactly on <Tex>{'\\vec b'}</Tex>.
        </TryThis>
      </TryThisList>
      {(hit || shortcut) && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="prose-lab">
            The solution is where the two lines cross: a point on both lines satisfies both
            equations. The inverse finds it in one step:
          </p>
          <div className="mt-2 overflow-x-auto">
            <Tex
              display
            >{`\\vec x = A^{-1}\\vec b = ${mat(inv)}${vec(TARGET, 0)} = ${vec(apply(inv, TARGET))}`}</Tex>
          </div>
        </div>
      )}
      {!hit && !shortcut && (
        <Button
          className="mt-4"
          size="sm"
          variant="soft"
          icon={<Sparkles className="size-4" />}
          onClick={() => setShortcut(true)}
        >
          Stuck? Show the shortcut
        </Button>
      )}
    </LabSection>
  )
}

function Practice() {
  const [x, setX] = useState<Vec2>([3, 0])
  const A: Mat2 = [1, 1, 0, 2]
  const b: Vec2 = [3, 4]
  const solved = norm(sub(apply(A, x), b)) < 1e-9
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <InteractiveChallenge
          id="c-solve"
          index={1}
          prompt="Solve $\begin{bmatrix} 1 & 1 \\ 0 & 2 \end{bmatrix}\vec x = \begin{bmatrix} 3 \\ 4 \end{bmatrix}$ by dragging $\vec x$ until $A\vec x$ lands on $\vec b$."
          solved={solved}
          hint="The second equation is $2y = 4$. Start there, then use $x + y = 3$."
          explanation="$y = 2$ from the second row, then $x = 3 - 2 = 1$: $\vec x = (1, 2)$, where the two lines cross."
          onReset={() => setX([3, 0])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <SolvePlots
              A={A}
              b={b}
              x={x}
              setX={setX}
              inputView={{ xMin: -1, xMax: 4, yMin: -1, yMax: 3 }}
              outputView={{ xMin: -2, xMax: 8, yMin: -2, yMax: 6 }}
            />
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-diag"
          index={2}
          prompt="What is the top-left entry of $\begin{bmatrix} 2 & 0 \\ 0 & 4 \end{bmatrix}^{-1}$?"
          answer={0.5}
          hint="This matrix stretches x by 2 and y by 4. What undoes a stretch by 2?"
          explanation="The inverse squeezes each axis back: $\begin{bmatrix} \frac12 & 0 \\ 0 & \frac14 \end{bmatrix}$."
        />
        <McqChallenge
          id="c-singular"
          index={3}
          prompt="Which matrix has **no** inverse?"
          options={[
            { text: '$\\begin{bmatrix} 2 & 4 \\\\ 1 & 2 \\end{bmatrix}$', correct: true },
            {
              text: '$\\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$',
              why: 'Its determinant is $4 - 1 = 3 \\ne 0$.',
            },
            {
              text: '$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$',
              why: 'Swapping the axes is undone by swapping them back: it is its own inverse.',
            },
            {
              text: '$\\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix}$',
              why: 'Its determinant is 3; the inverse squeezes x by $\\frac13$.',
            },
          ]}
          explanation="$2 \cdot 2 - 4 \cdot 1 = 0$: the second column is twice the first, so the plane collapses onto a line."
        />
        <NumericChallenge
          id="c-system"
          index={4}
          prompt="Solve $x + y = 5$ and $x - y = 1$. What is $x$?"
          answer={3}
          hint="Add the two equations: the $y$ terms cancel."
          explanation="Adding gives $2x = 6$, so $x = 3$ (and then $y = 2$)."
        />
        <McqChallenge
          id="c-identity"
          index={5}
          prompt="$A^{-1}A = \;?$"
          options={[
            { text: '$I$, the identity', correct: true },
            { text: '$A$', why: 'Undoing $A$ leaves nothing of $A$ behind.' },
            {
              text: '$0$, the zero matrix',
              why: 'The zero matrix squashes everything to the origin; undoing should change nothing.',
            },
            { text: '$A^2$', why: 'That would be doing $A$ twice.' },
          ]}
          explanation="Doing $A$ and then undoing it leaves every point where it was: that's the identity $I$."
        />
      </ChallengeSet>
    </LabSection>
  )
}
