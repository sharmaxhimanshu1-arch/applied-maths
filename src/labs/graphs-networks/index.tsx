import { useState } from 'react'
import { RotateCcw, Undo2 } from 'lucide-react'
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
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import {
  bfsDistances,
  degrees,
  nextEdges,
  oddNodes,
  shortestRoute,
  trailEnd,
  type Edge,
} from '../_shared/graphs'

const EVEN = 'var(--c-blue)'
const ODD = 'var(--c-orange)'
const ROUTE = 'var(--c-orange)'
const WALKED = 'var(--c-violet)'
const HERE = 'var(--c-orange)'

type GraphNode = { id: string; x: number; y: number }
type Shape = { nodes: GraphNode[]; edges: Edge[] }

const ids = (nodes: GraphNode[]) => nodes.map((n) => n.id)
const sameEdge = (e: Edge, f: Edge) =>
  (e[0] === f[0] && e[1] === f[1]) || (e[0] === f[1] && e[1] === f[0])

/** Six people around a table. */
const PARTY: GraphNode[] = ['A', 'B', 'C', 'D', 'E', 'F'].map((id, i) => {
  const a = Math.PI / 2 - (2 * Math.PI * i) / 6
  return { id, x: 50 + 40 * Math.cos(a), y: 50 - 40 * Math.sin(a) }
})
const PAIRS: Edge[] = PARTY.flatMap((p, i) => PARTY.slice(i + 1).map((q) => [p.id, q.id] as const))
const PARTY_START: Edge[] = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
  ['D', 'E'],
  ['E', 'F'],
  ['A', 'F'],
  ['A', 'D'],
]

/** A small metro map. */
const METRO: Shape = {
  nodes: [
    { id: 'A', x: 8, y: 22 },
    { id: 'B', x: 38, y: 8 },
    { id: 'C', x: 70, y: 18 },
    { id: 'D', x: 94, y: 45 },
    { id: 'E', x: 12, y: 66 },
    { id: 'F', x: 46, y: 46 },
    { id: 'G', x: 76, y: 76 },
    { id: 'H', x: 38, y: 92 },
  ],
  edges: [
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'D'],
    ['A', 'E'],
    ['B', 'F'],
    ['E', 'F'],
    ['F', 'C'],
    ['F', 'G'],
    ['G', 'D'],
    ['E', 'H'],
    ['H', 'G'],
  ],
}

type ShapeName = 'house' | 'bowtie' | 'bridges'

const SHAPES: Record<ShapeName, Shape> = {
  house: {
    nodes: [
      { id: 'A', x: 22, y: 92 },
      { id: 'B', x: 78, y: 92 },
      { id: 'C', x: 78, y: 48 },
      { id: 'D', x: 22, y: 48 },
      { id: 'E', x: 50, y: 10 },
    ],
    edges: [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'D'],
      ['D', 'A'],
      ['A', 'C'],
      ['B', 'D'],
      ['C', 'E'],
      ['D', 'E'],
    ],
  },
  bowtie: {
    nodes: [
      { id: 'A', x: 8, y: 14 },
      { id: 'B', x: 8, y: 86 },
      { id: 'C', x: 50, y: 50 },
      { id: 'D', x: 92, y: 14 },
      { id: 'E', x: 92, y: 86 },
    ],
    edges: [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'A'],
      ['C', 'D'],
      ['D', 'E'],
      ['E', 'C'],
    ],
  },
  bridges: {
    nodes: [
      { id: 'N', x: 45, y: 6 },
      { id: 'I', x: 30, y: 50 },
      { id: 'E', x: 88, y: 50 },
      { id: 'S', x: 45, y: 94 },
    ],
    edges: [
      ['N', 'I'],
      ['N', 'I'],
      ['S', 'I'],
      ['S', 'I'],
      ['N', 'E'],
      ['S', 'E'],
      ['I', 'E'],
    ],
  },
}

/** Path data for each edge; repeated edges between the same nodes bow apart so all show. */
function edgePaths(nodes: GraphNode[], edges: readonly Edge[]): string[] {
  const at = Object.fromEntries(nodes.map((n) => [n.id, n]))
  return edges.map((e, i) => {
    const twins = edges.map((f, j) => (sameEdge(e, f) ? j : -1)).filter((j) => j >= 0)
    const k = twins.indexOf(i)
    const bend = (k - (twins.length - 1) / 2) * 24
    const [a, b] = e[0] < e[1] ? [at[e[0]], at[e[1]]] : [at[e[1]], at[e[0]]]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const cx = (a.x + b.x) / 2 - (dy / len) * bend
    const cy = (a.y + b.y) / 2 + (dx / len) * bend
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
  })
}

/** Where a node's small note goes: just outside the node, away from the middle of the figure. */
function notePos(n: GraphNode): [number, number] {
  const dx = n.x - 50
  const dy = n.y - 50
  const len = Math.hypot(dx, dy)
  const [ux, uy] = len < 1 ? [0, -1] : [dx / len, dy / len]
  return [n.x + 14 * ux, n.y + 14 * uy + 2.3]
}

type EdgeLook = { color: string; width: number; dashed?: boolean }
type NodeLook = { color: string; note?: string; ring?: boolean }

function GraphDrawing({
  nodes,
  edges,
  edgeLook,
  nodeLook,
  ariaLabel,
}: {
  nodes: GraphNode[]
  edges: readonly Edge[]
  edgeLook: (i: number) => EdgeLook
  nodeLook: (id: string) => NodeLook
  ariaLabel: string
}) {
  const paths = edgePaths(nodes, edges)
  return (
    <svg
      viewBox="-12 -12 124 124"
      className="mx-auto block h-auto w-full max-w-sm"
      role="img"
      aria-label={ariaLabel}
    >
      {paths.map((d, i) => {
        const look = edgeLook(i)
        return (
          <path
            key={i}
            d={d}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={look.dashed ? '4 4' : undefined}
            style={{ stroke: look.color, strokeWidth: look.width }}
          />
        )
      })}
      {nodes.map((n) => {
        const look = nodeLook(n.id)
        return (
          <g key={n.id}>
            {look.ring && (
              <circle
                cx={n.x}
                cy={n.y}
                r={11}
                style={{ fill: 'none', stroke: HERE, strokeWidth: 2 }}
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={7.5}
              style={{ fill: 'var(--surface)', stroke: look.color, strokeWidth: 2.5 }}
            />
            <text
              x={n.x}
              y={n.y + 3}
              textAnchor="middle"
              style={{ fill: 'var(--ink)', fontSize: 8, fontWeight: 600 }}
            >
              {n.id}
            </text>
            {look.note != null && (
              <text
                x={notePos(n)[0]}
                y={notePos(n)[1]}
                textAnchor="middle"
                style={{ fill: 'var(--ink-2)', fontSize: 6.5 }}
              >
                {look.note}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function EdgeChips({
  edges,
  pressed,
  disabled,
  onToggle,
  label,
  names,
}: {
  edges: readonly Edge[]
  pressed: (i: number) => boolean
  disabled?: (i: number) => boolean
  onToggle: (i: number) => void
  label: string
  names?: (i: number) => string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {edges.map((e, i) => (
        <button
          key={i}
          type="button"
          aria-pressed={pressed(i)}
          disabled={disabled?.(i)}
          onClick={() => onToggle(i)}
          className={cn(
            'rounded-lg border px-2 py-1 font-mono text-xs',
            !pressed(i) && 'disabled:opacity-40',
            pressed(i)
              ? 'border-[var(--c-violet)] bg-[color-mix(in_oklab,var(--c-violet)_16%,var(--surface))] text-ink'
              : 'border-line text-ink-2 hover:bg-surface-2',
          )}
        >
          {names ? names(i) : `${e[0]}–${e[1]}`}
        </button>
      ))}
    </div>
  )
}

export default function GraphsNetworksLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Dots and lines">
        <Prose>
          <p>
            Friends on a social network, airports and flights, web pages and links, atoms and bonds:
            strip away the details and each is a set of dots joined by lines. Mathematicians call it
            a <strong>graph</strong>: <strong>nodes</strong> (the dots) joined by{' '}
            <strong>edges</strong> (the lines).
          </p>
          <p>
            Only the connections matter, not where the dots sit. That simple picture answers real
            questions: who is best connected, what is the shortest route, and can you walk every
            street exactly once?
          </p>
        </Prose>
      </LabSection>
      <HandshakeExplorer />
      <RouteExplorer />
      <TrailExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Three facts about graphs">
        <Formula
          tex={'\\sum_{v} \\deg(v) = 2\\,|E|'}
          caption="The handshake lemma: every edge has two ends, so the degrees add up to twice the edges."
        />
        <Prose>
          <ul>
            <li>
              <strong>Degree</strong> <Tex>{'\\deg(v)'}</Tex> is the number of edge ends at a node.
              The lemma means the number of odd-degree nodes is always even.
            </li>
            <li>
              <strong>Complete graph</strong> <Tex>{'K_n'}</Tex>: every pair joined, so{' '}
              <Tex>{'\\binom{n}{2} = \\tfrac{n(n-1)}{2}'}</Tex> edges.
            </li>
            <li>
              <strong>Breadth-first search</strong> finds a route with the fewest edges: visit all
              neighbours of the start (distance 1), then all of theirs (distance 2), and so on.
            </li>
            <li>
              <strong>Euler trails:</strong> a connected graph can be drawn in one stroke, using
              every edge once, exactly when it has 0 or 2 odd-degree nodes. With 2, start at one and
              finish at the other; with 0, you end where you began.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="The drawing is not the graph">
          <p>
            Move the dots, bend the lines, let them cross: if the same pairs are joined it is the
            same graph. Distances on the page mean nothing; only the connections (and, in a weighted
            graph, the numbers on the edges) count.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where graphs are used">
        <RealWorld
          items={[
            {
              title: 'Maps and satnav',
              body: 'Junctions are nodes and roads are weighted edges; route planners search the graph for the shortest or fastest path.',
            },
            {
              title: 'The web',
              body: 'Search engines rank pages by the links pointing at them: a graph of billions of nodes.',
            },
            {
              title: 'Social networks',
              body: '“People you may know” looks two steps away in the friendship graph.',
            },
            {
              title: 'Deliveries and gritters',
              body: 'Covering every street once is an Euler-trail problem; postal and snow-plough routes are planned this way.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A graph is nodes joined by edges; only the connections matter.',
            'Degrees add up to twice the number of edges.',
            'Breadth-first search finds routes with the fewest steps.',
            'One-stroke drawing (an Euler trail) needs 0 or 2 odd-degree nodes.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function HandshakeExplorer() {
  const [on, setOn] = useState<boolean[]>(() =>
    PAIRS.map((p) => PARTY_START.some((e) => sameEdge(e, p))),
  )
  const edges = PAIRS.filter((_, i) => on[i])
  const people = ids(PARTY)
  const deg = degrees(people, edges)
  const sum = people.reduce((s, id) => s + deg[id], 0)
  const odd = oddNodes(people, edges)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Handshakes and degrees">
      <Prose>
        <p>
          Six people at a party; an edge means two of them shook hands. Tap a pair to add or remove
          their handshake. Each node shows its <strong>degree</strong>, the number of handshakes it
          was part of. Odd degrees are orange, even ones blue.
        </p>
      </Prose>
      <PredictReveal
        question="Five people each shake hands with everyone else once. How many handshakes?"
        options={['5', '10', '20', '25']}
        answer={1}
        explanation="Each of the 5 shakes 4 hands: $5 \times 4 = 20$ hand-ends, but every handshake has two ends, so $20 \div 2 = 10$."
      />
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <GraphDrawing
            nodes={PARTY}
            edges={edges}
            edgeLook={() => ({ color: 'var(--ink-3)', width: 1.8 })}
            nodeLook={(id) => ({ color: deg[id] % 2 ? ODD : EVEN, note: `${deg[id]}` })}
            ariaLabel={`Six people with ${edges.length} handshakes`}
          />
        </div>
        <div className="mt-3 border-t border-line px-3 pt-3 sm:px-4">
          <EdgeChips
            label="Handshakes"
            edges={PAIRS}
            pressed={(i) => on[i]}
            onToggle={(i) => setOn((o) => o.map((v, j) => (j === i ? !v : v)))}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'handshakes (edges)', value: `${edges.length}` },
              { label: 'sum of degrees', value: `${sum} = 2 × ${edges.length}` },
              {
                label: 'odd-degree nodes',
                value: odd.length ? `${odd.join(', ')} (${odd.length})` : 'none',
                color: ODD,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-everyone-linked" when={edges.length === PAIRS.length}>
          Make everyone shake hands with everyone. How many handshakes is that?
        </TryThis>
        <TryThis id="t-all-even" when={odd.length === 0 && people.every((id) => deg[id] > 0)}>
          Make every degree even, with nobody left out.
        </TryThis>
        <TryThis id="t-degree-twenty" when={sum === 20}>
          Make the degrees add up to 20. How many handshakes did that take?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function NodeSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-line-strong bg-surface px-3"
      >
        {options.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </label>
  )
}

function RouteExplorer() {
  const [from, setFrom] = useState('A')
  const [to, setTo] = useState('C')
  const [closed, setClosed] = useState<boolean[]>(() => METRO.edges.map(() => false))
  const stations = ids(METRO.nodes)
  const open = METRO.edges.filter((_, i) => !closed[i])
  const dist = bfsDistances(stations, open, from)
  const route = shortestRoute(stations, open, from, to)
  const fullRoute = shortestRoute(stations, METRO.edges, from, to)
  const onRoute = (e: Edge) =>
    route != null && route.slice(1).some((n, i) => sameEdge(e, [route[i], n]))
  const steps = route ? route.length - 1 : -1
  return (
    <LabSection id="routes" eyebrow="Explore" title="The shortest route">
      <Prose>
        <p>
          A metro map is a graph. Pick two stations: breadth-first search labels every station with
          its distance from the start (the small numbers), and the orange line is a route with the
          fewest stops. Close lines to see the search find a way round.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <GraphDrawing
            nodes={METRO.nodes}
            edges={METRO.edges}
            edgeLook={(i) =>
              closed[i]
                ? { color: 'var(--line-strong)', width: 1.5, dashed: true }
                : onRoute(METRO.edges[i])
                  ? { color: ROUTE, width: 3.5 }
                  : { color: 'var(--ink-3)', width: 1.8 }
            }
            nodeLook={(id) => ({
              color: id === from || id === to ? ROUTE : EVEN,
              note: id in dist ? `${dist[id]}` : '×',
              ring: id === from,
            })}
            ariaLabel={`Metro map, route from ${from} to ${to}: ${route ? route.join(', ') : 'none'}`}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line px-3 pt-3 sm:px-4">
          <NodeSelect label="From" value={from} onChange={setFrom} options={stations} />
          <NodeSelect label="To" value={to} onChange={setTo} options={stations} />
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <p className="mb-1.5 text-sm font-medium text-ink-2">Close a line</p>
          <EdgeChips
            label="Closed lines"
            edges={METRO.edges}
            pressed={(i) => closed[i]}
            onToggle={(i) => setClosed((c) => c.map((v, j) => (j === i ? !v : v)))}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'route',
                value: route ? (route.length > 1 ? route.join(' → ') : 'same station') : 'no route',
                color: ROUTE,
              },
              { label: 'stops', value: steps < 0 ? '—' : `${steps}` },
              {
                label: 'reachable stations',
                value: `${Object.keys(dist).length} of ${stations.length}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-three-stops" when={steps === 3}>
          Find two stations that are exactly 3 stops apart.
        </TryThis>
        <TryThis
          id="t-detour"
          when={route != null && fullRoute != null && route.length > fullRoute.length}
        >
          Close a line so the shortest route gets longer, but still exists.
        </TryThis>
        <TryThis id="t-cut-off" when={route == null}>
          Close lines until there is no route at all.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Trail = { start: string | null; used: number[] }

function TrailBoard({
  shape,
  trail,
  onChange,
}: {
  shape: Shape
  trail: Trail
  onChange: (t: Trail) => void
}) {
  const { start, used } = trail
  const at = start == null ? null : trailEnd(shape.edges, start, used)
  const next = at == null ? [] : nextEdges(shape.edges, at, used)
  const twinName = (i: number) => {
    const e = shape.edges[i]
    const twins = shape.edges.filter((f) => sameEdge(e, f)).length
    return twins > 1
      ? `${e[0]}–${e[1]} #${shape.edges.slice(0, i + 1).filter((f) => sameEdge(e, f)).length}`
      : `${e[0]}–${e[1]}`
  }
  return (
    <div className="space-y-3">
      <GraphDrawing
        nodes={shape.nodes}
        edges={shape.edges}
        edgeLook={(i) =>
          used.includes(i)
            ? { color: WALKED, width: 3.5 }
            : next.includes(i)
              ? { color: 'var(--ink-2)', width: 1.8, dashed: true }
              : { color: 'var(--ink-3)', width: 1.8 }
        }
        nodeLook={(id) => ({
          color: id === at ? HERE : EVEN,
          ring: id === at,
          note: `${degrees(ids(shape.nodes), shape.edges)[id]}`,
        })}
        ariaLabel={
          start == null
            ? 'Pick a starting node'
            : `Walked ${used.length} of ${shape.edges.length} edges, now at ${at}`
        }
      />
      {start == null ? (
        <div role="group" aria-label="Start at" className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-ink-2">Start at</span>
          {shape.nodes.map((n) => (
            <Button
              key={n.id}
              size="sm"
              variant="secondary"
              onClick={() => onChange({ start: n.id, used: [] })}
            >
              {n.id}
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-ink-2">
            You are at <span className="font-semibold text-ink">{at}</span>. Pick an unused edge
            from here:
          </p>
          <EdgeChips
            label="Edges"
            edges={shape.edges}
            pressed={(i) => used.includes(i)}
            disabled={(i) => !next.includes(i)}
            onToggle={(i) => onChange({ start, used: [...used, i] })}
            names={twinName}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Undo2 className="size-4" />}
              disabled={used.length === 0}
              onClick={() => onChange({ start, used: used.slice(0, -1) })}
            >
              Undo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              onClick={() => onChange({ start: null, used: [] })}
            >
              Start again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TrailExplorer() {
  const [name, setName] = useState<ShapeName>('house')
  const [trail, setTrail] = useState<Trail>({ start: null, used: [] })
  const shape = SHAPES[name]
  const odd = oddNodes(ids(shape.nodes), shape.edges)
  const at = trail.start == null ? null : trailEnd(shape.edges, trail.start, trail.used)
  const complete = trail.used.length === shape.edges.length
  const stuck = at != null && !complete && nextEdges(shape.edges, at, trail.used).length === 0
  return (
    <LabSection id="trails" eyebrow="Explore" title="Draw it in one stroke">
      <Prose>
        <p>
          Can you trace each figure without lifting your pen and without going over an edge twice?
          Choose a start, then walk edge by edge (dashed edges are the ones you can take next). The
          small numbers are degrees. The last figure is the city of Königsberg: two river banks (N,
          S) and two islands (I, E) joined by seven bridges. Its people couldn't find a walk
          crossing each bridge once; Euler explained why in 1736.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Figure"
            value={name}
            onChange={(v) => {
              setName(v)
              setTrail({ start: null, used: [] })
            }}
            options={[
              { value: 'house', label: 'House' },
              { value: 'bowtie', label: 'Bow tie' },
              { value: 'bridges', label: 'Königsberg' },
            ]}
          />
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <TrailBoard shape={shape} trail={trail} onChange={setTrail} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'edges walked',
                value: `${trail.used.length} of ${shape.edges.length}`,
                color: WALKED,
              },
              {
                label: 'odd-degree nodes',
                value: odd.length ? `${odd.join(', ')} (${odd.length})` : 'none',
              },
              {
                label: 'one stroke?',
                value:
                  odd.length === 0
                    ? 'yes, and it ends where it starts'
                    : odd.length === 2
                      ? `yes, from ${odd[0]} to ${odd[1]}`
                      : 'impossible',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-house-traced" when={name === 'house' && complete}>
          Draw the whole house in one stroke. Where did you have to start?
        </TryThis>
        <TryThis id="t-loop-home" when={name === 'bowtie' && complete && at === trail.start}>
          Trace the bow tie and finish where you began.
        </TryThis>
        <TryThis id="t-stuck-bridges" when={name === 'bridges' && stuck}>
          Try to cross every Königsberg bridge once. Where do you get stuck?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [trail, setTrail] = useState<Trail>({ start: null, used: [] })
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-degree-sum-seven"
          index={1}
          prompt="A graph has 7 edges. What do the degrees of its nodes add up to?"
          answer={14}
          explanation="Each edge adds 1 to the degree of both its ends: $2 \times 7 = 14$."
        />
        <NumericChallenge
          id="c-six-handshakes"
          index={2}
          prompt="Six people all shake hands with each other once. How many handshakes?"
          answer={15}
          explanation="$\binom{6}{2} = \tfrac{6 \times 5}{2} = 15$."
        />
        <McqChallenge
          id="c-one-stroke"
          index={3}
          prompt="A connected graph has nodes of degree 3, 3, 2, 2 and 4. Can you draw it in one stroke, using every edge once?"
          options={[
            { text: 'Yes, starting at one degree-3 node and ending at the other', correct: true },
            {
              text: 'Yes, starting anywhere',
              why: 'With two odd nodes you must start at one of them.',
            },
            {
              text: 'No, the degrees aren’t all even',
              why: 'Two odd nodes is allowed: they are the ends.',
            },
          ]}
          explanation="Exactly two odd-degree nodes: an Euler trail runs from one to the other."
        />
        <NumericChallenge
          id="c-add-bridge"
          index={4}
          prompt="Königsberg's four land masses all have odd degree. What is the fewest new bridges that would make a one-stroke walk possible?"
          answer={1}
          explanation="A bridge between two odd land masses makes both even, leaving 2 odd nodes: enough for an Euler trail."
        />
        <McqChallenge
          id="c-fewest-stops"
          index={5}
          prompt="Which method finds a route with the fewest edges between two nodes?"
          options={[
            { text: 'Breadth-first search: distance 1, then 2, then 3…', correct: true },
            {
              text: 'Always take the closest-looking node',
              why: 'Positions on the page mean nothing; a greedy choice can miss shorter routes.',
            },
            {
              text: 'Count the degrees',
              why: 'Degrees say how connected a node is, not how to reach another.',
            },
          ]}
          explanation="BFS explores in rings of increasing distance, so the first time it reaches the target is by a shortest route."
        />
        <InteractiveChallenge
          id="c-trace-house"
          index={6}
          prompt="Draw the house in one stroke: walk all 8 edges without repeating one."
          solved={trail.used.length === SHAPES.house.edges.length}
          hint="Only A and B have odd degree. Start at one of them."
          explanation="Starting at A (or B), for example A–B–D–A–C–D–E–C–B, uses every edge once and ends at the other odd node."
          onReset={() => setTrail({ start: null, used: [] })}
        >
          <div className="rounded-xl border border-line p-3">
            <TrailBoard shape={SHAPES.house} trail={trail} onChange={setTrail} />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}
