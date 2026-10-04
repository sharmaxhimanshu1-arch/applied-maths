import { useState } from 'react'
import { Pause, Play, RotateCcw, Shuffle, StepForward } from 'lucide-react'
import { prefersReducedMotion } from '@/app/theme'
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
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  InfiniteLine,
  MovablePoint,
  Plot,
  Polyline,
  Vector,
  constraints,
  useAnimationFrame,
} from '@/viz'
import { DataPoints, ProbabilityMap } from '../_shared/Classifier'
import {
  chain,
  forward,
  initNet,
  lineModel,
  makeData,
  score,
  trainNet,
  type DatasetId,
  type Net,
} from '../_shared/ml'

const LINE = 'var(--ink-2)'
const HIDDEN = 'var(--c-violet)'
const LOSS = 'var(--c-red)'
const ORANGE = 'var(--c-orange)'
const FWD = 'var(--c-blue)'
const BACK = 'var(--c-magenta)'

const VIEW = { xMin: -3.2, xMax: 3.2, yMin: -3.2, yMax: 3.2 }
const MAX_STEPS = 3000
const PER_FRAME = 25
const pct = (x: number) => `${Math.round(x * 100)}%`
const f3 = (x: number) => formatNumber(x, 3)

const XOR = makeData('xor')
const DATA: Record<DatasetId, ReturnType<typeof makeData>> = {
  xor: XOR,
  circle: makeData('circle'),
  split: makeData('split'),
}

const inView = constraints.compose(constraints.snapToGrid(0.1), constraints.within(-3, 3, -3, 3))

export default function NeuralNetworksLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Many simple units, one bendy boundary">
        <Prose>
          <p>
            A single artificial neuron is just logistic regression: weigh the inputs, add them up,
            squash the total. It can only draw a straight boundary. Many real problems need a curved
            one.
          </p>
          <p>
            A <strong>neural network</strong> stacks neurons in layers. Each hidden neuron draws its
            own line and squashes; the output neuron combines those bent pieces into a curved
            boundary. Training nudges every weight downhill on the loss, and{' '}
            <strong>backpropagation</strong> is the chain rule that works out which way is downhill
            for all of them at once.
          </p>
        </Prose>
      </LabSection>
      <OneLineExplorer />
      <TrainExplorer />
      <ChainExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Layers, and the chain rule">
        <Formula
          tex={
            '\\mathbf h = \\tanh(W_1\\mathbf x + \\mathbf b_1) \\qquad p = \\sigma(\\mathbf w_2 \\cdot \\mathbf h + b_2)'
          }
          caption="A network with one hidden layer: a layer of neurons, then a logistic output."
        />
        <Formula
          tex={
            '\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial y}\\cdot\\frac{\\partial y}{\\partial z_2}\\cdot\\frac{\\partial z_2}{\\partial h}\\cdot\\frac{\\partial h}{\\partial z_1}\\cdot\\frac{\\partial z_1}{\\partial w_1}'
          }
          caption="Backpropagation: multiply the local slopes along the path from the loss back to a weight."
        />
        <Prose>
          <ul>
            <li>
              <strong>Forward pass:</strong> compute each layer from the one before, and remember
              the values.
            </li>
            <li>
              <strong>Backward pass:</strong> start from <Tex>{'\\partial L/\\partial y'}</Tex> at
              the output and walk back, multiplying by each local derivative. Every weight's
              gradient reuses the products already computed for the layers after it, so one backward
              pass costs about as much as one forward pass.
            </li>
            <li>
              <strong>Training</strong> is gradient descent on every weight:{' '}
              <Tex>{'w \\leftarrow w - \\eta\\,\\partial L/\\partial w'}</Tex>.
            </li>
            <li>
              <strong>Why the squash matters:</strong> without a nonlinear activation, layers of
              linear maps multiply out to one linear map, and the network is back to a single
              straight boundary.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Bigger isn't automatically better">
          <p>
            More neurons let a network bend its boundary more, but they don't guarantee it learns
            well. Training can get stuck, gradients can vanish when neurons saturate, and a network
            with too much freedom can memorise noise instead of the pattern. Start, check, and grow.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where networks work">
        <RealWorld
          items={[
            {
              title: 'Seeing',
              body: 'Image recognisers stack dozens of layers; early ones respond to edges, later ones to eyes, wheels and letters.',
            },
            {
              title: 'Language',
              body: 'Chat assistants and translators are huge networks trained by exactly this recipe: forward pass, loss, backprop, small step, repeat.',
            },
            {
              title: 'Science',
              body: 'Networks predict protein shapes, weather and material properties from data, often far faster than full simulations.',
            },
            {
              title: 'Your phone',
              body: 'Face unlock, voice typing and photo enhancement all run small networks on the device.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'One neuron = logistic regression = one straight boundary.',
            'A hidden layer of squashed neurons lets the output bend the boundary.',
            'Backprop is the chain rule: multiply local slopes from the loss back to each weight.',
            'Training is gradient descent on every weight; it can stall when neurons saturate.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function OneLineExplorer() {
  const [A, setA] = useState<Vec2>([-2.5, 2])
  const [B, setB] = useState<Vec2>([2.5, 1.5])
  const model = lineModel(A, B, 2)
  const { accuracy } = score(XOR, model)
  const mid: Vec2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1
  const n: Vec2 = [-(B[1] - A[1]) / len, (B[0] - A[0]) / len]
  return (
    <LabSection id="explore" eyebrow="Explore" title="One line isn't enough">
      <Prose>
        <p>
          This is the famous <strong>XOR</strong> pattern: orange in two opposite corners, blue in
          the other two. A single neuron can only split the plane with one straight line. Drag its
          handles and see how well you can do.
        </p>
      </Prose>
      <PredictReveal
        question="What is the best accuracy one straight line can get on XOR?"
        options={['50%', '75%', '90%', '100%']}
        answer={1}
        explanation="A line can put three of the four corners on their correct sides, never all four: 75% at best. That limit is what stalled neural network research in 1969."
      />
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot view={VIEW} aspect="equal" ariaLabel={`One line on XOR data: ${pct(accuracy)}`}>
            <ProbabilityMap prob={model} deps={[A[0], A[1], B[0], B[1]]} />
            <InfiniteLine
              through={A}
              direction={[B[0] - A[0], B[1] - A[1]]}
              color={LINE}
              width={2}
              dashed
            />
            <Vector from={mid} to={[mid[0] + 0.8 * n[0], mid[1] + 0.8 * n[1]]} color={ORANGE} />
            <DataPoints data={XOR} />
            <MovablePoint
              x={A[0]}
              y={A[1]}
              onMove={(x, y) => setA([x, y])}
              constrain={inView}
              color={LINE}
              label="First handle of the line"
            />
            <MovablePoint
              x={B[0]}
              y={B[1]}
              onMove={(x, y) => setB([x, y])}
              constrain={inView}
              color={LINE}
              label="Second handle of the line"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts items={[{ label: 'accuracy', value: pct(accuracy) }]} />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-best-line" when={accuracy >= 0.75}>
          Get 75% with one line. Which corner is always left on the wrong side?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Run = { net: Net; steps: number; history: Vec2[] }

function freshRun(hidden: number, seed: number, data: DatasetId): Run {
  const net = initNet(hidden, seed)
  const { loss } = score(DATA[data], (p) => forward(net, p).out)
  return { net, steps: 0, history: [[0, loss]] }
}

function advance(run: Run, data: DatasetId, steps: number): Run {
  const net = trainNet(run.net, DATA[data], steps)
  const total = run.steps + steps
  const { loss } = score(DATA[data], (p) => forward(net, p).out)
  return { net, steps: total, history: [...run.history, [total, loss]] }
}

/** Where a hidden unit's input is zero: its own little boundary line. */
function unitLine(w: number[], b: number) {
  const n2 = w[0] * w[0] + w[1] * w[1] || 1
  return {
    through: [(-b * w[0]) / n2, (-b * w[1]) / n2] as Vec2,
    direction: [-w[1], w[0]] as Vec2,
  }
}

const SIZES = ['2', '3', '4', '8'] as const

function TrainExplorer() {
  const [data, setData] = useState<DatasetId>('xor')
  const [hidden, setHidden] = useState<(typeof SIZES)[number]>('4')
  const [seed, setSeed] = useState(7)
  const [run, setRun] = useState<Run>(() => freshRun(4, 7, 'xor'))
  const [training, setTraining] = useState(false)
  const h = Number(hidden)
  const prob = (p: Vec2) => forward(run.net, p).out
  const { loss, accuracy } = score(DATA[data], prob)
  useAnimationFrame(() => {
    const next = advance(run, data, PER_FRAME)
    setRun(next)
    if (next.steps >= MAX_STEPS) setTraining(false)
  }, training)
  const restart = (d: DatasetId, size: number, s: number) => {
    setTraining(false)
    setRun(freshRun(size, s, d))
  }
  const train = () => {
    if (run.steps >= MAX_STEPS) return
    if (prefersReducedMotion()) {
      setRun(advance(run, data, MAX_STEPS - run.steps))
      return
    }
    setTraining(true)
  }
  return (
    <LabSection id="train" eyebrow="Explore" title="Train a tiny network">
      <Prose>
        <p>
          Two inputs, one hidden layer, one output. Each violet line is where one hidden neuron
          switches from negative to positive. Press train and watch gradient descent move every
          weight at once: the lines swing round, and the output bends the shading to fit the data.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap gap-3 px-3 pt-3 sm:px-4">
          <Segmented
            label="Dataset"
            size="sm"
            value={data}
            onChange={(d) => {
              setData(d)
              restart(d, h, seed)
            }}
            options={[
              { value: 'xor', label: 'XOR' },
              { value: 'circle', label: 'Circle' },
              { value: 'split', label: 'Two blobs' },
            ]}
          />
          <Segmented
            label="Hidden neurons"
            size="sm"
            value={hidden}
            onChange={(v) => {
              setHidden(v)
              restart(data, Number(v), seed)
            }}
            options={SIZES.map((s) => ({ value: s, label: `${s} hidden` }))}
          />
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:px-4">
          <Plot
            view={VIEW}
            aspect="equal"
            ariaLabel={`Network with ${h} hidden neurons after ${run.steps} steps: ${pct(accuracy)} accuracy`}
          >
            <ProbabilityMap prob={prob} deps={[run, data]} />
            {run.net.W1.map((w, i) => {
              const l = unitLine(w, run.net.b1[i])
              return (
                <InfiniteLine
                  key={i}
                  through={l.through}
                  direction={l.direction}
                  color={HIDDEN}
                  width={1.5}
                  opacity={0.7}
                  dashed
                />
              )
            })}
            <DataPoints data={DATA[data]} />
          </Plot>
          <Plot
            view={{ xMin: 0, xMax: MAX_STEPS, yMin: 0, yMax: 0.9 }}
            height={200}
            xLabel="steps"
            yLabel="loss"
            ariaLabel={`Loss curve: ${f3(loss)} after ${run.steps} steps`}
          >
            <Polyline points={run.history} color={LOSS} width={2.5} />
          </Plot>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={training ? <Pause className="size-4" /> : <Play className="size-4" />}
            onClick={() => (training ? setTraining(false) : train())}
            disabled={!training && run.steps >= MAX_STEPS}
          >
            {training ? 'Pause' : 'Train'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<StepForward className="size-4" />}
            onClick={() => setRun(advance(run, data, 100))}
            disabled={training || run.steps >= MAX_STEPS}
          >
            100 steps
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => restart(data, h, seed)}
            disabled={run.steps === 0}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Shuffle className="size-4" />}
            onClick={() => {
              setSeed(seed + 1)
              restart(data, h, seed + 1)
            }}
          >
            New random start
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'steps', value: run.steps },
              { label: 'loss', value: f3(loss), color: LOSS },
              { label: 'accuracy', value: pct(accuracy) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-xor" when={data === 'xor' && accuracy >= 0.95}>
          Train a network that gets XOR right. How many hidden lines does it use?
        </TryThis>
        <TryThis id="t-circle" when={data === 'circle' && accuracy >= 0.95}>
          Fit the circle. How do the straight hidden lines combine into a round boundary?
        </TryThis>
        <TryThis
          id="t-stuck"
          when={data === 'xor' && h === 2 && run.steps >= 1000 && accuracy < 0.9}
        >
          Try XOR with only 2 hidden neurons. Does it always find a way? Try a new random start.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** The forward values and backward gradients of the 1 → 1 → 1 chain, laid out side by side. */
function ChainTable({ w1, w2 }: { w1: number; w2: number }) {
  const c = chain(w1, w2)
  const rows: { fwd: string; back: string }[] = [
    {
      fwd: `z_1 = w_1 x = ${f3(c.z1)}`,
      back: `\\tfrac{\\partial L}{\\partial y} = y - t = ${f3(c.dLdy)}`,
    },
    {
      fwd: `h = \\tanh z_1 = ${f3(c.h)}`,
      back: `\\tfrac{\\partial y}{\\partial z_2} = y(1 - y) = ${f3(c.dydz2)}`,
    },
    {
      fwd: `z_2 = w_2 h = ${f3(c.z2)}`,
      back: `\\tfrac{\\partial L}{\\partial w_2} = ${f3(c.dLdz2)} \\times h = ${f3(c.dLdw2)}`,
    },
    {
      fwd: `y = \\sigma(z_2) = ${f3(c.y)}`,
      back: `\\tfrac{\\partial h}{\\partial z_1} = 1 - h^2 = ${f3(c.dhdz1)}`,
    },
    {
      fwd: `L = \\tfrac12(y - 1)^2 = ${formatNumber(c.loss, 4)}`,
      back: `\\tfrac{\\partial L}{\\partial w_1} = ${f3(c.dLdz2)} \\times w_2 \\times ${f3(c.dhdz1)} \\times x = ${formatNumber(c.dLdw1, 4)}`,
    },
  ]
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      <p className="text-ink-2 sm:col-span-2">
        <span style={{ color: FWD }}>Forward pass</span> (left),{' '}
        <span style={{ color: BACK }}>backward pass</span> (right). Input x = 1, target t = 1.
      </p>
      {rows.map((r, i) => (
        <div key={i} className="contents">
          <div className="overflow-x-auto py-0.5" style={{ color: FWD }}>
            <Tex>{r.fwd}</Tex>
          </div>
          <div className="overflow-x-auto py-0.5" style={{ color: BACK }}>
            <Tex>{r.back}</Tex>
          </div>
        </div>
      ))}
    </div>
  )
}

const LR = 6

function ChainExplorer() {
  const [w1, setW1] = useState(0.5)
  const [w2, setW2] = useState(-1)
  const [steps, setSteps] = useState(0)
  const c = chain(w1, w2)
  const eps = 1e-4
  const numeric = (chain(w1 + eps, w2).loss - chain(w1 - eps, w2).loss) / (2 * eps)
  const step = () => {
    setW1(Math.round((w1 - LR * c.dLdw1) * 1000) / 1000)
    setW2(Math.round((w2 - LR * c.dLdw2) * 1000) / 1000)
    setSteps(steps + 1)
  }
  return (
    <LabSection id="backprop" eyebrow="Explore" title="Backprop by hand">
      <Prose>
        <p>
          The smallest possible network: one input, one hidden neuron, one output, two weights. The
          left column is the forward pass. The right column walks back from the loss, multiplying
          local slopes: that is all backpropagation is. Compare its answer for{' '}
          <Tex>{'\\partial L/\\partial w_1'}</Tex> with a brute-force numerical check, then take
          gradient steps.
        </p>
      </Prose>
      <Figure>
        <div className="grid gap-x-6 gap-y-3 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'w_1'}</Tex>}
            name="Weight w1"
            value={w1}
            min={-3}
            max={3}
            step={0.1}
            format={(v) => formatNumber(v, 3)}
            onChange={setW1}
            color={FWD}
          />
          <Slider
            label={<Tex>{'w_2'}</Tex>}
            name="Weight w2"
            value={w2}
            min={-3}
            max={3}
            step={0.1}
            format={(v) => formatNumber(v, 3)}
            onChange={setW2}
            color={FWD}
          />
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <ChainTable w1={w1} w2={w2} />
        </div>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<StepForward className="size-4" />}
            onClick={step}
          >
            Take a gradient step
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'loss', value: formatNumber(c.loss, 4), color: LOSS },
              { label: 'backprop ∂L/∂w₁', value: formatNumber(c.dLdw1, 5), color: BACK },
              { label: 'numerical check', value: formatNumber(numeric, 5) },
              { label: 'steps taken', value: steps },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-low" when={c.loss < 0.005}>
          Take gradient steps until the loss is below 0.005.
        </TryThis>
        <TryThis
          id="t-vanish"
          when={Math.abs(w1) >= 2.5 && c.loss > 0.05 && Math.abs(c.dLdw1) < 0.01}
        >
          Set <Tex>{'w_2'}</Tex> negative and push <Tex>{'w_1'}</Tex> to 2.5 or more. The loss is
          big, so why is <Tex>{'\\partial L/\\partial w_1'}</Tex> almost zero?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [w, setW] = useState<Vec2>([0.5, -1])
  const c = chain(w[0], w[1])
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-activation"
          index={1}
          prompt="Why does a hidden layer need a nonlinear activation like tanh?"
          options={[
            {
              text: 'Without it, stacked linear layers collapse into one linear map',
              correct: true,
            },
            { text: 'It makes training faster', why: 'It can, but that is not why it is needed.' },
            { text: 'It keeps the weights small', why: 'Activations act on values, not weights.' },
            {
              text: 'It turns the output into a probability',
              why: 'That is the output sigmoid’s job.',
            },
          ]}
          explanation="$W_2(W_1x) = (W_2W_1)x$: without a squash between them, two layers are one layer, and the boundary stays straight."
        />
        <NumericChallenge
          id="c-params"
          index={2}
          prompt="How many weights and biases does a 2 → 4 → 1 network have in total?"
          answer={17}
          hint="Each hidden neuron has 2 weights and a bias; the output has 4 weights and a bias."
          explanation="Hidden: $4 \times (2 + 1) = 12$. Output: $4 + 1 = 5$. Total 17."
        />
        <NumericChallenge
          id="c-chain"
          index={3}
          prompt="Along one path, $\tfrac{\partial L}{\partial y} = 0.5$, $\tfrac{\partial y}{\partial z} = 0.25$ and $\tfrac{\partial z}{\partial w} = 2$. What is $\tfrac{\partial L}{\partial w}$?"
          answer={0.25}
          tolerance={0.001}
          explanation="Multiply along the chain: $0.5 \times 0.25 \times 2 = 0.25$."
        />
        <NumericChallenge
          id="c-neuron"
          index={4}
          prompt="A neuron has weights $(2, -1)$ and bias $0.5$. What is its score $z$ for the input $(1, 3)$?"
          answer={-0.5}
          tolerance={0.001}
          explanation="$z = 2 \cdot 1 + (-1) \cdot 3 + 0.5 = -0.5$."
        />
        <McqChallenge
          id="c-backprop"
          index={5}
          prompt="What does backpropagation compute?"
          options={[
            { text: 'The gradient of the loss with respect to every weight', correct: true },
            { text: 'The network’s prediction for an input', why: 'That is the forward pass.' },
            {
              text: 'The best possible weights directly',
              why: 'It gives directions; gradient descent takes the steps.',
            },
            { text: 'Which training examples are wrong', why: 'The loss tells you that.' },
          ]}
          explanation="It runs the chain rule backwards from the loss, giving every weight's gradient in one sweep. Gradient descent then uses them."
        />
        <InteractiveChallenge
          id="c-train-chain"
          index={6}
          prompt="Train the tiny chain network: take gradient steps until its loss is below 0.01."
          solved={c.loss < 0.01}
          hint="Each step moves both weights against their gradients. It takes a handful of clicks."
          explanation="Each step follows $w \leftarrow w - 6\,\partial L/\partial w$; the output climbs towards the target 1 and the loss shrinks."
          onReset={() => setW([0.5, -1])}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <ChainTable w1={w[0]} w2={w[1]} />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="primary"
                icon={<StepForward className="size-4" />}
                onClick={() =>
                  setW([
                    Math.round((w[0] - LR * c.dLdw1) * 1000) / 1000,
                    Math.round((w[1] - LR * c.dLdw2) * 1000) / 1000,
                  ])
                }
              >
                Gradient step
              </Button>
              <span className="text-sm">
                w₁ = {formatNumber(w[0], 3)}, w₂ = {formatNumber(w[1], 3)}, loss ={' '}
                {formatNumber(c.loss, 4)}
              </span>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
