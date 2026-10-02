import type { ConceptGraph } from '@/curriculum/graph'
import type { Concept, ConceptId, Domain, DomainId } from '@/curriculum/types'

export interface LayoutOptions {
  /** Horizontal distance between prerequisite columns. */
  colWidth: number
  /** Vertical distance between stacked nodes inside a lane. */
  rowHeight: number
  nodeWidth: number
  nodeHeight: number
  /** Space between lanes. */
  laneGap: number
  /** Padding above/below nodes inside a lane band. */
  lanePad: number
}

export const DEFAULT_LAYOUT: LayoutOptions = {
  colWidth: 250,
  rowHeight: 68,
  nodeWidth: 200,
  nodeHeight: 52,
  laneGap: 18,
  lanePad: 20,
}

export interface PlacedNode {
  id: ConceptId
  x: number
  y: number
  column: number
  lane: DomainId
  row: number
}

export interface LaneBand {
  domain: DomainId
  y: number
  height: number
}

export interface MapLayout {
  nodes: Map<ConceptId, PlacedNode>
  lanes: LaneBand[]
  width: number
  height: number
  options: LayoutOptions
}

/**
 * Skill-tree layout: column = longest prerequisite chain (so every arrow points right),
 * lane = domain. Inside a lane, nodes are placed on the row nearest the average height of
 * their prerequisites (a barycenter sweep), which keeps most edges short and straight.
 */
export function layoutMap(
  concepts: Concept[],
  domains: Domain[],
  graph: ConceptGraph,
  options: LayoutOptions = DEFAULT_LAYOUT,
): MapLayout {
  const { colWidth, rowHeight, nodeWidth, nodeHeight, laneGap, lanePad } = options
  const byLane = new Map<DomainId, Concept[]>(domains.map((d) => [d.id, []]))
  for (const c of concepts) byLane.get(c.domain)?.push(c)

  // Lane height = the most concepts that share one column in that lane.
  const laneRows = new Map<DomainId, number>()
  for (const [lane, cs] of byLane) {
    const perColumn = new Map<number, number>()
    for (const c of cs) {
      const col = graph.rank.get(c.id)!
      perColumn.set(col, (perColumn.get(col) ?? 0) + 1)
    }
    laneRows.set(lane, Math.max(1, ...perColumn.values()))
  }

  const lanes: LaneBand[] = []
  let cursor = 0
  for (const d of domains) {
    const height = laneRows.get(d.id)! * rowHeight - (rowHeight - nodeHeight) + lanePad * 2
    lanes.push({ domain: d.id, y: cursor, height })
    cursor += height + laneGap
  }
  const laneTop = new Map(lanes.map((l) => [l.domain, l.y + lanePad]))

  const nodes = new Map<ConceptId, PlacedNode>()
  const yOfRow = (lane: DomainId, row: number) => laneTop.get(lane)! + row * rowHeight

  // Initial placement: topological order inside each lane-column.
  const groups = new Map<string, ConceptId[]>()
  for (const id of graph.topo) {
    const c = concepts.find((x) => x.id === id)
    if (!c || !byLane.has(c.domain)) continue
    const col = graph.rank.get(id)!
    const key = `${c.domain}|${col}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(id)
  }
  for (const [key, ids] of groups) {
    const [lane, col] = key.split('|') as [DomainId, string]
    ids.forEach((id, row) =>
      nodes.set(id, { id, lane, row, column: +col, x: +col * colWidth, y: yOfRow(lane, row) }),
    )
  }

  // Barycenter sweeps, column by column, so a node sits level with what it builds on.
  const columns = [...new Set([...nodes.values()].map((n) => n.column))].sort((a, b) => a - b)
  for (let sweep = 0; sweep < 4; sweep++) {
    const forward = sweep % 2 === 0
    const order = forward ? columns : [...columns].reverse()
    for (const col of order) {
      for (const [key, ids] of groups) {
        const [lane, c] = key.split('|') as [DomainId, string]
        if (+c !== col) continue
        const neighbours = (id: ConceptId) =>
          forward ? graph.prereqs.get(id)! : graph.dependents.get(id)!
        const target = (id: ConceptId) => {
          const ys = neighbours(id).map((n) => nodes.get(n)!.y)
          return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : nodes.get(id)!.y
        }
        const sorted = [...ids].sort((a, b) => target(a) - target(b))
        placeInLane(sorted, lane, laneRows.get(lane)!, (id) => target(id))
      }
    }
  }

  function placeInLane(
    sorted: ConceptId[],
    lane: DomainId,
    rows: number,
    target: (id: ConceptId) => number,
  ) {
    const top = laneTop.get(lane)!
    // Desired rows, kept in order and pushed apart so no two nodes share a row.
    const wanted = sorted.map((id) =>
      Math.max(0, Math.min(rows - 1, Math.round((target(id) - top) / rowHeight))),
    )
    const placed: number[] = []
    wanted.forEach((w, i) => placed.push(i === 0 ? w : Math.max(w, placed[i - 1] + 1)))
    // If we ran past the bottom, slide everything back up.
    for (let i = placed.length - 1; i >= 0; i--) {
      const max = rows - (placed.length - i)
      if (placed[i] > max) placed[i] = max
      if (i < placed.length - 1 && placed[i] >= placed[i + 1]) placed[i] = placed[i + 1] - 1
    }
    sorted.forEach((id, i) => {
      const n = nodes.get(id)!
      n.row = placed[i]
      n.y = yOfRow(lane, placed[i])
    })
  }

  const maxCol = Math.max(0, ...columns)
  return {
    nodes,
    lanes,
    width: maxCol * colWidth + nodeWidth,
    height: cursor - laneGap,
    options,
  }
}
