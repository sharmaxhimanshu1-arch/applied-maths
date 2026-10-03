import { useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { createRng } from '@/math/random'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { CanvasLayer, InfiniteLine, Plot, Point, cssColor } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

type DatasetId = 'split' | 'xor' | 'circle'
type Sample = { at: Vec2; label: 0 | 1 }

/** Small two-class datasets on the square [-3, 3]², generated deterministically. */
function makeData(id: DatasetId): Sample[] {
  const rng = createRng(id === 'split' ? 11 : id === 'xor' ? 22 : 33)
  return Array.from({ length: 40 }, (_, i): Sample => {
    if (id === 'split') {
      const label = (i % 2) as 0 | 1
      const c: Vec2 = label ? [1.2, 1] : [-1.2, -0.8]
      return { at: [c[0] + rng.normal(0, 0.9), c[1] + rng.normal(0, 0.9)], label }
    }
    if (id === 'xor') {
      const q = i % 4
      const c: Vec2 = [q % 2 ? 1.5 : -1.5, q < 2 ? 1.5 : -1.5]
      const at: Vec2 = [c[0] + rng.normal(0, 0.55), c[1] + rng.normal(0, 0.55)]
      return { at, label: c[0] * c[1] > 0 ? 1 : 0 }
    }
    const inner = i % 2 === 0
    const r = inner ? rng.uniform(0, 1.1) : rng.uniform(1.9, 2.8)
    const a = rng.uniform(0, 2 * Math.PI)
    return { at: [r * Math.cos(a), r * Math.sin(a)], label: inner ? 1 : 0 }
  })
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
const fmt = (v: number, d = 2) => formatNumber(v, d)
const CLASS = ['var(--c-blue)', 'var(--c-orange)']

/** Average cross-entropy loss and accuracy of a probability model on the data. */
function score(data: Sample[], prob: (p: Vec2) => number) {
  let loss = 0
  let right = 0
  for (const s of data) {
    const p = Math.min(1 - 1e-9, Math.max(1e-9, prob(s.at)))
    loss -= s.label ? Math.log(p) : Math.log(1 - p)
    if ((p >= 0.5 ? 1 : 0) === s.label) right++
  }
  return { loss: loss / data.length, accuracy: right / data.length }
}

/** Background shaded by the model's probability of class 1 (orange) vs class 0 (blue). */
function ProbabilityMap({ prob, deps }: { prob: (p: Vec2) => number; deps: unknown[] }) {
  return (
    <CanvasLayer
      deps={deps}
      draw={(ctx, t) => {
        const cell = 6
        const zero = cssColor(CLASS[0])
        const one = cssColor(CLASS[1])
        for (let px = 0; px < t.width; px += cell)
          for (let py = 0; py < t.height; py += cell) {
            const p = prob([t.ix(px + cell / 2), t.iy(py + cell / 2)])
            ctx.globalAlpha = 0.06 + 0.32 * Math.abs(p - 0.5) * 2
            ctx.fillStyle = p >= 0.5 ? one : zero
            ctx.fillRect(px, py, cell, cell)
          }
        ctx.globalAlpha = 1
      }}
    />
  )
}

function DataPoints({ data }: { data: Sample[] }) {
  return (
    <>
      {data.map((s, i) => (
        <Point key={i} at={s.at} r={5} color={CLASS[s.label]} hollow={s.label === 0} />
      ))}
    </>
  )
}

const VIEW = { xMin: -3.2, xMax: 3.2, yMin: -3.2, yMax: 3.2 }

export type NeuronPreset =
  | { mode: 'logistic'; data?: DatasetId; w?: [number, number, number] }
  | { mode: 'network'; data?: DatasetId; hidden?: number }

export type NeuronState =
  | {
      mode: 'logistic'
      data: DatasetId
      w1: number
      w2: number
      b: number
      loss: number
      accuracy: number
      steps: number
    }
  | {
      mode: 'network'
      data: DatasetId
      hidden: number
      loss: number
      accuracy: number
      steps: number
    }

function LogisticMode({
  data: d0 = 'split',
  w: w0 = [0, 1, 0],
  onState,
}: {
  data?: DatasetId
  w?: [number, number, number]
  onState: (s: NeuronState) => void
}) {
  const [dataset, setDataset] = useState<DatasetId>(d0)
  const [[w1, w2, b], setW] = useState<[number, number, number]>(w0)
  const [steps, setSteps] = useState(0)
  const data = makeData(dataset)
  const prob = ([x, y]: Vec2) => sigmoid(w1 * x + w2 * y + b)
  const { loss, accuracy } = score(data, prob)
  useReport<NeuronState>(
    { mode: 'logistic', data: dataset, w1, w2, b, loss, accuracy, steps },
    onState,
  )
  const train = () => {
    let [a, c, e] = [w1, w2, b]
    for (let k = 0; k < 50; k++) {
      let g1 = 0
      let g2 = 0
      let gb = 0
      for (const s of data) {
        const err = sigmoid(a * s.at[0] + c * s.at[1] + e) - s.label
        g1 += err * s.at[0]
        g2 += err * s.at[1]
        gb += err
      }
      a -= (0.5 * g1) / data.length
      c -= (0.5 * g2) / data.length
      e -= (0.5 * gb) / data.length
    }
    // Keep the trained weights within the sliders’ range.
    const r = (v: number) => Math.max(-4, Math.min(4, Math.round(v * 100) / 100))
    setW([r(a), r(c), r(e)])
    setSteps((s) => s + 50)
  }
  const set = (i: 0 | 1 | 2) => (v: number) =>
    setW((w) => w.map((x, j) => (j === i ? v : x)) as [number, number, number])
  return (
    <>
      <div className="mx-auto w-full max-w-xl">
        <Plot
          view={VIEW}
          aspect="equal"
          maxHeight={560}
          ariaLabel={`Logistic regression: ${Math.round(accuracy * 100)}% of points classified correctly`}
        >
          <ProbabilityMap prob={prob} deps={[w1, w2, b]} />
          {(w1 !== 0 || w2 !== 0) && (
            <InfiniteLine
              through={
                w1 * w1 + w2 * w2 > 0
                  ? [(-b * w1) / (w1 * w1 + w2 * w2), (-b * w2) / (w1 * w1 + w2 * w2)]
                  : [0, 0]
              }
              direction={[-w2, w1]}
              color="var(--ink)"
              width={2}
              dashed
            />
          )}
          <DataPoints data={data} />
        </Plot>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
        <Slider
          label={<Tex>{'w_1'}</Tex>}
          name="w1"
          value={w1}
          min={-4}
          max={4}
          step={0.1}
          onChange={set(0)}
        />
        <Slider
          label={<Tex>{'w_2'}</Tex>}
          name="w2"
          value={w2}
          min={-4}
          max={4}
          step={0.1}
          onChange={set(1)}
        />
        <Slider
          label={<Tex>b</Tex>}
          name="b"
          value={b}
          min={-4}
          max={4}
          step={0.1}
          onChange={set(2)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line p-3 sm:p-4">
        <Button size="sm" onClick={train}>
          Train 50 steps
        </Button>
        <Segmented
          label="Dataset"
          size="sm"
          value={dataset}
          onChange={(v) => {
            setDataset(v)
            setSteps(0)
          }}
          options={[
            { value: 'split', label: 'Two clouds' },
            { value: 'xor', label: 'Checkerboard' },
            { value: 'circle', label: 'Ring' },
          ]}
        />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'model',
              value: (
                <Tex>{`p = \\sigma(${fmt(w1)}x ${w2 >= 0 ? '+' : '-'} ${fmt(Math.abs(w2))}y ${b >= 0 ? '+' : '-'} ${fmt(Math.abs(b))})`}</Tex>
              ),
            },
            { label: 'accuracy', value: `${Math.round(accuracy * 100)}%`, color: 'var(--c-green)' },
            { label: 'loss', value: fmt(loss, 3) },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Shading is the predicted probability of orange. The dashed line is where it is exactly
          50%: the decision boundary.
        </p>
      </div>
    </>
  )
}

/** A 2 → h → 1 network: tanh hidden layer, sigmoid output. */
type Net = { W1: number[][]; b1: number[]; W2: number[]; b2: number }

function initNet(hidden: number, seed: number): Net {
  const rng = createRng(seed)
  return {
    W1: Array.from({ length: hidden }, () => [rng.normal(0, 1), rng.normal(0, 1)]),
    b1: Array.from({ length: hidden }, () => rng.normal(0, 0.5)),
    W2: Array.from({ length: hidden }, () => rng.normal(0, 1)),
    b2: 0,
  }
}

function forward(net: Net, [x, y]: Vec2) {
  const h = net.W1.map((w, i) => Math.tanh(w[0] * x + w[1] * y + net.b1[i]))
  const out = sigmoid(h.reduce((s, v, i) => s + v * net.W2[i], net.b2))
  return { h, out }
}

/** Full-batch gradient descent with backpropagation. */
function trainNet(net: Net, data: Sample[], steps: number, lr = 0.3): Net {
  const W1 = net.W1.map((w) => [...w])
  const b1 = [...net.b1]
  const W2 = [...net.W2]
  let b2 = net.b2
  const n = data.length
  for (let k = 0; k < steps; k++) {
    const gW1 = W1.map(() => [0, 0])
    const gb1 = b1.map(() => 0)
    const gW2 = W2.map(() => 0)
    let gb2 = 0
    for (const s of data) {
      const { h, out } = forward({ W1, b1, W2, b2 }, s.at)
      const dOut = out - s.label // d(loss)/d(output pre-activation) for sigmoid + cross-entropy
      gb2 += dOut
      for (let i = 0; i < W2.length; i++) {
        gW2[i] += dOut * h[i]
        const dh = dOut * W2[i] * (1 - h[i] * h[i]) // back through tanh
        gW1[i][0] += dh * s.at[0]
        gW1[i][1] += dh * s.at[1]
        gb1[i] += dh
      }
    }
    for (let i = 0; i < W2.length; i++) {
      W2[i] -= (lr * gW2[i]) / n
      W1[i][0] -= (lr * gW1[i][0]) / n
      W1[i][1] -= (lr * gW1[i][1]) / n
      b1[i] -= (lr * gb1[i]) / n
    }
    b2 -= (lr * gb2) / n
  }
  return { W1, b1, W2, b2 }
}

/** The network drawn as circles and lines; line thickness and colour show each weight. */
function Diagram({ net }: { net: Net }) {
  const h = net.W2.length
  const W = 300
  const H = 150
  const ys = (count: number) => Array.from({ length: count }, (_, i) => ((i + 1) * H) / (count + 1))
  const inY = ys(2)
  const hidY = ys(h)
  const edge = (w: number) => ({
    stroke: w >= 0 ? 'var(--c-orange)' : 'var(--c-blue)',
    strokeWidth: Math.min(6, 0.6 + Math.abs(w) * 1.2),
    strokeOpacity: 0.75,
  })
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto block h-auto w-full max-w-sm"
      role="img"
      aria-label={`Network with 2 inputs, ${h} hidden units and 1 output`}
    >
      {hidY.map((y, i) => (
        <g key={i}>
          {inY.map((iy, j) => (
            <line key={j} x1={40} y1={iy} x2={150} y2={y} {...edge(net.W1[i][j])} />
          ))}
          <line x1={150} y1={y} x2={260} y2={H / 2} {...edge(net.W2[i])} />
        </g>
      ))}
      {inY.map((y, j) => (
        <g key={j}>
          <circle
            cx={40}
            cy={y}
            r={13}
            fill="var(--surface)"
            stroke="var(--ink-2)"
            strokeWidth={1.5}
          />
          <text x={40} y={y + 4} textAnchor="middle" fontSize={11} fill="var(--ink)">
            {j ? 'y' : 'x'}
          </text>
        </g>
      ))}
      {hidY.map((y, i) => (
        <circle
          key={i}
          cx={150}
          cy={y}
          r={10}
          fill="var(--surface)"
          stroke="var(--ink-2)"
          strokeWidth={1.5}
        />
      ))}
      <circle
        cx={260}
        cy={H / 2}
        r={13}
        fill="var(--surface)"
        stroke="var(--ink-2)"
        strokeWidth={1.5}
      />
      <text x={260} y={H / 2 + 4} textAnchor="middle" fontSize={11} fill="var(--ink)">
        p
      </text>
    </svg>
  )
}

function NetworkMode({
  data: d0 = 'xor',
  hidden: h0 = 3,
  onState,
}: {
  data?: DatasetId
  hidden?: number
  onState: (s: NeuronState) => void
}) {
  const [dataset, setDataset] = useState<DatasetId>(d0)
  const [hidden, setHidden] = useState(h0)
  const [seed, setSeed] = useState(1)
  const [run, setRun] = useState(() => ({ net: initNet(h0, 1), steps: 0 }))
  const data = makeData(dataset)
  const prob = (p: Vec2) => forward(run.net, p).out
  const { loss, accuracy } = score(data, prob)
  useReport<NeuronState>(
    { mode: 'network', data: dataset, hidden, loss, accuracy, steps: run.steps },
    onState,
  )
  const restart = (h: number, s: number) => setRun({ net: initNet(h, s), steps: 0 })
  return (
    <>
      <div className="mx-auto w-full max-w-xl">
        <Plot
          view={VIEW}
          aspect="equal"
          maxHeight={560}
          ariaLabel={`Neural network: ${Math.round(accuracy * 100)}% correct after ${run.steps} training steps`}
        >
          <ProbabilityMap prob={prob} deps={[run]} />
          <DataPoints data={data} />
        </Plot>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:p-4">
        <Diagram net={run.net} />
        <div className="grid gap-3">
          <Slider
            label="Hidden neurons"
            value={hidden}
            min={1}
            max={8}
            step={1}
            onChange={(h) => {
              setHidden(h)
              restart(h, seed)
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() =>
                setRun((r) => ({ net: trainNet(r.net, data, 100), steps: r.steps + 100 }))
              }
            >
              Train 100 steps
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSeed(seed + 1)
                restart(hidden, seed + 1)
              }}
            >
              New random weights
            </Button>
          </div>
          <Segmented
            label="Dataset"
            size="sm"
            value={dataset}
            onChange={(v) => {
              setDataset(v)
              restart(hidden, seed)
            }}
            options={[
              { value: 'split', label: 'Two clouds' },
              { value: 'xor', label: 'Checkerboard' },
              { value: 'circle', label: 'Ring' },
            ]}
          />
        </div>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'training steps', value: String(run.steps) },
            { label: 'accuracy', value: `${Math.round(accuracy * 100)}%`, color: 'var(--c-green)' },
            { label: 'loss', value: fmt(loss, 3) },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          Orange lines are positive weights, blue negative; thicker means stronger. Each training
          step nudges every weight downhill on the loss, using backpropagation.
        </p>
      </div>
    </>
  )
}

export default function NeuronWidget({
  preset: p,
  onStateChange: on,
}: WidgetComponentProps<'neuron'>) {
  return p.mode === 'logistic' ? (
    <LogisticMode data={p.data} w={p.w} onState={on} />
  ) : (
    <NetworkMode data={p.data} hidden={p.hidden} onState={on} />
  )
}
