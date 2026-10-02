import type { Concept, ConceptId } from './types'

/**
 * Pure algorithms over the prerequisite graph. Edges point from a prerequisite to the concept
 * that needs it. Everything here is deterministic so the map layout and learning paths are stable.
 */
export interface ConceptGraph {
  ids: ConceptId[]
  prereqs: ReadonlyMap<ConceptId, ConceptId[]>
  dependents: ReadonlyMap<ConceptId, ConceptId[]>
  /** Topological order: every concept appears after all of its prerequisites. */
  topo: ConceptId[]
  topoIndex: ReadonlyMap<ConceptId, number>
  /** Length of the longest prerequisite chain leading to the concept (roots are 0). */
  rank: ReadonlyMap<ConceptId, number>
  ancestors(id: ConceptId): ReadonlySet<ConceptId>
  descendants(id: ConceptId): ReadonlySet<ConceptId>
  /** Goals plus every concept they depend on. */
  closure(goals: Iterable<ConceptId>): Set<ConceptId>
  /** What is left to learn to reach `goal`, in a valid study order (goal last). */
  learningPath(goal: ConceptId, isDone: (id: ConceptId) => boolean): ConceptId[]
  /** Concepts not yet done whose prerequisites are all done ("ready to learn"). */
  frontier(isDone: (id: ConceptId) => boolean, within?: ReadonlySet<ConceptId>): ConceptId[]
}

export function buildGraph(concepts: Concept[]): ConceptGraph {
  const ids = concepts.map((c) => c.id)
  const known = new Set(ids)
  const order = new Map(ids.map((id, i) => [id, i]))
  const level = new Map(concepts.map((c) => [c.id, c.level]))

  const prereqs = new Map<ConceptId, ConceptId[]>()
  const dependents = new Map<ConceptId, ConceptId[]>()
  for (const id of ids) dependents.set(id, [])
  for (const c of concepts) {
    const ps = c.prerequisites.filter((p) => known.has(p) && p !== c.id)
    prereqs.set(c.id, ps)
    for (const p of ps) dependents.get(p)!.push(c.id)
  }

  // Kahn's algorithm; among available concepts prefer lower level, then source order.
  const indegree = new Map(ids.map((id) => [id, prereqs.get(id)!.length]))
  const available = ids.filter((id) => indegree.get(id) === 0)
  const priority = (id: ConceptId) => level.get(id)! * 10_000 + order.get(id)!
  const topo: ConceptId[] = []
  while (available.length) {
    available.sort((a, b) => priority(a) - priority(b))
    const next = available.shift()!
    topo.push(next)
    for (const d of dependents.get(next)!) {
      const n = indegree.get(d)! - 1
      indegree.set(d, n)
      if (n === 0) available.push(d)
    }
  }
  // Concepts caught in a cycle are appended so nothing disappears; validation reports the cycle.
  for (const id of ids) if (!topo.includes(id)) topo.push(id)
  const topoIndex = new Map(topo.map((id, i) => [id, i]))

  const rank = new Map<ConceptId, number>()
  for (const id of topo) {
    const ps = prereqs.get(id)!
    rank.set(id, ps.length ? Math.max(...ps.map((p) => rank.get(p) ?? 0)) + 1 : 0)
  }

  const ancestorCache = new Map<ConceptId, Set<ConceptId>>()
  const descendantCache = new Map<ConceptId, Set<ConceptId>>()

  function walk(start: ConceptId, edges: ReadonlyMap<ConceptId, ConceptId[]>) {
    const seen = new Set<ConceptId>()
    const stack = [...(edges.get(start) ?? [])]
    while (stack.length) {
      const id = stack.pop()!
      if (seen.has(id)) continue
      seen.add(id)
      stack.push(...(edges.get(id) ?? []))
    }
    seen.delete(start)
    return seen
  }

  function ancestors(id: ConceptId) {
    let s = ancestorCache.get(id)
    if (!s) ancestorCache.set(id, (s = walk(id, prereqs)))
    return s
  }

  function descendants(id: ConceptId) {
    let s = descendantCache.get(id)
    if (!s) descendantCache.set(id, (s = walk(id, dependents)))
    return s
  }

  function closure(goals: Iterable<ConceptId>) {
    const out = new Set<ConceptId>()
    for (const g of goals) {
      if (!known.has(g)) continue
      out.add(g)
      for (const a of ancestors(g)) out.add(a)
    }
    return out
  }

  const byTopo = (a: ConceptId, b: ConceptId) => topoIndex.get(a)! - topoIndex.get(b)!

  return {
    ids,
    prereqs,
    dependents,
    topo,
    topoIndex,
    rank,
    ancestors,
    descendants,
    closure,
    learningPath(goal, isDone) {
      return [...closure([goal])].filter((id) => !isDone(id)).sort(byTopo)
    },
    frontier(isDone, within) {
      return topo.filter(
        (id) =>
          (!within || within.has(id)) && !isDone(id) && prereqs.get(id)!.every((p) => isDone(p)),
      )
    },
  }
}

/** Every problem with the curriculum data, as human-readable messages (empty = valid). */
export function validateConcepts(concepts: Concept[]): string[] {
  const errors: string[] = []
  const byId = new Map<ConceptId, Concept>()
  for (const c of concepts) {
    if (byId.has(c.id)) errors.push(`Duplicate concept id "${c.id}"`)
    byId.set(c.id, c)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) errors.push(`Id "${c.id}" is not kebab-case`)
  }
  for (const c of concepts) {
    for (const p of c.prerequisites) {
      if (p === c.id) errors.push(`"${c.id}" lists itself as a prerequisite`)
      else if (!byId.has(p)) errors.push(`"${c.id}" has unknown prerequisite "${p}"`)
      else if (byId.get(p)!.level > c.level)
        errors.push(
          `"${c.id}" (level ${c.level}) needs harder "${p}" (level ${byId.get(p)!.level})`,
        )
    }
    if (new Set(c.prerequisites).size !== c.prerequisites.length)
      errors.push(`"${c.id}" lists a prerequisite twice`)
  }

  const g = buildGraph(concepts)
  // Cycle check: in a DAG every edge goes forward in topological order.
  for (const c of concepts) {
    for (const p of g.prereqs.get(c.id)!) {
      if (g.topoIndex.get(p)! > g.topoIndex.get(c.id)!) {
        errors.push(`Cycle involving "${c.id}" and "${p}"`)
      }
    }
  }
  // Redundant edges: p is already implied through another prerequisite q of the same concept.
  for (const c of concepts) {
    const ps = g.prereqs.get(c.id)!
    for (const p of ps) {
      const via = ps.find((q) => q !== p && g.ancestors(q).has(p))
      if (via) errors.push(`"${c.id}" lists "${p}", which is already implied by "${via}"`)
    }
  }
  return errors
}
