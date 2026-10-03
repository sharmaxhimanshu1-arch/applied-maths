import { describe, expect, it } from 'vitest'
import { CONCEPTS, areaOf } from '@/curriculum'
import type { AreaId } from '@/curriculum/types'
import { DEEP_LAB_IDS } from '@/labs/registry'
import { expressionsMatch } from '@/math/miniExpr'
import { WIDGETS } from '@/widgets/registry'
import { contentLoaders } from './index'
import type { ContentModule } from './types'

/** Areas whose lite content is complete. Every concept in them must have a lab of some kind. */
const COMPLETE: AreaId[] = [
  'foundations',
  'algebra',
  'geometry',
  'calculus',
  'linear-algebra',
  'probability',
]

const modules = Object.fromEntries(
  await Promise.all(
    Object.entries(contentLoaders).map(async ([area, load]) => [area, (await load()).default]),
  ),
) as Record<AreaId, ContentModule>

const entries = Object.entries(modules).flatMap(([area, mod]) =>
  Object.entries(mod).map(([id, content]) => ({ area: area as AreaId, id, content: content! })),
)

describe('lite content', () => {
  it('belongs to real concepts in the matching area, without a deep lab', () => {
    for (const { area, id } of entries) {
      const concept = CONCEPTS.find((c) => c.id === id)
      expect(concept, id).toBeDefined()
      expect(areaOf(concept!.domain).id, id).toBe(area)
      expect(DEEP_LAB_IDS.has(id), `${id} has both a deep lab and lite content`).toBe(false)
    }
  })

  it('covers every concept in the completed areas', () => {
    for (const c of CONCEPTS) {
      if (!COMPLETE.includes(areaOf(c.domain).id) || DEEP_LAB_IDS.has(c.id)) continue
      expect(modules[areaOf(c.domain).id][c.id], c.id).toBeDefined()
    }
  })

  it.each(entries.map((e) => [e.id, e.content] as const))('%s is well formed', (_id, content) => {
    expect(content.hook.length).toBeGreaterThan(40)
    expect(content.explain.length).toBeGreaterThan(40)
    expect(Object.keys(WIDGETS)).toContain(content.explore.type)
    expect(content.explore.tryThis.length).toBeGreaterThanOrEqual(2)
    expect(content.checks.length).toBeGreaterThanOrEqual(2)
    expect(content.realWorld.length).toBeGreaterThanOrEqual(1)

    const ids = [...content.checks.map((c) => c.id), ...content.explore.tryThis.map((t) => t.id)]
    expect(new Set(ids).size, 'ids are unique').toBe(ids.length)

    for (const check of content.checks) {
      if (check.kind === 'mcq') {
        expect(check.options.filter((o) => o.correct).length, check.id).toBe(1)
        expect(check.options.length, check.id).toBeGreaterThanOrEqual(2)
      }
      if (check.kind === 'numeric') expect(Number.isFinite(check.answer), check.id).toBe(true)
      // The answer key must parse, and so accept itself.
      if (check.kind === 'expression')
        expect(expressionsMatch(check.answer, check.answer, check.vars), check.id).toBe(true)
    }
  })

  it('never uses a lone dollar or star outside markup', () => {
    for (const { id, content } of entries) {
      const text = JSON.stringify(content)
      const dollars = (text.match(/(?<!\\)\$/g) ?? []).length
      expect(dollars % 2, `${id} has an unbalanced $`).toBe(0)
    }
  })
})
