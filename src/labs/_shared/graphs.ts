/** Small undirected (multi)graphs for the graphs-networks lab. Edges are pairs of node ids. */
export type Edge = readonly [string, string]

/** How many edge ends touch each node. A repeated edge counts each time. */
export function degrees(nodes: readonly string[], edges: readonly Edge[]): Record<string, number> {
  const deg = Object.fromEntries(nodes.map((n) => [n, 0]))
  for (const [a, b] of edges) {
    deg[a]++
    deg[b]++
  }
  return deg
}

/** The nodes with odd degree. */
export function oddNodes(nodes: readonly string[], edges: readonly Edge[]): string[] {
  const deg = degrees(nodes, edges)
  return nodes.filter((n) => deg[n] % 2 === 1)
}

/** Breadth-first search: the number of steps from `start` to each node it can reach. */
export function bfsDistances(
  nodes: readonly string[],
  edges: readonly Edge[],
  start: string,
): Record<string, number> {
  const dist: Record<string, number> = { [start]: 0 }
  const queue = [start]
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i]
    for (const [a, b] of edges) {
      const next = a === cur ? b : b === cur ? a : null
      if (next != null && nodes.includes(next) && !(next in dist)) {
        dist[next] = dist[cur] + 1
        queue.push(next)
      }
    }
  }
  return dist
}

/** One shortest route from `from` to `to` (a list of nodes), or null if none exists. */
export function shortestRoute(
  nodes: readonly string[],
  edges: readonly Edge[],
  from: string,
  to: string,
): string[] | null {
  const dist = bfsDistances(nodes, edges, from)
  if (!(to in dist)) return null
  const route = [to]
  let cur = to
  while (cur !== from) {
    const here = cur
    const prev = nodes.find(
      (n) =>
        dist[n] === dist[here] - 1 &&
        edges.some(([a, b]) => (a === n && b === here) || (b === n && a === here)),
    )
    if (prev == null) return null
    route.unshift(prev)
    cur = prev
  }
  return route
}

/** The other end of edge `e` from node `at`, or null if the edge doesn't touch it. */
export function otherEnd(e: Edge, at: string): string | null {
  return e[0] === at ? e[1] : e[1] === at ? e[0] : null
}

/** Where a trail that starts at `start` and walks the edges `used` (by index, in order) ends up. */
export function trailEnd(edges: readonly Edge[], start: string, used: readonly number[]): string {
  let at = start
  for (const i of used) at = otherEnd(edges[i], at) ?? at
  return at
}

/** The edges (by index) the trail can take next: unused ones touching the current node. */
export function nextEdges(edges: readonly Edge[], at: string, used: readonly number[]): number[] {
  return edges.map((_, i) => i).filter((i) => !used.includes(i) && otherEnd(edges[i], at) != null)
}
