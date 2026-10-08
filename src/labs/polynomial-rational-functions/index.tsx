import { useState } from 'react'
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
import { FunctionGraph, InfiniteLine, MovablePoint, Plot, Point, constraints } from '@/viz'
import { linearTex } from '../_shared/algebra'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const ROOT_A = 'var(--c-orange)'
const ROOT_B = 'var(--c-violet)'
const ASYMPTOTE = 'var(--c-red)'
const VIEW = { xMin: -5, xMax: 5, yMin: -6, yMax: 6 }
const onAxis = constraints.compose(
  constraints.horizontal(0),
  constraints.snapToGrid(0.5),
  constraints.within(-4.5, 4.5, 0, 0),
)

const BEHAVIOUR: Record<number, string> = {
  1: 'crosses straight through',
  2: 'touches and turns back (bounce)',
  3: 'flattens, then crosses',
}

/** (x − r) in TeX, written x + 2 for r = −2. */
const factor = (r: number) => `(${linearTex(1, -r)})`

export default function PolynomialRationalFunctionsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Reading a graph from its formula">
        <Prose>
          <p>
            Written in factored form, a polynomial tells you where its graph meets the axis:{' '}
            <Tex>{'(x + 2)(x - 1)^2'}</Tex> is zero at −2 and at 1. The power on each factor tells
            you <em>how</em> it meets: crossing, bouncing or flattening.
          </p>
          <p>
            Divide one polynomial by another and you get a <strong>rational function</strong>, like{' '}
            <Tex>{'\\tfrac{x + 1}{x - 2}'}</Tex>. Where the bottom is zero the graph shoots off to
            infinity along a <strong>vertical asymptote</strong>; far out it settles towards a{' '}
            <strong>horizontal asymptote</strong>.
          </p>
        </Prose>
      </LabSection>
      <ZerosExplorer />
      <RationalExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Zeros, multiplicity and asymptotes">
        <Formula
          tex={'p(x) = k\\,(x - r_1)^{m_1}(x - r_2)^{m_2}\\cdots'}
          caption="Each root rᵢ has a multiplicity mᵢ: odd means the graph crosses, even means it bounces."
        />
        <Formula
          tex={'f(x) = \\frac{N(x)}{D(x)}'}
          caption="Vertical asymptotes where D(x) = 0 (and N(x) ≠ 0); the horizontal asymptote depends on the degrees of N and D."
        />
        <Prose>
          <ul>
            <li>
              <strong>Horizontal asymptote:</strong> if the bottom has the higher degree,{' '}
              <Tex>{'y = 0'}</Tex>. If the degrees are equal, <Tex>{'y = '}</Tex> the ratio of the
              leading coefficients: <Tex>{'\\tfrac{2x + 1}{x - 3} \\to 2'}</Tex>.
            </li>
            <li>
              <strong>Holes:</strong> if top and bottom share a factor, it cancels and leaves a
              single missing point, not an asymptote: <Tex>{'\\tfrac{x^2 - 4}{x - 2} = x + 2'}</Tex>{' '}
              except at <Tex>{'x = 2'}</Tex>.
            </li>
            <li>
              The degree of a polynomial is the sum of the multiplicities: it has at most that many
              zeros.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Graphs can cross horizontal asymptotes">
          <p>
            A vertical asymptote is a wall the graph never touches, but a horizontal asymptote only
            describes the far left and far right. In the middle the graph may cross it:{' '}
            <Tex>{'\\tfrac{x}{x^2 + 1}'}</Tex> crosses <Tex>{'y = 0'}</Tex> at the origin.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where these functions appear">
        <RealWorld
          items={[
            {
              title: 'Average cost',
              body: 'Cost per item, $\\tfrac{500 + 2n}{n}$, falls towards 2 as production grows: a horizontal asymptote.',
            },
            {
              title: 'Lenses and optics',
              body: 'The lens equation gives image distance as a rational function that blows up at the focal length.',
            },
            {
              title: 'Concentration',
              body: 'Mixing in a pure solution makes concentration a rational function that levels off.',
            },
            {
              title: 'Engineering design',
              body: 'Beam deflections and control-system responses are read from polynomial roots and rational asymptotes.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Factored form shows the zeros; odd multiplicity crosses, even bounces.',
            'Rational functions have vertical asymptotes where the denominator is zero.',
            'Compare degrees to find the horizontal asymptote.',
            'A factor that cancels leaves a hole, not an asymptote.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ZerosExplorer() {
  const [r1, setR1] = useState(-2)
  const [r2, setR2] = useState(1.5)
  const [m, setM] = useState('1')
  const mult = Number(m)
  const p = (x: number) => 0.4 * (x - r1) ** mult * (x - r2)
  const merged = r1 === r2
  return (
    <LabSection id="explore" eyebrow="Explore" title="Zeros and their multiplicity">
      <Prose>
        <p>
          The polynomial is <Tex>{'p(x) = 0.4\\,(x - r_1)^m (x - r_2)'}</Tex>. Drag the two roots
          along the axis and change the power on the first one. Watch how the graph behaves at the
          orange root.
        </p>
      </Prose>
      <PredictReveal
        question="How does the graph of $(x - 1)^2(x + 3)$ behave at $x = 1$?"
        options={['Crosses the axis', 'Touches and turns back', 'Has an asymptote']}
        answer={1}
        explanation="The factor $(x - 1)$ is squared, so $p(x)$ doesn't change sign there: the graph bounces off the axis."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <span className="text-sm text-ink-2">Power on the orange root</span>
          <Segmented
            label="Multiplicity of the first root"
            value={m}
            onChange={setM}
            options={[
              { value: '1', label: 'm = 1' },
              { value: '2', label: 'm = 2' },
              { value: '3', label: 'm = 3' },
            ]}
          />
        </div>
        <p className="px-3 pt-3 text-center sm:px-4">
          <Tex>{`p(x) = 0.4\\,${factor(r1)}${mult > 1 ? `^${mult}` : ''}${factor(r2)}`}</Tex>
        </p>
        <div className="mx-auto w-full max-w-xl px-3 pt-2 sm:px-4">
          <Plot
            view={VIEW}
            aspect="equal"
            ariaLabel={`Graph of a polynomial with roots ${num(r1)} (power ${mult}) and ${num(r2)}`}
          >
            <FunctionGraph fn={p} color={CURVE} />
            <MovablePoint
              x={r1}
              y={0}
              onMove={(x) => setR1(x)}
              constrain={onAxis}
              step={0.5}
              color={ROOT_A}
              label="First root"
            />
            <MovablePoint
              x={r2}
              y={0}
              onMove={(x) => setR2(x)}
              constrain={onAxis}
              step={0.5}
              color={ROOT_B}
              label="Second root"
            />
          </Plot>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'degree', value: `${mult} + 1 = ${mult + 1}` },
              {
                label: `at x = ${num(r1)}`,
                value: merged
                  ? `${BEHAVIOUR[Math.min(mult + 1, 3)]} (roots merged)`
                  : BEHAVIOUR[mult],
                color: ROOT_A,
              },
              {
                label: `at x = ${num(r2)}`,
                value: merged ? 'same root' : BEHAVIOUR[1],
                color: ROOT_B,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-touch-and-turn" when={mult === 2 && !merged}>
          Square the first factor. What does the graph do at that root now?
        </TryThis>
        <TryThis id="t-flatten-through" when={mult === 3 && !merged}>
          Cube the first factor. How is crossing at a cubed root different from a plain root?
        </TryThis>
        <TryThis id="t-merge-roots" when={merged}>
          Drag the two roots onto each other. What multiplicity does the merged root have?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function RationalExplorer() {
  const [c, setC] = useState(1)
  const [d, setD] = useState(1)
  const [b, setB] = useState(1)
  const f = (x: number) => (c * x + d) / (x - b)
  const hole = c * b + d === 0
  const ha = c
  return (
    <LabSection id="rational" eyebrow="Explore" title="Asymptotes and holes">
      <Prose>
        <p>
          Here <Tex>{'f(x) = \\tfrac{cx + d}{x - b}'}</Tex>. The red dashed lines are the
          asymptotes. Change the sliders: the vertical one follows the zero of the bottom, the
          horizontal one follows the ratio of the <Tex>{'x'}</Tex>-coefficients. Can you make the
          vertical asymptote vanish?
        </p>
      </Prose>
      <Figure>
        <p className="px-3 pt-3 text-center sm:px-4">
          <Tex>{`f(x) = \\dfrac{${linearTex(c, d)}}{${linearTex(1, -b)}}`}</Tex>
        </p>
        <div className="mx-auto w-full max-w-xl px-3 pt-2 sm:px-4">
          <Plot
            view={VIEW}
            aspect="equal"
            ariaLabel={
              hole
                ? `f is the constant ${ha} with a hole at x = ${b}`
                : `Rational function with vertical asymptote x = ${b} and horizontal asymptote y = ${ha}`
            }
          >
            <InfiniteLine
              through={[0, ha]}
              direction={[1, 0]}
              color={ASYMPTOTE}
              width={1.5}
              dashed
            />
            {!hole && (
              <InfiniteLine
                through={[b, 0]}
                direction={[0, 1]}
                color={ASYMPTOTE}
                width={1.5}
                dashed
              />
            )}
            <FunctionGraph fn={f} domain={[VIEW.xMin - 3, b - 1e-6]} color={CURVE} />
            <FunctionGraph fn={f} domain={[b + 1e-6, VIEW.xMax + 3]} color={CURVE} />
            {hole && <Point at={[b, ha]} r={6} color={CURVE} hollow />}
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <Slider
            label="c (top x coefficient)"
            value={c}
            min={0}
            max={3}
            step={1}
            onChange={setC}
            color={CURVE}
          />
          <Slider
            label="d (top constant)"
            value={d}
            min={-4}
            max={4}
            step={1}
            onChange={setD}
            color={CURVE}
          />
          <Slider
            label="b (bottom zero)"
            value={b}
            min={-3}
            max={3}
            step={1}
            onChange={setB}
            color={ASYMPTOTE}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'vertical',
                value: hole ? `none: a hole at x = ${b}` : `x = ${b}`,
                color: ASYMPTOTE,
              },
              { label: 'horizontal', value: `y = ${ha}`, color: ASYMPTOTE },
              {
                label: 'why',
                value: c === 0 ? 'top has lower degree → y = 0' : `equal degrees → ${c} ÷ 1`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-hole-appears" when={hole}>
          Make the top zero at the same <Tex>{'x'}</Tex> as the bottom. What happens to the vertical
          asymptote?
        </TryThis>
        <TryThis id="t-sink-to-zero" when={c === 0 && d !== 0}>
          Remove the <Tex>{'x'}</Tex> from the top. Where does the graph settle far away?
        </TryThis>
        <TryThis id="t-wall-at-two" when={b === 2 && !hole}>
          Put the vertical asymptote at <Tex>{'x = 2'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [r1, setR1] = useState(0)
  const [r2, setR2] = useState(0.5)
  const roots = [r1, r2].sort((p, q) => p - q)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-distinct-zeros"
          index={1}
          prompt="How many different real zeros does $p(x) = (x - 1)^2(x + 3)$ have?"
          answer={2}
          explanation="$x = 1$ (multiplicity 2) and $x = -3$: two different zeros."
        />
        <McqChallenge
          id="c-bounce"
          index={2}
          prompt="At $x = -2$, what does the graph of $(x + 2)^2(x - 5)$ do?"
          options={[
            { text: 'Touches the axis and turns back', correct: true },
            { text: 'Crosses straight through', why: 'An even power never changes sign.' },
            { text: 'Has a vertical asymptote', why: 'Polynomials have no asymptotes.' },
          ]}
          explanation="The squared factor keeps the same sign on both sides of −2, so the graph bounces."
        />
        <NumericChallenge
          id="c-vertical-line"
          index={3}
          prompt="$f(x) = \dfrac{3}{x - 4}$ has a vertical asymptote $x = \;?$"
          answer={4}
          explanation="The denominator is zero at $x = 4$ while the top is 3, not 0."
        />
        <NumericChallenge
          id="c-level-off"
          index={4}
          prompt="$f(x) = \dfrac{2x + 1}{x - 3}$ has a horizontal asymptote $y = \;?$"
          answer={2}
          explanation="Equal degrees: the ratio of leading coefficients, $2 \div 1 = 2$."
        />
        <McqChallenge
          id="c-hole-or-wall"
          index={5}
          prompt="What happens at $x = 2$ for $f(x) = \dfrac{x^2 - 4}{x - 2}$?"
          options={[
            { text: 'A hole: the graph is $y = x + 2$ with one point missing', correct: true },
            {
              text: 'A vertical asymptote',
              why: 'The factor $x - 2$ cancels, so nothing blows up.',
            },
            { text: 'Nothing special', why: '$f(2)$ is $\\tfrac{0}{0}$: undefined.' },
          ]}
          explanation="$\tfrac{(x - 2)(x + 2)}{x - 2} = x + 2$ for $x \ne 2$: a line with a hole at $(2, 4)$."
        />
        <InteractiveChallenge
          id="c-place-roots"
          index={6}
          prompt="Drag the roots so that $p(x) = (x - r_1)(x - r_2)$ is zero at $-3$ and $2$."
          solved={roots[0] === -3 && roots[1] === 2}
          hint="The factors are $(x + 3)$ and $(x - 2)$."
          explanation="Roots at −3 and 2 give $p(x) = (x + 3)(x - 2) = x^2 + x - 6$."
          onReset={() => {
            setR1(0)
            setR2(0.5)
          }}
        >
          <div className="mx-auto w-full max-w-md rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`p(x) = ${factor(r1)}${factor(r2)}`}</Tex>
            </p>
            <Plot
              view={VIEW}
              aspect="equal"
              ariaLabel={`Graph of a quadratic with roots ${num(r1)} and ${num(r2)}`}
            >
              <FunctionGraph fn={(x) => (x - r1) * (x - r2)} color={CURVE} />
              <MovablePoint
                x={r1}
                y={0}
                onMove={(x) => setR1(x)}
                constrain={onAxis}
                step={0.5}
                color={ROOT_A}
                label="First root"
              />
              <MovablePoint
                x={r2}
                y={0}
                onMove={(x) => setR2(x)}
                constrain={onAxis}
                step={0.5}
                color={ROOT_B}
                label="Second root"
              />
            </Plot>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
