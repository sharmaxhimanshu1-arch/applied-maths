import { areaOf, getConcept } from '@/curriculum'
import type { AreaId, ConceptId } from '@/curriculum/types'
import type { ContentModule, LiteContent } from './types'

/** One lazily loaded chunk of lite-lab content per curriculum area. */
const loaders: Record<AreaId, () => Promise<{ default: ContentModule }>> = {
  foundations: () => import('./foundations'),
  algebra: () => import('./algebra'),
  geometry: () => import('./geometry'),
  calculus: () => import('./calculus'),
  'linear-algebra': () => import('./linear-algebra'),
  probability: () => import('./probability'),
  applied: () => import('./applied'),
}

export async function loadLiteContent(id: ConceptId): Promise<LiteContent | undefined> {
  const concept = getConcept(id)
  if (!concept) return undefined
  const mod = await loaders[areaOf(concept.domain).id]()
  return mod.default[id]
}

export { loaders as contentLoaders }
