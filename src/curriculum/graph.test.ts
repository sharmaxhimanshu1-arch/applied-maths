import { describe, expect, it } from 'vitest'
import { buildGraph, validateConcepts } from './graph'
import type { Concept } from './types'

function concept(id: string, prerequisites: string[] = [], level: Concept['level'] = 1): Concept {
  return { id, title: id, domain: 'numbers', level, prerequisites, summary: '', estMinutes: 10 }
}

//   a ─► b ─► d
//   └──► c ─┘   └─► e
const fixture = [
  concept('a'),
  concept('b', ['a']),
  concept('c', ['a']),
  concept('d', ['b', 'c']),
  concept('e', ['d']),
  concept('lonely'),
]

describe('buildGraph', () => {
  const g = buildGraph(fixture)

  it('orders every concept after its prerequisites', () => {
    for (const c of fixture) {
      for (const p of c.prerequisites) {
        expect(g.topoIndex.get(p)!).toBeLessThan(g.topoIndex.get(c.id)!)
      }
    }
    expect(g.topo).toHaveLength(fixture.length)
  })

  it('computes rank as the longest prerequisite chain', () => {
    expect(g.rank.get('a')).toBe(0)
    expect(g.rank.get('d')).toBe(2)
    expect(g.rank.get('e')).toBe(3)
    expect(g.rank.get('lonely')).toBe(0)
  })

  it('finds ancestors and descendants', () => {
    expect([...g.ancestors('e')].sort()).toEqual(['a', 'b', 'c', 'd'])
    expect([...g.descendants('a')].sort()).toEqual(['b', 'c', 'd', 'e'])
    expect(g.ancestors('a').size).toBe(0)
  })

  it('builds a learning path that skips what is done and ends at the goal', () => {
    const done = new Set(['a', 'b'])
    expect(g.learningPath('e', (id) => done.has(id))).toEqual(['c', 'd', 'e'])
    expect(g.learningPath('a', () => false)).toEqual(['a'])
  })

  it('finds the frontier of ready-to-learn concepts', () => {
    const done = new Set(['a'])
    expect(g.frontier((id) => done.has(id))).toEqual(
      ['lonely', 'b', 'c'].sort((x, y) => g.topoIndex.get(x)! - g.topoIndex.get(y)!),
    )
    expect(g.frontier((id) => done.has(id), new Set(['b', 'c', 'd']))).toEqual(['b', 'c'])
  })

  it('computes closures for tracks', () => {
    expect([...g.closure(['d'])].sort()).toEqual(['a', 'b', 'c', 'd'])
    expect(g.closure(['unknown']).size).toBe(0)
  })
})

describe('validateConcepts', () => {
  it('accepts a valid graph', () => {
    expect(validateConcepts(fixture)).toEqual([])
  })

  it('reports unknown prerequisites, duplicates and self-loops', () => {
    const errors = validateConcepts([concept('a', ['ghost']), concept('a'), concept('b', ['b'])])
    expect(errors.join('\n')).toMatch(/unknown prerequisite "ghost"/)
    expect(errors.join('\n')).toMatch(/Duplicate concept id "a"/)
    expect(errors.join('\n')).toMatch(/lists itself/)
  })

  it('reports cycles', () => {
    const errors = validateConcepts([concept('a', ['c']), concept('b', ['a']), concept('c', ['b'])])
    expect(errors.some((e) => e.startsWith('Cycle'))).toBe(true)
  })

  it('reports redundant edges', () => {
    const errors = validateConcepts([concept('a'), concept('b', ['a']), concept('c', ['a', 'b'])])
    expect(errors).toEqual(['"c" lists "a", which is already implied by "b"'])
  })

  it('reports prerequisites that are harder than the concept', () => {
    const errors = validateConcepts([concept('hard', [], 3), concept('easy', ['hard'], 1)])
    expect(errors[0]).toMatch(/needs harder/)
  })
})
