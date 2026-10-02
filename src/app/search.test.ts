import { describe, expect, it } from 'vitest'
import { search } from './search'

const ids = (q: string) =>
  search(q).map((r) => (r.kind === 'concept' ? r.concept.id : `tool:${r.tool.id}`))

describe('search', () => {
  it('ranks title matches first', () => {
    expect(ids('eigen')[0]).toBe('eigenvectors')
    expect(ids('bayes')[0]).toBe('bayes-theorem')
  })

  it('matches tags and requires every word', () => {
    expect(ids('soh cah toa')[0]).toBe('right-triangle-trig')
    expect(ids('galton')).toContain('binomial-distribution')
    expect(ids('derivative zzz')).toEqual([])
  })

  it('finds tools', () => {
    expect(ids('matrix')).toContain('tool:matrix-lab')
    expect(ids('calculator')[0]).toBe('tool:calculator')
  })

  it('returns nothing for an empty query', () => {
    expect(search('   ')).toEqual([])
  })
})
