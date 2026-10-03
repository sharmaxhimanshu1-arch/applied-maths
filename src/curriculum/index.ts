import { algebra } from './concepts/algebra'
import { applied } from './concepts/applied'
import { calculus } from './concepts/calculus'
import { foundations } from './concepts/foundations'
import { geometry } from './concepts/geometry'
import { linearAlgebra } from './concepts/linear-algebra'
import { probability } from './concepts/probability'
import { DOMAINS } from './domains'
import { buildGraph } from './graph'
import type { Concept, ConceptId } from './types'

const domainOrder = new Map(DOMAINS.map((d, i) => [d.id, i]))

/** All concepts, grouped by map lane (domain order). */
export const CONCEPTS: Concept[] = [
  ...foundations,
  ...algebra,
  ...geometry,
  ...calculus,
  ...linearAlgebra,
  ...probability,
  ...applied,
].sort((a, b) => domainOrder.get(a.domain)! - domainOrder.get(b.domain)!)

export const conceptById = new Map<ConceptId, Concept>(CONCEPTS.map((c) => [c.id, c]))

export function getConcept(id: ConceptId): Concept | undefined {
  return conceptById.get(id)
}

/** The curriculum as a prerequisite graph (built once). */
export const graph = buildGraph(CONCEPTS)

export * from './domains'
export * from './tracks'
export type * from './types'
