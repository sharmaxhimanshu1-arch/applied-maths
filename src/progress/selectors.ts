import { CONCEPTS, graph, trackById } from '@/curriculum'
import type { ConceptId, DomainId } from '@/curriculum/types'
import {
  isDoneStatus,
  localDay,
  useProgress,
  type ConceptProgress,
  type ProgressData,
} from './store'

/** How a concept appears on the map. */
export type NodeState = 'mastered' | 'known' | 'in-progress' | 'ready' | 'locked'

export function isDone(concepts: Record<ConceptId, ConceptProgress>, id: ConceptId): boolean {
  return isDoneStatus(concepts[id]?.status)
}

export function nodeState(concepts: Record<ConceptId, ConceptProgress>, id: ConceptId): NodeState {
  const status = concepts[id]?.status
  if (status === 'mastered') return 'mastered'
  if (status === 'known') return 'known'
  if (status) return 'in-progress'
  return graph.prereqs.get(id)!.every((p) => isDone(concepts, p)) ? 'ready' : 'locked'
}

export const NODE_STATE_LABEL: Record<NodeState, string> = {
  mastered: 'Mastered',
  known: 'Already known',
  'in-progress': 'In progress',
  ready: 'Ready to learn',
  locked: 'Prerequisites first',
}

/** Concepts in a track (all of them for the full journey). */
export function trackConcepts(trackId: string): Set<ConceptId> {
  const track = trackById.get(trackId)
  if (!track || !track.goals) return new Set(CONCEPTS.map((c) => c.id))
  return graph.closure(track.goals)
}

export function countDone(concepts: Record<ConceptId, ConceptProgress>, ids: Iterable<ConceptId>) {
  let done = 0
  let total = 0
  for (const id of ids) {
    total++
    if (isDone(concepts, id)) done++
  }
  return { done, total }
}

export function domainCounts(concepts: Record<ConceptId, ConceptProgress>, domain: DomainId) {
  return countDone(
    concepts,
    CONCEPTS.filter((c) => c.domain === domain).map((c) => c.id),
  )
}

/** Next concepts to learn: ready ones in the current track, nearest the goal first. */
export function recommendations(
  data: Pick<ProgressData, 'concepts' | 'goal' | 'track'>,
  limit = 4,
) {
  const done = (id: ConceptId) => isDone(data.concepts, id)
  if (data.goal && !done(data.goal)) {
    const path = graph.learningPath(data.goal, done)
    const ready = path.filter((id) => graph.prereqs.get(id)!.every(done))
    if (ready.length) return ready.slice(0, limit)
  }
  return graph.frontier(done, trackConcepts(data.track)).slice(0, limit)
}

/** Consecutive active days ending today (or yesterday, so a streak survives until midnight). */
export function streak(activity: string[], now = new Date()): number {
  if (!activity.length) return 0
  const days = new Set(activity)
  const cursor = new Date(now)
  if (!days.has(localDay(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(localDay(cursor))) return 0
  }
  let count = 0
  while (days.has(localDay(cursor))) {
    count++
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

/** React hook: the map state of one concept. */
export function useNodeState(id: ConceptId): NodeState {
  return useProgress((s) => nodeState(s.concepts, id))
}
