import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { linearRegression } from '@/math/stats'
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  CanvasLayer,
  FunctionGraph,
  InfiniteLine,
  MovablePoint,
  Plot,
  Point,
  Polyline,
  Segment,
  constraints,
  cssColor,
  useAnimationFrame,
} from '@/viz'
import { num, signed } from '../_shared/tex'

// ── One parameter: a double-well loss curve ────────────────────────────────

const loss = (w: number) => 0.08 * w ** 4 - 0.5 * w ** 2 + 0.3 * w + 2
const slope = (w: number) => 0.32 * w ** 3 - w + 0.3
const W_MAX = 3.2
const BALL = 'var(--c-orange)'
const CURVE = 'var(--c-blue)'

type Run1D = { path: number[]; eta: number; running: boolean; diverged: boolean }

const settled = (r: Run1D) =>
  r.path.length > 1 && !r.diverged && Math.abs(slope(r.path[r.path.length - 1])) < 0.005

function stepRun(r: Run1D): Run1D {
  const w = r.path[r.path.length - 1]
  const next = w - r.eta * slope(w)
  if (!Number.isFinite(next) || Math.abs(next) > W_MAX)
    return { ...r, running: false, diverged: true }
  const done = Math.abs(slope(next)) < 0.005 || r.path.length > 400
  return { ...r, path: [...r.path, next], running: r.running && !done }
}

/** The ball, its trail and the controls. `run` is owned by the parent so labs can read it. */
function Descent1D({ run, onRun }: { run: Run1D; onRun: (r: Run1D) => void }) {
  const [clock, setClock] = useState(0)
  const w = run.path[run.path.length - 1]
  useAnimationFrame((dt) => {
    const t = clock + dt
    if (t < 0.14) return setClock(t)
    setClock(0)
    onRun(stepRun(run))
  }, run.running)
  const start = (s: number) => onRun({ ...run, path: [s], running: false, diverged: false })
  const trail: Vec2[] = run.path.map((p) => [p, loss(p)])
  const steps = run.path.length - 1
  return (
    <>
      <Plot
        view={{ xMin: -3.4, xMax: 3.4, yMin: -0.3, yMax: 6.6 }}
        height={320}
        xLabel="parameter w"
        yLabel="loss"
        ariaLabel={`Loss curve; the ball is at w = ${num(w)} with loss ${num(loss(w))} after ${steps} steps`}
      >
        <FunctionGraph fn={loss} domain={[-W_MAX, W_MAX]} color={CURVE} width={2.75} />
        {trail.length > 1 && <Polyline points={trail} color="var(--ink-3)" width={1.25} dashed />}
        {trail.slice(0, -1).map((p, i) => (
          <Point key={i} at={p} r={3.5} color={BALL} />
        ))}
        {!run.diverged && (
          <Segment
            from={[w - 0.6, loss(w) - 0.6 * slope(w)]}
            to={[w + 0.6, loss(w) + 0.6 * slope(w)]}
            color="var(--c-violet)"
            width={2}
          />
        )}
        <MovablePoint
          x={w}
          y={loss(w)}
          onMove={(x) => start(x)}
          constrain={constraints.onGraph(loss, -3, 3)}
          step={0.1}
          color={BALL}
          size={9}
          label="Starting point of the ball (drag along the curve)"
        />
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={run.running ? <Pause className="size-4" /> : <Play className="size-4" />}
            disabled={run.diverged || settled(run)}
            onClick={() => onRun({ ...run, running: !run.running })}
          >
            {run.running ? 'Pause' : 'Run'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<StepForward className="size-4" />}
            disabled={run.running || run.diverged || settled(run)}
            onClick={() => onRun(stepRun(run))}
          >
            One step
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            disabled={steps === 0 && !run.diverged}
            onClick={() => start(run.path[0])}
          >
            Back to start
          </Button>
        </div>
        <Slider
          label="Learning rate η (step size)"
          value={run.eta}
          min={0.01}
          max={1.5}
          step={0.01}
          onChange={(eta) =>
            onRun({ ...run, eta, path: [run.path[0]], running: false, diverged: false })
          }
          color={BALL}
        />
        <Readouts
          items={[
            { label: 'steps', value: String(steps) },
            { label: 'w', value: run.diverged ? 'flew off!' : num(w, 3) },
            { label: 'loss', value: run.diverged ? '–' : num(loss(w), 3), color: CURVE },
            {
              label: 'slope',
              value: run.diverged ? '–' : num(slope(w), 3),
              color: 'var(--c-violet)',
            },
            {
              label: 'status',
              value: run.diverged
                ? 'diverged'
                : settled(run)
                  ? 'settled in a valley'
                  : run.running
                    ? 'rolling…'
                    : 'ready',
            },
          ]}
        />
      </div>
    </>
  )
}

// ── Two parameters: fitting a line ────────────────────────────────────────

const DATA: Vec2[] = [
  [0.5, 1.2],
  [1, 1.9],
  [1.5, 2.1],
  [2, 3.2],
  [2.5, 3.1],
  [3, 4.2],
  [3.5, 4.4],
]
const XS = DATA.map((p) => p[0])
const YS = DATA.map((p) => p[1])
const FIT = linearRegression(XS, YS)
const mse = (m: number, b: number) =>
  DATA.reduce((s, [x, y]) => s + (y - (m * x + b)) ** 2, 0) / DATA.length
function gradient(m: number, b: number): Vec2 {
  let gm = 0
  let gb = 0
  for (const [x, y] of DATA) {
    const r = y - (m * x + b)
    gm += (-2 * x * r) / DATA.length
    gb += (-2 * r) / DATA.length
  }
  return [gm, gb]
}
const MSE_MIN = mse(FIT.slope, FIT.intercept)
const PARAM_VIEW = { xMin: -1.2, xMax: 3.2, yMin: -2.2, yMax: 3.4 }

/** Banded heatmap of the loss over the (m, b) plane: darker = lower. */
function LossLandscape() {
  return (
    <CanvasLayer
      draw={(ctx, t) => {
        const blue = cssColor('var(--c-blue)')
        const cell = 4
        ctx.fillStyle = blue
        for (let px = 0; px < t.width; px += cell) {
          for (let py = 0; py < t.height; py += cell) {
            const L = mse(t.ix(px + cell / 2), t.iy(py + cell / 2))
            const band = Math.floor(Math.log(1 + (L - MSE_MIN) / 0.04) * 1.6)
            ctx.globalAlpha = Math.max(0.03, 0.5 - band * 0.045)
            ctx.fillRect(px, py, cell, cell)
          }
        }
        ctx.globalAlpha = 1
      }}
    />
  )
}

type Run2D = { path: Vec2[]; eta: number; running: boolean; diverged: boolean }

function step2D(r: Run2D): Run2D {
  const [m, b] = r.path[r.path.length - 1]
  const [gm, gb] = gradient(m, b)
  const next: Vec2 = [m - r.eta * gm, b - r.eta * gb]
  if (!Number.isFinite(next[0]) || Math.abs(next[0]) > 60 || Math.abs(next[1]) > 60)
    return { ...r, running: false, diverged: true }
  const g = gradient(...next)
  const done = Math.hypot(g[0], g[1]) < 0.01 || r.path.length > 600
  return { ...r, path: [...r.path, next], running: r.running && !done }
}

function ContourExplorer() {
  const [run, setRun] = useState<Run2D>({
    path: [[-0.5, 2.5]],
    eta: 0.05,
    running: false,
    diverged: false,
  })
  const [clock, setClock] = useState(0)
  const [m, b] = run.path[run.path.length - 1]
  const g = gradient(m, b)
  const converged = run.path.length > 1 && !run.diverged && Math.hypot(g[0], g[1]) < 0.01
  const steps = run.path.length - 1
  useAnimationFrame((dt) => {
    const t = clock + dt
    if (t < 0.05) return setClock(t)
    setClock(0)
    setRun(step2D)
  }, run.running)
  const restart = (p: Vec2, eta = run.eta) =>
    setRun({ path: [p], eta, running: false, diverged: false })
  return (
    <LabSection id="contour" eyebrow="Explore" title="Two knobs: a valley on a map">
      <Prose>
        <p>
          Fitting a line <Tex>y = mx + b</Tex> means choosing two numbers. Each choice has a loss
          (the mean squared error), so the loss is a landscape over the <Tex>(m, b)</Tex> plane:
          darker means lower. Drag the start point, pick a learning rate and run. The line on the
          right is the model at the ball's current position.
        </p>
      </Prose>
      <Figure>
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="px-3 pt-2 text-sm font-semibold">Loss landscape</div>
            <Plot
              view={PARAM_VIEW}
              height={300}
              xLabel="slope m"
              yLabel="intercept b"
              ariaLabel={`Gradient descent at m = ${num(m)}, b = ${num(b)} after ${steps} steps`}
            >
              <LossLandscape />
              <Point at={[FIT.slope, FIT.intercept]} r={4} color="var(--ink)" hollow />
              {run.path.length > 1 && <Polyline points={run.path} color={BALL} width={1.75} />}
              <MovablePoint
                x={m}
                y={b}
                onMove={(x, y) => restart([x, y])}
                constrain={constraints.within(-1, 3, -2, 3.2)}
                step={0.1}
                color={BALL}
                size={8}
                label="Starting slope and intercept"
              />
            </Plot>
          </div>
          <div className="border-t border-line md:border-t-0 md:border-l">
            <div className="px-3 pt-2 text-sm font-semibold">The model</div>
            <Plot
              view={{ xMin: -0.2, xMax: 4.2, yMin: -0.5, yMax: 5.5 }}
              height={300}
              ariaLabel={`Line y = ${num(m)}x ${signed(b)} through the data`}
            >
              {!run.diverged && (
                <InfiniteLine through={[0, b]} direction={[1, m]} color={BALL} width={2.5} />
              )}
              {DATA.map((p, i) => (
                <Point key={i} at={p} r={4.5} color="var(--c-blue)" />
              ))}
            </Plot>
          </div>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={run.running ? <Pause className="size-4" /> : <Play className="size-4" />}
              disabled={run.diverged || converged}
              onClick={() => setRun((r) => ({ ...r, running: !r.running }))}
            >
              {run.running ? 'Pause' : 'Run'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              onClick={() => restart(run.path[0])}
            >
              Back to start
            </Button>
          </div>
          <Slider
            label="Learning rate η"
            value={run.eta}
            min={0.01}
            max={0.2}
            step={0.01}
            onChange={(eta) => restart(run.path[0], eta)}
            color={BALL}
          />
          <Readouts
            items={[
              { label: 'steps', value: String(steps) },
              {
                label: 'model',
                value: run.diverged ? 'diverged' : <Tex>{`y = ${num(m)}x ${signed(b)}`}</Tex>,
              },
              { label: 'loss (MSE)', value: run.diverged ? '–' : num(mse(m, b), 3), color: CURVE },
              { label: 'best possible', value: num(MSE_MIN, 3) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-fit" when={converged}>
          Run until the ball stops. Does the line fit the data now? Compare it with the hollow dot,
          the exact least squares answer.
        </TryThis>
        <TryThis id="t-zigzag" when={run.eta >= 0.15 && steps >= 10 && !run.diverged}>
          Use a learning rate of 0.15 or more. Why does the path zigzag across the valley?
        </TryThis>
        <TryThis id="t-diverge2" when={run.diverged}>
          Push the learning rate up to 0.18 or more. What happens to the ball?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

// ── The lab ───────────────────────────────────────────────────────────────

export default function GradientDescentLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Learn by rolling downhill">
        <Prose>
          <p>
            How does a machine “learn”? Give it a model with adjustable numbers (its{' '}
            <em>parameters</em>) and a way to score how wrong it is (its <em>loss</em>). Learning
            means finding the parameters with the smallest loss.
          </p>
          <p>
            Usually there's no formula for the best parameters, and far too many to try them all. So
            the computer does what a ball does on a hillside: it feels the slope where it stands and
            takes a small step downhill. Then it does it again, thousands of times. That's{' '}
            <strong>gradient descent</strong>, and it trains almost every AI model you've heard of.
          </p>
        </Prose>
      </LabSection>
      <BallExplorer />
      <ContourExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The update rule">
        <Formula
          tex={
            "w_{\\text{new}} = w - \\eta \\, L'(w) \\qquad\\qquad \\vec w_{\\text{new}} = \\vec w - \\eta\\, \\nabla L(\\vec w)"
          }
          caption="Step against the slope (one parameter) or against the gradient (many). $\eta$ is the learning rate."
        />
        <Prose>
          <p>
            Where the slope is steep, steps are big; near the bottom the slope flattens and the
            steps shrink automatically. With many parameters the gradient <Tex>{'\\nabla L'}</Tex>{' '}
            points uphill most steeply, so minus the gradient is the fastest way down.
          </p>
          <p>
            For the line fit, the loss is{' '}
            <Tex>{'L(m, b) = \\frac1n \\sum (y_i - m x_i - b)^2'}</Tex> and its gradient is{' '}
            <Tex>{'\\big(-\\tfrac2n \\sum x_i r_i,\\; -\\tfrac2n \\sum r_i\\big)'}</Tex>, where{' '}
            <Tex>r_i</Tex> are the residuals.
          </p>
        </Prose>
        <Callout kind="insight" title="The learning rate is a trade-off">
          <p>
            Too small and training crawls; too big and each step overshoots the valley, bouncing
            higher until it flies off. Real training schedules often start large and shrink the
            learning rate as they go.
          </p>
        </Callout>
        <Callout kind="misconception" title="Downhill isn't always the bottom">
          <p>
            Gradient descent only knows the local slope, so it can settle in a valley that isn't the
            lowest one. In practice, randomness and huge numbers of parameters help models find good
            valleys anyway.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet gradient descent">
        <RealWorld
          items={[
            {
              title: 'Neural networks',
              body: 'Image recognisers and language models are trained by gradient descent on millions or billions of parameters at once.',
            },
            {
              title: 'Recommendations',
              body: 'Streaming and shopping sites fit models of your taste by repeatedly nudging parameters to reduce prediction errors.',
            },
            {
              title: 'Engineering design',
              body: 'Wing shapes, antenna layouts and chip placements are tuned by stepping design parameters down the slope of a cost.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Training = minimising a loss function over the parameters.',
            'Gradient descent repeats $w \\leftarrow w - \\eta \\nabla L(w)$: a step against the slope.',
            'The learning rate $\\eta$ must be small enough not to overshoot, big enough to make progress.',
            'It finds a nearby minimum, which may not be the lowest one.',
            'Fitting a regression line by gradient descent lands on the least squares answer.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BallExplorer() {
  const [run, setRun] = useState<Run1D>({ path: [2.8], eta: 0.1, running: false, diverged: false })
  const w = run.path[run.path.length - 1]
  const done = settled(run)
  return (
    <LabSection id="explore" eyebrow="Explore" title="A ball on the loss curve">
      <Prose>
        <p>
          The blue curve is the loss for every value of one parameter <Tex>w</Tex>. The purple line
          is the slope where the ball sits. Each step moves the ball against the slope by the
          learning rate times the slope. Drag the ball to choose where it starts.
        </p>
      </Prose>
      <PredictReveal
        question="The ball starts high on the right. With a moderate learning rate, where will it end up?"
        options={[
          'In the deepest valley on the left',
          'In the nearer, shallower valley on the right',
          'It will roll forever',
        ]}
        answer={1}
        explanation="In the nearer valley. Gradient descent only feels the local slope, and from the right the slope leads into the shallower dip. It never sees the deeper valley on the other side of the hump."
      />
      <Figure>
        <Descent1D run={run} onRun={setRun} />
      </Figure>
      <TryThisList>
        <TryThis id="t-local" when={done && w > 0}>
          Run from the right. The ball settles, but is it at the lowest point of the curve?
        </TryThis>
        <TryThis id="t-global" when={done && w < 0}>
          Find a start (or learning rate) that reaches the deepest valley on the left.
        </TryThis>
        <TryThis id="t-tiny" when={run.eta <= 0.03 && run.path.length > 25}>
          Use a tiny learning rate (0.03 or less). How many steps does the trip take now?
        </TryThis>
        <TryThis id="t-explode" when={run.diverged}>
          Make the learning rate big enough that the ball flies off the curve.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [run, setRun] = useState<Run1D>({ path: [2.8], eta: 0.1, running: false, diverged: false })
  const w = run.path[run.path.length - 1]
  const solved = settled(run) && w < 0 && run.path.length - 1 <= 30
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-step"
          index={1}
          prompt="The loss is $L(w) = w^2$. You are at $w = 3$ with learning rate $\eta = 0.1$. Where is $w$ after one step?"
          answer={2.4}
          hint="$L'(w) = 2w$, so the slope at 3 is 6."
          explanation="$w_{\text{new}} = 3 - 0.1 \times 6 = 2.4$."
        />
        <McqChallenge
          id="c-direction"
          index={2}
          prompt="The slope of the loss at the current $w$ is positive. Which way does gradient descent move $w$?"
          options={[
            { text: 'Decrease $w$ (move left)', correct: true },
            {
              text: 'Increase $w$ (move right)',
              why: 'Positive slope means the loss rises to the right, so downhill is to the left.',
            },
            { text: 'Stay put', why: 'Only a zero slope stops it.' },
            {
              text: 'It depends on the learning rate',
              why: 'The learning rate sets the size of the step, not its direction.',
            },
          ]}
          explanation="$w - \eta L'(w)$ with $L'(w) > 0$ makes $w$ smaller: it steps downhill."
        />
        <McqChallenge
          id="c-too-big"
          index={3}
          prompt="What usually happens if the learning rate is much too large?"
          options={[
            { text: 'Steps overshoot the valley and the loss can blow up', correct: true },
            {
              text: 'Training finishes faster with the same result',
              why: 'Bigger steps help only up to a point; beyond it they overshoot.',
            },
            {
              text: 'The model reaches a better minimum',
              why: 'Overshooting doesn’t find better valleys; it bounces around or diverges.',
            },
            { text: 'Nothing changes', why: 'The step size is the learning rate times the slope.' },
          ]}
          explanation="Each step jumps past the bottom to a steeper spot on the other side, so the next step is even bigger: the process diverges."
        />
        <NumericChallenge
          id="c-exact"
          index={4}
          prompt="$L(w) = (w - 5)^2$, starting at $w = 1$ with $\eta = 0.5$. Where is $w$ after one step?"
          answer={5}
          hint="$L'(w) = 2(w - 5)$."
          explanation="$1 - 0.5 \times 2(1 - 5) = 1 + 4 = 5$: for this bowl, $\eta = 0.5$ jumps straight to the minimum."
        />
        <InteractiveChallenge
          id="c-global"
          index={5}
          prompt="Choose a start and a learning rate so the ball settles in the **deepest** valley within **30 steps**."
          solved={solved}
          hint="Start the ball on the left of the hump, then pick a learning rate around 0.2–0.5."
          explanation="Starting left of the hump (near $w = 0.3$) puts the ball in the deep valley's basin; a moderate learning rate gets there in a handful of steps."
          onReset={() => setRun({ path: [2.8], eta: 0.1, running: false, diverged: false })}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Descent1D run={run} onRun={setRun} />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
