import { useState } from 'react'
import { findExtrema, findRoots } from '@/math/calculus'
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
import { FunctionGraph, Plot, Point } from '@/viz'
import { linearTex, polyDegree, polyEval, polyMul, polyTex, type Poly } from '../_shared/algebra'

const CURVE = 'var(--c-blue)'
const ROOT = 'var(--c-orange)'
const TURN = 'var(--c-violet)'
const VIEW = { xMin: -4, xMax: 4, yMin: -8, yMax: 8 }

/** How the graph leaves the window on each side, from the leading term. */
function endBehaviour(p: Poly): string {
  const d = polyDegree(p)
  if (d <= 0) return 'flat'
  const lead = p[d]
  const right = lead > 0 ? 'up' : 'down'
  const left = d % 2 === 0 ? right : lead > 0 ? 'down' : 'up'
  return `${left} on the left, ${right} on the right`
}

/** Real roots and turning points inside the plotted window. */
function shape(p: Poly) {
  const f = (x: number) => polyEval(p, x)
  const d = polyDegree(p)
  if (d <= 0) return { roots: [] as number[], turns: [] as { x: number; y: number }[] }
  // An odd sample count keeps grid points off x = 0, where nice polynomials often turn; nearby
  // duplicates (a sample landing exactly on a turn reports it twice) are merged.
  const turns = findExtrema(f, -6, 6, 1201).filter(
    (e, i, all) => i === 0 || e.x - all[i - 1].x > 0.02,
  )
  return { roots: findRoots(f, -6, 6, 1201), turns: turns.map((e) => ({ x: e.x, y: e.y })) }
}

const COEFF_LABELS = [
  'Constant c₀',
  'x coefficient c₁',
  'x² coefficient c₂',
  'x³ coefficient c₃',
  'x⁴ coefficient c₄',
]

export default function PolynomialsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Building curves from powers of x">
        <Prose>
          <p>
            A <strong>polynomial</strong> adds up whole-number powers of <Tex>{'x'}</Tex>, each with
            a coefficient: <Tex>{'3x^2 - 2x + 5'}</Tex> or <Tex>{'x^4 - 4x^2 + 1'}</Tex>. Lines and
            parabolas are the simplest ones; higher powers make curves that wiggle.
          </p>
          <p>
            The biggest power, the <strong>degree</strong>, tells you a lot before you draw
            anything: how the ends of the graph point, at most how many times it can cross the{' '}
            <Tex>{'x'}</Tex>-axis, and at most how many hills and valleys it has.
          </p>
        </Prose>
      </LabSection>
      <BuilderExplorer />
      <BoxExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Degree, roots and turning points">
        <Formula
          tex={'p(x) = c_n x^n + c_{n-1} x^{n-1} + \\cdots + c_1 x + c_0, \\qquad c_n \\ne 0'}
          caption="A polynomial of degree n. The leading term cₙxⁿ controls the ends of the graph."
        />
        <Prose>
          <ul>
            <li>
              A degree-<Tex>{'n'}</Tex> polynomial has at most <Tex>{'n'}</Tex> real roots and at
              most <Tex>{'n - 1'}</Tex> turning points.
            </li>
            <li>
              <strong>End behaviour:</strong> even degree, both ends point the same way; odd degree,
              opposite ways. A negative leading coefficient flips it.
            </li>
            <li>
              <strong>Add</strong> by collecting like terms:{' '}
              <Tex>{'(2x^2 + 3x) + (x^2 - 5x) = 3x^2 - 2x'}</Tex>.
            </li>
            <li>
              <strong>Multiply</strong> every term by every term:{' '}
              <Tex>{'(x + 2)(x + 3) = x^2 + 5x + 6'}</Tex>. Degrees add.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="(x + 3)² is not x² + 9">
          <p>
            Squaring a sum multiplies it by itself, so every term meets every term:{' '}
            <Tex>{'(x + 3)^2 = x^2 + 3x + 3x + 9 = x^2 + 6x + 9'}</Tex>. The box model shows the two{' '}
            <Tex>{'3x'}</Tex> pieces that “x² + 9” forgets. Check with <Tex>{'x = 1'}</Tex>:{' '}
            <Tex>{'4^2 = 16'}</Tex>, not 10.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where polynomials are used">
        <RealWorld
          items={[
            {
              title: 'Motion',
              body: 'A thrown ball’s height is a degree-2 polynomial in time: $h = -4.9t^2 + vt + h_0$.',
            },
            {
              title: 'Design curves',
              body: 'Fonts, car bodies and animation paths are drawn with polynomial (Bézier) curves.',
            },
            {
              title: 'Approximation',
              body: 'Calculators compute $\\sin$, $e^x$ and more with carefully chosen polynomials.',
            },
            {
              title: 'Volumes and areas',
              body: 'A box cut from a sheet has volume $x(20 - 2x)^2$: a cubic to maximise.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A polynomial is a sum of terms $c\\,x^k$ with whole-number $k$.',
            'The degree is the highest power; the leading term sets the end behaviour.',
            'Degree $n$: at most $n$ real roots and $n - 1$ turning points.',
            'Multiply by pairing every term with every term; degrees add.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BuilderExplorer() {
  const [c, setC] = useState<number[]>([-2, 0, 1, 0, 0])
  const d = polyDegree(c)
  const { roots, turns } = shape(c)
  const set = (i: number) => (v: number) => setC((old) => old.map((x, j) => (j === i ? v : x)))
  return (
    <LabSection id="explore" eyebrow="Explore" title="Build a polynomial">
      <Prose>
        <p>
          Each slider sets one coefficient. Orange dots are real roots, where the curve crosses or
          touches the <Tex>{'x'}</Tex>-axis; violet dots are turning points. Compare the counts with
          the degree.
        </p>
      </Prose>
      <PredictReveal
        question="At most how many times can a degree-3 polynomial cross the $x$-axis?"
        options={['1', '2', '3', '4']}
        answer={2}
        explanation="A degree-$n$ polynomial has at most $n$ real roots, so at most 3. It always has at least one, because the two ends point opposite ways."
      />
      <Figure>
        <p className="px-3 pt-3 text-center sm:px-4">
          <Tex>{`p(x) = ${polyTex(c)}`}</Tex>
        </p>
        <div className="mx-auto w-full max-w-xl px-3 pt-2 sm:px-4">
          <Plot view={VIEW} ratio={1.3} ariaLabel={`Graph of p(x) = ${polyTex(c)}`}>
            <FunctionGraph fn={(x) => polyEval(c, x)} color={CURVE} />
            {roots.map((r) => (
              <Point key={`r${r}`} at={[r, 0]} r={5} color={ROOT} />
            ))}
            {turns.map((t) => (
              <Point key={`t${t.x}`} at={[t.x, t.y]} r={5} color={TURN} />
            ))}
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          {c.map((v, i) => (
            <Slider
              key={i}
              label={COEFF_LABELS[i]}
              value={v}
              min={-3}
              max={3}
              step={0.5}
              onChange={set(i)}
            />
          ))}
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'degree', value: d < 0 ? 'none (zero polynomial)' : `${d}` },
              { label: 'ends', value: endBehaviour(c) },
              {
                label: 'real roots',
                value: `${roots.length} (at most ${Math.max(d, 0)})`,
                color: ROOT,
              },
              {
                label: 'turning points',
                value: `${turns.length} (at most ${Math.max(d - 1, 0)})`,
                color: TURN,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-w-shape" when={d === 4 && turns.length === 3}>
          Make a degree-4 “W” or “M”: three turning points.
        </TryThis>
        <TryThis id="t-opposite-ends" when={d % 2 === 1}>
          Give the polynomial an odd degree. What happens to the two ends?
        </TryThis>
        <TryThis id="t-no-crossing" when={d >= 2 && roots.length === 0}>
          Make a polynomial of degree 2 or more that never touches the <Tex>{'x'}</Tex>-axis.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function BoxExplorer() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const [c, setC] = useState(1)
  const [d, setD] = useState(3)
  const product = polyMul([b, a], [d, c])
  const cells = [polyTex([0, 0, a * c]), polyTex([0, a * d]), polyTex([0, b * c]), polyTex([b * d])]
  return (
    <LabSection id="box" eyebrow="Explore" title="Multiplying with a box">
      <Prose>
        <p>
          To multiply <Tex>{'(ax + b)(cx + d)'}</Tex>, write one factor across the top and the other
          down the side. Each cell is one term times one term; then collect like terms. The two
          middle cells are the ones people forget.
        </p>
      </Prose>
      <Figure>
        <p className="px-3 pt-3 text-center sm:px-4">
          <Tex>{`(${linearTex(a, b)})(${linearTex(c, d)}) = ${polyTex(product)}`}</Tex>
        </p>
        <div className="flex justify-center px-3 pt-3 sm:px-4">
          <table className="border-separate border-spacing-1 text-center text-sm">
            <caption className="sr-only">Box multiplication grid</caption>
            <thead>
              <tr>
                <th scope="col" aria-label="times" />
                <th scope="col" className="px-3 font-medium text-ink-2">
                  <Tex>{linearTex(c, 0)}</Tex>
                </th>
                <th scope="col" className="px-3 font-medium text-ink-2">
                  <Tex>{`${d}`}</Tex>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="px-3 font-medium text-ink-2">
                  <Tex>{linearTex(a, 0)}</Tex>
                </th>
                <td className="rounded-lg bg-[color-mix(in_oklab,var(--c-blue)_18%,var(--surface))] px-3 py-3">
                  <Tex>{cells[0]}</Tex>
                </td>
                <td className="rounded-lg bg-[color-mix(in_oklab,var(--c-violet)_18%,var(--surface))] px-3 py-3">
                  <Tex>{cells[1]}</Tex>
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-3 font-medium text-ink-2">
                  <Tex>{`${b}`}</Tex>
                </th>
                <td className="rounded-lg bg-[color-mix(in_oklab,var(--c-violet)_18%,var(--surface))] px-3 py-3">
                  <Tex>{cells[2]}</Tex>
                </td>
                <td className="rounded-lg bg-[color-mix(in_oklab,var(--c-orange)_18%,var(--surface))] px-3 py-3">
                  <Tex>{cells[3]}</Tex>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="a (first x coefficient)"
            value={a}
            min={1}
            max={3}
            step={1}
            onChange={setA}
          />
          <Slider label="b (first constant)" value={b} min={-5} max={5} step={1} onChange={setB} />
          <Slider
            label="c (second x coefficient)"
            value={c}
            min={1}
            max={3}
            step={1}
            onChange={setC}
          />
          <Slider label="d (second constant)" value={d} min={-5} max={5} step={1} onChange={setD} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x² term', value: `${a * c}` },
              { label: 'middle term', value: `${a * d} + ${b * c} = ${a * d + b * c}` },
              { label: 'constant', value: `${b * d}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-middle-vanishes" when={a * d + b * c === 0 && b !== 0}>
          Make the two middle cells cancel, so the answer has no <Tex>{'x'}</Tex> term.
        </TryThis>
        <TryThis id="t-square-it" when={a === c && b === d && b !== 0}>
          Make both factors the same. Why are the two middle cells equal?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [c, setC] = useState<number[]>([0, 0, 1])
  const solved = c[2] !== 0 && c[1] === -c[2] && c[0] === -6 * c[2]
  const set = (i: number) => (v: number) => setC((old) => old.map((x, j) => (j === i ? v : x)))
  const roots = findRoots((x) => polyEval(c, x), -6, 6, 1201)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-degree-of"
          index={1}
          prompt="What is the degree of $3x^4 - x + 7$?"
          answer={4}
          explanation="The highest power of $x$ is 4."
        />
        <McqChallenge
          id="c-add-polys"
          index={2}
          prompt="$(2x^2 + 3x) + (x^2 - 5x) = \;?$"
          options={[
            { text: '$3x^2 - 2x$', correct: true },
            { text: '$3x^4 - 2x^2$', why: 'Adding doesn’t change the powers.' },
            {
              text: '$x^2 + 8x$',
              why: 'Add the $x^2$ terms and the $x$ terms separately: $2 + 1$, $3 - 5$.',
            },
            { text: '$3x^2 + 8x$', why: '$3x + (-5x) = -2x$.' },
          ]}
          explanation="$x^2$ terms: $2 + 1 = 3$. $x$ terms: $3 - 5 = -2$."
        />
        <NumericChallenge
          id="c-expand-middle"
          index={3}
          prompt="Expand $(x + 4)(x - 1)$. What is the coefficient of $x$?"
          answer={3}
          explanation="$x^2 - x + 4x - 4 = x^2 + 3x - 4$."
        />
        <McqChallenge
          id="c-end-behaviour"
          index={4}
          prompt="How do the ends of $y = -x^3 + 2x$ point?"
          options={[
            { text: 'Up on the left, down on the right', correct: true },
            {
              text: 'Down on the left, up on the right',
              why: 'That is $+x^3$; the minus sign flips it.',
            },
            { text: 'Both up', why: 'Odd degree: the ends point opposite ways.' },
            { text: 'Both down', why: 'Odd degree: the ends point opposite ways.' },
          ]}
          explanation="Odd degree with a negative leading coefficient: rising on the left, falling on the right."
        />
        <NumericChallenge
          id="c-max-roots"
          index={5}
          prompt="At most how many real roots can a degree-5 polynomial have?"
          answer={5}
          explanation="A degree-$n$ polynomial has at most $n$ real roots."
        />
        <InteractiveChallenge
          id="c-roots-two-and-three"
          index={6}
          prompt="Set the coefficients so the quadratic has roots exactly at $-2$ and $3$."
          solved={solved}
          hint="Multiply out $(x + 2)(x - 3)$."
          explanation="$(x + 2)(x - 3) = x^2 - x - 6$: $c_2 = 1$, $c_1 = -1$, $c_0 = -6$ (or any multiple of these)."
          onReset={() => setC([0, 0, 1])}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`p(x) = ${polyTex(c)}`}</Tex>
            </p>
            <div className="mx-auto w-full max-w-md">
              <Plot view={VIEW} ratio={1.4} ariaLabel={`Graph of p(x) = ${polyTex(c)}`}>
                <FunctionGraph fn={(x) => polyEval(c, x)} color={CURVE} />
                {roots.map((r) => (
                  <Point key={r} at={[r, 0]} r={5} color={ROOT} />
                ))}
              </Plot>
            </div>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              <Slider
                label="x² coefficient"
                value={c[2]}
                min={-3}
                max={3}
                step={1}
                onChange={set(2)}
              />
              <Slider
                label="x coefficient"
                value={c[1]}
                min={-6}
                max={6}
                step={1}
                onChange={set(1)}
              />
              <Slider label="Constant" value={c[0]} min={-8} max={8} step={1} onChange={set(0)} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
