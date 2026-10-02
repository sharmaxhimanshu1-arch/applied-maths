import { describe, expect, it } from 'vitest'
import { AREAS, CONCEPTS, DOMAINS, MILESTONES, TRACKS, conceptById, graph } from './index'
import { validateConcepts } from './graph'

describe('curriculum data', () => {
  it('has the planned 110 concepts', () => {
    expect(CONCEPTS).toHaveLength(110)
  })

  it('is a valid, acyclic, non-redundant prerequisite graph', () => {
    expect(validateConcepts(CONCEPTS)).toEqual([])
  })

  it('assigns every concept to a known domain, and every domain to a known area', () => {
    const domainIds = new Set(DOMAINS.map((d) => d.id))
    const areaIds = new Set(AREAS.map((a) => a.id))
    for (const c of CONCEPTS) expect(domainIds.has(c.domain), c.id).toBe(true)
    for (const d of DOMAINS) expect(areaIds.has(d.area), d.id).toBe(true)
    // Every domain has at least one concept.
    for (const d of DOMAINS)
      expect(
        CONCEPTS.some((c) => c.domain === d.id),
        d.id,
      ).toBe(true)
  })

  it('gives every concept a title, summary and time estimate', () => {
    for (const c of CONCEPTS) {
      expect(c.title.length, c.id).toBeGreaterThan(2)
      expect(c.summary.length, c.id).toBeGreaterThan(15)
      expect(c.estMinutes, c.id).toBeGreaterThan(0)
    }
  })

  it('only references real concepts from tracks and milestones', () => {
    for (const t of TRACKS)
      for (const g of t.goals ?? []) expect(conceptById.has(g), `${t.id}: ${g}`).toBe(true)
    for (const m of MILESTONES)
      for (const g of m.goals) expect(conceptById.has(g), `${m.id}: ${g}`).toBe(true)
  })

  it('builds an ML track that reaches back to the foundations', () => {
    const ml = TRACKS.find((t) => t.id === 'ml')!
    const closure = graph.closure(ml.goals!)
    expect(closure.has('number-line')).toBe(true)
    expect(closure.has('chain-rule')).toBe(true)
    expect(closure.has('eigenvectors')).toBe(true)
    expect(closure.has('fourier-series')).toBe(false)
    expect(closure.size).toBeLessThan(CONCEPTS.length)
  })

  it('has a single connected structure rooted in a few starting points', () => {
    const roots = CONCEPTS.filter((c) => c.prerequisites.length === 0).map((c) => c.id)
    expect(roots.sort()).toEqual(['logic-truth-tables', 'number-line', 'sets-venn'])
  })
})
