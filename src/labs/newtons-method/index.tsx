import { RotateCcw, StepForward } from 'lucide-react'
import { useState } from 'react'
import { derivative } from '@/math/calculus'
import { formatNumber } from '@/math/core'
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
  ExpressionChallenge,
  InteractiveChallenge,
  McqChallenge,
  NumericChallenge,
} from '@/learn/challenges'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, MovablePoint, Plot, Point, Segment, constraints } from '@/viz'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const TANGENT = 'var(--c-magenta)'
const START = 'var(--c-orange)'
const STEP = 'var(--c-violet)'

type NewtonKey = 'sqrt2' | 'cos' | 'cycle'

type NewtonFn = {
  f: (x: number) => number
  root: number
  view: { xMin: number; xMax: number; yMin: number; yMax: number }
  tex: string
  label: string
  x0: number
}

const NEWTON_FNS: Record<NewtonKey, NewtonFn> = {
  sqrt2: {
    f: (x) => x * x - 2,
    root: Math.SQRT2,
    view: { xMin: -1.2, xMax: 3.6, yMin: -3, yMax: 9 },
    tex: 'f(x) = x^2 - 2',
    label: 'Square root of 2',
    x0: 3,
  },
  cos: {
    f: (x) => Math.cos(x) - x,
    root: 0.7390851332151607,
    view: { xMin: -1.5, xMax: 3.2, yMin: -4, yMax: 2 },
    tex: 'f(x) = \\cos x - x',
    label: 'cos x = x',
    x0: 2.5,
  },
  cycle: {
    f: (x) => x ** 3 - 2 * x + 2,
    root: -1.7692923542386314,
    view: { xMin: -3, xMax: 2.5, yMin: -6, yMax: 8 },
    tex: 'f(x) = x^3 - 2x + 2',
    label: 'A troublemaker',
    x0: 1.5,
  },
}

const MAX_STEPS = 8

/** Newton iterates x₀, x₁, …, stopping early if the tangent is flat or the guess runs off. */
function iterate(f: (x: number) => number, x0: number, steps: number) {
  const xs = [x0]
  for (let k = 0; k < steps; k++) {
    const x = xs[xs.length - 1]
    const d = derivative(f, x, 1e-6)
    if (!Number.isFinite(d) || Math.abs(d) < 1e-12) break
    const next = x - f(x) / d
    if (!Number.isFinite(next) || Math.abs(next) > 1e6) break
    xs.push(next)
  }
  return xs
}

/** How many decimal places of x agree with the true root. */
function correctDigits(x: number, root: number) {
  const err = Math.abs(x - root)
  if (err === 0) return 16
  return Math.max(0, Math.min(16, Math.floor(-Math.log10(err))))
}

export default function NewtonsMethodLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Slide down the tangent">
        <Prose>
          <p>
            How does a calculator find <Tex>{'\\sqrt 2'}</Tex>? There's no button inside that knows
            it. Instead it solves <Tex>{'x^2 - 2 = 0'}</Tex> by guessing, then repeatedly improving
            the guess.
          </p>
          <p>
            Newton's trick: near your guess, the curve looks like its tangent line, and a line is
            easy to solve. So follow the tangent down to where <em>it</em> hits zero and use that as
            your next guess. Close to the answer, each step roughly{' '}
            <strong>doubles the number of correct digits</strong>.
          </p>
        </Prose>
      </LabSection>
      <ZigZagExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The Newton step">
        <Formula
          tex={"x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}"}
          caption="The tangent at $x_n$ crosses zero at $x_{n+1}$: rise $f(x_n)$ over slope $f'(x_n)$ is how far to move."
        />
        <Prose>
          <p>
            For <Tex>{'f(x) = x^2 - a'}</Tex> the step becomes{' '}
            <Tex>{'x_{n+1} = \\tfrac12\\big(x_n + \\tfrac{a}{x_n}\\big)'}</Tex>: average your guess
            with <Tex>{'a / x_n'}</Tex>. The Babylonians used this for square roots 4,000 years ago.
          </p>
          <p>
            Near a simple root the error is roughly squared each step: 0.01 becomes 0.0001, then
            0.00000001. That is <em>quadratic convergence</em>, and it's why a handful of steps
            gives every digit a computer can store.
          </p>
        </Prose>
        <Callout kind="misconception" title="Newton isn't guaranteed to work">
          <p>
            It needs a good start. A flat tangent (<Tex>{"f'(x_n) = 0"}</Tex>) never meets the axis;
            a start in the wrong place can bounce in a cycle or fly off. In practice it is paired
            with a safe method like bisection to get close first.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where Newton’s method runs">
        <RealWorld
          items={[
            {
              title: 'Square roots in hardware',
              body: 'Processors compute $\\sqrt x$ and $1/x$ with a rough first guess and a couple of Newton steps.',
            },
            {
              title: 'Video games',
              body: 'The famous “fast inverse square root” trick in Quake III was one clever guess followed by one Newton step.',
            },
            {
              title: 'Engineering solvers',
              body: 'Circuit simulators and structural analysis solve huge systems of equations with Newton’s method in many dimensions.',
            },
            {
              title: 'Machine learning',
              body: 'Second-order optimisers take Newton steps on the gradient to reach a minimum in far fewer iterations.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Newton’s method replaces the curve by its tangent and solves that instead.',
            "The step is $x_{n+1} = x_n - f(x_n)/f'(x_n)$.",
            'Near a root, correct digits roughly double each step.',
            'It can fail: flat tangents, cycles, or runaway guesses. A good start matters.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ZigZagExplorer() {
  const [key, setKey] = useState<NewtonKey>('sqrt2')
  const [x0, setX0] = useState(NEWTON_FNS.sqrt2.x0)
  const [steps, setSteps] = useState(0)
  const fn = NEWTON_FNS[key]
  const xs = iterate(fn.f, x0, steps)
  const stuck = xs.length < steps + 1
  const last = xs[xs.length - 1]
  const digits = correctDigits(last, fn.root)
  const cycling = key === 'cycle' && steps >= 4 && Math.abs(fn.f(last)) > 0.1
  const pick = (k: NewtonKey) => {
    setKey(k)
    setX0(NEWTON_FNS[k].x0)
    setSteps(0)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Zig-zag to the root">
      <Prose>
        <p>
          Drag the orange starting guess along the axis, then press <strong>Step</strong>. Each step
          climbs to the curve, follows the pink tangent down to the axis, and lands on a better
          guess. The table counts how many digits are already right.
        </p>
      </Prose>
      <PredictReveal
        question="Starting from $x_0 = 3$ for $\sqrt 2$, roughly how many steps until the first 10 digits are right?"
        options={['About 3', 'About 6', 'About 20', 'It never gets 10 digits']}
        answer={1}
        explanation="About 6. The first steps make slow progress from far away, then the correct digits double: 1, 2, 5, 10, …"
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Equation"
            value={key}
            onChange={pick}
            options={(Object.keys(NEWTON_FNS) as NewtonKey[]).map((k) => ({
              value: k,
              label: NEWTON_FNS[k].label,
            }))}
          />
          <Tex>{fn.tex}</Tex>
        </div>
        <Plot
          view={fn.view}
          height={320}
          ariaLabel={`Newton's method from ${num(x0)}: ${xs.length - 1} steps, now at ${formatNumber(last, 6)}`}
        >
          <FunctionGraph fn={fn.f} color={CURVE} />
          {xs.slice(0, -1).map((x, k) => {
            const next = xs[k + 1]
            return (
              <g key={k}>
                <Segment from={[x, 0]} to={[x, fn.f(x)]} color="var(--ink-3)" width={1.25} dashed />
                <Segment from={[x, fn.f(x)]} to={[next, 0]} color={TANGENT} width={2} />
                <Point at={[next, 0]} r={4} color={STEP} />
              </g>
            )
          })}
          <MovablePoint
            x={x0}
            y={0}
            onMove={(px) => setX0(px)}
            constrain={constraints.compose(
              constraints.snapToGrid(0.05),
              constraints.within(fn.view.xMin + 0.2, fn.view.xMax - 0.2, 0, 0),
            )}
            step={0.05}
            color={START}
            label="Starting guess x0"
          />
        </Plot>
        <div className="flex flex-wrap items-center gap-2 border-t border-line p-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<StepForward className="size-4" />}
            onClick={() => setSteps((s) => Math.min(MAX_STEPS, s + 1))}
            disabled={steps >= MAX_STEPS || stuck}
          >
            Step
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => setSteps(0)}
            disabled={steps === 0}
          >
            Reset
          </Button>
          <span className="text-sm text-ink-2" role="status">
            {stuck
              ? 'The tangent is flat (or the guess ran off): Newton can’t continue from here.'
              : cycling
                ? 'Stuck bouncing back and forth: this start never settles.'
                : `${xs.length - 1} of ${MAX_STEPS} steps`}
          </span>
        </div>
        <div className="overflow-x-auto overflow-y-hidden border-t border-line p-3 sm:px-4">
          <table className="w-full min-w-[20rem] text-sm tabular-nums">
            <caption className="sr-only">Newton iterates and correct digits</caption>
            <thead>
              <tr className="text-left text-ink-2">
                <th className="py-1 pr-3 font-medium">n</th>
                <th className="py-1 pr-3 font-medium">guess</th>
                <th className="py-1 pr-3 font-medium">f(guess)</th>
                <th className="py-1 font-medium">correct digits</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {xs.map((x, k) => (
                <tr key={k} className="border-t border-line">
                  <td className="py-1 pr-3">{k}</td>
                  <td className="py-1 pr-3">
                    {x.toFixed(12).replace(/0+$/, '').replace(/\.$/, '')}
                  </td>
                  <td className="py-1 pr-3">{formatNumber(fn.f(x), 4)}</td>
                  <td className="py-1">{correctDigits(x, fn.root)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'start', value: formatNumber(x0, 2), color: START },
              { label: 'latest guess', value: formatNumber(last, 8), color: STEP },
              { label: 'correct digits', value: String(digits) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-ten" when={key === 'sqrt2' && digits >= 10}>
          Get 10 correct digits of <Tex>{'\\sqrt 2'}</Tex>. How many steps did it take, and how did
          the digits grow?
        </TryThis>
        <TryThis id="t-flat" when={key === 'sqrt2' && Math.abs(x0) < 0.03 && steps >= 1}>
          Start at <Tex>{'x_0 = 0'}</Tex> and press Step. Why can't Newton move?
        </TryThis>
        <TryThis id="t-cycle" when={cycling}>
          On the troublemaker, start at <Tex>{'x_0 = 0'}</Tex> and take 4 steps. What happens?
        </TryThis>
        <TryThis id="t-other-side" when={key === 'sqrt2' && x0 < -0.5 && digits >= 6}>
          Start at a negative guess. Which root do you land on now?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const CYCLE = NEWTON_FNS.cycle

function Practice() {
  const [x0, setX0] = useState(1.5)
  const xs = iterate(CYCLE.f, x0, 6)
  const settled = xs.length === 7 && Math.abs(CYCLE.f(xs[6])) < 1e-6
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-step-lab"
          index={1}
          prompt="Take one Newton step for $f(x) = x^2 - 2$ from $x_0 = 1$."
          answer={1.5}
          explanation="$x_1 = 1 - \dfrac{1 - 2}{2 \cdot 1} = 1 + 0.5 = 1.5$."
        />
        <NumericChallenge
          id="c-step2-lab"
          index={2}
          prompt="Now one more step from $x_1 = 1.5$."
          answer={17 / 12}
          tolerance={0.0005}
          explanation="$1.5 - \dfrac{0.25}{3} = 1.41\overline{6}$. Already 3 digits of $\sqrt 2 = 1.41421\ldots$"
        />
        <McqChallenge
          id="c-fail-lab"
          index={3}
          prompt="When does a Newton step break down completely?"
          options={[
            { text: "When $f'(x_n) = 0$: the tangent is flat", correct: true },
            { text: 'When $f(x_n) = 0$', why: 'Then you have already found the root.' },
            { text: 'When $x_n$ is negative', why: 'Negative guesses are fine.' },
            {
              text: 'Never: it always converges',
              why: 'It can cycle, run off, or hit a flat tangent.',
            },
          ]}
          explanation="The step divides by $f'(x_n)$. A flat tangent runs parallel to the axis and never crosses it."
        />
        <InteractiveChallenge
          id="c-rescue"
          index={4}
          prompt="On $x^3 - 2x + 2$, starting at 1.5 never settles. Move the start so that after 6 steps Newton has found the root."
          solved={settled}
          hint="The only real root is near $-1.77$. Start on its side of the hump."
          explanation="Any start below about $-0.8$ slides straight down to the root at $-1.769$. Starts near 0 and 1 bounce between them forever."
          onReset={() => setX0(1.5)}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <Slider
              label={<Tex>{'x_0'}</Tex>}
              name="Starting guess x0"
              value={x0}
              min={-3}
              max={2}
              step={0.1}
              onChange={setX0}
              color={START}
            />
            <p className="text-sm">
              After 6 steps: <span className="font-mono">{formatNumber(xs[xs.length - 1], 6)}</span>{' '}
              (<Tex>{`f = ${num(CYCLE.f(xs[xs.length - 1]), 4)}`}</Tex>)
            </p>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-digits"
          index={5}
          prompt="Close to the root, a guess has 4 correct digits. About how many after the next step?"
          options={[
            { text: 'About 8', correct: true },
            {
              text: 'About 5',
              why: 'Newton does better than one digit per step near a simple root.',
            },
            {
              text: 'About 16',
              why: 'Squaring the error doubles the digits, it doesn’t quadruple them.',
            },
            { text: 'Still 4', why: 'Each step improves the guess.' },
          ]}
          explanation="The error is roughly squared: $10^{-4}$ becomes about $10^{-8}$."
        />
        <ExpressionChallenge
          id="c-babylon"
          index={6}
          prompt="Simplify the Newton step for $f(x) = x^2 - a$: write $x - \dfrac{x^2 - a}{2x}$ in terms of $x$ and $a$."
          answer="(x + a/x)/2"
          vars={['x', 'a']}
          range={[0.5, 4]}
          explanation="$x - \dfrac{x}{2} + \dfrac{a}{2x} = \tfrac12\big(x + \tfrac ax\big)$: average the guess with $a/x$."
        />
      </ChallengeSet>
    </LabSection>
  )
}
