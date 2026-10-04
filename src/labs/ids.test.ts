import { describe, expect, it } from 'vitest'
import retired from './retired-lite-ids.json'

/**
 * Progress is stored per concept by prompt and challenge id. A deep lab that replaces a lite lab
 * must not reuse the lite lab's ids for different tasks, or learners' old answers would show up
 * as already done (and could count towards mastery). The lite ids are frozen in
 * retired-lite-ids.json; add a concept's ids there before converting it to a deep lab.
 */
const sources = import.meta.glob<string>('./*/index.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const labs = Object.entries(sources).map(([path, src]) => ({
  id: path.split('/')[1],
  ids: [...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]),
}))

const RETIRED: Record<string, string[]> = retired

describe('deep lab prompt and challenge ids', () => {
  it('are unique within each lab', () => {
    for (const lab of labs) {
      const dupes = lab.ids.filter((id, i) => lab.ids.indexOf(id) !== i)
      expect(dupes, lab.id).toEqual([])
    }
  })

  it('never reuse an id from the lite lab they replaced', () => {
    for (const lab of labs) {
      const old = new Set(RETIRED[lab.id] ?? [])
      expect(
        lab.ids.filter((id) => old.has(id)),
        lab.id,
      ).toEqual([])
    }
  })
})
