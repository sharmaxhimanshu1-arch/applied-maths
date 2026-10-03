import { describe, expect, it } from 'vitest'
import { CONCEPTS } from '@/curriculum'
import { DEEP_LAB_IDS } from '@/labs/registry'
import { expressionsMatch } from '@/math/miniExpr'
import deep from './deep'
import { loadReviewQuestions, pickQuestion } from './pool'

describe('review questions', () => {
  it('cover every deep lab, and only deep labs', () => {
    for (const id of DEEP_LAB_IDS) expect(deep[id]?.length ?? 0, id).toBeGreaterThanOrEqual(3)
    for (const id of Object.keys(deep)) expect(DEEP_LAB_IDS.has(id), id).toBe(true)
  })

  it('give every concept at least two questions to review with', async () => {
    for (const c of CONCEPTS)
      expect((await loadReviewQuestions(c.id)).length, c.id).toBeGreaterThanOrEqual(2)
  })

  it.each(Object.entries(deep))('%s review set is well formed', (_id, checks) => {
    const ids = checks!.map((c) => c.id)
    expect(new Set(ids).size, 'ids are unique').toBe(ids.length)
    for (const check of checks!) {
      expect(check.explain.length, check.id).toBeGreaterThan(5)
      const dollars = (JSON.stringify(check).match(/(?<!\\)\$/g) ?? []).length
      expect(dollars % 2, `${check.id} has an unbalanced $`).toBe(0)
      if (check.kind === 'mcq') {
        expect(check.options.filter((o) => o.correct).length, check.id).toBe(1)
        expect(check.options.length, check.id).toBeGreaterThanOrEqual(3)
      }
      if (check.kind === 'numeric') expect(Number.isFinite(check.answer), check.id).toBe(true)
      if (check.kind === 'expression')
        expect(expressionsMatch(check.answer, check.answer, check.vars), check.id).toBe(true)
    }
  })

  it('rotates through the pool', () => {
    const pool = deep.limits!
    expect(pickQuestion(pool, 0)).toBe(pool[0])
    expect(pickQuestion(pool, 4)).toBe(pool[1])
    expect(pickQuestion([], 2)).toBeNull()
  })
})
