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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import {
  Circle,
  FunctionGraph,
  InfiniteLine,
  MovablePoint,
  ParametricCurve,
  Plot,
  Point,
  constraints,
} from '@/viz'
import { paren } from '../_shared/algebra'

const IN = 'var(--c-blue)'
const OUT = 'var(--c-orange)'
const CURVE = 'var(--c-blue)'
const PROBE = 'var(--c-violet)'

type RuleId = 'double' | 'square' | 'abs'

const RULES: Record<
  RuleId,
  { tex: string; outputs: (x: number) => number[]; isFunction: boolean }
> = {
  double: { tex: 'x \\mapsto 2x', outputs: (x) => [2 * x], isFunction: true },
  square: { tex: 'x \\mapsto x^2 - 4', outputs: (x) => [x * x - 4], isFunction: true },
  abs: {
    tex: 'x \\mapsto \\text{any } y \\text{ with } |y| = x',
    outputs: (x) => (x < 0 ? [] : x === 0 ? [0] : [x, -x]),
    isFunction: false,
  },
}

type CurveId = 'parabola' | 'cubic' | 'circle' | 'sideways'

/** The heights where the vertical line x = a meets each curve. */
const CROSSINGS: Record<CurveId, (a: number) => number[]> = {
  parabola: (a) => [(a * a) / 2 - 2],
  cubic: (a) => [a ** 3 / 8 - a],
  circle: (a) =>
    Math.abs(a) > 3 ? [] : Math.abs(a) === 3 ? [0] : [Math.sqrt(9 - a * a), -Math.sqrt(9 - a * a)],
  sideways: (a) =>
    a < -2 ? [] : a === -2 ? [0] : [Math.sqrt(2 * (a + 2)), -Math.sqrt(2 * (a + 2))],
}

const CURVE_TEX: Record<CurveId, string> = {
  parabola: 'y = \\tfrac{1}{2}x^2 - 2',
  cubic: 'y = \\tfrac{1}{8}x^3 - x',
  circle: 'x^2 + y^2 = 9',
  sideways: 'x = \\tfrac{1}{2}y^2 - 2',
}

const snapLine = constraints.compose(
  constraints.horizontal(0),
  constraints.snapToGrid(0.5),
  constraints.within(-5, 5, 0, 0),
)

export default function FunctionsIntroLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="One input, exactly one output">
        <Prose>
          <p>
            A <strong>function</strong> is a rule that takes an input and gives back{' '}
            <em>exactly one</em> output. Put in a temperature in °C, get one temperature in °F. Put
            in a person, get their birthday. Put in <Tex>{'x'}</Tex>, get <Tex>{'2x'}</Tex>.
          </p>
          <p>
            Two inputs may share an output (many people share a birthday), but one input may never
            give two different answers. Plot each input with its output and you get the function's{' '}
            <strong>graph</strong>.
          </p>
        </Prose>
      </LabSection>
      <MachineExplorer />
      <VerticalLineExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Notation, domain and range">
        <Formula
          tex={'f(x) = 2x + 3 \\qquad f(4) = 2 \\cdot 4 + 3 = 11'}
          caption="Read f(x) as “f of x”: the output of the function f for the input x."
        />
        <Prose>
          <ul>
            <li>
              The <strong>domain</strong> is the set of inputs allowed; the <strong>range</strong>{' '}
              is the set of outputs that actually come out. For <Tex>{'f(x) = \\sqrt{x}'}</Tex>, the
              domain is <Tex>{'x \\ge 0'}</Tex> and the range is <Tex>{'y \\ge 0'}</Tex>.
            </li>
            <li>
              The <strong>graph</strong> is every point <Tex>{'(x, f(x))'}</Tex>.
            </li>
            <li>
              <strong>Vertical line test:</strong> a curve is the graph of a function exactly when
              no vertical line crosses it more than once.
            </li>
            <li>
              A function can be given by a formula, a table, a graph or words; they're all the same
              idea.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="f(x) doesn't mean f times x">
          <p>
            The brackets in <Tex>{'f(x)'}</Tex> say what goes <em>into</em> the function, not a
            multiplication. <Tex>{'f(3)'}</Tex> means “the output when the input is 3”, and{' '}
            <Tex>{'f(a + 1)'}</Tex> is not <Tex>{'f(a) + 1'}</Tex> in general.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where functions are used">
        <RealWorld
          items={[
            {
              title: 'Unit conversions',
              body: '°F = 1.8 × °C + 32 is a function: each Celsius reading gives one Fahrenheit reading.',
            },
            {
              title: 'Prices',
              body: 'Postage as a function of weight, or a taxi fare as a function of distance: one input, one price.',
            },
            {
              title: 'Code',
              body: 'A programming function takes arguments and returns a value; pure ones always return the same output for the same input.',
            },
            {
              title: 'Science',
              body: 'Height of a ball as a function of time, population as a function of year: graphs of functions are how data is read.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A function gives exactly one output for each input.',
            'Different inputs may share an output; one input may not have two.',
            '$f(x)$ is the output for input $x$; the graph is all points $(x, f(x))$.',
            'Vertical line test: no vertical line meets a function’s graph twice.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function MachineExplorer() {
  const [rule, setRule] = useState<RuleId>('double')
  const [x, setX] = useState(1)
  const [tried, setTried] = useState<number[]>([1])
  const r = RULES[rule]
  const outs = r.outputs(x)
  const shared = rule === 'square' && tried.some((t) => t !== 0 && tried.includes(-t))
  const points: Vec2[] = tried.flatMap((t) => r.outputs(t).map((y): Vec2 => [t, y]))
  const rows = [...tried].sort((p, q) => p - q)
  return (
    <LabSection id="explore" eyebrow="Explore" title="From a rule to a graph">
      <Prose>
        <p>
          Choose a rule and slide the input. Each input you try is written in the table and plotted
          as a point. One of the three rules is not a function: find out which.
        </p>
      </Prose>
      <PredictReveal
        question="Which of these could NOT be a function?"
        options={[
          'Each student → their height',
          'Each number → its square',
          'Each country → one of its cities',
          'Each day → that day’s noon temperature',
        ]}
        answer={2}
        explanation="A country has many cities, so “one of its cities” doesn't pick a single output. The other rules give exactly one answer per input."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Rule"
            value={rule}
            onChange={(v) => {
              setRule(v)
              setTried([x])
            }}
            options={[
              { value: 'double', label: 'Double it' },
              { value: 'square', label: 'Square, then − 4' },
              { value: 'abs', label: 'Any y with |y| = x' },
            ]}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-3 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-4">
          <div className="mx-auto w-full max-w-md">
            <Plot
              view={{ xMin: -5, xMax: 5, yMin: -9, yMax: 13 }}
              ratio={1.1}
              xIntegers
              ariaLabel={`Points plotted for the rule ${r.tex}: ${points.map((p) => `(${p[0]}, ${p[1]})`).join(', ')}`}
            >
              {points.map((p) => (
                <Point
                  key={`${p[0]},${p[1]}`}
                  at={p}
                  r={p[0] === x ? 6 : 4.5}
                  color={p[0] === x ? OUT : IN}
                />
              ))}
            </Plot>
          </div>
          <div className="grid content-start gap-2">
            <p className="text-center text-sm">
              <Tex>{r.tex}</Tex>
            </p>
            <table className="mx-auto text-center text-sm tabular-nums">
              <caption className="sr-only">Inputs and outputs</caption>
              <thead>
                <tr className="text-xs text-ink-2">
                  <th scope="col" className="px-3 font-medium">
                    input
                  </th>
                  <th scope="col" className="px-3 font-medium">
                    output
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t} className={cn(t === x && 'font-semibold')}>
                    <td className="px-3">{t}</td>
                    <td className="px-3">{r.outputs(t).join(' and ') || 'none'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Input x"
            value={x}
            min={-4}
            max={4}
            step={1}
            onChange={(v) => {
              setX(v)
              setTried((t) => (t.includes(v) ? t : [...t, v]))
            }}
            color={IN}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: `output for ${paren(x)}`,
                value: outs.length ? outs.join(' and ') : 'none',
                color: OUT,
              },
              { label: 'inputs tried', value: `${tried.length}` },
              {
                label: 'a function?',
                value: r.isFunction ? 'yes' : 'no: some inputs give two outputs',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-five-inputs" when={tried.length >= 5}>
          Try five different inputs on one rule and look at the shape the points make.
        </TryThis>
        <TryThis id="t-one-in-two-out" when={rule === 'abs' && x > 0}>
          Find an input that gets two different outputs. Why does that break the rule of a function?
        </TryThis>
        <TryThis id="t-shared-output" when={shared}>
          With “square, then − 4”, find two different inputs that share an output. Is that allowed?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function VerticalLineExplorer() {
  const [curve, setCurve] = useState<CurveId>('parabola')
  const [a, setA] = useState(1)
  const ys = CROSSINGS[curve](a)
  const tangent = ys.length === 1 && (curve === 'circle' || curve === 'sideways')
  return (
    <LabSection id="vertical-line" eyebrow="Explore" title="The vertical line test">
      <Prose>
        <p>
          A vertical line picks one input, <Tex>{'x = a'}</Tex>. Where it meets the curve are the
          outputs for that input. Drag the violet handle along the axis: if the line ever meets the
          curve twice, the curve is not the graph of a function.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Curve"
            value={curve}
            onChange={setCurve}
            options={[
              { value: 'parabola', label: 'Parabola' },
              { value: 'cubic', label: 'Cubic' },
              { value: 'circle', label: 'Circle' },
              { value: 'sideways', label: 'Sideways' },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-xl px-3 pt-3 sm:px-4">
          <Plot
            view={{ xMin: -5, xMax: 5, yMin: -4, yMax: 4 }}
            aspect="equal"
            ariaLabel={`The curve ${CURVE_TEX[curve]} and the vertical line x = ${a}, meeting it ${ys.length} times`}
          >
            {curve === 'parabola' && <FunctionGraph fn={(x) => (x * x) / 2 - 2} color={CURVE} />}
            {curve === 'cubic' && <FunctionGraph fn={(x) => x ** 3 / 8 - x} color={CURVE} />}
            {curve === 'circle' && (
              <Circle center={[0, 0]} r={3} stroke={CURVE} strokeWidth={2.5} />
            )}
            {curve === 'sideways' && (
              <ParametricCurve
                x={(t) => (t * t) / 2 - 2}
                y={(t) => t}
                tMin={-4.5}
                tMax={4.5}
                color={CURVE}
              />
            )}
            <InfiniteLine through={[a, 0]} direction={[0, 1]} color={PROBE} width={2} dashed />
            {ys.map((y) => (
              <Point key={y} at={[a, y]} r={6} color={OUT} />
            ))}
            <MovablePoint
              x={a}
              y={0}
              onMove={(nx) => setA(nx)}
              constrain={snapLine}
              step={0.5}
              color={PROBE}
              label="Vertical line position"
            />
          </Plot>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'curve', value: <Tex>{CURVE_TEX[curve]}</Tex> },
              { label: 'line', value: `x = ${a}`, color: PROBE },
              {
                label: 'meets the curve',
                value: `${ys.length} time${ys.length === 1 ? '' : 's'}`,
                color: OUT,
              },
              {
                label: 'graph of a function?',
                value: curve === 'parabola' || curve === 'cubic' ? 'yes' : 'no',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-two-hits" when={ys.length === 2}>
          Find a curve and a line position where the line meets the curve twice.
        </TryThis>
        <TryThis id="t-no-hits" when={ys.length === 0}>
          Find a line that misses the curve completely. What does that say about the domain?
        </TryThis>
        <TryThis id="t-just-touches" when={tangent}>
          On the circle or the sideways parabola, find the line that touches at exactly one point.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [x, setX] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-f-of-four"
          index={1}
          prompt="If $f(x) = 3x - 1$, what is $f(4)$?"
          answer={11}
          explanation="$f(4) = 3 \cdot 4 - 1 = 11$."
        />
        <McqChallenge
          id="c-not-a-function"
          index={2}
          prompt="Which set of (input, output) pairs is NOT a function?"
          options={[
            { text: '(1, 2), (2, 3), (1, 5)', correct: true },
            { text: '(1, 2), (2, 2), (3, 2)', why: 'Sharing an output is fine.' },
            { text: '(0, 0), (1, 1), (2, 4)', why: 'Each input appears once.' },
            { text: '(5, −1)', why: 'One input, one output.' },
          ]}
          explanation="The input 1 has two outputs, 2 and 5."
        />
        <McqChallenge
          id="c-sqrt-domain"
          index={3}
          prompt="What is the domain of $f(x) = \sqrt{x}$ (using real numbers)?"
          options={[
            { text: '$x \\ge 0$', correct: true },
            { text: 'All real numbers', why: 'No real number squares to a negative.' },
            { text: '$x > 0$', why: '$\\sqrt{0} = 0$ is fine.' },
          ]}
          explanation="Square roots of negative numbers aren't real, so the inputs must be $x \ge 0$."
        />
        <NumericChallenge
          id="c-f-of-minus-two"
          index={4}
          prompt="If $f(x) = x^2 + 1$, what is $f(-2)$?"
          answer={5}
          explanation="$(-2)^2 + 1 = 4 + 1 = 5$."
        />
        <McqChallenge
          id="c-shared-output"
          index={5}
          prompt="Can a function send two different inputs to the same output?"
          options={[
            { text: 'Yes', correct: true },
            { text: 'No', why: 'The rule forbids one input having two outputs, not the reverse.' },
          ]}
          explanation="$x^2$ sends both 2 and −2 to 4 and is still a function."
        />
        <InteractiveChallenge
          id="c-find-input"
          index={6}
          prompt="For $f(x) = 2x + 3$, find the input with $f(x) = 11$."
          solved={2 * x + 3 === 11}
          hint="Work backwards: subtract 3, then halve."
          explanation="$11 - 3 = 8$ and $8 \div 2 = 4$, so $f(4) = 11$."
          onReset={() => setX(0)}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`f(${x}) = 2 \\cdot ${paren(x)} + 3 = ${2 * x + 3}`}</Tex>
            </p>
            <Slider
              label="Input x"
              value={x}
              min={-6}
              max={6}
              step={1}
              onChange={setX}
              color={IN}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
