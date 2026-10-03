import { useState } from 'react'
import { choose } from '@/math/stats'
import { Readouts } from '@/learn/blocks'
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export type CountingTreePreset =
  | { mode: 'product'; stages: { label: string; count: number }[] }
  | { mode: 'arrange'; n?: number; k?: number }

export type CountingTreeState =
  | { mode: 'product'; counts: number[]; total: number }
  | { mode: 'arrange'; n: number; k: number; orderMatters: boolean; count: number }

const LEVEL_COLORS = ['var(--c-blue)', 'var(--c-orange)', 'var(--c-aqua)', 'var(--c-violet)']
const MAX_LEAVES = 60

type Node = {
  x: number
  y: number
  level: number
  parent?: { x: number; y: number }
  label?: string
}

/** Lay out a tree left-to-right with the leaves spread evenly down the page. */
function layoutTree(
  branching: number[],
  labelsAt: (level: number, index: number, path: number[]) => string,
  height: number,
) {
  const leaves = branching.reduce((a, b) => a * b, 1)
  const nodes: Node[] = []
  const levelX = (l: number) => 30 + (l * 520) / Math.max(1, branching.length)
  const build = (
    level: number,
    path: number[],
    top: number,
    span: number,
    parent?: { x: number; y: number },
  ) => {
    const me = { x: levelX(level), y: top + span / 2 }
    if (level > 0)
      nodes.push({ ...me, level, parent, label: labelsAt(level, path[path.length - 1], path) })
    if (level === branching.length) return
    const b = branching[level]
    for (let i = 0; i < b; i++) build(level + 1, [...path, i], top + (span / b) * i, span / b, me)
  }
  build(0, [], 10, height - 20)
  return { nodes, leaves }
}

function Tree({
  branching,
  labelsAt,
}: {
  branching: number[]
  labelsAt: (level: number, index: number, path: number[]) => string
}) {
  const leaves = branching.reduce((a, b) => a * b, 1)
  if (leaves > MAX_LEAVES)
    return (
      <p className="p-6 text-center text-ink-2">
        {leaves.toLocaleString()} branches: too many to draw, but the multiplication still counts
        them.
      </p>
    )
  const height = Math.max(160, Math.min(420, leaves * 16))
  const { nodes } = layoutTree(branching, labelsAt, height)
  const showLabels = leaves <= 24
  return (
    <svg
      viewBox={`0 0 600 ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`A tree with ${leaves} branches at the end`}
    >
      <circle cx={30} cy={height / 2} r={5} fill="var(--ink)" />
      {nodes.map((n, i) => (
        <line
          key={`l${i}`}
          x1={n.parent!.x}
          y1={n.parent!.y}
          x2={n.x}
          y2={n.y}
          stroke={LEVEL_COLORS[(n.level - 1) % 4]}
          strokeOpacity={0.55}
          strokeWidth={1.5}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          <circle
            cx={n.x}
            cy={n.y}
            r={leaves > 30 && n.level === branching.length ? 2.5 : 4}
            fill={LEVEL_COLORS[(n.level - 1) % 4]}
          />
          {showLabels && n.label && (
            // Leaves are labelled to the right; inner nodes above, clear of their branches.
            <text
              x={n.level === branching.length ? n.x + 7 : n.x}
              y={n.level === branching.length ? n.y + 4 : n.y - 8}
              textAnchor={n.level === branching.length ? 'start' : 'middle'}
              fontSize={11}
              fill="var(--ink-2)"
              paintOrder="stroke"
              stroke="var(--surface)"
              strokeWidth={3}
            >
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

/** The shortest prefix of each name that tells it apart from the others ('Shirts', 'Shoes' → 'Shi', 'Sho'). */
function shortNames(names: string[]) {
  return names.map((name) => {
    let n = 1
    while (n < name.length && names.some((o) => o !== name && o.startsWith(name.slice(0, n)))) n++
    return name.slice(0, n)
  })
}

function ProductMode({
  stages,
  onState,
}: {
  stages: { label: string; count: number }[]
  onState: (s: CountingTreeState) => void
}) {
  const [counts, setCounts] = useState(stages.map((s) => s.count))
  const total = counts.reduce((a, b) => a * b, 1)
  const short = shortNames(stages.map((s) => s.label))
  useReport<CountingTreeState>({ mode: 'product', counts, total }, onState)
  return (
    <>
      <div className="overflow-x-auto p-3 sm:p-4">
        <div className="min-w-[28rem]">
          <Tree branching={counts} labelsAt={(level, i) => `${short[level - 1]}${i + 1}`} />
        </div>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
        {stages.map((s, i) => (
          <Slider
            key={s.label}
            label={s.label}
            value={counts[i]}
            min={1}
            max={4}
            step={1}
            onChange={(v) => setCounts((c) => c.map((x, j) => (j === i ? v : x)))}
            color={LEVEL_COLORS[i]}
          />
        ))}
      </div>
      <p className="border-t border-line px-3 py-2 text-[1.05rem] sm:px-4">
        <Tex>{`${counts.join(' \\times ')} = ${total}`}</Tex>{' '}
        <span className="text-sm text-ink-2">different choices in all</span>
      </p>
    </>
  )
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const factorial = (x: number): number => (x <= 1 ? 1 : x * factorial(x - 1))

function ArrangeMode({
  n: n0 = 4,
  k: k0 = 2,
  onState,
}: {
  n?: number
  k?: number
  onState: (s: CountingTreeState) => void
}) {
  const [n, setN] = useState(n0)
  const [k, setK] = useState(k0)
  const [orderMatters, setOrderMatters] = useState(true)
  const perms = factorial(n) / factorial(n - k)
  const combos = choose(n, k)
  const count = orderMatters ? perms : combos
  useReport<CountingTreeState>({ mode: 'arrange', n, k, orderMatters, count }, onState)
  const branching = Array.from({ length: k }, (_, i) => n - i)
  // The letter chosen at each level is the i-th of those not used higher up the path.
  const labelsAt = (_level: number, index: number, path: number[]) => {
    const used: string[] = []
    for (const step of path.slice(0, -1))
      used.push(LETTERS.slice(0, n).filter((l) => !used.includes(l))[step])
    return LETTERS.slice(0, n).filter((l) => !used.includes(l))[index]
  }
  return (
    <>
      <div className="overflow-x-auto p-3 sm:p-4">
        <div className="min-w-[28rem]">
          <Tree branching={branching} labelsAt={labelsAt} />
        </div>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:items-end sm:p-4">
        <Slider
          label="Items to choose from (n)"
          value={n}
          min={2}
          max={6}
          step={1}
          onChange={(v) => {
            setN(v)
            setK((x) => Math.min(x, v))
          }}
          color={LEVEL_COLORS[0]}
        />
        <Slider
          label="How many you pick (k)"
          value={k}
          min={1}
          max={n}
          step={1}
          onChange={setK}
          color={LEVEL_COLORS[1]}
        />
        <Switch label="Order matters" checked={orderMatters} onChange={setOrderMatters} />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'arrangements (order matters)',
              value: <Tex>{`{}^{${n}}P_{${k}} = ${branching.join(' \\times ')} = ${perms}`}</Tex>,
            },
            {
              label: 'selections (order ignored)',
              value: <Tex>{`\\binom{${n}}{${k}} = \\frac{${perms}}{${k}!} = ${combos}`}</Tex>,
            },
          ]}
        />
      </div>
    </>
  )
}

export default function CountingTreeWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'countingTree'>) {
  return preset.mode === 'product' ? (
    <ProductMode stages={preset.stages} onState={onStateChange} />
  ) : (
    <ArrangeMode n={preset.n} k={preset.k} onState={onStateChange} />
  )
}
