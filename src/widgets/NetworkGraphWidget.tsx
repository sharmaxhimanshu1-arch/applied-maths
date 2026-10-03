import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Label, MovablePoint, Plot, Segment, constraints } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export interface NetworkGraphPreset {
  nodes: { id: string; at: Vec2 }[]
  edges: [string, string][]
}

export interface NetworkGraphState {
  nodes: number
  edges: number
  degreeSum: number
  from: string
  to: string
  /** Number of edges on the shortest route, or -1 if there is none. */
  pathLength: number
}

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

function shortestPath(nodes: string[], edges: string[], from: string, to: string): string[] | null {
  const prev = new Map<string, string | null>([[from, null]])
  const queue = [from]
  while (queue.length) {
    const cur = queue.shift()!
    if (cur === to) break
    for (const n of nodes) {
      if (!prev.has(n) && edges.includes(key(cur, n))) {
        prev.set(n, cur)
        queue.push(n)
      }
    }
  }
  if (!prev.has(to)) return null
  const path: string[] = []
  for (let c: string | null = to; c !== null; c = prev.get(c) ?? null) path.unshift(c)
  return path
}

const VIEW = { xMin: -5.5, xMax: 5.5, yMin: -3.4, yMax: 3.4 }

export default function NetworkGraphWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'networkGraph'>) {
  const [pos, setPos] = useState<Record<string, Vec2>>(() =>
    Object.fromEntries(preset.nodes.map((n) => [n.id, n.at])),
  )
  const [edges, setEdges] = useState<string[]>(() => preset.edges.map(([a, b]) => key(a, b)))
  const ids = preset.nodes.map((n) => n.id)
  const [from, setFrom] = useState(ids[0])
  const [to, setTo] = useState(ids[1])
  const degree = (id: string) => edges.filter((e) => e.split('|').includes(id)).length
  const degreeSum = ids.reduce((s, id) => s + degree(id), 0)
  const path = from === to ? [from] : shortestPath(ids, edges, from, to)
  const onPath = new Set(path ? path.slice(1).map((n, i) => key(path[i], n)) : [])
  useReport<NetworkGraphState>(
    {
      nodes: ids.length,
      edges: edges.length,
      degreeSum,
      from,
      to,
      pathLength: path ? path.length - 1 : -1,
    },
    onStateChange,
  )
  const connected = edges.includes(key(from, to))
  const select = (label: string, value: string, set: (v: string) => void) => (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-10 rounded-xl border border-line-strong bg-surface px-3"
      >
        {ids.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </label>
  )
  return (
    <div className="grid">
      <Plot
        view={VIEW}
        aspect="equal"
        grid={false}
        axes={false}
        ariaLabel={`Network of ${ids.length} nodes and ${edges.length} links`}
      >
        {edges.map((e) => {
          const [a, b] = e.split('|')
          return (
            <Segment
              key={e}
              from={pos[a]}
              to={pos[b]}
              color={onPath.has(e) ? 'var(--c-orange)' : 'var(--ink-3)'}
              width={onPath.has(e) ? 4 : 2}
            />
          )
        })}
        {ids.map((id) => (
          <MovablePoint
            key={id}
            x={pos[id][0]}
            y={pos[id][1]}
            onMove={(x, y) => setPos((p) => ({ ...p, [id]: [x, y] }))}
            constrain={constraints.within(-5.2, 5.2, -3.1, 3.1)}
            color={id === from || id === to ? 'var(--c-orange)' : 'var(--c-blue)'}
            size={9}
            label={`Node ${id}`}
          />
        ))}
        {ids.map((id) => (
          <Label
            key={`l${id}`}
            at={pos[id]}
            anchor="bottom-left"
            offset={[8, -8]}
            className="text-sm font-semibold"
          >
            {id}
            <span className="ml-1 text-xs font-normal text-ink-2">({degree(id)})</span>
          </Label>
        ))}
      </Plot>
      <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-4">
        {select('From', from, setFrom)}
        {select('To', to, setTo)}
        <Button
          size="sm"
          variant="secondary"
          disabled={from === to}
          onClick={() =>
            setEdges((es) =>
              connected ? es.filter((e) => e !== key(from, to)) : [...es, key(from, to)],
            )
          }
        >
          {connected ? 'Remove this link' : 'Add a link'}
        </Button>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'shortest route',
              value: path
                ? path.length > 1
                  ? `${path.join(' → ')} (${path.length - 1} steps)`
                  : 'same node'
                : 'no route',
              color: 'var(--c-orange)',
            },
            { label: 'links', value: String(edges.length) },
            { label: 'sum of degrees', value: String(degreeSum) },
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          The number next to each node is its degree: how many links touch it. Drag nodes to
          untangle the picture.
        </p>
      </div>
    </div>
  )
}
